/**
 * URL slug: lowercase ASCII letters, digits and single hyphens ("Wealth & Invest" → "wealth-invest").
 * Accents are folded ("Société" → "societe"); everything else becomes a separator.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const SLUG_PATTERN = /^[a-z0-9-]+$/
