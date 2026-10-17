import type { Block } from 'payload'

export const DocumentDownloadsBlock: Block = {
  slug: 'documentDownloads',
  interfaceName: 'DocumentDownloadsBlock',
  fields: [
    { name: 'heading', type: 'text' },
    {
      name: 'documents',
      type: 'relationship',
      relationTo: 'documents',
      hasMany: true,
      required: true,
    },
  ],
}
