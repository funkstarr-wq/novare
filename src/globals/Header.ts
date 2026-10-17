import type { GlobalConfig } from 'payload'

import { linkField } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: { group: 'Site' },
  access: { read: () => true },
  fields: [
    {
      name: 'navItems',
      label: 'Primary navigation',
      type: 'array',
      maxRows: 8,
      fields: [
        linkField(),
        {
          name: 'children',
          label: 'Menu items',
          type: 'array',
          admin: { description: 'Optional: turns this item into a menu.' },
          fields: [linkField()],
        },
      ],
    },
    linkField({ name: 'utilityCta', label: 'Header button', required: false }),
  ],
}
