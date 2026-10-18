import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import React from 'react'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { PreviewBanner } from '@/components/layout/PreviewBanner'

import '@/styles/globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: 'Novare',
    template: '%s | Novare',
  },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: draft } = await draftMode()
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-4 focus:py-2"
        >
          Skip to main content
        </a>
        {draft && <PreviewBanner />}
        <Header draft={draft} />
        <main id="main-content" className="flex flex-col">
          {children}
        </main>
        <Footer draft={draft} />
      </body>
    </html>
  )
}
