'use client'

import { type FormEvent, type ReactNode, useId, useState } from 'react'

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

const inputClass =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-ink focus-visible:border-focus'

/** Posts to Payload's form-builder endpoint and shows the form's confirmation message. */
export function FormClient({
  formId,
  fields,
  submitLabel,
  confirmation,
  redirectTo,
  privacyHref,
}: Props) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const prefix = useId()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    const data = new FormData(event.currentTarget)
    const submissionData = fields
      .filter((field) => field.blockType !== 'message')
      .map((field) => {
        const name = (field as InputField).name
        const value =
          field.blockType === 'checkbox' ? String(data.get(name) === 'on') : data.get(name)
        return { field: name, value: String(value ?? '') }
      })
    const response = await fetch('/api/form-submissions/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form: formId, submissionData }),
    }).catch(() => null)
    if (!response?.ok) return setStatus('error')
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
      {status === 'error' && (
        <p role="alert" className="text-danger">
          Your message could not be sent. Please try again.
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
