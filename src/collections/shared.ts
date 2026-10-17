import type { CollectionConfig } from 'payload'

/** Drafts with autosave and up to 50 versions per document (brief §5 conventions). */
export const draftVersions: CollectionConfig['versions'] = {
  drafts: { autosave: true },
  maxPerDoc: 50,
}

/** Marks a collection as regulated (brief §5 [R]); the approval guard (M2) reads it. */
export const regulated = { regulated: true } as const

export const adminGroups = {
  site: 'Site',
  solutions: 'Solutions',
  company: 'Company',
  insights: 'Insights & news',
  library: 'Library',
  system: 'System',
} as const
