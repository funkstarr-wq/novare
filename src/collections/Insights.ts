import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, CollectionConfig } from 'payload'

import { baseRichTextFeatures } from '@/fields/richText'
import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions } from './shared'

// Blocks an article body may embed (brief §5.1).
const articleBlocks: Block[] = [
  {
    slug: 'articleQuote',
    interfaceName: 'ArticleQuoteBlock',
    labels: { singular: 'Quote', plural: 'Quotes' },
    fields: [
      { name: 'text', type: 'textarea', required: true },
      { name: 'attribution', type: 'text' },
    ],
  },
  {
    slug: 'articleImage',
    interfaceName: 'ArticleImageBlock',
    labels: { singular: 'Image', plural: 'Images' },
    fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      { name: 'caption', type: 'text' },
    ],
  },
  {
    slug: 'chartImage',
    interfaceName: 'ChartImageBlock',
    labels: { singular: 'Chart', plural: 'Charts' },
    fields: [
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      { name: 'caption', type: 'text' },
      {
        name: 'source',
        type: 'text',
        admin: { description: 'Where the data comes from, shown under the chart.' },
      },
    ],
  },
  {
    slug: 'callout',
    interfaceName: 'CalloutBlock',
    labels: { singular: 'Callout', plural: 'Callouts' },
    fields: [
      { name: 'heading', type: 'text' },
      { name: 'text', type: 'textarea', required: true },
    ],
  },
]

export const Insights: CollectionConfig = {
  slug: 'insights',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    group: adminGroups.insights,
    description: "Novare's own articles.",
  },
  defaultSort: '-publishedAt',
  versions: draftVersions,
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Article',
          fields: [
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'excerpt', type: 'textarea' },
            {
              name: 'body',
              type: 'richText',
              editor: lexicalEditor({
                features: () => [
                  ...baseRichTextFeatures(),
                  BlocksFeature({ blocks: articleBlocks }),
                ],
              }),
            },
          ],
        },
        {
          label: 'Related',
          fields: [
            {
              name: 'relatedSolutions',
              type: 'relationship',
              relationTo: 'solutions',
              hasMany: true,
            },
          ],
        },
        seoTab,
      ],
    },
    slugField(),
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
    { name: 'author', type: 'relationship', relationTo: 'people', admin: { position: 'sidebar' } },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: { position: 'sidebar' },
    },
  ],
}
