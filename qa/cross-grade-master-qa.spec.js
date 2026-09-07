const { test, expect } = require('playwright/test');

const GRADES = [2, 3, 4];
const PRIVILEGED = ['teacher', 'parent', 'admin'];
const BASE = 'http://127.0.0.1:4173';

function mockAuth(role, grade) {
  return async ({ page }) => {
    await page.addInitScript(({ role, grade }) => {
      const user = { id: `master-qa-${role}-${grade}` };
      const profiles = { user_id: user.id, role, grade };
      const chain = {
        select() { return this; },
        eq() { return this; },
        maybeSingle: async () => ({ data: profiles, error: null }),
        upsert: async () => ({ data: null, error: null })
      };
      window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = {
        auth: {
          getUser: async () => ({ data: { user }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } })
        },
        from: () => chain
      };
    }, { role, grade });
  };
}

test.describe('Cross-Grade Master QA — access matrix', () => {
  for (const requested of GRADES) {
    for (const studentGrade of GRADES) {
      test(`student G${studentGrade} -> G${requested}`, async ({ page }) => {
        const pageErrors = [];
        const consoleErrors = [];
        page.on('pageerror', e => pageErrors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
        await mockAuth('student', studentGrade)({ page });
        await page.goto(`${BASE}/grade${requested}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);
        if (studentGrade === requested) {
          await expect(page).toHaveURL(new RegExp(`/grade${requested}/?$`));
          await expect(page.locator('.mission-task')).toBeVisible();
        } else {
          await expect(page).toHaveURL(new RegExp(`/grade${studentGrade}/`));
        }
        expect(pageErrors, `G${studentGrade}->G${requested} page errors: ${pageErrors.join(' | ')}`).toEqual([]);
        expect(consoleErrors, `G${studentGrade}->G${requested} console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
      });
    }

    for (const role of PRIVILEGED) {
      test(`${role} can enter G${requested}`, async ({ page }) => {
        const pageErrors = [];
        const consoleErrors = [];
        page.on('pageerror', e => pageErrors.push(e.message));
        page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
        await mockAuth(role, 0)({ page });
        await page.goto(`${BASE}/grade${requested}/`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);
        await expect(page).toHaveURL(new RegExp(`/grade${requested}/?$`));
        await expect(page.locator('.mission-task')).toBeVisible();
        expect(pageErrors, `${role} G${requested} page errors: ${pageErrors.join(' | ')}`).toEqual([]);
        expect(consoleErrors, `${role} G${requested} console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
      });
    }
  }

  test('unauthenticated direct grade access fails closed', async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', e => pageErrors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    await page.goto(`${BASE}/grade2/`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login\.html\?redirect=/);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});

test.describe('Cross-Grade Master QA — runtime isolation', () => {
  test('grade-local progress storage is isolated', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('magic-neon-grade-2', JSON.stringify({ current: 7, done: [1, 2, 3], stars: 3, streak: 3 }));
      localStorage.removeItem('magic-neon-grade-3');
      localStorage.removeItem('magic-neon-grade-4');
    });
    await page.goto(`${BASE}/grade3/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => ({
      g2: JSON.parse(localStorage.getItem('magic-neon-grade-2') || 'null'),
      g3: JSON.parse(localStorage.getItem('magic-neon-grade-3') || 'null'),
      g4: JSON.parse(localStorage.getItem('magic-neon-grade-4') || 'null')
    }));
    expect(state.g2).toEqual({ current: 7, done: [1, 2, 3], stars: 3, streak: 3 });
    expect(state.g3).not.toEqual(state.g2);
    expect(state.g4).toBeNull();
  });

  for (const grade of GRADES) {
    test(`G${grade} first mission has isolated topic and usable completion`, async ({ page }) => {
      const pageErrors = [];
      const consoleErrors = [];
      page.on('pageerror', e => pageErrors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      await mockAuth('student', grade)({ page });
      await page.addInitScript(g => {
        localStorage.setItem(`magic-neon-grade-${g}`, JSON.stringify({ current: 1, done: [], stars: 0, streak: 0 }));
      }, grade);
      await page.goto(`${BASE}/grade${grade}/`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.mission-task')).toBeVisible();
      await expect(page.locator('body')).toContainText(/MISSION\s+1\s*\/\s*60/i);
      const topic = await page.locator('body').getAttribute('data-topic-qa');
      expect(topic || '').not.toBe('');
      const complete = page.locator('[data-complete]').first();
      await expect(complete).toBeVisible();
      const choices = page.locator('.mission-task .choice[data-answer="right"], .mission-task .choice[data-ok="true"]');
      if (await choices.count()) {
        await choices.first().click();
      } else {
        const answer = page.locator('.mission-task .answer');
        await answer.fill('This is a useful idea because it helps us learn and practice English.');
        const save = page.locator('.mission-task [data-save-answer], .mission-task [data-save]').first();
        await save.click();
        await expect(page.locator('.mission-task .save-msg')).toContainText(/saved|save/i);
      }
      await expect(complete).toBeEnabled();
      await complete.click();
      await expect(page.locator('body')).toContainText(/MISSION\s+2\s*\/\s*60/i);
      expect(pageErrors, `G${grade} page errors: ${pageErrors.join(' | ')}`).toEqual([]);
      expect(consoleErrors, `G${grade} console errors: ${consoleErrors.join(' | ')}`).toEqual([]);
    });
  }
});
