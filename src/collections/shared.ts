import type { CollectionConfig } from 'payload'

import {
  approvers,
  contentWrite,
  publicOperations,
  publishedOrStaff,
  publishers,
  staff,
} from '@/access'
import { markAiChangesetsPublished } from '@/ai/apply'
import { submitForReviewEndpoint } from '@/endpoints/submitForReview'
import { reviewField } from '@/fields/review'
import { approvalGuard, regulatedPageDeleteGuard } from '@/hooks/approvalGuard'
import { auditAfterChange, auditAfterDelete } from '@/hooks/audit'
import { revalidateAfterChange, revalidateAfterDelete } from '@/hooks/revalidate'

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

/**
 * Roles, compliance review, audit trail and cache revalidation for a content collection (brief §6).
 * Regulated collections (and pages, per document) get the review group and the
 * submit-for-review endpoint. A collection's own `access` entries win over these defaults.
 */
export function withContentRules(collection: CollectionConfig): CollectionConfig {
  const regulated = collection.custom?.regulated === true
  const isPages = collection.slug === 'pages'
  const reviewable = regulated || isPages
  const hooks = collection.hooks ?? {}

  return {
    ...collection,
    admin: {
      ...collection.admin,
      components: {
        ...collection.admin?.components,
        edit: {
          ...collection.admin?.components?.edit,
          // The AI editor's document panel (brief §10.2), next to Save and Publish.
          beforeDocumentControls: [
            ...(collection.admin?.components?.edit?.beforeDocumentControls ?? []),
            '/admin/ai/DocumentAssistant#DocumentAssistant',
          ],
        },
      },
    },
    // `publishedOrStaff` checks the 2FA code itself, so the public can still read.
    custom: { ...collection.custom, ...publicOperations('read') },
    access: {
      read: publishedOrStaff,
      readVersions: staff,
      create: contentWrite(regulated),
      update: contentWrite(regulated),
      delete: regulated ? approvers : publishers,
      ...collection.access,
    },
    endpoints: reviewable
      ? [...(collection.endpoints || []), submitForReviewEndpoint]
      : collection.endpoints,
    fields: reviewable
      ? [...collection.fields, reviewField({ onlyWhenRegulated: isPages })]
      : collection.fields,
    hooks: {
      ...hooks,
      beforeChange: [...(hooks.beforeChange ?? []), approvalGuard(regulated)],
      beforeDelete: [...(hooks.beforeDelete ?? []), ...(isPages ? [regulatedPageDeleteGuard] : [])],
      afterChange: [
        ...(hooks.afterChange ?? []),
        auditAfterChange,
        revalidateAfterChange,
        markAiChangesetsPublished,
      ],
      afterDelete: [...(hooks.afterDelete ?? []), auditAfterDelete, revalidateAfterDelete],
    },
  }
}
