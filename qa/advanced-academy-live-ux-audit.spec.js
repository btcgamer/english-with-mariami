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

  test('Mission Flow 2.0 — completed mission automatically activates the next mission', async ({ page }) => {
    await page.goto(BASE + '/advanced-academy.html?grade=12&world=1', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.evaluate(() => Boolean(window.MagicCurriculum?.state?.worldData?.missions)), { timeout: 15000 }).toBe(true);

    await page.locator('[data-open-mission="1"]').click();
    await expect(page.locator('[data-curriculum-modal]')).toBeVisible();
    await expect(page.locator('[data-curriculum-modal-number]')).toHaveText('MISSION 1');
    await page.locator('[data-curriculum-complete]').click();

    await expect.poll(
      () => page.locator('[data-curriculum-modal-number]').textContent(),
      { timeout: 5000 }
    ).toBe('MISSION 2');
    await expect(page.locator('[data-curriculum-modal]')).toBeVisible();
    await expect(page.locator('[data-curriculum-world-progress]')).toHaveText('1/20');
  });

  test('Mission Flow 2.0 — completing World 1 Mission 20 unlocks World 2 and activates Mission 1', async ({ page }) => {
    await page.goto(BASE + '/advanced-academy.html?grade=12&world=1', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect.poll(() => page.evaluate(() => Boolean(window.MagicCurriculum?.state?.worldData?.missions)), { timeout: 15000 }).toBe(true);

    for (let mission = 1; mission <= 20; mission++) {
      await page.locator('[data-open-mission="' + mission + '"]').click();
      await expect(page.locator('[data-curriculum-modal]')).toBeVisible();
      await expect(page.locator('[data-curriculum-modal-number]')).toHaveText('MISSION ' + mission);
      await page.locator('[data-curriculum-complete]').click();

      if (mission < 20) {
        await expect.poll(
          () => page.locator('[data-curriculum-modal-number]').textContent(),
          { timeout: 5000 }
        ).toBe('MISSION ' + (mission + 1));
      }
    }

    await expect.poll(
      () => page.evaluate(() => window.MagicCurriculum?.state?.world),
      { timeout: 8000 }
    ).toBe(2);
    await expect.poll(
      () => page.locator('[data-curriculum-modal-number]').textContent(),
      { timeout: 8000 }
    ).toBe('MISSION 1');
    await expect(page.locator('[data-curriculum-world-progress]')).toHaveText('0/20');
    await expect(page.locator('[data-curriculum-total-progress]')).toHaveText('20/200');
    await expect(page.locator('[data-curriculum-world-nav] [data-curriculum-world="2"]')).not.toBeDisabled();
  });
});
