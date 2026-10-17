import { type FieldHook, slugField as payloadSlugField, type TextField } from 'payload'

import { SLUG_PATTERN, slugify } from '@/lib/slugify'

/**
 * Unique, indexed slug in the sidebar, generated from `useAsSlug` until an editor changes it or
 * the document is published (Payload's built-in behaviour), and validated against `^[a-z0-9-]+$`.
 */
export const slugField = (useAsSlug = 'title') => {
  // Payload fills the slug in a late field hook, after collection hooks such as the nested-docs
  // breadcrumbs have already run. Fill a missing one first, so documents created through the
  // API (seed, imports, the AI editor) get the same URL the admin UI would give them.
  const fillMissingSlug: FieldHook = ({ siblingData, value }) => {
    const source = siblingData?.[useAsSlug]
    return value || (typeof source === 'string' ? slugify(source) || value : value)
  }

  return payloadSlugField({
    useAsSlug,
    slugify: ({ valueToSlugify }) =>
      typeof valueToSlugify === 'string' ? slugify(valueToSlugify) : undefined,
    overrides: (row) => {
      const slug = row.fields.find((field) => 'name' in field && field.name === 'slug') as TextField
      slug.hooks = { ...slug.hooks, beforeValidate: [fillMissingSlug] }
      slug.validate = (value: null | string | undefined) =>
        !value || SLUG_PATTERN.test(value) || 'Use lowercase letters, numbers and hyphens only.'
      return row
    },
  })
}
