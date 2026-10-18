import NextLink from 'next/link'

import { Media } from '@/components/Media'
import type { Person } from '@/payload-types'

export function PersonCard({ person }: { person: Person }) {
  return (
    <li className="flex flex-col gap-3">
      <Media
        media={person.photo}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="aspect-square h-auto w-full rounded-lg object-cover"
      />
      <h3 className="text-lg font-semibold">
        <NextLink href={`/about/leadership/${person.slug}/`} className="hover:underline">
          {person.name}
        </NextLink>
      </h3>
      {person.role && <p className="text-ink-muted">{person.role}</p>}
    </li>
  )
}
