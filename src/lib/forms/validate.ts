import type { Form } from '@/payload-types'

/**
 * Server-side checks for a submission against its form (brief §9): only the form's own fields
 * are kept, required ones must be filled in, emails and select values must be valid, and the
 * POPIA consent box must be ticked. The browser checks the same, but cannot be trusted.
 */
type InputField = Exclude<NonNullable<Form['fields']>[number], { blockType: 'message' }>
export type SubmissionValue = { field: string; value: string }

const MAX_LENGTH: Partial<Record<InputField['blockType'], number>> = { textarea: 5_000 }
const DEFAULT_MAX = 500
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isConsentField = (field: { name: string; blockType: string }) =>
  field.blockType === 'checkbox' && /consent/i.test(field.name)

export type Validated = {
  data: SubmissionValue[]
  errors: string[]
  consent: { given: boolean; text: string } | null
}

export function validateSubmission(form: Pick<Form, 'fields'>, input: unknown): Validated {
  const given = new Map<string, string>()
  if (Array.isArray(input)) {
    for (const item of input) {
      if (item && typeof item === 'object' && typeof item.field === 'string') {
        given.set(
          item.field,
          typeof item.value === 'string' ? item.value : String(item.value ?? ''),
        )
      }
    }
  }

  const data: SubmissionValue[] = []
  const errors: string[] = []
  let consent: Validated['consent'] = null

  for (const field of (form.fields ?? []) as InputField[]) {
    if (!('name' in field) || field.blockType === ('message' as string)) continue
    const label = field.label || field.name
    let value = (given.get(field.name) ?? '').trim()

    if (field.blockType === 'checkbox') {
      value = value === 'true' ? 'true' : 'false'
      if (field.required && value !== 'true') errors.push(`${label} must be ticked.`)
      if (isConsentField(field)) consent = { given: value === 'true', text: label }
      data.push({ field: field.name, value })
      continue
    }

    const max = MAX_LENGTH[field.blockType] ?? DEFAULT_MAX
    if (value.length > max) errors.push(`${label} is too long (at most ${max} characters).`)
    if (field.required && !value) errors.push(`${label} is required.`)
    if (value && field.blockType === 'email' && !EMAIL.test(value)) {
      errors.push(`${label} must be an email address.`)
    }
    if (value && field.blockType === 'select') {
      const options = (field.options ?? []).map((option) => option.value)
      if (!options.includes(value)) errors.push(`Choose one of the options for ${label}.`)
    }
    data.push({ field: field.name, value })
  }

  return { data, errors, consent }
}
