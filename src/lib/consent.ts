'use client'

import { useSyncExternalStore } from 'react'

/**
 * Cookie consent (brief §12): the visitor's choice lives in one first-party cookie, which is
 * strictly necessary and needs no consent itself. Nothing optional (analytics) may load until
 * the choice is `accepted`; wrap such scripts in `<ConsentGate>`.
 */
export const CONSENT_COOKIE = 'novare_consent'
const MAX_AGE = 60 * 60 * 24 * 180 // ask again after six months
const CHANGE = 'novare:consent'
const REOPEN = 'novare:consent-reopen'

export type Consent = 'accepted' | 'declined'

export function readConsent(cookie: string): Consent | null {
  const match = new RegExp(`(?:^|;\\s*)${CONSENT_COOKIE}=(accepted|declined)`).exec(cookie)
  return (match?.[1] as Consent | undefined) ?? null
}

export function saveConsent(choice: Consent) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`
  window.dispatchEvent(new Event(CHANGE))
}

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange)
  return () => window.removeEventListener(CHANGE, onChange)
}

/** The visitor's choice: `null` before they make one, `undefined` while rendering on the server. */
export const useConsent = (): Consent | null | undefined =>
  useSyncExternalStore(
    subscribe,
    () => readConsent(document.cookie),
    () => undefined,
  )

/** Opens the banner again (the footer's "Cookie settings"). */
export const reopenConsent = () => window.dispatchEvent(new Event(REOPEN))
export const onReopenConsent = (handler: () => void) => {
  window.addEventListener(REOPEN, handler)
  return () => window.removeEventListener(REOPEN, handler)
}
