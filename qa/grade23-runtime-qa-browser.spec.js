const { test, expect } = require('playwright/test');

const GRADE = Number(process.env.GRADE || 2);
const BASE_URL = process.env.GRADE_BASE_URL || `http://127.0.0.1:4173/grade${GRADE}/`;
const MISSIONS = 60;

test(`Grade ${GRADE} — 60 mission runtime QA`, async ({ page }) => {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.addInitScript((grade) => {
    localStorage.setItem(`magic-neon-grade-${grade}`, JSON.stringify({ current: 1, done: [], stars: 0, streak: 0 }));
    sessionStorage.removeItem(`magic-neon-fresh-grade-${grade}`);
  }, GRADE);

  await page.addInitScript((grade) => {
    const user = { id: `qa-grade-${grade}-user` };
    const profiles = { user_id: user.id, role: 'student', grade };
    const chain = {
      select() { return this; },
      eq() { return this; },
      maybeSingle: async () => ({ data: profiles, error: null }),
      upsert: async () => ({ data: null, error: null })
    };
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = {
      auth: { getUser: async () => ({ data: { user }, error: null }) },
      from: () => chain
    };
  }, GRADE);

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  for (let n = 1; n <= MISSIONS; n++) {
    const task = page.locator('.mission-task');
    await expect(task).toBeVisible();
    await expect(page.locator('body')).toContainText(new RegExp(`MISSION\\s+${n}\\s*/\\s*60`, 'i'));

    const complete = page.locator('[data-complete]').first();
    await expect(complete).toBeVisible();

    const rightByAnswer = task.locator('.choice[data-answer="right"]');
    const rightByOk = task.locator('.choice[data-ok="true"]');
    const rightCount = await rightByAnswer.count() + await rightByOk.count();

    if (rightCount > 0) {
      for (const locator of [rightByAnswer, rightByOk]) {
        const count = await locator.count();
        for (let i = 0; i < count; i++) await locator.nth(i).click();
      }
    } else {
      const answer = task.locator('.answer');
      await expect(answer).toBeVisible();
      await answer.fill('I think this is a useful idea because it helps people learn. It can make a day better and give us a clear goal. We can practice, listen and try again when something is difficult.');
      const saveButton = task.locator('[data-save-answer], [data-save]').first();
      await expect(saveButton).toBeVisible();
      await saveButton.click();
      await expect(task.locator('.save-msg')).toContainText(/saved|save/i);
    }

    await expect(complete).toBeEnabled();
    await complete.click();
    if (n < MISSIONS) await expect(page.locator('body')).toContainText(new RegExp(`MISSION\\s+${n + 1}\\s*/\\s*60`, 'i'));
  }

  const state = await page.evaluate((grade) => JSON.parse(localStorage.getItem(`magic-neon-grade-${grade}`) || '{}'), GRADE);
  expect(state.done).toHaveLength(60);
  expect(new Set(state.done).size).toBe(60);
  expect(state.current).toBe(60);
  expect(state.stars).toBe(60);
  expect(state.streak).toBe(60);
  expect(pageErrors, `Unexpected page errors: ${pageErrors.join(' | ')}`).toEqual([]);
  expect(consoleErrors, `Unexpected console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
});
