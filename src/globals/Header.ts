import type { GlobalConfig } from 'payload'

import { anyone, publishers } from '@/access'
import { auditGlobalAfterChange } from '@/hooks/audit'
import { revalidateGlobal } from '@/hooks/revalidate'

import { linkField } from '@/fields/link'

export const Header: GlobalConfig = {
  slug: 'header',
  admin: { group: 'Site' },
  // Live as soon as saved, so editors and above only.
  access: { read: anyone, update: publishers },
  hooks: { afterChange: [auditGlobalAfterChange, revalidateGlobal] },
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
