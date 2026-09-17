const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://127.0.0.1:4173/advanced-academy.html?grade=11';

async function clearProgress(page) {
  await page.evaluate(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.toLowerCase().includes('magic') || key.toLowerCase().includes('curriculum') || key.toLowerCase().includes('grade')) {
        localStorage.removeItem(key);
      }
    }
  });
}

test('Grade 11 runtime loads World 1 with 20 missions and preserves completion state', async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  const httpErrors = [];

  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) httpErrors.push(`HTTP ${response.status()}: ${response.url()}`);
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await clearProgress(page);
  await page.reload({ waitUntil: 'networkidle' });

  await expect(page.locator('body')).toContainText('GRADE 11');
  await expect(page.locator('body')).toContainText('C2+');
  await expect(page.locator('body')).toContainText('ADVANCED DISCOURSE');

  const state = await page.evaluate(() => ({
    grade: window.MAGIC_CURRICULUM_GRADE,
    runtime: !!window.MagicCurriculum,
    worldCount: window.MagicCurriculum?.worlds?.length ?? null,
    currentWorld: window.MagicCurriculum?.currentWorld ?? null,
    missionCount: window.MagicCurriculum?.worlds?.[0]?.missionCount ?? window.MagicCurriculum?.worlds?.[0]?.missions?.length ?? null,
    world1Missions: window.MagicCurriculum?.worlds?.[0]?.missions?.length ?? null
  }));

  expect(state.grade).toBe(11);
  expect(state.runtime).toBeTruthy();
  expect(state.worldCount).toBeGreaterThanOrEqual(1);
  expect(state.currentWorld).toBe(1);
  expect(state.missionCount).toBe(20);
  expect(state.world1Missions).toBe(20);

  const missionButtons = page.locator('button').filter({ hasText: /MISSION|M\s*\d+/i });
  expect(await missionButtons.count()).toBeGreaterThan(0);

  await page.evaluate(() => {
    const runtime = window.MagicCurriculum;
    if (runtime?.completeMission) runtime.completeMission(1);
  });

  const afterCompletion = await page.evaluate(() => {
    const runtime = window.MagicCurriculum;
    return {
      xp: runtime?.progress?.xp ?? null,
      stars: runtime?.progress?.stars ?? null,
      completed: runtime?.progress?.completedMissions?.includes?.('11-1-1') || runtime?.progress?.completedMissions?.includes?.(1) || false
    };
  });

  expect(afterCompletion.xp).toBe(50);
  expect(afterCompletion.stars).toBe(1);
  expect(afterCompletion.completed).toBeTruthy();

  await page.reload({ waitUntil: 'networkidle' });
  const persisted = await page.evaluate(() => {
    const runtime = window.MagicCurriculum;
    return {
      xp: runtime?.progress?.xp ?? null,
      stars: runtime?.progress?.stars ?? null
    };
  });

  expect(persisted.xp).toBe(50);
  expect(persisted.stars).toBe(1);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
  expect(httpErrors).toEqual([]);
});
