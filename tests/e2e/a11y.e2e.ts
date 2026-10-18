import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

import { templates } from './support/templates'

// Every front-end template (brief §4.5 a11y job, §14 rule 7), plus the 404 page.
const pages = [...templates, { name: '404', path: '/no-such-page/' }]

test.describe('accessibility @a11y', () => {
  for (const { name, path } of pages) {
    test(`${name} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path)
      await expect(page.locator('h1')).toHaveCount(1)

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      const blocking = results.violations.filter(
        (violation) => violation.impact === 'serious' || violation.impact === 'critical',
      )

      expect(blocking.map(({ id, help, nodes }) => ({ id, help, nodes: nodes.length }))).toEqual([])
    })
  }
})
