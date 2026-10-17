/**
 * Fails (exit 1) if any published document or global still contains `TODO-CONTENT`.
 * Run with `pnpm check:content`; production's pre-deploy runs it so placeholder copy can't go live.
 */
import { getPayload } from 'payload'

import { findPublishedTodoContent } from '../src/lib/todoContent'
import config from '../src/payload.config'

const payload = await getPayload({ config })
const hits = await findPublishedTodoContent(payload)

if (hits.length === 0) {
  console.log('No published content contains TODO-CONTENT.')
  process.exit(0)
}

console.error(`${hits.length} published item(s) still contain TODO-CONTENT:`)
for (const hit of hits) {
  console.error(
    hit.global ? `  global ${hit.global}` : `  ${hit.collection} #${hit.id} ${hit.title ?? ''}`,
  )
}
process.exit(1)
