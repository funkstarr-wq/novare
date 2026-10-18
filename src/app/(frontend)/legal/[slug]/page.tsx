import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PageHeader } from '@/components/PageHeader'
import { RichText } from '@/components/RichText'
import { Section } from '@/components/Section'
import { DocumentList } from '@/components/sections/DocumentDownloads'
import { formatDate } from '@/lib/format'
import { getBySlug } from '@/lib/queries'
import { pathFor } from '@/lib/urls'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const doc = await getBySlug(draft, 'legal-documents', (await params).slug)
  if (!doc) return {}
  return { title: doc.meta?.title || doc.title, description: doc.meta?.description ?? undefined }
}

export default async function LegalPage({ params }: Props) {
  const { isEnabled: draft } = await draftMode()
  const doc = await getBySlug(draft, 'legal-documents', (await params).slug)
  if (!doc) notFound()
  return (
    <>
      <Breadcrumbs items={[{ href: pathFor('legal-documents', doc)!, label: doc.title }]} />
      <PageHeader title={doc.title}>
        {doc.versionDate && (
          <p className="text-ink-muted">
            Last updated <time dateTime={doc.versionDate}>{formatDate(doc.versionDate)}</time>
          </p>
        )}
      </PageHeader>
      <Section>
        <RichText data={doc.body} />
      </Section>
      {doc.file && (
        <Section heading="Download">
          <DocumentList documents={[doc.file]} />
        </Section>
      )}
    </>
  )
}
