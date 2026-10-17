/**
 * Dev seed data. Run with `pnpm seed` (`payload run` loads .env and the Payload config).
 * Railway runs it after migrations on every deploy; it only acts in PR environments.
 */
import { getPayload } from 'payload'

import { runSeed, seedSkipReason } from '../src/lib/seed'
import config from '../src/payload.config'

const skipReason = seedSkipReason(process.env)

if (skipReason) {
  console.log(`Seed skipped: ${skipReason}`)
} else {
  const payload = await getPayload({ config })
  await runSeed(payload, process.env)
}

process.exit(0)
