import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { contentWrite } from '@/access'
import type { Role } from '@/collections/Users'

const check = (regulated: boolean, role: Role | null, data: Record<string, unknown>) =>
  contentWrite(regulated)({
    req: { user: role ? { id: 1, roles: [role] } : null } as unknown as PayloadRequest,
    data,
  })

describe('contentWrite (brief §6.1)', () => {
  it.each([
    // [regulated, role, publishing, allowed]
    [false, 'contributor', false, true],
    [false, 'contributor', true, false],
    [false, 'editor', true, true],
    [true, 'editor', false, true],
    [true, 'editor', true, false],
    [true, 'compliance', true, true],
    [true, 'admin', true, true],
    [false, null, false, false],
  ] as const)('regulated=%s %s publishing=%s → %s', (regulated, role, publishing, allowed) => {
    expect(check(regulated, role, { _status: publishing ? 'published' : 'draft' })).toBe(allowed)
  })

  it('treats a page with the regulated box ticked as regulated', () => {
    expect(check(false, 'editor', { _status: 'published', regulated: true })).toBe(false)
    expect(check(false, 'compliance', { _status: 'published', regulated: true })).toBe(true)
  })
})
