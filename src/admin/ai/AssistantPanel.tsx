'use client'

import './assistant.css'

import { Button, CheckboxInput, toast } from '@payloadcms/ui'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { AppliedDoc } from '@/ai/apply'
import type { AiStatus } from '@/ai/guards'
import type { ChangesetView } from '@/endpoints/ai'

/**
 * The AI editor panel (brief §10.2): a prompt box, the conversation, the proposed changes with
 * a field-level diff and per-change accept/reject, and Apply to draft / Discard / Open live
 * preview. Used in the document drawer and on the site assistant page.
 */
type Context = { collection: string; id: number | string; title?: string }
type Line = { role: 'user' | 'assistant' | 'step' | 'error'; text: string }
type Applied = AppliedDoc & { preview?: null | string }

const money = (value: number | null) => (value === null ? '—' : `$${value.toFixed(2)}`)

async function fetchStatus(): Promise<AiStatus> {
  const response = await fetch('/api/ai/status/', { credentials: 'include' })
  const data = (await response.json().catch(() => ({}))) as AiStatus & { error?: string }
  if (!response.ok) throw new Error(data.error ?? 'The assistant is not available.')
  return data
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new Error(data.error ?? 'The request failed.')
  return data
}

export function AssistantPanel({
  context,
  onApplied,
}: {
  context?: Context
  onApplied?: (docs: Applied[]) => void
}) {
  const [status, setStatus] = useState<AiStatus | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [streaming, setStreaming] = useState('')
  const [changeset, setChangeset] = useState<ChangesetView | null>(null)
  const [accepted, setAccepted] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)
  const [applied, setApplied] = useState<Applied[] | null>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  const loadStatus = useCallback(
    () =>
      fetchStatus().then(
        (data) => {
          setStatus(data)
          setStatusError(null)
        },
        (error: Error) => setStatusError(error.message),
      ),
    [],
  )

  useEffect(() => {
    void loadStatus()
  }, [loadStatus])

  const say = (line: Line) => setLines((current) => [...current, line])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const text = prompt.trim()
    if (!text || busy) return
    setBusy(true)
    setApplied(null)
    setPrompt('')
    say({ role: 'user', text })
    let reply = ''
    try {
      const response = await fetch('/api/ai/plan/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          ...(context ? { context: { collection: context.collection, id: context.id } } : {}),
          ...(changeset?.canContinue ? { continueFrom: changeset.id } : {}),
        }),
      })
      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? 'The assistant could not start.')
      }
      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += value
        const parts = buffer.split('\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          if (!part.trim()) continue
          const event = JSON.parse(part) as
            | { type: 'text'; delta: string }
            | { type: 'tool'; name: string; ok: boolean; summary: string }
            | { type: 'done'; changeset: ChangesetView }
            | { type: 'error'; message: string }
          if (event.type === 'text') {
            reply += event.delta
            setStreaming(reply)
          } else if (event.type === 'tool') {
            if (reply.trim()) say({ role: 'assistant', text: reply.trim() })
            reply = ''
            setStreaming('')
            say({ role: event.ok ? 'step' : 'error', text: event.summary })
          } else if (event.type === 'done') {
            setStreaming('')
            const next = event.changeset
            if (next.reply) say({ role: 'assistant', text: next.reply })
            else if (reply.trim()) say({ role: 'assistant', text: reply.trim() })
            if (next.error) say({ role: 'error', text: next.error })
            reply = ''
            setChangeset(next)
            setAccepted(new Set(next.operations.filter((op) => op.ok).map((op) => op.index)))
          } else {
            throw new Error(event.message)
          }
        }
      }
    } catch (error) {
      setStreaming('')
      say({ role: 'error', text: error instanceof Error ? error.message : 'Something went wrong.' })
    } finally {
      setBusy(false)
      void loadStatus()
      input.current?.focus()
    }
  }

  const apply = async () => {
    if (!changeset) return
    setBusy(true)
    try {
      const result = await post<{ changeset: ChangesetView; docs: Applied[] }>('/api/ai/apply/', {
        changesetId: changeset.id,
        accepted: [...accepted],
      })
      setChangeset(result.changeset)
      setApplied(result.docs)
      toast.success('Applied to draft. Check the preview, then publish.')
      onApplied?.(result.docs)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not apply the changes.')
    } finally {
      setBusy(false)
    }
  }

  const discard = async () => {
    if (!changeset) return
    setBusy(true)
    try {
      await post('/api/ai/discard/', { changesetId: changeset.id })
      setChangeset(null)
      say({ role: 'step', text: 'Discarded the proposed changes.' })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not discard.')
    } finally {
      setBusy(false)
    }
  }

  const toggle = (index: number) =>
    setAccepted((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })

  const proposals = changeset?.operations.filter((op) => op.ok) ?? []
  const pending = changeset?.status === 'proposed' && proposals.length > 0
  const unavailable =
    statusError ??
    (status && !status.enabled
      ? 'The AI assistant is switched off. An admin can turn it on in AI settings.'
      : status && !status.configured
        ? 'The AI assistant has no API key on this server.'
        : null)

  return (
    <section className="ai-panel" aria-label="AI assistant">
      <div className="ai-panel__status">
        {status ? (
          <span>
            Budget left this month: <strong>{money(status.remainingUSD)}</strong>
            {status.budgetUSD !== null ? ` of ${money(status.budgetUSD)}` : ' (no budget set)'}
          </span>
        ) : null}
        {context?.title ? <span>Editing: {context.title}</span> : null}
      </div>

      {unavailable ? <p className="ai-panel__notice">{unavailable}</p> : null}

      <ol className="ai-panel__thread" aria-live="polite">
        {lines.map((line, index) => (
          <li key={index} className={`ai-line ai-line--${line.role}`}>
            {line.text}
          </li>
        ))}
        {streaming ? <li className="ai-line ai-line--assistant">{streaming}</li> : null}
        {busy && !streaming ? <li className="ai-line ai-line--step">Working…</li> : null}
      </ol>

      {changeset && proposals.length ? (
        <div className="ai-panel__changes">
          <h3>Proposed changes</h3>
          {changeset.flags.length ? (
            <ul className="ai-panel__flags">
              {changeset.flags.map((flag, index) => (
                <li key={index}>
                  {flag.type === 'regulated' ? 'Compliance: ' : 'Possible financial claim: '}
                  {flag.detail}
                </li>
              ))}
            </ul>
          ) : null}
          <ul className="ai-panel__ops">
            {proposals.map((op) => (
              <li key={op.index} className="ai-op">
                {pending ? (
                  <CheckboxInput
                    id={`ai-op-${changeset.id}-${op.index}`}
                    checked={accepted.has(op.index)}
                    onToggle={() => toggle(op.index)}
                    label={op.summary ?? op.tool}
                  />
                ) : (
                  <p className="ai-op__summary">
                    {op.accepted === false ? '✕ ' : '✓ '}
                    {op.summary}
                  </p>
                )}
                {op.changes.length ? (
                  <table className="ai-diff">
                    <thead>
                      <tr>
                        <th scope="col">Field</th>
                        <th scope="col">Before</th>
                        <th scope="col">After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {op.changes.map((change, index) => (
                        <tr key={index}>
                          <th scope="row">{change.path}</th>
                          <td className="ai-diff__before">{change.before}</td>
                          <td className="ai-diff__after">{change.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : null}
              </li>
            ))}
          </ul>
          {pending ? (
            <div className="ai-panel__actions">
              <Button
                buttonStyle="primary"
                size="small"
                disabled={busy || !accepted.size}
                onClick={apply}
              >
                Apply to draft
              </Button>
              <Button buttonStyle="secondary" size="small" disabled={busy} onClick={discard}>
                Discard
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      {applied?.length ? (
        <div className="ai-panel__applied">
          <p>
            Saved as a draft. Nothing is live until it is published.
            {context ? ' Close the assistant to load the new draft into the editor.' : ''}
          </p>
          <ul>
            {applied.map((doc) => (
              <li key={`${doc.collection}:${doc.id}`}>
                {doc.title}
                {doc.inReview ? ' (sent to compliance review)' : ''}{' '}
                {doc.preview ? (
                  <a href={doc.preview} target="_blank" rel="noreferrer">
                    Open live preview
                  </a>
                ) : null}{' '}
                <a href={`/admin/collections/${doc.collection}/${doc.id}/`}>Open in the editor</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form className="ai-panel__form" onSubmit={submit}>
        <label htmlFor="ai-prompt">
          {changeset?.canContinue ? 'Reply or ask for more changes' : 'What should change?'}
        </label>
        <textarea
          id="ai-prompt"
          ref={input}
          rows={3}
          maxLength={4000}
          value={prompt}
          disabled={busy || Boolean(unavailable)}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
              event.currentTarget.form?.requestSubmit()
            }
          }}
          placeholder={
            context
              ? 'e.g. Shorten the hero subheading to one sentence.'
              : 'e.g. Update the Lagos office phone number to … everywhere.'
          }
        />
        <Button
          type="submit"
          size="small"
          disabled={busy || !prompt.trim() || Boolean(unavailable)}
        >
          {busy ? 'Working…' : 'Send'}
        </Button>
      </form>
    </section>
  )
}
