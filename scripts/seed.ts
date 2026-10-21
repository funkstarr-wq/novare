/**
 * Dev seed data. Run with `pnpm seed` (`payload run` loads .env and the Payload config).
 * Railway runs it after migrations on every deploy; it only acts in PR environments, and runs
 * the WordPress import when WORDPRESS_IMPORT=true and the redirects import when REDIRECTS_IMPORT=true.
 */
import { getPayload } from 'payload'

import { runSeed, seedSkipReason } from '../src/lib/seed'
import { importRedirectsFile } from '../src/migration/redirects'
import { WordPressClient } from '../src/migration/wordpress/client'
import { importWordPress, reportMarkdown } from '../src/migration/wordpress/import'
import config from '../src/payload.config'

const skipReason = seedSkipReason(process.env)

if (skipReason) {
  console.log(`Seed skipped: ${skipReason}`)
} else {
  const payload = await getPayload({ config })
  await runSeed(payload, process.env)
}

// The WordPress import (M6), when asked for: Railway's pre-deploy step can reach both the
// database and the old site. Idempotent: a re-run adds what is new and leaves imported documents
// alone, unless WORDPRESS_IMPORT_OVERWRITE=true.
if (process.env.WORDPRESS_IMPORT === 'true') {
  const payload = await getPayload({ config })
  const report = await importWordPress(payload, {
    client: new WordPressClient(process.env.WORDPRESS_URL || 'https://novare.com'),
    overwrite: process.env.WORDPRESS_IMPORT_OVERWRITE === 'true',
  })
  console.log(reportMarkdown(report))
}

// The go-live redirects (docs/redirects.csv), after the import that creates their targets.
if (process.env.REDIRECTS_IMPORT === 'true') {
  const payload = await getPayload({ config })
  console.log(await importRedirectsFile(payload, process.env.REDIRECTS_CSV || 'docs/redirects.csv'))
}

process.exit(0)
