'use client'

import NextLink from 'next/link'
import { type ReactNode, useEffect, useState } from 'react'

import { onReopenConsent, reopenConsent, saveConsent, useConsent } from '@/lib/consent'

const button =
  'inline-flex items-center rounded-md px-4 py-2 font-semibold focus-visible:outline-3 focus-visible:outline-focus'

/** The consent banner: fixed to the bottom of the screen, so it never shifts the page. */
export function CookieBannerClient({
  message,
  policyHref,
}: {
  message: string
  policyHref: null | string
}) {
  const consent = useConsent()
  const [reopened, setReopened] = useState(false)
  useEffect(() => onReopenConsent(() => setReopened(true)), [])

  if (consent === undefined || (consent !== null && !reopened)) return null

  const choose = (choice: 'accepted' | 'declined') => {
    saveConsent(choice)
    setReopened(false)
  }

  return (
    <section
      aria-label="Cookie choices"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface shadow-lg"
    >
      <div className="mx-auto flex max-w-(--container-page) flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-ink">
          {message}{' '}
          {policyHref && (
            <NextLink href={policyHref} className="text-brand underline">
              Read more
            </NextLink>
          )}
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            className={`${button} border border-border bg-surface text-ink hover:bg-surface-muted`}
            onClick={() => choose('declined')}
          >
            Decline
          </button>
          <button
            type="button"
            className={`${button} bg-brand text-on-brand hover:bg-brand-strong`}
            onClick={() => choose('accepted')}
          >
            Accept analytics
          </button>
        </div>
      </div>
    </section>
  )
}

/** "Cookie settings" in the footer: opens the banner again so a visitor can change their mind. */
export function CookieSettingsButton() {
  return (
    <button type="button" className="hover:underline" onClick={reopenConsent}>
      Cookie settings
    </button>
  )
}

/** Renders its children (analytics, embeds that set cookies) only after the visitor accepts. */
export function ConsentGate({ children }: { children: ReactNode }) {
  return useConsent() === 'accepted' ? children : null
}
