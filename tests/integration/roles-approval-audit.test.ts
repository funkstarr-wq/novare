import config from '@payload-config'
import { createLocalReq, getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import type { Role } from '@/collections/Users'
import { submitForReviewEndpoint } from '@/endpoints/submitForReview'
import { richText } from '@/lib/lexical'
import type { User } from '@/payload-types'

let payload: Payload
const users = {} as Record<Role, User>
const created: { collection: Parameters<Payload['delete']>[0]['collection']; id: number }[] = []

const as = (role: Role) => ({ user: users[role], overrideAccess: false as const })
const track = <T extends { id: number }>(
  collection: (typeof created)[number]['collection'],
  doc: T,
) => {
  created.push({ collection, id: doc.id })
  return doc
}
let counter = 0
const unique = (prefix: string) => `${prefix}-${Date.now()}-${(counter += 1)}`

beforeAll(async () => {
  payload = await getPayload({ config })
  for (const role of ['admin', 'editor', 'compliance', 'contributor'] as const) {
    users[role] = await payload.create({
      collection: 'users',
      data: {
        email: `${unique(role)}@roles.example.test`,
        password: 'integration-only-password',
        name: `Test ${role}`,
        roles: [role],
      },
    })
  }
})

afterAll(async () => {
  for (const { collection, id } of created.reverse()) {
    await payload.delete({ collection, id }).catch(() => undefined)
  }
  for (const user of Object.values(users)) {
    await payload.delete({ collection: 'users', id: user.id })
  }
})

const solutionData = (title: string) => ({
  title,
  slug: unique('solution'),
  fspLicenceNumber: 'TODO-CONTENT: licence',
  disclaimer: richText('Disclaimer'),
})

describe('publishing (brief §6.1)', () => {
  it('lets a contributor save drafts but never publish', async () => {
    const draft = track(
      'categories',
      await payload.create({
        collection: 'categories',
        data: { title: 'Contributor draft', slug: unique('category'), _status: 'draft' },
        draft: true,
        ...as('contributor'),
      }),
    )
    expect(draft._status).toBe('draft')

    await expect(
      payload.update({
        collection: 'categories',
        id: draft.id,
        data: { _status: 'published' },
        ...as('contributor'),
      }),
    ).rejects.toThrow(/not allowed/i)
    await expect(
      payload.create({
        collection: 'categories',
        data: { title: 'Contributor publish', slug: unique('category'), _status: 'published' },
        ...as('contributor'),
      }),
    ).rejects.toThrow(/not allowed/i)
  })

  it('lets an editor publish ordinary content', async () => {
    const category = track(
      'categories',
      await payload.create({
        collection: 'categories',
        data: { title: 'Editor publish', slug: unique('category'), _status: 'published' },
        ...as('editor'),
      }),
    )
    expect(category._status).toBe('published')
  })

  it('stops an editor publishing regulated content', async () => {
    const solution = track(
      'solutions',
      await payload.create({
        collection: 'solutions',
        data: { ...solutionData('Regulated draft'), _status: 'draft' },
        draft: true,
        overrideAccess: true,
      }),
    )

    await expect(
      payload.update({
        collection: 'solutions',
        id: solution.id,
        data: { _status: 'published' },
        ...as('editor'),
      }),
    ).rejects.toThrow(/not allowed/i)
  })

  it('treats a page as regulated when its box is ticked', async () => {
    const page = track(
      'pages',
      await payload.create({
        collection: 'pages',
        data: { title: 'Regulated page', slug: unique('page'), regulated: true, _status: 'draft' },
        draft: true,
        overrideAccess: true,
      }),
    )

    await expect(
      payload.update({
        collection: 'pages',
        id: page.id,
        data: { _status: 'published' },
        ...as('editor'),
      }),
    ).rejects.toThrow(/compliance/i)
    await expect(
      payload.delete({ collection: 'pages', id: page.id, ...as('editor') }),
    ).rejects.toThrow(/compliance/i)

    const published = await payload.update({
      collection: 'pages',
      id: page.id,
      data: { _status: 'published' },
      ...as('compliance'),
    })
    expect(published._status).toBe('published')
  })
})

describe('compliance review (brief §6.2)', () => {
  it('approves on compliance publish and returns to draft on a later edit', async () => {
    const solution = track(
      'solutions',
      await payload.create({
        collection: 'solutions',
        data: { ...solutionData('Approval flow'), _status: 'draft' },
        draft: true,
        overrideAccess: true,
      }),
    )

    const published = await payload.update({
      collection: 'solutions',
      id: solution.id,
      data: { _status: 'published' },
      ...as('compliance'),
    })
    expect(published.review).toMatchObject({ reviewStatus: 'approved' })
    expect(published.review?.reviewedAt).toBeTruthy()
    const reviewer = published.review?.reviewedBy
    expect(typeof reviewer === 'object' ? reviewer?.id : reviewer).toBe(users.compliance.id)

    const edited = await payload.update({
      collection: 'solutions',
      id: solution.id,
      data: { summary: 'Changed after approval' },
      draft: true,
      ...as('editor'),
    })
    expect(edited.review?.reviewStatus).toBe('draft')
  })

  it('only lets compliance approve, and ignores reviewer fields sent by anyone else', async () => {
    const solution = track(
      'solutions',
      await payload.create({
        collection: 'solutions',
        data: { ...solutionData('Who approves'), _status: 'draft' },
        draft: true,
        overrideAccess: true,
      }),
    )

    await expect(
      payload.update({
        collection: 'solutions',
        id: solution.id,
        data: { review: { reviewStatus: 'approved' } },
        draft: true,
        ...as('editor'),
      }),
    ).rejects.toThrow(/Only compliance can approve/)

    const forged = await payload.update({
      collection: 'solutions',
      id: solution.id,
      data: { review: { reviewStatus: 'in_review', reviewedBy: users.editor.id } },
      draft: true,
      ...as('editor'),
    })
    expect(forged.review?.reviewStatus).toBe('in_review')
    expect(forged.review?.reviewedBy ?? null).toBeNull()
  })

  it('keeps compliance-only fields away from editors', async () => {
    const solution = track(
      'solutions',
      await payload.create({
        collection: 'solutions',
        data: { ...solutionData('Licence guard'), fspLicenceNumber: 'ORIGINAL', _status: 'draft' },
        draft: true,
        overrideAccess: true,
      }),
    )

    const afterEditor = await payload.update({
      collection: 'solutions',
      id: solution.id,
      data: { fspLicenceNumber: 'CHANGED BY EDITOR' },
      draft: true,
      ...as('editor'),
    })
    expect(afterEditor.fspLicenceNumber).toBe('ORIGINAL')

    const afterCompliance = await payload.update({
      collection: 'solutions',
      id: solution.id,
      data: { fspLicenceNumber: 'CHANGED BY COMPLIANCE' },
      draft: true,
      ...as('compliance'),
    })
    expect(afterCompliance.fspLicenceNumber).toBe('CHANGED BY COMPLIANCE')
  })

  it('lets only compliance and admins edit legal documents', async () => {
    await expect(
      payload.create({
        collection: 'legal-documents',
        data: { title: 'Editor legal doc', slug: unique('legal'), _status: 'draft' },
        draft: true,
        ...as('editor'),
      }),
    ).rejects.toThrow(/not allowed/i)

    const doc = track(
      'legal-documents',
      await payload.create({
        collection: 'legal-documents',
        data: { title: 'Compliance legal doc', slug: unique('legal'), _status: 'draft' },
        draft: true,
        ...as('compliance'),
      }),
    )
    expect(doc.id).toBeDefined()
  })

  it('submits for review and emails every compliance user', async () => {
    const solution = track(
      'solutions',
      await payload.create({
        collection: 'solutions',
        data: { ...solutionData('Submit me'), _status: 'draft' },
        draft: true,
        overrideAccess: true,
      }),
    )
    const sendEmail = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)

    const req = await createLocalReq({ user: users.contributor }, payload)
    req.routeParams = { collection: 'solutions', id: String(solution.id) }
    const response = await submitForReviewEndpoint.handler(req)

    expect(response.status).toBe(200)
    const draft = await payload.findByID({ collection: 'solutions', id: solution.id, draft: true })
    expect(draft.review?.reviewStatus).toBe('in_review')
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.arrayContaining([users.compliance.email]),
        subject: expect.stringContaining('Submit me'),
      }),
    )
    sendEmail.mockRestore()
  })
})

describe('audit log (brief §6.3)', () => {
  const entriesFor = (collection: string, docId: number | string) =>
    payload.find({
      collection: 'audit-log',
      where: { collection: { equals: collection }, docId: { equals: String(docId) } },
      sort: 'timestamp',
      depth: 0,
    })

  it('records create, publish and delete with the user who did it', async () => {
    const category = await payload.create({
      collection: 'categories',
      data: { title: 'Audited', slug: unique('category'), _status: 'draft' },
      draft: true,
      ...as('editor'),
    })
    await payload.update({
      collection: 'categories',
      id: category.id,
      data: { title: 'Audited and published', _status: 'published' },
      ...as('editor'),
    })
    await payload.delete({ collection: 'categories', id: category.id, ...as('editor') })

    const { docs } = await entriesFor('categories', category.id)
    expect(docs.map((entry) => entry.operation)).toEqual(['create', 'publish', 'delete'])
    expect(docs.every((entry) => entry.user === users.editor.id && entry.source === 'human')).toBe(
      true,
    )
    expect(docs[1].diffSummary).toContain('title')
  })

  it('skips admin autosaves', async () => {
    const category = track(
      'categories',
      await payload.create({
        collection: 'categories',
        data: { title: 'Autosaved', slug: unique('category'), _status: 'draft' },
        draft: true,
        ...as('editor'),
      }),
    )
    const req = await createLocalReq({ user: users.editor }, payload)
    req.query = { autosave: 'true' }
    await payload.update({
      collection: 'categories',
      id: category.id,
      data: { description: 'typing…' },
      draft: true,
      overrideAccess: false,
      req,
    })

    const { docs } = await entriesFor('categories', category.id)
    expect(docs.map((entry) => entry.operation)).toEqual(['create'])
  })

  it('marks changes made by the AI editor and links the changeset', async () => {
    const category = track(
      'categories',
      await payload.create({
        collection: 'categories',
        data: { title: 'AI edit', slug: unique('category'), _status: 'draft' },
        draft: true,
        ...as('editor'),
        context: { auditSource: 'ai' },
      }),
    )
    const { docs } = await entriesFor('categories', category.id)
    expect(docs[0].source).toBe('ai')
  })

  it('cannot be edited or deleted, even by an admin', async () => {
    const { docs } = await payload.find({ collection: 'audit-log', limit: 1, depth: 0 })
    const entry = docs[0]
    await expect(
      payload.update({
        collection: 'audit-log',
        id: entry.id,
        data: { diffSummary: 'x' },
        ...as('admin'),
      }),
    ).rejects.toThrow(/not allowed/i)
    await expect(
      payload.delete({ collection: 'audit-log', id: entry.id, ...as('admin') }),
    ).rejects.toThrow(/not allowed/i)
  })
})

describe('users', () => {
  it('lets people edit their own name but not their roles', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: users.editor.id,
      data: { name: 'Renamed editor', roles: ['admin'] },
      ...as('editor'),
    })
    expect(updated.name).toBe('Renamed editor')
    expect(updated.roles).toEqual(['editor'])
  })

  it('lets only admins create accounts', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: `${unique('x')}@roles.example.test`,
          password: 'p',
          name: 'X',
          roles: ['editor'],
        },
        ...as('editor'),
      }),
    ).rejects.toThrow(/not allowed/i)
  })
})

describe('public read access', () => {
  it('shows anonymous visitors published documents only', async () => {
    const draft = track(
      'categories',
      await payload.create({
        collection: 'categories',
        data: { title: 'Hidden draft', slug: unique('category'), _status: 'draft' },
        draft: true,
        overrideAccess: true,
      }),
    )
    const visible = await payload.find({
      collection: 'categories',
      where: { id: { equals: draft.id } },
      overrideAccess: false,
    })
    expect(visible.totalDocs).toBe(0)
  })
})
