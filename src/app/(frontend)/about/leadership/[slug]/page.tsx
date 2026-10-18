import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Media } from '@/components/Media'
import { RichText } from '@/components/RichText'
import { hubCrumbs } from '@/lib/crumbs'
import { populated } from '@/lib/format'
import { getBySlug } from '@/lib/queries'
import { pathFor } from '@/lib/urls'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return [] // rendered on first request, then cached (see [[...path]]/page.tsx)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { isEnabled: draft } = await draftMode()
  const person = await getBySlug(draft, 'people', (await params).slug)
  if (!person) return {}
  return {
    title: person.meta?.title || person.name,
    description: person.meta?.description ?? person.role ?? undefined,
  }
}

export default async function PersonPage({ params }: Props) {
  const { isEnabled: draft } = await draftMode()
  const person = await getBySlug(draft, 'people', (await params).slug)
  if (!person) notFound()
  const division = populated(person.division)
  const crumbs = await hubCrumbs(
    draft,
    [
      ['/about/', 'About'],
      ['/about/leadership/', 'Leadership'],
    ],
    { href: pathFor('people', person)!, label: person.name },
  )
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <article className="mx-auto grid max-w-(--container-page) gap-8 px-6 py-10 md:grid-cols-[1fr_2fr]">
        <Media
          media={person.photo}
          sizes="(min-width: 768px) 33vw, 100vw"
          priority
          className="h-auto w-full rounded-lg"
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold text-brand-strong sm:text-4xl">{person.name}</h1>
          {person.role && <p className="text-lg text-ink-muted">{person.role}</p>}
          {division && (
            <p>
              <a href={pathFor('solutions', division)!} className="text-brand underline">
                {division.title}
              </a>
            </p>
          )}
          <RichText data={person.bio} />
          {person.linkedinUrl && (
            <p>
              <a href={person.linkedinUrl} rel="noopener" className="text-brand underline">
                {person.name} on LinkedIn
              </a>
            </p>
          )}
        </div>
      </article>
    </>
  )
}
