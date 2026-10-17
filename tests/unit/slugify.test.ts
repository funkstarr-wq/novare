import { describe, expect, it } from 'vitest'

import { SLUG_PATTERN, slugify } from '@/lib/slugify'

describe('slugify', () => {
  it.each([
    ['Wealth & Invest', 'wealth-invest'],
    ['Multi-Management', 'multi-management'],
    ['  About   us  ', 'about-us'],
    ['Société Générale', 'societe-generale'],
    ['HedgeNews Africa Awards 2020', 'hedgenews-africa-awards-2020'],
    ['snake_case_title', 'snake-case-title'],
    ['--Already--hyphenated--', 'already-hyphenated'],
  ])('%j → %j', (input, expected) => {
    expect(slugify(input)).toBe(expected)
    expect(SLUG_PATTERN.test(expected)).toBe(true)
  })
})
