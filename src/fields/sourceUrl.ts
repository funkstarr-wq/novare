import type { CollectionConfig, Field } from 'payload'

/**
 * Where an imported document came from on the old site (brief §11). The WordPress import
 * upserts by it, so running the import again updates documents instead of duplicating them.
 * Hidden in the admin; empty for everything created here.
 */
export const sourceUrlField: Field = {
  name: 'sourceUrl',
  type: 'text',
  index: true,
  admin: { hidden: true },
}

/** Collections the WordPress import writes to. */
export const IMPORTED_COLLECTIONS = [
  'insights',
  'press-mentions',
  'jobs',
  'awards',
  'offices',
  'legal-documents',
  'media',
  'documents',
] as const

export const withSourceUrl = (collection: CollectionConfig): CollectionConfig =>
  (IMPORTED_COLLECTIONS as readonly string[]).includes(collection.slug)
    ? { ...collection, fields: [...collection.fields, sourceUrlField] }
    : collection
