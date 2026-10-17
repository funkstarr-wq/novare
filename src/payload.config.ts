import { postgresAdapter } from '@payloadcms/db-postgres'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { AiChangesets } from './collections/AiChangesets'
import { AuditLog } from './collections/AuditLog'
import { Awards } from './collections/Awards'
import { Categories } from './collections/Categories'
import { Documents } from './collections/Documents'
import { Funds } from './collections/Funds'
import { Insights } from './collections/Insights'
import { Jobs } from './collections/Jobs'
import { LegalDocuments } from './collections/LegalDocuments'
import { Media } from './collections/Media'
import { Offices } from './collections/Offices'
import { Pages } from './collections/Pages'
import { People } from './collections/People'
import { PressMentions } from './collections/PressMentions'
import { Projects } from './collections/Projects'
import { Research } from './collections/Research'
import { adminGroups } from './collections/shared'
import { Solutions } from './collections/Solutions'
import { Users } from './collections/Users'
import { linkableCollections } from './fields/link'
import { richTextEditor } from './fields/richText'
import { AiSettings, Footer, Header, SiteSettings } from './globals'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | Novare CMS',
    },
  },
  collections: [
    Pages,
    Solutions,
    Funds,
    Projects,
    People,
    Offices,
    Awards,
    Jobs,
    Insights,
    Categories,
    PressMentions,
    Research,
    Media,
    Documents,
    LegalDocuments,
    Users,
    AiChangesets,
    AuditLog,
  ],
  globals: [Header, Footer, SiteSettings, AiSettings],
  editor: richTextEditor,
  // English only for v1, but every locale-aware API is already in place: adding a language is
  // this list plus `localized: true` on the fields that need translating (brief §1 non-goals).
  localization: {
    locales: [{ label: 'English', code: 'en' }],
    defaultLocale: 'en',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      connectionTimeoutMillis: 10_000,
    },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Local dev pushes schema changes automatically. CI and every Railway environment run
    // committed migrations instead (`pnpm payload migrate`); set PAYLOAD_DB_PUSH=false to match.
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
  }),
  sharp,
  telemetry: false,
  plugins: [
    nestedDocsPlugin({
      collections: ['pages'],
      generateLabel: (_, doc) => String(doc.title ?? ''),
      generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
    }),
    seoPlugin({
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => {
        const title = doc?.title ?? doc?.name
        return title ? `${title} | Novare` : 'Novare'
      },
      generateURL: ({ doc }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${doc?.path ?? (doc?.slug ? `/${doc.slug}/` : '/')}`,
    }),
    redirectsPlugin({
      collections: linkableCollections,
      redirectTypes: ['301', '302'],
      overrides: {
        admin: { group: adminGroups.site },
      },
    }),
    formBuilderPlugin({
      fields: {
        text: true,
        textarea: true,
        email: true,
        select: true,
        checkbox: true,
        message: true,
        number: false,
        date: false,
        country: false,
        state: false,
        upload: false,
        payment: false,
      },
      formOverrides: { admin: { group: adminGroups.site } },
      formSubmissionOverrides: { admin: { group: adminGroups.site } },
    }),
    // Media and documents go to the Railway Bucket when S3_BUCKET is set; local disk otherwise.
    // alwaysInsertFields keeps the schema identical either way, so migrations don't diverge.
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      alwaysInsertFields: true,
      collections: { media: true, documents: true },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT || undefined,
        region: process.env.S3_REGION || 'auto',
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
})
