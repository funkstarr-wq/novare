import config from '@payload-config'
import type { BetaContentBlock } from '@anthropic-ai/sdk/resources/beta/messages/messages'
import { createLocalReq, getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { applyChangeset, rollbackChangeset } from '@/ai/apply'
import { AiRefusal } from '@/ai/guards'
import { message, text, toolUse } from '@/ai/mock'
import type { MessageParams, ModelClient } from '@/ai/model'
import { planChangeset } from '@/ai/plan'
import type { Role } from '@/collections/Users'
import { richText } from '@/lib/lexical'
import type { AiChangeset, Page, User } from '@/payload-types'

// Brief §10.8 integration tests, with a mock Anthropic client playing recorded tool calls.
let payload: Payload
const users = {} as Record<Role, User>
const cleanup: { collection: 'pages' | 'solutions'; id: number }[] = []
let counter = 0
const unique = (prefix: string) => `${prefix}-${Date.now()}-${(counter += 1)}`

// A session that has entered its 2FA code (payload-totp marks it with this strategy).
const session = (role: Role) => ({ ...users[role], collection: 'users', _strategy: 'totp' })
const reqAs = (role: Role) => createLocalReq({ user: session(role) as never }, payload)

/** A recorded conversation: the model's turns in order, then the claims classifier's verdict. */
function fixtureClient(turns: BetaContentBlock[][], verdict = false) {
  const requests: MessageParams[] = []
  let turn = 0
  const client: ModelClient = {
    async create(params) {
      requests.push(structuredClone(params))
      if (params.output_config?.format) {
        return message(
          [
            text(
              JSON.stringify({
                contains_claim: verdict,
                reason: verdict ? 'A return claim.' : 'None.',
              }),
            ),
          ],
          'end_turn',
          params.model,
        )
      }
      const content = turns[turn] ?? [text('Done.')]
      turn += 1
      const usesTool = content.some((block) => block.type === 'tool_use')
      return message(content, usesTool ? 'tool_use' : 'end_turn', params.model)
    },
  }
  return { client, requests }
}

const editHero = (collection: string, id: number, heading: string) => [
  [text('I will read the page first.'), toolUse('get_document', { collection, id })],
  [toolUse('update_fields', { collection, id, fields: { hero: { heading } } })],
  [text(`I proposed changing the hero heading to "${heading}".`)],
]

async function plan(role: Role, prompt: string, turns: BetaContentBlock[][], verdict = false) {
  const { client, requests } = fixtureClient(turns, verdict)
  const result = await planChangeset({
    payload,
    user: session(role) as never,
    client,
    prompt,
    context: undefined,
  })
  return { ...result, requests }
}

async function page(heading: string, extra: Partial<Page> = {}) {
  const doc = await payload.create({
    collection: 'pages',
    data: {
      title: unique('AI page'),
      slug: unique('ai-page'),
      hero: { heading },
      _status: 'published',
      ...extra,
    } as never,
  })
  cleanup.push({ collection: 'pages', id: doc.id })
  return doc
}

const draftOf = (id: number) =>
  payload.findByID({ collection: 'pages', id, draft: true, depth: 0 }) as Promise<Page>
const liveOf = (id: number) =>
  payload.findByID({ collection: 'pages', id, depth: 0 }) as Promise<Page>
const reload = (changeset: AiChangeset) =>
  payload.findByID({ collection: 'ai-changesets', id: changeset.id, depth: 0 })

const setSettings = (data: Record<string, unknown>) =>
  payload.updateGlobal({ slug: 'ai-settings', data, overrideAccess: true })

beforeAll(async () => {
  payload = await getPayload({ config })
  for (const role of ['admin', 'editor', 'compliance', 'contributor'] as const) {
    users[role] = await payload.create({
      collection: 'users',
      data: {
        email: `${unique(role)}@ai.example.test`,
        password: 'integration-only-password',
        name: `AI ${role}`,
        roles: [role],
      },
    })
  }
  await setSettings({ enabled: true, monthlyBudgetUSD: 50, regulatedPhrases: [] })
})

afterAll(async () => {
  await setSettings({ enabled: false, monthlyBudgetUSD: null })
  await payload.delete({ collection: 'ai-changesets', where: { id: { exists: true } } })
  for (const { collection, id } of cleanup.reverse()) {
    await payload.delete({ collection, id }).catch(() => undefined)
  }
  for (const user of Object.values(users)) {
    await payload.delete({ collection: 'audit-log', where: { user: { equals: user.id } } })
    await payload.delete({ collection: 'users', id: user.id })
  }
})

describe('plan → apply → publish (brief §10.3)', () => {
  it('proposes without writing, applies to a draft as the user, and marks it published', async () => {
    const target = await page('Old heading')
    const { changeset, requests } = await plan(
      'editor',
      'Change the hero heading to "New heading"',
      editHero('pages', target.id, 'New heading'),
    )

    // Read tools ran; the write was only proposed.
    expect(changeset.status).toBe('proposed')
    expect((await draftOf(target.id)).hero?.heading).toBe('Old heading')
    const [op] = changeset.operations as { tool: string; changes: unknown[] }[]
    expect(op.tool).toBe('update_fields')
    expect(op.changes).toEqual([
      { path: 'hero.heading', before: 'Old heading', after: 'New heading' },
    ])
    expect(changeset.costUSD).toBeGreaterThan(0)

    // The document went to the model inside a data section, with the system prompt's rules.
    const toolResult = JSON.stringify(requests[1].messages.at(-1))
    expect(toolResult).toContain('document_data')
    expect(JSON.stringify(requests[0].system)).toContain('Never invent')
    expect(JSON.stringify(requests[0])).not.toMatch(/integration-only-password|@ai\.example\.test/)

    const { docs } = await applyChangeset(await reqAs('editor'), changeset.id)
    expect(docs[0]).toMatchObject({ collection: 'pages', id: target.id, inReview: false })
    expect((await draftOf(target.id)).hero?.heading).toBe('New heading')
    expect((await liveOf(target.id)).hero?.heading).toBe('Old heading')

    const applied = await reload(changeset)
    expect(applied.status).toBe('applied_to_draft')
    expect(applied.affectedDocs?.[0].beforeVersionId).toBeTruthy()
    const audit = await payload.find({
      collection: 'audit-log',
      where: {
        and: [{ collection: { equals: 'pages' } }, { docId: { equals: String(target.id) } }],
      },
      sort: '-createdAt',
      depth: 0,
    })
    expect(audit.docs[0]).toMatchObject({ source: 'ai', changesetId: changeset.id })

    await payload.update({
      collection: 'pages',
      id: target.id,
      data: { _status: 'published' },
      user: session('editor'),
      overrideAccess: false,
    })
    expect((await liveOf(target.id)).hero?.heading).toBe('New heading')
    expect((await reload(changeset)).status).toBe('published')
  })

  it('lets a contributor apply drafts but not publish them', async () => {
    const target = await page('Contributor heading')
    const { changeset } = await plan(
      'contributor',
      'Change the hero heading to "Drafted by a contributor"',
      editHero('pages', target.id, 'Drafted by a contributor'),
    )
    await applyChangeset(await reqAs('contributor'), changeset.id)
    expect((await draftOf(target.id)).hero?.heading).toBe('Drafted by a contributor')

    await expect(
      payload.update({
        collection: 'pages',
        id: target.id,
        data: { _status: 'published' },
        user: session('contributor'),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    expect((await liveOf(target.id)).hero?.heading).toBe('Contributor heading')
  })

  it('does not let someone else apply your changeset', async () => {
    const target = await page('Mine')
    const { changeset } = await plan(
      'editor',
      'Change the hero heading to "Theirs"',
      editHero('pages', target.id, 'Theirs'),
    )
    await expect(applyChangeset(await reqAs('contributor'), changeset.id)).rejects.toThrow(
      AiRefusal,
    )
  })
})

describe('compliance (brief §10.7)', () => {
  it('sends a regulated document to compliance review', async () => {
    const solution = await payload.create({
      collection: 'solutions',
      data: {
        title: unique('AI solution'),
        slug: unique('ai-solution'),
        fspLicenceNumber: 'TODO-CONTENT: licence',
        disclaimer: richText('Disclaimer'),
        _status: 'published',
      },
    })
    cleanup.push({ collection: 'solutions', id: solution.id })
    const { changeset } = await plan('editor', 'Tighten the summary', [
      [
        toolUse('update_fields', {
          collection: 'solutions',
          id: solution.id,
          fields: { summary: 'A clearer summary.' },
        }),
      ],
      [text('Proposed. This needs compliance approval.')],
    ])
    expect(changeset.flags?.map((flag) => flag.type)).toContain('regulated')

    const { docs } = await applyChangeset(await reqAs('editor'), changeset.id)
    expect(docs[0].inReview).toBe(true)
    const draft = await payload.findByID({
      collection: 'solutions',
      id: solution.id,
      draft: true,
      depth: 0,
    })
    expect(draft.review?.reviewStatus).toBe('in_review')
    await expect(
      payload.update({
        collection: 'solutions',
        id: solution.id,
        data: { _status: 'published' },
        user: session('editor'),
        overrideAccess: false,
      }),
    ).rejects.toThrow(/not allowed|compliance/i)
  })

  it('holds a possible financial claim on any document for compliance', async () => {
    const target = await page('Plain heading')
    const { changeset } = await plan(
      'editor',
      'Make the hero heading punchier',
      editHero('pages', target.id, 'Guaranteed returns of 15% a year'),
      true,
    )
    expect(changeset.flags?.map((flag) => flag.type)).toEqual(
      expect.arrayContaining(['financial_claim', 'claims_check']),
    )
    await applyChangeset(await reqAs('editor'), changeset.id)

    const publish = (role: Role) =>
      payload.update({
        collection: 'pages',
        id: target.id,
        data: { _status: 'published' },
        user: session(role),
        overrideAccess: false,
      })
    await expect(publish('editor')).rejects.toThrow(/financial claim/)
    await publish('compliance')
    expect((await reload(changeset)).status).toBe('published')
  })
})

describe('guards', () => {
  it('refuses new plans when switched off or over the monthly budget', async () => {
    const target = await page('Budget heading')
    const turns = () => editHero('pages', target.id, 'Over budget')

    await setSettings({ enabled: false })
    await expect(plan('editor', 'x', turns())).rejects.toThrow(/switched off/)

    await setSettings({ enabled: true, monthlyBudgetUSD: 0.000001 })
    await expect(plan('editor', 'x', turns())).rejects.toThrow(/budget/)

    await setSettings({ enabled: true, monthlyBudgetUSD: null })
    const before = process.env.AI_MONTHLY_BUDGET_USD
    delete process.env.AI_MONTHLY_BUDGET_USD
    await expect(plan('editor', 'x', turns())).rejects.toThrow(/Set a monthly budget/)
    if (before !== undefined) process.env.AI_MONTHLY_BUDGET_USD = before

    await setSettings({ enabled: true, monthlyBudgetUSD: 50 })
  })

  it('returns invalid proposals to the model as errors and never applies them', async () => {
    const target = await page('Guarded')
    const { changeset, requests } = await plan('editor', 'Change the slug', [
      [
        toolUse('update_fields', {
          collection: 'pages',
          id: target.id,
          fields: { slug: 'moved', parent: 1 },
        }),
      ],
      [text('I cannot change the URL of a live page.')],
    ])
    // Nothing valid to apply; the conversation stays open so the person can answer.
    expect((changeset.operations as { ok: boolean }[]).map((op) => op.ok)).toEqual([false])
    const result = JSON.stringify(requests[1].messages.at(-1))
    expect(result).toContain('is_error')
    expect(result).toContain('needs a redirect')
    await expect(applyChangeset(await reqAs('editor'), changeset.id)).rejects.toThrow(
      /at least one/,
    )
  })
})

describe('rollback (brief §10.3 step 8)', () => {
  it('restores the version from before the changeset as a new draft', async () => {
    const target = await page('Before rollback')
    const { changeset } = await plan(
      'editor',
      'Change the hero heading to "After"',
      editHero('pages', target.id, 'After'),
    )
    await applyChangeset(await reqAs('editor'), changeset.id)
    expect((await draftOf(target.id)).hero?.heading).toBe('After')

    await rollbackChangeset(await reqAs('editor'), changeset.id)
    expect((await draftOf(target.id)).hero?.heading).toBe('Before rollback')
    expect((await reload(changeset)).status).toBe('rolled_back')
  })
})
