import type {
  BetaContentBlock,
  BetaMessageParam,
  BetaToolResultBlockParam,
} from '@anthropic-ai/sdk/resources/beta/messages/messages'
import type { Payload, PayloadRequest } from 'payload'

import { canApprove, canPublish } from '@/access'
import type { RoleUser } from '@/access/roles'
import type { AiChangeset } from '@/payload-types'

import { classifyClaims, matchingPhrases } from './claims'
import { checkCanPlan, loadSettings } from './guards'
import { classifierModel, editorModel, type MessageParams, type ModelClient } from './model'
import { type OperationRecord, OperationError, isWriteTool } from './operations'
import { Usage } from './pricing'
import { systemPrompt } from './prompt'
import { ToolRunner, TOOLS } from './tools'
import { isAiCollection, MAX_WRITE_OPS } from './whitelist'

/**
 * Plans a changeset (brief §10.3 steps 1–5): runs the tool-use loop, collects the write tools'
 * proposals without executing them, checks them for financial claims and stores the result as an
 * `ai-changesets` record with status `proposed`.
 */
export const MAX_TURNS = 12
const MAX_STORED_MESSAGES = 400_000

/** Models the API can rescue with a server-side fallback when a safety classifier declines. */
const FALLBACK_MODELS = new Set([
  'claude-sonnet-5-5',
  'claude-opus-5-5',
  'claude-opus-5',
  'claude-fable-5-1',
])

export type PlanEvent =
  | { type: 'text'; delta: string }
  | { type: 'tool'; name: string; ok: boolean; summary: string }

export type PlanInput = {
  payload: Payload
  user: RoleUser & { id: number }
  client: ModelClient
  prompt: string
  context?: { collection?: string; id?: number | string }
  /** Continue the conversation of the user's own earlier proposal (which it replaces). */
  continueFrom?: number
  req?: Partial<PayloadRequest>
  onEvent?: (event: PlanEvent) => void
}

export type Flag = { type: string; detail: string }

/** Phrase hits per proposal, and a note for each regulated document (no API call). */
export async function phraseFlags(
  payload: Payload,
  operations: OperationRecord[],
): Promise<Flag[]> {
  const settings = await loadSettings(payload)
  const flags: Flag[] = []
  for (const op of live(operations)) {
    const hits = [
      ...new Set(
        (op.texts ?? []).flatMap((text) => matchingPhrases(text, settings.regulatedPhrases ?? [])),
      ),
    ]
    if (hits.length) {
      flags.push({
        type: 'financial_claim',
        detail: `${op.doc?.title ?? 'Change'} (${op.summary}): matches ${hits.join(', ')}.`,
      })
    }
  }
  for (const doc of regulatedDocs(operations)) {
    flags.push({ type: 'regulated', detail: `${doc} is regulated: it needs compliance approval.` })
  }
  return flags
}

/** Phrase flags plus one classifier verdict over everything the changeset writes (brief §10.7). */
export async function claimFlags(
  payload: Payload,
  client: ModelClient,
  operations: OperationRecord[],
  usage: Usage,
): Promise<Flag[]> {
  const flags = await phraseFlags(payload, operations)
  const texts = live(operations).flatMap((op) => op.texts ?? [])
  if (texts.length) {
    const model = classifierModel()
    const verdict = await classifyClaims(client, model, texts)
    if (verdict.message) usage.add(verdict.message.model || model, verdict.message.usage)
    if (verdict.flagged) flags.push({ type: 'claims_check', detail: verdict.reason })
  }
  return flags
}

/** Flags that send a document to compliance. */
export const needsCompliance = (flags: Flag[]) =>
  flags.some((flag) => flag.type === 'financial_claim' || flag.type === 'claims_check')

const live = (operations: OperationRecord[]) =>
  operations.filter((op) => op.ok && op.accepted !== false)

const regulatedDocs = (operations: OperationRecord[]) => [
  ...new Set(
    live(operations)
      .filter((op) => op.regulated && op.doc)
      .map((op) => op.doc!.title),
  ),
]

function permissions(user: RoleUser) {
  if (canApprove(user)) return 'They can publish all content, including regulated content.'
  if (canPublish(user)) return 'They can publish, except regulated content, which needs compliance.'
  return 'They can save drafts but cannot publish; an editor publishes their work.'
}

function opening(input: PlanInput, contextDoc: string | null) {
  const roles = (input.user.roles ?? []).join(', ') || 'none'
  // Their roles, never their name or email: no user data goes to the API (brief §10.7).
  const lines = [
    `You are working for a member of staff (roles: ${roles}). ${permissions(input.user)}`,
  ]
  if (contextDoc) lines.push(`They are editing this document:\n${contextDoc}`)
  else lines.push('They are in the site-wide assistant, not editing a particular document.')
  lines.push(`Their request:\n${input.prompt}`)
  return lines.join('\n\n')
}

const toolResult = (id: string, content: string, isError = false): BetaToolResultBlockParam => ({
  type: 'tool_result',
  tool_use_id: id,
  content,
  ...(isError ? { is_error: true } : {}),
})

const replyText = (content: BetaContentBlock[]) =>
  content
    .filter((block) => block.type === 'text')
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n')
    .trim()

export type PlanResult = { changeset: AiChangeset; reply: string; error?: string }

export async function planChangeset(input: PlanInput): Promise<PlanResult> {
  const { payload, user, client } = input
  await checkCanPlan(payload, user.id, true)
  const settings = await loadSettings(payload)
  const model = editorModel(settings.model)
  const runner = new ToolRunner({ payload, user: user as PayloadRequest['user'], req: input.req })
  const usage = new Usage()
  const operations: OperationRecord[] = []

  // Continuing: replay the earlier proposals, then add to that conversation (append-only).
  let messages: BetaMessageParam[] = []
  let previous: AiChangeset | null = null
  if (input.continueFrom) {
    previous = await payload.findByID({
      collection: 'ai-changesets',
      id: input.continueFrom,
      depth: 0,
      overrideAccess: true,
    })
    const ownerId = typeof previous.user === 'object' ? previous.user.id : previous.user
    const stored = previous.messages as { complete?: boolean; messages?: BetaMessageParam[] } | null
    if (ownerId !== user.id || previous.status !== 'proposed' || !stored?.complete) {
      throw new OperationError('That conversation cannot be continued. Start a new request.')
    }
    messages = stored.messages ?? []
    for (const op of (previous.operations as OperationRecord[] | null) ?? []) {
      if (!op.ok) continue
      const replay = await runner.workspace
        .apply(op.tool, op.args, op.doc?.id === null ? op.doc.key : undefined)
        .catch(() => null)
      if (replay) operations.push({ ...op, index: operations.length, ...replay, ok: true })
    }
    messages.push({ role: 'user', content: input.prompt })
  } else {
    let contextDoc: string | null = null
    const { collection, id } = input.context ?? {}
    if (collection && id !== undefined && isAiCollection(collection)) {
      contextDoc = await runner.read('get_document', { collection, id }).catch(() => null)
    }
    messages.push({ role: 'user', content: opening(input, contextDoc) })
  }

  const params = (): MessageParams => ({
    model,
    max_tokens: 16_000,
    system: [{ type: 'text', text: systemPrompt(payload.config, settings.systemPromptAddendum) }],
    tools: TOOLS,
    messages,
    cache_control: { type: 'ephemeral' },
    output_config: { effort: 'medium' },
    ...(FALLBACK_MODELS.has(model)
      ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }
      : {}),
  })

  let reply = ''
  let error: string | undefined
  let complete = true

  try {
    for (let turn = 0; ; turn += 1) {
      if (turn >= MAX_TURNS) {
        error =
          'The assistant took too many steps. Review what it proposed, or ask again more specifically.'
        complete = false
        break
      }
      const message = await client.create(params(), (delta) =>
        input.onEvent?.({ type: 'text', delta }),
      )
      usage.add(message.model || model, message.usage)
      messages.push({ role: 'assistant', content: message.content })

      if (message.stop_reason === 'refusal') {
        error = 'The model declined this request.'
        complete = false
        break
      }
      if (message.stop_reason === 'pause_turn') continue
      if (message.stop_reason === 'max_tokens') {
        error = 'The reply was cut off. Ask for fewer changes at a time.'
        complete = false
        break
      }
      const calls = message.content.filter((block) => block.type === 'tool_use')
      if (message.stop_reason !== 'tool_use' || !calls.length) {
        reply = replyText(message.content)
        break
      }

      const results: BetaToolResultBlockParam[] = []
      for (const call of calls) {
        if (call.type !== 'tool_use') continue
        const args = (call.input ?? {}) as Record<string, unknown>
        try {
          if (isWriteTool(call.name)) {
            const writes = operations.filter((op) => op.ok).length
            if (writes >= MAX_WRITE_OPS) {
              throw new OperationError(
                `You have reached the limit of ${MAX_WRITE_OPS} changes for one request.`,
              )
            }
            const outcome = await runner.workspace.apply(call.name, args)
            const entry = outcome.doc
            const record: OperationRecord = {
              index: operations.length,
              tool: call.name,
              args,
              ok: true,
              ...outcome,
              regulated: entry ? runner.workspace.isRegulated(entry.key) : false,
            }
            operations.push(record)
            input.onEvent?.({
              type: 'tool',
              name: call.name,
              ok: true,
              summary: record.summary ?? call.name,
            })
            const created = entry?.id === null ? ` Its id is "${entry.key}".` : ''
            results.push(
              toolResult(
                call.id,
                `Proposed: ${record.summary}.${created} Nothing is saved until the person applies it.`,
              ),
            )
          } else {
            const content = await runner.read(call.name, args)
            input.onEvent?.({
              type: 'tool',
              name: call.name,
              ok: true,
              summary: `Read (${call.name})`,
            })
            results.push(toolResult(call.id, content))
          }
        } catch (caught) {
          const message =
            caught instanceof OperationError
              ? caught.message
              : 'That did not work. Try a different approach.'
          if (isWriteTool(call.name)) {
            operations.push({
              index: operations.length,
              tool: call.name,
              args,
              ok: false,
              error: message,
            })
          }
          input.onEvent?.({ type: 'tool', name: call.name, ok: false, summary: message })
          results.push(toolResult(call.id, message, true))
        }
      }
      messages.push({ role: 'user', content: results })
    }
  } catch (caught) {
    error =
      caught instanceof Error
        ? `The AI service failed: ${caught.message}`
        : 'The AI service failed.'
    complete = false
  }

  const proposals = operations.filter((op) => op.ok)
  const flags = proposals.length ? await claimFlags(payload, client, proposals, usage) : []
  const stored = JSON.stringify(messages).length <= MAX_STORED_MESSAGES
  const status = error && !proposals.length ? 'failed' : 'proposed'

  const changeset = await payload.create({
    collection: 'ai-changesets',
    data: {
      prompt: input.prompt,
      user: user.id,
      model,
      status,
      reply: reply || null,
      error: error ?? null,
      context: input.context ?? null,
      messages: stored
        ? { complete: complete && !error, messages }
        : { complete: false, truncated: true, reply },
      operations,
      affectedDocs: uniqueDocs(proposals),
      flags,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUSD: Number(usage.cost.toFixed(6)),
    },
    overrideAccess: true,
    req: input.req,
  })

  if (previous) {
    await payload.update({
      collection: 'ai-changesets',
      id: previous.id,
      data: { status: 'rejected', supersededBy: changeset.id },
      overrideAccess: true,
      req: input.req,
    })
  }

  return { changeset, reply, error }
}

export function uniqueDocs(operations: OperationRecord[]) {
  const seen = new Map<string, { collection: string; docId: string }>()
  for (const op of operations) {
    if (!op.doc) continue
    seen.set(op.doc.key, {
      collection: op.doc.collection,
      docId: op.doc.id === null ? op.doc.key : String(op.doc.id),
    })
  }
  return [...seen.values()]
}
