import {
  BlockquoteFeature,
  BoldFeature,
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'

import { linkableCollections } from './link'

/**
 * The only formatting editors (and the AI editor, §10.4) get: paragraphs, h2–h4, lists, quotes,
 * links, bold and italic. No colours, alignment, embeds or raw HTML.
 */
export const baseRichTextFeatures = () => [
  ParagraphFeature(),
  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
  BoldFeature(),
  ItalicFeature(),
  UnorderedListFeature(),
  OrderedListFeature(),
  BlockquoteFeature(),
  LinkFeature({ enabledCollections: linkableCollections }),
  FixedToolbarFeature(),
  InlineToolbarFeature(),
]

export const richTextEditor = lexicalEditor({ features: baseRichTextFeatures })
