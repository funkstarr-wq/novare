// Dates as South African English writes them ("17 October 2026"), in one place.
const dateFormat = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Africa/Johannesburg',
})

export const formatDate = (value: null | string | undefined) =>
  value ? dateFormat.format(new Date(value)) : null

/** `YYYY-MM-DD` for today in South Africa, e.g. to hide vacancies that have closed. */
export const todayISO = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date())

/** A populated relationship, or `null` when it is only an ID (not populated) or empty. */
export const populated = <T extends object>(value: number | null | T | undefined): T | null =>
  value && typeof value === 'object' ? value : null
