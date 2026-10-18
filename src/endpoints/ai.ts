import type { Endpoint, PayloadRequest } from 'payload'
import { z } from 'zod'

import { applyChangeset, discardChangeset, rollbackChangeset } from '@/ai/apply'
import { AiRefusal, aiStatus, checkCanPlan, verifiedStaff } from '@/ai/guards'
import { defaultClient } from '@/ai/model'
import type { OperationRecord } from '@/ai/operations'
import { planChangeset } from '@/ai/plan'
import { previewURL } from '@/lib/preview'
import type { AiChangeset } from '@/payload-types'

/**
 * The AI editor's API (brief §10.3), served by Payload under /api/ai/… (with the trailing
 * slash). Every route needs a staff session verified with 2FA; the Anthropic key stays here.
 */

/** A changeset as the admin panel shows it: no conversation, no raw tool input. */
export function changesetView(changeset: AiChangeset) {
  const operations = ((changeset.operations as OperationRecord[] | null) ?? []).map((op) => ({
    index: op.index,
    tool: op.tool,
    ok: op.ok,
    error: op.error,
    summary: op.summary,
    doc: op.doc,
    changes: op.changes ?? [],
    accepted: op.accepted,
  }))
  return {
    id: changeset.id,
    status: changeset.status,
    prompt: changeset.prompt,
    reply: changeset.reply ?? null,
    error: changeset.error ?? null,
    flags: changeset.flags ?? [],
    operations,
    affectedDocs: changeset.affectedDocs ?? [],
    costUSD: changeset.costUSD ?? 0,
    createdAt: changeset.createdAt,
    canContinue:
      changeset.status === 'proposed' &&
      (changeset.messages as { complete?: boolean } | null)?.complete === true,
  }
}
export type ChangesetView = ReturnType<typeof changesetView>

const PlanBody = z.object({
  prompt: z.string().trim().min(1).max(4000),
  context: z
    .object({ collection: z.string().max(64), id: z.union([z.number(), z.string().max(64)]) })
    .optional(),
  continueFrom: z.number().int().positive().optional(),
})
const ChangesetBody = z.object({
  changesetId: z.number().int().positive(),
  accepted: z.array(z.number().int().min(0)).optional(),
})

const body = async <T extends z.ZodType>(req: PayloadRequest, schema: T): Promise<z.output<T>> => {
  const raw = req.json ? await req.json().catch(() => null) : null
  const parsed = schema.safeParse(raw)
  if (!parsed.success) throw new AiRefusal('Invalid request.', 400)
  return parsed.data
}

const handle =
  (run: (req: PayloadRequest) => Promise<Response | unknown>): Endpoint['handler'] =>
  async (req) => {
    try {
      const result = await run(req)
      return result instanceof Response ? result : Response.json(result)
    } catch (error) {
      if (error instanceof AiRefusal) {
        return Response.json({ error: error.message }, { status: error.status })
      }
      if (error instanceof Error && error.name === 'OperationError') {
        return Response.json({ error: error.message }, { status: 409 })
      }
      req.payload.logger.error({ err: error, msg: 'AI editor request failed' })
      return Response.json({ error: 'Something went wrong.' }, { status: 500 })
    }
  }

export const aiEndpoints: Endpoint[] = [
  {
    path: '/ai/status',
    method: 'get',
    handler: handle(async (req) => {
      await verifiedStaff(req)
      return aiStatus(req.payload, defaultClient() !== null)
    }),
  },
  {
    path: '/ai/changesets',
    method: 'get',
    handler: handle(async (req) => {
      const user = await verifiedStaff(req)
      const { docs } = await req.payload.find({
        collection: 'ai-changesets',
        where: { user: { equals: user.id } },
        sort: '-createdAt',
        limit: 50,
        depth: 0,
        overrideAccess: true,
      })
      return { docs: docs.map(changesetView) }
    }),
  },
  {
    path: '/ai/plan',
    method: 'post',
    handler: handle(async (req) => {
      const user = await verifiedStaff(req)
      const input = await body(req, PlanBody)
      const client = defaultClient()
      await checkCanPlan(req.payload, user.id, client !== null)
      const encoder = new TextEncoder()
      // Progress streams as newline-delimited JSON; the last line is the changeset.
      const stream = new ReadableStream({
        async start(controller) {
          const send = (event: unknown) =>
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`))
          try {
            const result = await planChangeset({
              payload: req.payload,
              user: user as never,
              client: client!,
              prompt: input.prompt,
              context: input.context,
              continueFrom: input.continueFrom,
              onEvent: send,
            })
            send({ type: 'done', changeset: changesetView(result.changeset) })
          } catch (error) {
            const message =
              error instanceof AiRefusal ||
              (error instanceof Error && error.name === 'OperationError')
                ? error.message
                : 'Something went wrong.'
            if (!(error instanceof AiRefusal))
              req.payload.logger.error({ err: error, msg: 'AI plan failed' })
            send({ type: 'error', message })
          } finally {
            controller.close()
          }
        },
      })
      return new Response(stream, {
        headers: {
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      })
    }),
  },
  {
    path: '/ai/apply',
    method: 'post',
    handler: handle(async (req) => {
      await verifiedStaff(req)
      const input = await body(req, ChangesetBody)
      const { changeset, docs } = await applyChangeset(req, input.changesetId, input.accepted)
      // The same preview link the admin's live preview uses (verified staff only).
      const withPreview = docs.map((doc) => ({
        ...doc,
        preview: doc.url ? previewURL(doc.url) : null,
      }))
      return { changeset: changesetView(changeset), docs: withPreview }
    }),
  },
  {
    path: '/ai/discard',
    method: 'post',
    handler: handle(async (req) => {
      await verifiedStaff(req)
      const input = await body(req, ChangesetBody)
      return { changeset: changesetView(await discardChangeset(req, input.changesetId)) }
    }),
  },
  {
    path: '/ai/rollback',
    method: 'post',
    handler: handle(async (req) => {
      await verifiedStaff(req)
      const input = await body(req, ChangesetBody)
      const { changeset, notes } = await rollbackChangeset(req, input.changesetId)
      return { changeset: changesetView(changeset), notes }
    }),
  },
]
