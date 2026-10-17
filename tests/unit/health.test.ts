import { afterEach, describe, expect, it, vi } from 'vitest'

import { checkHealth } from '@/lib/health'

describe('checkHealth', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports healthy without probing when no database is configured', async () => {
    const probeDatabase = vi.fn()

    await expect(checkHealth({ databaseUrl: undefined, probeDatabase })).resolves.toEqual({
      status: 'ok',
      db: 'not_configured',
    })
    expect(probeDatabase).not.toHaveBeenCalled()
  })

  it('reports healthy when the database answers', async () => {
    const report = await checkHealth({
      databaseUrl: 'postgres://db',
      probeDatabase: async () => undefined,
    })

    expect(report).toEqual({ status: 'ok', db: 'ok' })
  })

  it('reports an error when the probe fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const report = await checkHealth({
      databaseUrl: 'postgres://db',
      probeDatabase: async () => {
        throw new Error('connection refused')
      },
    })

    expect(report).toEqual({ status: 'error', db: 'unreachable' })
  })

  it('reports an error when the probe hangs past the timeout', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const report = await checkHealth({
      databaseUrl: 'postgres://db',
      probeDatabase: () => new Promise(() => undefined),
      timeoutMs: 10,
    })

    expect(report).toEqual({ status: 'error', db: 'unreachable' })
  })
})
