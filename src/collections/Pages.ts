import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

import { layoutField } from '@/fields/layout'
import { linkField } from '@/fields/link'
import { seoTab } from '@/fields/seo'
import { slugField } from '@/fields/slug'

import { adminGroups, draftVersions } from './shared'

/**
 * The page's URL path with a trailing slash, from the breadcrumbs the nested-docs plugin has just
 * populated (its hook runs before this one). The top-level page with slug `home` is `/`.
 */
const setPath: CollectionBeforeChangeHook = ({ data }) => {
  const crumbs: { url?: null | string }[] | undefined = data.breadcrumbs
  const url = crumbs?.at(-1)?.url

  if (data.slug === 'home' && !data.parent) data.path = '/'
  else if (url) data.path = `${url}/`
  else if (data.slug) data.path = `/${data.slug}/`

  return data
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', '_status', 'updatedAt'],
    group: adminGroups.site,
    description: 'Hubs and general pages: home, About, History, Impact, Contact and so on.',
  },
  versions: draftVersions,
  hooks: { beforeChange: [setPath] },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'hero',
              type: 'group',
              fields: [
                { name: 'heading', type: 'text' },
                { name: 'subheading', type: 'textarea' },
                { name: 'image', type: 'upload', relationTo: 'media' },
                linkField({ name: 'cta', label: 'Call to action', required: false }),
              ],
            },
          ],
        },
        { label: 'Content', fields: [layoutField] },
        seoTab,
      ],
    },
    slugField(),
    {
      name: 'path',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Set from the slug and parent page.',
      },
    },
    {
      name: 'regulated',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          'Tick if this page describes regulated financial services: publishing it then needs compliance approval.',
      },
    },
  ],
}
