/**
 * Minimal Lexical (Payload rich text) documents built from plain strings. Each string becomes a
 * paragraph; a string starting with "## " becomes an h2.
 */
export type RichTextDocument = {
  root: {
    type: string
    children: { type: string; version: number; [key: string]: unknown }[]
    direction: 'ltr' | 'rtl' | null
    format: '' | 'center' | 'end' | 'justify' | 'left' | 'right' | 'start'
    indent: number
    version: number
  }
  [key: string]: unknown
}

const text = (value: string) => ({
  type: 'text',
  text: value,
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

export function richText(...blocks: string[]): RichTextDocument {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: blocks.map((block) =>
        block.startsWith('## ')
          ? {
              type: 'heading',
              tag: 'h2',
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
              children: [text(block.slice(3))],
            }
          : {
              type: 'paragraph',
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
              textFormat: 0,
              textStyle: '',
              children: [text(block)],
            },
      ),
    },
  }
}
