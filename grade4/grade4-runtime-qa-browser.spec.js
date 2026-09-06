const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.GRADE4_BASE_URL || 'http://127.0.0.1:4173/grade4/';
const MISSIONS = 60;
const LABELS = ['Listening Word Quest', 'Dialogue Lab', 'Reading Mission', 'Grammar Lab', 'Critical Thinking'];

test('Grade 4 — 60 mission runtime QA', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('magic-neon-grade-4', JSON.stringify({ current: 1, done: [], stars: 0, streak: 0 }));
    window.__G4_BROWSER_QA__ = true;
  });

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  for (let n = 1; n <= MISSIONS; n++) {
    const task = page.locator('.mission-task');
    await expect(task).toBeVisible();
    const missionText = page.locator('.eyebrow').filter({ hasText: /MISSION\s+\d+\s*\/\s*60/i }).first();
    await expect(missionText).toContainText(`MISSION ${n} / 60`);
    await expect(page.locator('.mission-card h2')).toContainText(LABELS[(n - 1) % 5]);

    const complete = page.locator('[data-complete]');
    await expect(complete).toBeDisabled();

    if (n % 5 !== 0) {
      await expect(task.locator('.choice')).toHaveCount(3);
      await expect(task.locator('.choice[data-ok="true"]')).toHaveCount(1);
      await task.locator('.choice[data-ok="true"]').click();
    } else {
      await expect(task.locator('.answer')).toBeVisible();
      await expect(task.locator('[data-save]')).toBeVisible();
      await task.locator('.answer').fill('I think this idea is useful because it gives a clear reason. It can help people learn and make a better decision. We should consider evidence and practical results before choosing. A careful approach can make the final result more effective.');
      await task.locator('[data-save]').click();
    }

    await expect(complete).toBeEnabled();
    await complete.click();

    if (n < MISSIONS) {
      await expect(missionText).toContainText(`MISSION ${n + 1} / 60`);
    }
  }

  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('magic-neon-grade-4') || '{}'));
  expect(state.done).toHaveLength(60);
  expect(state.current).toBe(60);
});
