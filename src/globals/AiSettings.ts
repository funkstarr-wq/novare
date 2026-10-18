import type { GlobalConfig } from 'payload'

import { admins, adminsOnlyField, staff } from '@/access'
import { auditGlobalAfterChange } from '@/hooks/audit'

// AI editor settings (brief §5.2, §10): staff can see them, only admins change them.
export const AiSettings: GlobalConfig = {
  slug: 'ai-settings',
  label: 'AI settings',
  admin: { group: 'System' },
  access: { read: staff, update: admins },
  hooks: { afterChange: [auditGlobalAfterChange] },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: false },
    {
      name: 'model',
      type: 'text',
      admin: { description: 'Leave empty to use ANTHROPIC_MODEL from the environment.' },
    },
    {
      name: 'monthlyBudgetUSD',
      label: 'Monthly budget (USD)',
      type: 'number',
      min: 0,
      admin: { description: 'Leave empty to use AI_MONTHLY_BUDGET_USD from the environment.' },
    },
    {
      name: 'regulatedPhrases',
      type: 'array',
      admin: {
        description:
          'Text that flags a change as a possible performance or return claim and sends it to compliance review.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'pattern', type: 'text', required: true, admin: { width: '75%' } },
            {
              name: 'isRegex',
              label: 'Regular expression',
              type: 'checkbox',
              defaultValue: false,
              admin: { width: '25%' },
            },
          ],
        },
      ],
    },
    {
      name: 'systemPromptAddendum',
      type: 'textarea',
      access: { read: adminsOnlyField, update: adminsOnlyField },
      admin: { description: 'Admin only. Appended to the AI editor system prompt.' },
    },
  ],
}
