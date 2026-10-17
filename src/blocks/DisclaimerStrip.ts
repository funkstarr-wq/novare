import type { Block } from 'payload'

export const DisclaimerStripBlock: Block = {
  slug: 'disclaimerStrip',
  interfaceName: 'DisclaimerStripBlock',
  fields: [
    {
      name: 'content',
      type: 'richText',
      admin: { description: "Leave empty to show this page's own disclaimer." },
    },
  ],
}
