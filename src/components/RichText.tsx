import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { pathFor } from '@/lib/urls'
import type {
  ArticleImageBlock,
  ArticleQuoteBlock,
  CalloutBlock,
  ChartImageBlock,
} from '@/payload-types'

import { Media } from './Media'

type BlockNode<T> = { node: { fields: T } }

const Figure = ({ fields }: { fields: ArticleImageBlock | ChartImageBlock }) => (
  <figure className="flex flex-col gap-2">
    <Media media={fields.image} sizes="(min-width: 768px) 68ch, 100vw" className="h-auto w-full" />
    {(fields.caption || ('source' in fields && fields.source)) && (
      <figcaption className="text-sm text-ink-muted">
        {fields.caption}
        {'source' in fields && fields.source && <> Source: {fields.source}</>}
      </figcaption>
    )}
  </figure>
)

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // Blocks editors can place inside an insight's body (src/collections/Insights.ts).
  blocks: {
    articleQuote: ({ node }: BlockNode<ArticleQuoteBlock>) => (
      <figure className="border-l-4 border-brand pl-4">
        <blockquote className="text-xl">{node.fields.text}</blockquote>
        {node.fields.attribution && (
          <figcaption className="mt-2 text-ink-muted">{node.fields.attribution}</figcaption>
        )}
      </figure>
    ),
    articleImage: ({ node }: BlockNode<ArticleImageBlock>) => <Figure fields={node.fields} />,
    chartImage: ({ node }: BlockNode<ChartImageBlock>) => <Figure fields={node.fields} />,
    callout: ({ node }: BlockNode<CalloutBlock>) => (
      <aside className="rounded-lg bg-surface-muted p-6">
        {node.fields.heading && <p className="font-semibold">{node.fields.heading}</p>}
        <p>{node.fields.text}</p>
      </aside>
    ),
  },
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const doc = linkNode.fields.doc
      if (!doc || typeof doc.value !== 'object') return '#'
      return pathFor(doc.relationTo, doc.value) ?? '#'
    },
  }),
})

type Props = { data: SerializedEditorState | null | undefined; className?: string }

/** Rich text from Payload, styled by `.rich-text` in globals.css. Headings start at h2. */
export function RichText({ data, className }: Props) {
  if (!data) return null
  return (
    <LexicalRichText
      data={data}
      converters={converters}
      className={['rich-text', className].filter(Boolean).join(' ')}
    />
  )
}
