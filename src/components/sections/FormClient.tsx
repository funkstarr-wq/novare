'use client'

import Script from 'next/script'
import { type FormEvent, type ReactNode, useEffect, useId, useState } from 'react'

import type { Form } from '@/payload-types'

type InputField = Exclude<NonNullable<Form['fields']>[number], { blockType: 'message' }>
export type FormField =
  | (InputField & { id: string })
  | { blockType: 'message'; id: string; content: ReactNode }

type Props = {
  formId: number
  fields: FormField[]
  submitLabel: string
  confirmation: ReactNode
  redirectTo?: string
  privacyHref: null | string
}

// Cloudflare Turnstile runs only when a site key is configured (brief §9).
const turnstileKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

const inputClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus-visible:border-focus'

/**
 * Sends the form to /api/submit-form/ (spam checks and validation, src/endpoints/forms.ts) and
 * shows the form's confirmation message. The time-to-submit token is fetched when the form
 * loads, because the page itself is cached.
 */
export function FormClient({
  formId,
  fields,
  submitLabel,
  confirmation,
  redirectTo,
  privacyHref,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<null | string>(null)
  const [token, setToken] = useState<null | string>(null)
  const prefix = useId()

  useEffect(() => {
    fetch('/api/form-token/')
      .then((response) => response.json() as Promise<{ token?: string }>)
      .then(
        (data) => setToken(data.token ?? null),
        () => setToken(null),
      )
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError(null)
    const data = new FormData(event.currentTarget)
    const submissionData = fields
      .filter((field) => field.blockType !== 'message')
      .map((field) => {
        const name = (field as InputField).name
        const value =
          field.blockType === 'checkbox' ? String(data.get(name) === 'on') : data.get(name)
        return { field: name, value: String(value ?? '') }
      })
    const response = await fetch('/api/submit-form/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        form: formId,
        submissionData,
        token,
        website: data.get('website'),
        turnstileToken: data.get('cf-turnstile-response'),
      }),
    }).catch(() => null)
    if (!response?.ok) {
      const body = (await response?.json().catch(() => null)) as { error?: string } | null
      setError(body?.error ?? null)
      return setStatus('error')
    }
    if (redirectTo) return window.location.assign(redirectTo)
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div role="status" className="rounded-lg bg-surface-muted p-6">
        {confirmation}
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="flex max-w-(--container-prose) flex-col gap-5"
      noValidate={false}
    >
      {fields.map((field) => {
        if (field.blockType === 'message') return <div key={field.id}>{field.content}</div>
        const id = `${prefix}-${field.name}`
        const label = field.label || field.name
        const required = Boolean(field.required)
        const marker = required ? <span aria-hidden="true"> *</span> : null
        if (field.blockType === 'checkbox') {
          return (
            <div key={field.id} className="flex items-start gap-3">
              <input
                id={id}
                name={field.name}
                type="checkbox"
                required={required}
                defaultChecked={Boolean(field.defaultValue)}
                className="mt-1 size-4"
              />
              <label htmlFor={id}>
                {label}
                {marker}
                {privacyHref && /consent/i.test(field.name) && (
                  <>
                    {' '}
                    <a href={privacyHref} className="text-brand underline">
                      Read the privacy notice
                    </a>
                  </>
                )}
              </label>
            </div>
          )
        }
        return (
          <div key={field.id} className="flex flex-col gap-2">
            <label htmlFor={id} className="font-semibold">
              {label}
              {marker}
            </label>
            {field.blockType === 'textarea' ? (
              <textarea
                id={id}
                name={field.name}
                required={required}
                rows={5}
                className={inputClass}
              />
            ) : field.blockType === 'select' ? (
              <select
                id={id}
                name={field.name}
                required={required}
                className={inputClass}
                defaultValue=""
              >
                <option value="" disabled>
                  Choose…
                </option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={field.name}
                type={field.blockType === 'email' ? 'email' : 'text'}
                autoComplete={field.blockType === 'email' ? 'email' : undefined}
                required={required}
                className={inputClass}
              />
            )}
          </div>
        )
      })}
      {/* A field people never see or fill in: anything typed here marks the sender as a bot. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${prefix}-website`}>Website</label>
        <input
          id={`${prefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {turnstileKey && (
        <>
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
          <div className="cf-turnstile" data-sitekey={turnstileKey} />
        </>
      )}
      {status === 'error' && (
        <p role="alert" className="text-danger">
          {error ?? 'Your message could not be sent. Please try again.'}
        </p>
      )}
      <div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center rounded-md bg-brand px-5 py-2.5 font-semibold text-on-brand hover:bg-brand-strong disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
