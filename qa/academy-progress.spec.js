const { test, expect } = require('playwright/test');
const BASE = process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:4173';
async function prepare(page, route = 'academy.html') {
  await page.route('https://cdn.jsdelivr.net/**', r => r.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route(/\/shared\/(magic-me-v10-pending|magic-me|magic-me-v10-academy)\.js/, r => r.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('**/magicme-studio/vendor/three.module.js', r => r.fulfill({ contentType: 'application/javascript', body: 'throw Error("Progress tests use the static globe");' }));
  await page.addInitScript(() => {
    const user = { id: 'progress-test-user', email: 'learner@example.test', user_metadata: {} };
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = {
      auth: { getSession: async () => ({ data: { session: { user } }, error: null }), getUser: async () => ({ data: { user }, error: null }) },
      from: () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { user_id: user.id, role: 'student', grade: 2 }, error: null }) })
    };
  });
  await page.goto(`${BASE}/${route}?grade=2`);
  await expect(page.locator('html')).toHaveClass(/mariami-auth-ready/);
  await expect(page.locator('#lesson-content')).toBeVisible();
}
async function review(page, rating = 'easy', keyboard = false) {
  if (keyboard) {
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('Space'); await page.keyboard.press(rating === 'easy' ? '4' : '3');
  } else {
    await page.locator('#pro-show').click(); await page.locator(`#pro-rate-${rating}`).click();
  }
}
async function value(page, id, expected) { await expect(page.locator(`#${id}`)).toHaveJSProperty('value', expected); }
for (const width of [390, 1440]) {
  test(`All practice, lesson and goal meters persist at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 }); await prepare(page);
    const lessonId = new URL(page.url()).searchParams.get('lesson');
    await page.locator('#premium-goal').selectOption('5');
    await page.locator('#pro-start-lesson').click(); await review(page);
    await value(page, 'pg-started', 1); await value(page, 'pg-mastered', 1);
    await expect(page.locator('#pg-started-pct')).not.toHaveText('0%');
    await expect(page.locator('#pg-mastered-pct')).not.toHaveText('0%');
    await value(page, 'pg-daily', 1); await expect(page.locator('#pg-daily-pct')).toHaveText('20%');
    await value(page, 'pg-session-bar', 1); await value(page, 'pg-lesson-bar', 1);
    const topic = page.locator('.topic-item').filter({ has: page.locator('progress') });
    await expect(topic.first().locator('progress')).toHaveJSProperty('value', 1);
    await expect(page.locator('#premium-memory-strong-n')).toHaveText('1');
    await expect(page.locator('#premium-week-total')).toHaveText('1 სიტყვა');
    expect(await page.locator('#premium-memory-strong').evaluate(e => e.getBoundingClientRect().width)).toBeGreaterThanOrEqual(2);
    // The filtered topic list must still address the actual lesson, not an array index.
    const title = await page.locator('#title-ka').innerText(); await page.locator('#search').fill(title);
    await expect(page.locator(`.topic-item[data-lesson-id="${lessonId}"] progress`)).toHaveJSProperty('value', 1);
    await page.locator('#search').fill('');
    for (let i = 0; i < 4; i++) await review(page);
    await value(page, 'pg-daily', 5); await expect(page.locator('#pg-daily-pct')).toHaveText('100%');
    await page.locator('#premium-goal').selectOption('20'); await expect(page.locator('#pg-daily-pct')).toHaveText('25%');
    await page.locator('#mark-done').click(); await value(page, 'pg-lessons', 1);
    await expect(page.locator('#pg-ring')).toHaveAttribute('aria-valuenow', '1');
    await page.locator('#mark-done').click(); await value(page, 'pg-lessons', 1);
    await page.reload(); await expect(page.locator('#lesson-content')).toBeVisible();
    await value(page, 'pg-started', 5); await value(page, 'pg-mastered', 5); await value(page, 'pg-lessons', 1);
    await value(page, 'pg-daily', 5); await expect(page.locator('#pg-daily')).toHaveJSProperty('max', 20);
    await expect(page.locator('#pg-daily-pct')).toHaveText('25%');
    await page.locator('#grade').selectOption('3'); await expect(page.locator('#topic-no')).toContainText('კლასი 3');
    await value(page, 'pg-started', 0); await value(page, 'pg-lessons', 0);
    await page.locator('#grade').selectOption('2'); await expect(page.locator('#topic-no')).toContainText('კლასი 2');
    await value(page, 'pg-started', 5); await value(page, 'pg-lessons', 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test('Keyboard reviews and a finished session update the visible session bar to 100%', async ({ page }) => {
  await prepare(page); await page.locator('#pro-start-new').click();
  await review(page, 'easy', true); await value(page, 'pg-session-bar', 1); await value(page, 'pg-started', 1);
  for (let i = 1; i < 15; i++) await review(page);
  await expect(page.locator('#pro-finish')).toBeVisible(); await expect(page.locator('#pro-practice')).toBeHidden();
  await expect(page.locator('#pg-session-box')).toBeVisible(); await value(page, 'pg-session-bar', 15);
  await expect(page.locator('#pg-session-bar')).toHaveJSProperty('max', 15);
  await expect(page.locator('#pg-session-count')).toContainText('15 / 15');
});
test('Failed storage writes never advance progress', async ({ page }) => {
  await prepare(page);
  await page.evaluate(() => {
    const write = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, val) { if (key.startsWith('ewm-study-pro-v1-grade-') || key.startsWith('mariami-grammar-listening-2026-done-')) throw Error('Storage test denial'); return write.call(this, key, val); };
  });
  await page.locator('#pro-start-new').click(); await review(page);
  await expect(page.locator('#pro-card-result')).toContainText('დაბლოკა');
  await value(page, 'pg-started', 0); await value(page, 'pg-mastered', 0); await value(page, 'pg-daily', 0); await value(page, 'pg-session-bar', 0);
  await page.locator('#mark-done').click(); await value(page, 'pg-lessons', 0);
  await expect(page.locator('#lesson-status')).toContainText('ვერ შეინახა');
});
test('Imported progress refreshes word, topic, daily and mastery meters', async ({ page }) => {
  await prepare(page);
  const word = await page.locator('.word-card b').first().innerText();
  page.on('dialog', d => d.accept());
  await page.locator('#pro-import').setInputFiles({ name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'mariami-study-pro-backup', schema: 1, grades: { 2: { [word.toLowerCase()]: { level: 4, hits: 3, misses: 0, last: Date.now(), due: Date.now() + 86400000 } } } })) });
  await expect(page.locator('#pro-message')).toContainText('პროგრესი გაერთიანდა');
  await value(page, 'pg-started', 1); await value(page, 'pg-mastered', 1); await value(page, 'pg-daily', 1); await value(page, 'pg-lesson-bar', 1);
});
test('The supplementary library uses the same live progress updates', async ({ page }) => {
  await prepare(page, 'learning-library-premium.html');
  await page.locator('#pro-start-lesson').click(); await review(page);
  await value(page, 'pg-started', 1); await value(page, 'pg-mastered', 1); await value(page, 'pg-lesson-bar', 1);
  await expect(page.locator('#pg-started-pct')).not.toHaveText('0%');
});
test('Progress saved in another tab updates the open dashboard', async ({ page, context }) => {
  await prepare(page);
  const other = await context.newPage(); await prepare(other);
  await other.locator('#pro-start-lesson').click(); await review(other);
  await value(page, 'pg-started', 1); await value(page, 'pg-mastered', 1); await value(page, 'pg-daily', 1);
  await expect(page.locator('#premium-memory-strong-n')).toHaveText('1');
  await expect(page.locator('#pro-started')).toHaveText('1');
  await other.close();
});
