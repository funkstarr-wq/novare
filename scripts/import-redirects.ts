/**
 * Imports docs/redirects.csv (old,new,status) into the redirects collection:
 * `pnpm import:redirects`. Upserts by the old path and never deletes (docs/launch-runbook.md).
 * On Railway it runs in the pre-deploy step when REDIRECTS_IMPORT=true (scripts/seed.ts).
 */
import { getPayload } from 'payload'

import { importRedirectsFile } from '../src/migration/redirects'
import config from '../src/payload.config'

const payload = await getPayload({ config })
console.log(await importRedirectsFile(payload, process.env.REDIRECTS_CSV || 'docs/redirects.csv'))
process.exit(0)
