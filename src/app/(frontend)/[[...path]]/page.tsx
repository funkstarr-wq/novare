import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { HUBS } from '@/components/hubs'
import { PageHero } from '@/components/PageHeader'
import { opensWithHero, RenderBlocks } from '@/components/RenderBlocks'
import { pageCrumbs } from '@/lib/crumbs'
import { getPageByPath, getSiteSettings } from '@/lib/queries'

type Props = { params: Promise<{ path?: string[] }> }

// The build has no database: pages render on first request and are then cached until their
// content changes (src/hooks/revalidate.ts). Hourly as a safety net, e.g. for closed vacancies.
export const revalidate = 3600
export async function generateStaticParams() {
  return []
}

const toPath = (segments: string[] | undefined) =>
  segments?.length ? `/${segments.map(decodeURIComponent).join('/')}/` : '/'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = toPath((await params).path)
  const { isEnabled: draft } = await draftMode()
  const page = await getPageByPath(draft, path)
  const title = page?.meta?.title || page?.title || HUBS[path]?.title
  if (!title) return {}
  return {
    title: path === '/' ? { absolute: page?.meta?.title || 'Novare' } : title,
    description: page?.meta?.description || page?.hero?.subheading || undefined,
  }
}

/** Every `pages` document by its nested path, the home page (`/`) and the listing hubs. */
export default async function Page({ params }: Props) {
  const path = toPath((await params).path)
  const { isEnabled: draft } = await draftMode()
  const [page, settings] = await Promise.all([getPageByPath(draft, path), getSiteSettings(draft)])
  const hub = HUBS[path]
  if (!page && !hub) notFound()

  const blocks = page?.layout
  const heroTitle = opensWithHero(blocks)
  const title = page?.title ?? hub!.title
  const crumbs = page ? pageCrumbs(page.breadcrumbs) : [{ href: path, label: title }]

  return (
    <>
      {path !== '/' && <Breadcrumbs items={crumbs} />}
      {!heroTitle && <PageHero page={page} title={title} />}
      <RenderBlocks
        blocks={blocks}
        draft={draft}
        hasTitle={!heroTitle}
        parent={{ disclaimer: settings.defaultDisclaimer }}
      />
      {hub && <hub.Component draft={draft} />}
    </>
  )
}
