import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/items',
  '/items/rhythm-and-vines',
  '/search',
  '/map',
  '/opt-out',
  '/subscribe',
  '/contact',
  '/feedback',
  '/help',
  '/login',
];

// Automated gate: WCAG 2.2 A/AA + best practice. AAA is a manual human
// review on top of this (see docs/a11y.md) because axe has no AAA rules.
test.describe('a11y audit (WCAG 2.2 A/AA + best practice)', () => {
  for (const route of routes) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(route);
      // Entrance animations (Reveal) fade content in over 800ms; axe must
      // run after they settle or mid-transition opacity skews contrast.
      await page.waitForTimeout(1_200);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
