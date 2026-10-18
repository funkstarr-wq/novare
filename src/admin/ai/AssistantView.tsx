import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'

import { AssistantPanel } from './AssistantPanel'
import { History } from './History'

/** /admin/assistant/: site-wide requests and the user's history (brief §10.2). */
export function AssistantView({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, locale, permissions, visibleEntities } = initPageResult
  if (!req.user) redirect('/admin/login/')

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user}
      visibleEntities={visibleEntities}
    >
      <Gutter className="ai-view">
        <h1>AI assistant</h1>
        <p>
          Ask for changes across the site, for example contact details on every office. The
          assistant only proposes changes: you review them, apply them to drafts, preview and
          publish. Regulated content still needs compliance approval.
        </p>
        <AssistantPanel />
        <h2>Your requests</h2>
        <History />
      </Gutter>
    </DefaultTemplate>
  )
}
