'use client'

import { Button, Drawer, useDocumentInfo, useModal } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import { AssistantPanel } from './AssistantPanel'

const slug = 'ai-assistant'

/**
 * "AI assistant" next to Save and Publish in every public collection's edit view (brief §10.2).
 * Opens the panel in a drawer, scoped to this document. Once changes are applied, closing the
 * drawer reloads the editor, so the form shows the new draft and cannot autosave stale values
 * over it.
 */
export function DocumentAssistant() {
  const { id, collectionSlug, title } = useDocumentInfo()
  const { openModal, isModalOpen } = useModal()
  const [applied, setApplied] = useState(false)
  const open = isModalOpen(slug)

  useEffect(() => {
    if (applied && !open) window.location.reload()
  }, [applied, open])

  if (!id || !collectionSlug) return null

  return (
    <>
      <Button buttonStyle="secondary" size="small" margin={false} onClick={() => openModal(slug)}>
        AI assistant
      </Button>
      <Drawer slug={slug} title="AI assistant">
        <AssistantPanel
          context={{
            collection: collectionSlug,
            id,
            title: typeof title === 'string' ? title : undefined,
          }}
          onApplied={() => setApplied(true)}
        />
      </Drawer>
    </>
  )
}
