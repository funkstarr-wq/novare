import { Section } from '@/components/Section'
import { fileURL } from '@/lib/urls'
import type { Document, DocumentDownloadsBlock } from '@/payload-types'

import type { SectionProps } from './types'

const kb = (bytes: null | number | undefined) =>
  bytes ? `${Math.max(1, Math.round(bytes / 1024))} KB` : null

export function DocumentList({ documents }: { documents: (Document | number)[] }) {
  const files = documents.filter((doc): doc is Document => typeof doc === 'object' && !!doc.url)
  if (files.length === 0) return null
  return (
    <ul className="flex flex-col gap-3">
      {files.map((doc) => (
        <li key={doc.id}>
          <a href={fileURL(doc.url)!} className="text-brand underline">
            {doc.title}
          </a>{' '}
          <span className="text-sm text-ink-muted">
            ({['PDF', kb(doc.filesize)].filter(Boolean).join(', ')})
          </span>
        </li>
      ))}
    </ul>
  )
}

export function DocumentDownloads({ block }: SectionProps<DocumentDownloadsBlock>) {
  return (
    <Section heading={block.heading}>
      <DocumentList documents={block.documents ?? []} />
    </Section>
  )
}
