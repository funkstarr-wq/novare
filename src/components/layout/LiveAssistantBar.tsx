'use client'

import { usePathname, useRouter } from 'next/navigation'
import { type FormEvent, useEffect, useState } from 'react'

import type { ChangesetView } from '@/endpoints/ai'

type Located = { collection: string; id: number; title: string } | null

type State =
  | { kind: 'idle' }
  | { kind: 'working'; steps: string[] }
  | { kind: 'done'; changeset: ChangesetView; applied: boolean }
  | { kind: 'undone' }
  | { kind: 'published' }
  | { kind: 'error'; message: string; needsReview?: boolean }

const post = (url: string, body: unknown) =>
  fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

class BarError extends Error {
  constructor(
    message: string,
    readonly needsReview = false,
  ) {
    super(message)
  }
}

const errorOf = async (response: Response) => {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string
    needsReview?: boolean
  }
  return new BarError(data.error ?? 'Something went wrong.', data.needsReview === true)
}

/**
 * The live AI bar (decision "Live AI bar"): in draft mode, a signed-in editor types a change for
 * the page they are looking at and presses Enter. The M5 assistant plans it, it is applied to
 * the draft as that editor, and the page refreshes to show it. Nothing is public until Publish,
 * which goes through the usual permissions and, for regulated content, compliance review.
 */
export function LiveAssistantBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [allowed, setAllowed] = useState<boolean | null>(null)
  const [located, setLocated] = useState<Located>(null)
  const [prompt, setPrompt] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  // Which document this page shows; a 401/403 means no verified staff session: no bar.
  useEffect(() => {
    let current = true
    fetch(`/api/ai/locate/?path=${encodeURIComponent(pathname)}`, { credentials: 'include' })
      .then(async (response) => {
        if (!current) return
        if (!response.ok) return setAllowed(false)
        const data = (await response.json()) as { document: Located }
        setAllowed(true)
        setLocated(data.document)
      })
      .catch(() => current && setAllowed(false))
    return () => {
      current = false
    }
  }, [pathname])

  if (!allowed) return null

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const text = prompt.trim()
    if (!text || state.kind === 'working') return
    const steps: string[] = []
    setState({ kind: 'working', steps: [] })
    try {
      const response = await post('/api/ai/plan/', {
        prompt: text,
        ...(located ? { context: { collection: located.collection, id: located.id } } : {}),
      })
      if (!response.ok || !response.body) throw await errorOf(response)
      let changeset: ChangesetView | null = null
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += value
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const event = JSON.parse(line) as
            | { type: 'tool'; summary: string }
            | { type: 'done'; changeset: ChangesetView }
            | { type: 'error'; message: string }
            | { type: 'text' }
          if (event.type === 'tool') {
            steps.push(event.summary)
            setState({ kind: 'working', steps: [...steps] })
          }
          if (event.type === 'error') throw new BarError(event.message)
          if (event.type === 'done') changeset = event.changeset
        }
      }
      if (!changeset) throw new BarError('The assistant did not finish. Try again.')
      if (changeset.error) throw new BarError(changeset.error)

      const proposed = changeset.operations.filter((op) => op.ok)
      if (proposed.length === 0) {
        // A question or an explanation, with nothing to change.
        setState({ kind: 'done', changeset, applied: false })
        return
      }
      const applied = await post('/api/ai/apply/', { changesetId: changeset.id })
      if (!applied.ok) throw await errorOf(applied)
      const result = (await applied.json()) as { changeset: ChangesetView }
      setPrompt('')
      setState({ kind: 'done', changeset: result.changeset, applied: true })
      router.refresh()
    } catch (error) {
      setState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Something went wrong.',
        needsReview: error instanceof BarError && error.needsReview,
      })
    }
  }

  const undo = async (changeset: ChangesetView) => {
    const response = await post('/api/ai/rollback/', { changesetId: changeset.id })
    if (!response.ok) {
      const error = await errorOf(response)
      return setState({ kind: 'error', message: error.message, needsReview: error.needsReview })
    }
    setState({ kind: 'undone' })
    router.refresh()
  }

  const publish = async () => {
    if (!located) return
    const response = await post('/api/ai/publish/', {
      collection: located.collection,
      id: located.id,
    })
    if (!response.ok) {
      const error = await errorOf(response)
      return setState({ kind: 'error', message: error.message, needsReview: error.needsReview })
    }
    setState({ kind: 'published' })
    router.refresh()
  }

  const submitForReview = async () => {
    if (!located) return
    const response = await post(`/api/${located.collection}/${located.id}/submit-for-review/`, {})
    if (!response.ok) {
      const error = await errorOf(response)
      return setState({ kind: 'error', message: error.message, needsReview: error.needsReview })
    }
    setState({ kind: 'error', message: 'Sent to compliance for review.' })
  }

  const working = state.kind === 'working'
  const adminHref = located ? `/admin/collections/${located.collection}/${located.id}/` : null
  const pill =
    'rounded-full border border-ink-muted px-3 py-1 text-xs font-medium text-surface hover:border-surface'

  return (
    <div className="on-dark fixed inset-x-0 bottom-4 z-50 px-4">
      <div className="mx-auto flex max-w-3xl flex-col gap-2">
        {state.kind !== 'idle' && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[10px] bg-ink px-5 py-4 text-sm text-surface shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          >
            {working && (
              <p>
                Working on it…
                {state.steps.length > 0 && (
                  <span className="text-border"> {state.steps[state.steps.length - 1]}</span>
                )}
              </p>
            )}
            {state.kind === 'done' && (
              <div className="flex flex-col gap-3">
                <p>
                  {/* Once applied, say what changed; the assistant's own reply is written for
                      the admin's review step ("apply it to the draft…"). */}
                  {(state.applied
                    ? state.changeset.operations
                        .filter((op) => op.ok)
                        .map((op) => op.summary)
                        .join(' ')
                    : '') ||
                    state.changeset.reply ||
                    'Nothing to change.'}
                </p>
                {state.changeset.flags.length > 0 && (
                  <p className="text-accent">
                    This may contain a financial claim: compliance must approve it before it is
                    published.
                  </p>
                )}
                {state.applied && (
                  <div className="flex flex-wrap gap-2">
                    <span className="self-center text-xs text-border">
                      Saved as a draft. Only signed-in editors see it.
                    </span>
                    <button type="button" className={pill} onClick={() => undo(state.changeset)}>
                      Undo
                    </button>
                    {located && (
                      <button type="button" className={pill} onClick={publish}>
                        Publish
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {state.kind === 'undone' && <p>Undone. The previous content is the draft again.</p>}
            {state.kind === 'published' && <p>Published. The change is now live.</p>}
            {state.kind === 'error' && (
              <div className="flex flex-wrap items-center gap-2">
                <p>{state.message}</p>
                {state.needsReview && located && (
                  <button type="button" className={pill} onClick={submitForReview}>
                    Submit for review
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        <form
          onSubmit={submit}
          className="flex items-center gap-3 rounded-full bg-ink py-2 pl-5 pr-2 text-surface shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
        >
          <span aria-hidden="true" className="text-accent">
            ✦
          </span>
          <label htmlFor="live-ai-prompt" className="sr-only">
            Ask the AI to change this page
          </label>
          <input
            id="live-ai-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={working}
            placeholder={
              located
                ? `Change ${located.title}… e.g. “Change the hero heading to …”`
                : 'Ask the AI to change the site…'
            }
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-surface placeholder:text-border focus-visible:outline-none"
            autoComplete="off"
          />
          {adminHref && (
            <a href={adminHref} className="hidden text-xs text-border hover:text-surface sm:inline">
              Open in admin
            </a>
          )}
          <button
            type="submit"
            disabled={working || !prompt.trim()}
            className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink disabled:opacity-50"
          >
            {working ? 'Working…' : 'Apply'}
          </button>
        </form>
      </div>
    </div>
  )
}
