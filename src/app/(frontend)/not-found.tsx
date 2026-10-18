import type { Metadata } from 'next'
import NextLink from 'next/link'

import { SearchForm } from './search/SearchForm'

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } }

const destinations = [
  { href: '/', label: 'Home page' },
  { href: '/solutions/', label: 'Solutions' },
  { href: '/insights/', label: 'Insights' },
  { href: '/contact/', label: 'Contact us' },
]

/** 404 for every public route (brief §7): search plus the main destinations. */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-(--container-page) flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold text-brand-strong sm:text-4xl">Page not found</h1>
      <p className="max-w-(--container-prose) text-lg text-ink-muted">
        The page you were looking for may have moved. Search the site or start from one of these
        pages.
      </p>
      <SearchForm />
      <ul className="flex flex-col gap-2">
        {destinations.map((item) => (
          <li key={item.href}>
            <NextLink href={item.href} className="text-brand underline">
              {item.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </div>
  )
}
