const { test, expect } = require('playwright/test');

const BASE = 'http://127.0.0.1:4173';
const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];

async function waitForRuntime(page) {
  await expect.poll(() => page.evaluate(() => Boolean(window.MagicCurriculum?.state?.worldData?.missions)), { timeout: 15000 }).toBe(true);
}

test.describe('Advanced Academy production readiness', () => {
  for (const grade of GRADES) {
    test(`Grade ${grade} boots, renders World 1 and opens a mission`, async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto(`${BASE}/advanced-academy.html?grade=${grade}`, { waitUntil: 'domcontentloaded' });
      await waitForRuntime(page);
      await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(20);
      await expect(page.locator('[data-curriculum-title]')).not.toHaveText('');
      await expect(page.locator('[data-curriculum-level]')).not.toHaveText('');
      await page.locator('[data-open-mission]').first().click();
      await expect(page.locator('[data-curriculum-modal]')).toBeVisible();
      expect(pageErrors, `Grade ${grade} page errors: ${pageErrors.join(' | ')}`).toEqual([]);
    });

    test(`Grade ${grade} mobile layout remains usable`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE}/advanced-academy.html?grade=${grade}`, { waitUntil: 'domcontentloaded' });
      await waitForRuntime(page);
      await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(20);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      expect(overflow, `Grade ${grade} has horizontal overflow on mobile`).toBe(false);
    });
  }

  test('mission completion updates XP/stars and persists', async ({ page }) => {
    await page.goto(`${BASE}/advanced-academy.html?grade=12`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForRuntime(page);
    await page.locator('[data-open-mission]').first().click();
    await page.locator('[data-curriculum-complete]').click();
    await expect(page.locator('[data-curriculum-world-progress]')).toContainText('1/20');
    await expect(page.locator('[data-curriculum-xp]')).toContainText('50');
    await expect(page.locator('[data-curriculum-stars]')).toContainText('1');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await waitForRuntime(page);
    await expect(page.locator('[data-curriculum-world-progress]')).toContainText('1/20');
  });
});
