import type { CollectionSlug, GlobalSlug, Payload } from 'payload'

export const TODO_MARKER = 'TODO-CONTENT'

export type TodoHit = { collection?: string; global?: string; id?: number | string; title?: string }

/**
 * Finds published content that still carries a `TODO-CONTENT` placeholder (brief §14 rule 3).
 * Drafts are ignored: they are expected to be unfinished.
 */
export async function findPublishedTodoContent(payload: Payload): Promise<TodoHit[]> {
  const hits: TodoHit[] = []

  for (const collection of payload.config.collections) {
    if (!collection.versions?.drafts) continue

    let page = 1
    for (;;) {
      const result = await payload.find({
        collection: collection.slug as CollectionSlug,
        where: { _status: { equals: 'published' } },
        depth: 0,
        limit: 100,
        page,
        draft: false,
        overrideAccess: true,
      })
      for (const doc of result.docs) {
        if (JSON.stringify(doc).includes(TODO_MARKER)) {
          const title = collection.admin?.useAsTitle
          hits.push({
            collection: collection.slug,
            id: doc.id,
            title: title
              ? String((doc as unknown as Record<string, unknown>)[title] ?? '')
              : undefined,
          })
        }
      }
      if (!result.hasNextPage) break
      page += 1
    }
  }

  for (const global of payload.config.globals) {
    const doc = await payload.findGlobal({
      slug: global.slug as GlobalSlug,
      depth: 0,
      overrideAccess: true,
    })
    if (JSON.stringify(doc).includes(TODO_MARKER)) hits.push({ global: global.slug })
  }

  return hits
}
