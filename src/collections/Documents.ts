import type { CollectionConfig } from 'payload'

import { anyone, publishers, staff } from '@/access'

import { adminGroups } from './shared'

export const Documents: CollectionConfig = {
  slug: 'documents',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'versionDate', 'updatedAt'],
    group: adminGroups.library,
    description: 'PDFs and other downloadable files: factsheets, legal documents, reports.',
  },
  access: {
    read: anyone,
    create: staff,
    update: staff,
    delete: publishers,
  },
  upload: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'other',
      options: [
        { label: 'Factsheet', value: 'factsheet' },
        { label: 'Legal', value: 'legal' },
        { label: 'Report', value: 'report' },
        { label: 'Policy', value: 'policy' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'versionDate',
      type: 'date',
      admin: { description: 'The date printed on, or applying to, this version of the document.' },
    },
    {
      name: 'owner',
      type: 'text',
      admin: { description: 'Person or team responsible for keeping this document current.' },
    },
  ],
}
