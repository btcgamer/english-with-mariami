const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.GRADE4_BASE_URL;
const MISSIONS = 60;
const LABELS = ['Listening Word Quest', 'Dialogue Lab', 'Reading Mission', 'Grammar Lab', 'Critical Thinking'];

if (!BASE_URL) throw new Error('GRADE4_BASE_URL is required');

test('Grade 4 — 60 mission runtime QA', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('magic-neon-grade-4', JSON.stringify({ current: 1, done: [], stars: 0, streak: 0 }));
  });

  await page.goto(`${BASE_URL}?qa=1`, { waitUntil: 'domcontentloaded' });

  for (let n = 1; n <= MISSIONS; n++) {
    const task = page.locator('.mission-task');
    await expect(task).toBeVisible();
    const missionText = page.locator('.top .eyebrow').filter({ hasText: /MISSION\s+\d+\s*\/\s*60/i }).first();
    await expect(missionText).toContainText(`MISSION ${n} / 60`);

    const expectedLabel = LABELS[(n - 1) % 5];
    await expect(page.locator('.mission-card h2')).toContainText(expectedLabel);

    const complete = page.locator('[data-complete]');
    await expect(complete).toBeDisabled();

    if (n % 5 !== 0) {
      const choices = task.locator('.choice');
      await expect(choices).toHaveCount(3);
      await expect(task.locator('.choice[data-ok="true"]')).toHaveCount(1);
      await task.locator('.choice[data-ok="true"]').click();
    } else {
      await expect(task.locator('.answer')).toBeVisible();
      await expect(task.locator('[data-save]')).toBeVisible();
      await task.locator('.answer').fill('I think this idea is useful because it gives a clear reason. It can help people learn and make a better decision. We should consider evidence before choosing. This approach can create a practical result.');
      await task.locator('[data-save]').click();
    }

    await expect(complete).toBeEnabled();
    await complete.click();

    if (n < MISSIONS) {
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('.mission-task')).toBeVisible();
    }
  }

  await expect(page.locator('body')).toContainText(/60\/60 PASS|GRADE 4 RUNTIME QA/);
});
