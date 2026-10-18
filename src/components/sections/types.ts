import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

/** What every section component receives from `RenderBlocks`. */
export type SectionProps<B> = {
  block: B
  /** First section on the page: a hero then renders the page's `<h1>`. */
  first: boolean
  /** Draft mode: the page is a live preview. */
  draft: boolean
  /** The document the section sits on, for defaults such as its disclaimer. */
  parent: { disclaimer?: SerializedEditorState | null }
}
