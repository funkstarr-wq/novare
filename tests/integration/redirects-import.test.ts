import config from '@payload-config'
import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { importRedirects, parseRedirectsCsv } from '@/migration/redirects'

// M8: the go-live redirects import upserts by the old path and never deletes.
let payload: Payload
const PREFIX = '/m8-test-'

beforeAll(async () => {
  payload = await getPayload({ config })
})

afterAll(async () => {
  await payload.delete({
    collection: 'redirects',
    where: { from: { like: PREFIX } },
    overrideAccess: true,
  })
})

const find = async (from: string) =>
  (
    await payload.find({
      collection: 'redirects',
      where: { from: { equals: from } },
      depth: 0,
      overrideAccess: true,
    })
  ).docs

describe('redirects import', () => {
  it('creates, then leaves alone, then updates, without deleting anything', async () => {
    const first = parseRedirectsCsv(
      `old,new,status\n${PREFIX}a/,/insights/a/,301\n${PREFIX}b/,/careers/,302\n`,
    )
    expect(await importRedirects(payload, first)).toEqual({ created: 2, updated: 0, unchanged: 0 })
    expect((await find(`${PREFIX}a/`))[0]).toMatchObject({
      type: '301',
      to: { type: 'custom', url: '/insights/a/' },
    })

    expect(await importRedirects(payload, first)).toEqual({ created: 0, updated: 0, unchanged: 2 })

    const second = parseRedirectsCsv(`${PREFIX}a/,/insights/a-renamed/,301\n`)
    expect(await importRedirects(payload, second)).toEqual({ created: 0, updated: 1, unchanged: 0 })
    expect((await find(`${PREFIX}a/`))[0].to?.url).toBe('/insights/a-renamed/')
    // Rows missing from the CSV stay.
    expect(await find(`${PREFIX}b/`)).toHaveLength(1)
    expect(await find(`${PREFIX}a/`)).toHaveLength(1)
  })
})
