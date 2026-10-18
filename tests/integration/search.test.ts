import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { search } from '@/lib/search'

let payload: Payload
const ids: number[] = []
const word = `zephyrine${Date.now()}`

beforeAll(async () => {
  payload = await getPayload({ config })
  for (const [title, status] of [
    [`Published ${word} outlook`, 'published'],
    [`Draft ${word} outlook`, 'draft'],
  ] as const) {
    const insight = await payload.create({
      collection: 'insights',
      data: {
        title,
        slug: `${status}-${word}`,
        excerpt: 'An integration test insight',
        _status: status,
      },
      draft: status === 'draft',
    })
    ids.push(insight.id)
  }
})

afterAll(async () => {
  for (const id of ids) await payload.delete({ collection: 'insights', id })
})

describe('site search (brief §7, /search/)', () => {
  it('finds published documents by a word in the title, with their URL', async () => {
    const results = await search(word)
    expect(results).toEqual([
      expect.objectContaining({
        collection: 'insights',
        title: `Published ${word} outlook`,
        href: `/insights/published-${word}/`,
      }),
    ])
  })

  it('ignores drafts, empty queries and stray syntax', async () => {
    expect((await search(word)).some((result) => result.title.startsWith('Draft'))).toBe(false)
    expect(await search('   ')).toEqual([])
    await expect(search(`"${word}" OR -' ; drop table insights; --`)).resolves.toBeInstanceOf(Array)
  })
})
