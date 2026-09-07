const { test, expect } = require('@playwright/test');

const GRADE = Number(process.env.GRADE || 2);
const BASE_URL = process.env.GRADE_BASE_URL || `http://127.0.0.1:4173/grade${GRADE}/`;
const MISSIONS = 60;
const LABELS = ['Listening Word Quest', 'Dialogue Lab', 'Reading Mission', 'Grammar Lab', 'Thinking Challenge'];

function installSupabaseQaStub(page) {
  return page.addInitScript((grade) => {
    const user = { id: `qa-grade-${grade}-user` };
    const profiles = { user_id: user.id, role: 'student', grade };
    const chain = {
      select() { return this; },
      eq() { return this; },
      maybeSingle: async () => ({ data: profiles, error: null }),
      upsert: async () => ({ data: null, error: null })
    };
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = {
      auth: {
        getUser: async () => ({ data: { user }, error: null })
      },
      from: () => chain
    };
  }, GRADE);
}

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
  await installSupabaseQaStub(page);

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  for (let n = 1; n <= MISSIONS; n++) {
    const task = page.locator('.mission-task');
    await expect(task).toBeVisible();
    const missionText = page.locator('.eyebrow').filter({ hasText: /MISSION\s+\d+\s*\/\s*60/i }).first();
    await expect(missionText).toContainText(`MISSION ${n} / 60`);
    await expect(page.locator('.mission-card h2')).toContainText(LABELS[(n - 1) % 5]);

    const complete = page.locator('[data-complete]');
    await expect(complete).toBeDisabled();
    const type = (n - 1) % 5;

    if (type === 0 || type === 1 || type === 3) {
      await expect(task.locator('.choice')).toHaveCount(3);
      await expect(task.locator('.choice[data-answer="right"]')).toHaveCount(1);
      await task.locator('.choice[data-answer="right"]').click();
    } else if (type === 2) {
      const questions = task.locator('.question');
      await expect(questions).toHaveCount(2);
      const right = task.locator('.choice[data-answer="right"]');
      await expect(right).toHaveCount(2);
      await right.nth(0).click();
      await right.nth(1).click();
    } else {
      await expect(task.locator('.answer')).toBeVisible();
      await expect(task.locator('[data-save-answer]')).toBeVisible();
      await task.locator('.answer').fill('I think this is a useful idea because it helps people learn. It can make a day better and give us a clear goal. We can practice, listen and try again when something is difficult.');
      await task.locator('[data-save-answer]').click();
      await expect(task.locator('.save-msg')).toContainText(/saved|save/i);
    }

    await expect(complete).toBeEnabled();
    await complete.click();
    if (n < MISSIONS) await expect(missionText).toContainText(`MISSION ${n + 1} / 60`);
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
