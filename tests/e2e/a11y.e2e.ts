import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// One entry per front-end template (brief §4.5 a11y job, §14 rule 7). M3 adds the rest.
const templates = [{ name: 'home', path: '/' }]

test.describe('accessibility @a11y', () => {
  for (const { name, path } of templates) {
    test(`${name} has no serious or critical axe violations`, async ({ page }) => {
      await page.goto(path)

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
