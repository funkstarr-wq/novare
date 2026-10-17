import type { CollectionConfig } from 'payload'

import { anyone, publishers, staff } from '@/access'

import { adminGroups } from './shared'

// Images. Stored in the Railway bucket when S3 is configured; AVIF/WebP are produced by
// next/image at request time, so only width variants are generated here.
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    group: adminGroups.library,
  },
  access: {
    read: anyone,
    create: staff,
    update: staff,
    delete: publishers,
  },
  upload: {
    mimeTypes: ['image/*'],
    focalPoint: true,
    adminThumbnail: 'w400',
    imageSizes: [400, 800, 1200, 1600, 2400].map((width) => ({
      name: `w${width}`,
      width,
      withoutEnlargement: true,
    })),
  },
  fields: [
    {
      name: 'alt',
      label: 'Alt text',
      type: 'text',
      required: true,
      admin: { description: 'Describe the image for people who cannot see it.' },
    },
  ],
}
