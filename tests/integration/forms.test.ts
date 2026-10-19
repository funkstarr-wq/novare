import { createServer, type IncomingMessage } from 'node:http'
import type { AddressInfo } from 'node:net'

import config from '@payload-config'
import { createLocalReq, getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

import { formEndpoints } from '@/endpoints/forms'
import { deleteOldSubmissions } from '@/jobs/retention'
import { issueFormToken } from '@/lib/forms/spam'
import { richText } from '@/lib/lexical'
import type { Form } from '@/payload-types'

// Brief §9 forms: the spam-checked endpoint, routing, CRM webhook and retention (M7).
let payload: Payload
let form: Form
let ipCounter = 0

const submit = formEndpoints.find((endpoint) => endpoint.path === '/submit-form')!.handler

async function post(body: Record<string, unknown>, ip = `198.51.100.${(ipCounter += 1)}`) {
  const req = await createLocalReq({}, payload)
  req.json = async () => body
  Object.assign(req, { headers: new Headers({ 'x-forwarded-for': ip }) })
  const response = (await submit(req)) as Response
  return { status: response.status, body: (await response.json()) as Record<string, unknown> }
}

const fields = (overrides: Record<string, string> = {}) =>
  Object.entries({
    name: 'Integration Visitor',
    email: 'visitor@example.test',
    topic: 'wealth',
    message: 'Hello',
    popiaConsent: 'true',
    ...overrides,
  }).map(([field, value]) => ({ field, value }))

const valid = (overrides: Record<string, unknown> = {}) => ({
  form: form.id,
  submissionData: fields(),
  token: issueFormToken(Date.now() - 5_000),
  website: '',
  ...overrides,
})

const submissionsFor = () =>
  payload.find({ collection: 'form-submissions', where: { form: { equals: form.id } }, depth: 0 })

beforeAll(async () => {
  payload = await getPayload({ config })
  form = await payload.create({
    collection: 'forms',
    data: {
      title: 'Integration enquiry',
      confirmationType: 'message',
      confirmationMessage: richText('Thanks'),
      routing: [
        { topic: 'wealth', emailTo: 'wealth@example.test' },
        { topic: '*', emailTo: 'hello@example.test' },
      ],
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true },
        { blockType: 'email', name: 'email', label: 'Email', required: true },
        {
          blockType: 'select',
          name: 'topic',
          label: 'Topic',
          required: true,
          options: [
            { label: 'Wealth', value: 'wealth' },
            { label: 'Other', value: 'other' },
          ],
        },
        { blockType: 'textarea', name: 'message', label: 'Message', required: true },
        { blockType: 'checkbox', name: 'popiaConsent', label: 'I agree.', required: true },
      ],
    },
  })
})

afterAll(async () => {
  await payload.delete({ collection: 'form-submissions', where: { form: { equals: form.id } } })
  await payload.delete({ collection: 'forms', id: form.id })
})

describe('POST /api/submit-form/', () => {
  it('stores a valid enquiry with its consent record and emails the topic’s address', async () => {
    const sendEmail = vi.spyOn(payload, 'sendEmail')
    const { status } = await post(valid())
    expect(status).toBe(200)

    const { docs } = await submissionsFor()
    const stored = docs.at(-1)!
    expect(stored.consent).toMatchObject({ given: true, text: 'I agree.' })
    expect(stored.submissionData?.find((entry) => entry.field === 'name')?.value).toBe(
      'Integration Visitor',
    )
    const routed = sendEmail.mock.calls.map(([message]) => message).find((message) => message.to)
    expect(routed).toMatchObject({ to: ['wealth@example.test'], replyTo: 'visitor@example.test' })
    sendEmail.mockRestore()
  })

  it('answers a filled honeypot as if it worked, and keeps nothing', async () => {
    const before = (await submissionsFor()).totalDocs
    const { status } = await post(valid({ website: 'http://spam.example' }))
    expect(status).toBe(200)
    expect((await submissionsFor()).totalDocs).toBe(before)
  })

  it.each([
    [{ token: issueFormToken(Date.now()) }, /quick/],
    [{ token: 'forged.token' }, /expired/],
    [{ submissionData: fields({ popiaConsent: 'false' }) }, /must be ticked/],
    [{ submissionData: fields({ email: 'nope' }) }, /email address/],
  ])('refuses %j', async (change, error) => {
    const { status, body } = await post(valid(change))
    expect(status).toBe(400)
    expect(String(body.error)).toMatch(error)
  })

  it('limits each connection to 5 messages in 10 minutes', async () => {
    const ip = '203.0.113.7'
    const statuses = []
    for (let i = 0; i < 6; i += 1) statuses.push((await post(valid(), ip)).status)
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429])
  })

  it('posts the enquiry to the CRM webhook, signed', async () => {
    const received: { body: string; signature?: string }[] = []
    const server = createServer((request: IncomingMessage, response) => {
      let body = ''
      request.on('data', (chunk) => (body += chunk))
      request.on('end', () => {
        received.push({ body, signature: request.headers['x-novare-signature'] as string })
        response.end('ok')
      })
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const { port } = server.address() as AddressInfo
    vi.stubEnv('CRM_WEBHOOK_URL', `http://127.0.0.1:${port}/hook`)
    vi.stubEnv('CRM_WEBHOOK_SECRET', 'integration-secret')
    try {
      expect((await post(valid())).status).toBe(200)
      expect(received).toHaveLength(1)
      expect(JSON.parse(received[0].body)).toMatchObject({
        form: { id: form.id, title: 'Integration enquiry' },
        data: { email: 'visitor@example.test', topic: 'wealth' },
      })
      expect(received[0].signature).toMatch(/^[0-9a-f]{64}$/)
    } finally {
      vi.unstubAllEnvs()
      server.close()
    }
  })
})

describe('retention job', () => {
  it('deletes submissions older than the retention period and keeps newer ones', async () => {
    await post(valid())
    await post(valid())
    const { docs } = await submissionsFor()
    const [old, recent] = docs.slice(-2)
    await payload.db.updateOne({
      collection: 'form-submissions',
      id: old.id,
      data: { createdAt: new Date('2020-01-01T00:00:00Z').toISOString() },
    })

    const result = await deleteOldSubmissions(payload)
    expect(result.deleted).toBeGreaterThanOrEqual(1)
    const remaining = (await submissionsFor()).docs.map((doc) => doc.id)
    expect(remaining).not.toContain(old.id)
    expect(remaining).toContain(recent.id)
  })
})
