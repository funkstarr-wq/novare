import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { draftMode } from 'next/headers'
import React from 'react'

import { JsonLd } from '@/components/JsonLd'
import { CookieBanner } from '@/components/layout/CookieBanner'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { PreviewBanner } from '@/components/layout/PreviewBanner'
import { organization, website } from '@/lib/jsonld'
import { getSiteSettings } from '@/lib/queries'
import { siteURL } from '@/lib/site'

import '@/styles/globals.css'

// The old site's typeface (decision "Interim brand"). next/font downloads it at build time and
// serves it from this site, so browsers never contact Google (brief §8.2).
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteURL()),
  title: {
    default: 'Novare',
    template: '%s | Novare',
  },
}

/**
 * Site-wide structured data (brief §8.3). Its own component, like the header and footer, so the
 * layout itself never waits on the database: routes that read the query string must reach that
 * point first to render per request (the build has no database).
 */
async function SiteJsonLd({ draft }: { draft: boolean }) {
  const settings = await getSiteSettings(draft)
  return <JsonLd data={[organization(settings), website(settings)]} />
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: draft } = await draftMode()
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        <SiteJsonLd draft={draft} />
        {draft && <PreviewBanner />}
        <Header draft={draft} />
        <main id="main-content" className="flex flex-col">
          {children}
        </main>
        <Footer draft={draft} />
        <CookieBanner draft={draft} />
      </body>
    </html>
  )
}
