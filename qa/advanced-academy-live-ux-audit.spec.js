const { test, expect } = require('playwright/test');

const BASE = 'http://127.0.0.1:4173';
const GRADES = [5, 6, 7, 8, 9, 10, 11, 12];

async function boot(page, grade, world = 1) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE + '/advanced-academy.html?grade=' + grade + '&world=' + world, { waitUntil: 'domcontentloaded' });
  await expect.poll(() => page.evaluate(() => Boolean(window.MagicCurriculum?.state?.worldData?.missions)), { timeout: 15000 }).toBe(true);
}

test.describe('Advanced Academy UX audit', () => {
  for (const grade of GRADES) {
    test('Grade ' + grade + ' — desktop HUD and mission layout', async ({ page }) => {
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await boot(page, grade);
      await expect(page.locator('[data-curriculum-title]')).not.toHaveText('Curriculum loading…');
      await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(20);
      await expect(page.locator('[data-curriculum-xp]')).toHaveText('0');
      await expect(page.locator('[data-curriculum-stars]')).toContainText('0');
      await expect(page.locator('[data-curriculum-world-progress]')).toHaveText('0/20');
      await expect(page.locator('[data-curriculum-total-progress]')).toHaveText('0/200');
      await expect(page.locator('[data-curriculum-world-nav] .magic-world-btn')).toHaveCount(10);
      expect(errors).toEqual([]);
    });

    test('Grade ' + grade + ' — mobile no horizontal overflow', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(BASE + '/advanced-academy.html?grade=' + grade, { waitUntil: 'domcontentloaded' });
      await expect.poll(() => page.evaluate(() => Boolean(window.MagicCurriculum?.state?.worldData?.missions)), { timeout: 15000 }).toBe(true);
      const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 2);
      await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(20);
    });
  }

  test('Mission interaction — modal completion updates HUD and survives reload', async ({ page }) => {
    await page.goto(BASE + '/advanced-academy.html?grade=12', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.evaluate(() => Boolean(window.MagicCurriculum?.state?.worldData?.missions)), { timeout: 15000 }).toBe(true);
    await page.locator('[data-open-mission]').first().click();
    await expect(page.locator('[data-curriculum-modal]')).toBeVisible();
    await page.locator('[data-curriculum-complete]').click();
    await expect(page.locator('[data-curriculum-world-progress]')).toHaveText('1/20');
    await expect(page.locator('[data-curriculum-xp]')).toHaveText('50');
    await expect(page.locator('[data-curriculum-stars]')).toContainText('1');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.evaluate(() => Boolean(window.MagicCurriculum?.state?.worldData?.missions)), { timeout: 15000 }).toBe(true);
    await expect(page.locator('[data-curriculum-world-progress]')).toHaveText('1/20');
    await expect(page.locator('[data-curriculum-total-progress]')).toHaveText('1/200');
  });
});
