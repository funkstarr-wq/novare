'use client'

import { Button, toast, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

/** "Submit for compliance review" in the review sidebar of regulated documents (brief §6.2). */
export function SubmitForReview() {
  const { id, collectionSlug } = useDocumentInfo()
  const status = useFormFields(([fields]) => fields['review.reviewStatus']?.value)
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  if (!id || !collectionSlug) return null

  const submit = async () => {
    setBusy(true)
    try {
      const response = await fetch(`/api/${collectionSlug}/${id}/submit-for-review/`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string
          errors?: { message: string }[]
        }
        throw new Error(body.error ?? body.errors?.[0]?.message ?? 'Could not submit for review.')
      }
      toast.success('Submitted for compliance review.')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not submit for review.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      buttonStyle="secondary"
      size="small"
      disabled={busy || status === 'in_review' || status === 'approved'}
      onClick={submit}
    >
      Submit for compliance review
    </Button>
  )
}
