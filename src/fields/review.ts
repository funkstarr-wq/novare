import type { GroupField } from 'payload'

export const REVIEW_STATUSES = ['draft', 'in_review', 'approved', 'changes_requested'] as const
export type ReviewStatus = (typeof REVIEW_STATUSES)[number]

/**
 * Compliance review state of a regulated document (brief §6.2). The approval guard
 * (`src/hooks/approvalGuard.ts`) owns every transition; editors only ever submit for review.
 */
export const reviewField = ({ onlyWhenRegulated = false } = {}): GroupField => ({
  name: 'review',
  label: 'Compliance review',
  type: 'group',
  interfaceName: 'Review',
  admin: {
    position: 'sidebar',
    condition: onlyWhenRegulated ? (data) => data?.regulated === true : undefined,
  },
  fields: [
    {
      name: 'reviewStatus',
      label: 'Status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In review', value: 'in_review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Changes requested', value: 'changes_requested' },
      ],
      admin: {
        description:
          'Only compliance can approve or request changes. Any edit after approval returns it to draft.',
      },
    },
    {
      name: 'submit',
      type: 'ui',
      admin: { components: { Field: '/admin/SubmitForReview#SubmitForReview' } },
    },
    {
      name: 'reviewNote',
      label: 'Note',
      type: 'textarea',
      admin: { description: 'From compliance: what was approved, or what needs changing.' },
    },
    { name: 'reviewedBy', type: 'relationship', relationTo: 'users', admin: { readOnly: true } },
    { name: 'reviewedAt', type: 'date', admin: { readOnly: true } },
  ],
})
