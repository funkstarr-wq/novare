'use client'

import { Button, toast } from '@payloadcms/ui'
import { useCallback, useEffect, useState } from 'react'

import type { ChangesetView } from '@/endpoints/ai'

const STATUS: Record<ChangesetView['status'], string> = {
  proposed: 'Proposed',
  applied_to_draft: 'Applied to draft',
  rejected: 'Discarded',
  published: 'Published',
  rolled_back: 'Rolled back',
  failed: 'Failed',
}

const when = (iso: string) =>
  new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(iso),
  )

/** The signed-in user's changesets, newest first, with rollback (brief §10.2 History). */
export function History() {
  const [docs, setDocs] = useState<ChangesetView[] | null>(null)
  const [busy, setBusy] = useState<number | null>(null)

  const load = useCallback(
    () =>
      fetch('/api/ai/changesets/', { credentials: 'include' })
        .then((response) => response.json() as Promise<{ docs?: ChangesetView[] }>)
        .then(
          (data) => setDocs(data.docs ?? []),
          () => setDocs([]),
        ),
    [],
  )

  useEffect(() => {
    void load()
  }, [load])

  const rollback = async (changeset: ChangesetView) => {
    if (
      !window.confirm('Restore every document this changed to how it was before, as a new draft?')
    )
      return
    setBusy(changeset.id)
    try {
      const response = await fetch('/api/ai/rollback/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changesetId: changeset.id }),
      })
      const data = (await response.json().catch(() => ({}))) as { error?: string; notes?: string[] }
      if (!response.ok) throw new Error(data.error ?? 'Could not roll back.')
      toast.success(
        ['Rolled back. The previous content is now the draft.', ...(data.notes ?? [])].join(' '),
      )
      await load()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not roll back.')
    } finally {
      setBusy(null)
    }
  }

  if (!docs) return <p>Loading history…</p>
  if (!docs.length) return <p>No requests yet.</p>

  return (
    <table className="ai-history">
      <thead>
        <tr>
          <th scope="col">When</th>
          <th scope="col">Request</th>
          <th scope="col">Status</th>
          <th scope="col">Documents</th>
          <th scope="col">Cost</th>
          <th scope="col">
            <span className="ai-visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {docs.map((changeset) => (
          <tr key={changeset.id}>
            <td>{when(changeset.createdAt)}</td>
            <td>{changeset.prompt}</td>
            <td>{STATUS[changeset.status]}</td>
            <td>
              {changeset.affectedDocs.map((doc) => (
                <a
                  key={`${doc.collection}:${doc.docId}`}
                  className="ai-history__doc"
                  href={
                    /^\d+$/.test(doc.docId)
                      ? `/admin/collections/${doc.collection}/${doc.docId}/`
                      : undefined
                  }
                >
                  {doc.collection} #{doc.docId}
                </a>
              ))}
            </td>
            <td>${changeset.costUSD.toFixed(3)}</td>
            <td>
              {changeset.status === 'applied_to_draft' || changeset.status === 'published' ? (
                <Button
                  buttonStyle="secondary"
                  size="small"
                  margin={false}
                  disabled={busy === changeset.id}
                  onClick={() => rollback(changeset)}
                >
                  Roll back
                </Button>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
