import { describe, expect, it } from 'vitest'

import { richText } from '@/lib/lexical'

describe('richText', () => {
  it('makes one paragraph per string and an h2 for "## " lines', () => {
    const doc = richText('## Heading', 'Body text')

    expect(doc.root.children.map((node) => [node.type, node.tag])).toEqual([
      ['heading', 'h2'],
      ['paragraph', undefined],
    ])
    expect(JSON.stringify(doc)).toContain('"text":"Heading"')
    expect(JSON.stringify(doc)).not.toContain('## ')
  })
})
