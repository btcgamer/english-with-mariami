const { test, expect } = require('playwright/test');
const BASE = process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:4173';
async function learner(page) {
  await page.route('https://cdn.jsdelivr.net/**', r => r.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route(/\/shared\/(magic-me-v10-pending|magic-me|magic-me-v10-academy)\.js/, r => r.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.addInitScript(() => {
    const user = { id: 'portal-test-user', email: 'learner@example.test', user_metadata: {} };
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = {
      auth: { getSession: async () => ({ data: { session: { user } } }), getUser: async () => ({ data: { user } }) },
      from: () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { user_id: user.id, role: 'student', grade: 2 } }) })
    };
  });
}
for (const [position, range, first, last] of [[0,'1-4',1,4],[1,'5-8',5,8],[2,'9-12',9,12]]) {
  test(`Home portal ${range} opens current academy and preserves its range after grade selection`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await learner(page);
    await page.goto(BASE + '/index.html');
    await page.locator('.portal-card').nth(position).click();
    await expect(page).toHaveURL(new RegExp(`academy\\.html\\?grade=${first}&range=${range}#grade-portals$`));
    await expect(page.locator('#lesson-content')).toBeVisible();
    await expect(page.locator(`[data-grade-range="${range}"]`)).toHaveAttribute('aria-pressed', 'true');
    const visible = page.locator('#grade-portals a:visible');
    await expect(visible).toHaveCount(4);
    expect(await visible.evaluateAll(links => links.map(a => Number(new URL(a.href).searchParams.get('grade'))))).toEqual([first,first+1,first+2,last]);
    await visible.last().click();
    await expect(page.locator('#lesson-content')).toBeVisible();
    await expect(page.locator('#grade')).toHaveValue(String(last));
    await expect(page.locator('#grade-portals a:visible')).toHaveCount(4);
    await page.reload();
    await expect(page.locator('#lesson-content')).toBeVisible();
    await expect(page.locator('#grade-portals a:visible')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
test('Old grades bookmark retains a valid grade but ignores external redirect input', async ({ page }) => {
  await learner(page);
  await page.goto(BASE + '/grades.html?grade=8&range=5-8&redirect=https://example.com');
  await expect(page).toHaveURL(/academy\.html\?range=5-8&grade=8(?:&lesson=[^#]+)?#grade-portals$/);
  await expect(page.locator('#grade')).toHaveValue('8');
  await expect(page.locator('#grade-portals a:visible')).toHaveCount(4);
});
test('Old grades bookmark with a range chooses that range’s first grade', async ({ page }) => {
  await learner(page);
  await page.goto(BASE + '/grades.html?range=9-12&grade=999');
  await expect(page).toHaveURL(/academy\.html\?range=9-12&grade=9(?:&lesson=[^#]+)?#grade-portals$/);
  await expect(page.locator('#grade')).toHaveValue('9');
});
test('Service worker leaves the academy HTML styling unchanged', async ({ page }) => {
  await learner(page);
  await page.route('**/pwa.js*', r => r.fulfill({body:''}));
  await page.goto(BASE + '/index.html');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true}));
  });
  const response = await page.goto(BASE + '/academy.html?grade=2');
  const markup = await response.text();
  expect(markup).toContain('shared/review-polish.css');
  expect(markup).not.toContain('<link rel="stylesheet" href="./magic-ai-25c.css">');
});
