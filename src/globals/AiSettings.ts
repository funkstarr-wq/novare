import type { FieldAccess, GlobalConfig } from 'payload'

const isAdmin: FieldAccess = ({ req }) =>
  Boolean((req.user as { roles?: string[] } | null | undefined)?.roles?.includes('admin'))

// AI editor settings (brief §5.2, §10). Global-level access is tightened with the roles in M2.
export const AiSettings: GlobalConfig = {
  slug: 'ai-settings',
  label: 'AI settings',
  admin: { group: 'System' },
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
      access: { read: isAdmin, update: isAdmin },
      admin: { description: 'Admin only. Appended to the AI editor system prompt.' },
    },
  ],
}
