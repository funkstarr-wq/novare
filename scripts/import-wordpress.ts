/**
 * The WordPress import (brief §11): `MIGRATION_REPORT=docs/migration-report.md pnpm import:wp`.
 * Reads https://novare.com (or WORDPRESS_URL) and upserts into the database in DATABASE_URL.
 * On Railway it runs in the pre-deploy step when WORDPRESS_IMPORT=true (scripts/seed.ts).
 */
import { writeFileSync } from 'node:fs'

import { getPayload } from 'payload'

import { WordPressClient } from '../src/migration/wordpress/client'
import { importWordPress, reportMarkdown } from '../src/migration/wordpress/import'
import config from '../src/payload.config'

// `payload run` does not pass arguments through, so the report path comes from the environment.
const reportPath = process.env.MIGRATION_REPORT || null

const payload = await getPayload({ config })
const report = await importWordPress(payload, {
  client: new WordPressClient(process.env.WORDPRESS_URL || 'https://novare.com'),
  overwrite: process.env.WORDPRESS_IMPORT_OVERWRITE === 'true',
})
const markdown = reportMarkdown(report)
if (reportPath) writeFileSync(reportPath, markdown)
else console.log(markdown)
process.exit(0)
