import { serialize, type Thing } from '@/lib/jsonld'

/** Structured data for search engines (brief §8.3). */
export function JsonLd({ data }: { data: (Thing | null | undefined)[] }) {
  const json = serialize(data)
  if (!json) return null
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
