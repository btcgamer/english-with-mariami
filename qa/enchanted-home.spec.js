const { test, expect } = require('playwright/test');
const fs = require('node:fs'); const path = require('node:path'); const vm = require('node:vm');
const BASE = process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:4173';
async function guest(page) {
  await page.route('https://cdn.jsdelivr.net/**', r => r.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.addInitScript(() => {
    localStorage.setItem('ewm-sw-route-reset-v20', '1');
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = { auth: { getSession: async () => ({ data: { session: null }, error: null }) } };
  });
}
for (const width of [1440, 390, 320]) {
  test(`Magical homepage and both waterfall scenes work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 }); await guest(page);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${BASE}/index.html`);
    await expect(page.locator('.magic-water-layer')).toHaveCount(2);
    await expect(page.locator('a[href*="parent-space"], .parent-magic')).toHaveCount(0);
    const water = page.locator('.hero-living-world .magic-water-layer');
    await expect(water).toHaveAttribute('data-water-state', 'running');
    const first = await water.evaluate(canvas => canvas.toDataURL());
    await page.waitForTimeout(180);
    expect(await water.evaluate(canvas => canvas.toDataURL())).not.toBe(first);
    await page.screenshot({ path: `/tmp/enchanted-home-v2-${width}.png` });
    await page.locator('.motion-control').click();
    await expect(water).toHaveAttribute('data-water-state', 'paused');
    const paused = await water.evaluate(canvas => canvas.toDataURL());
    await page.waitForTimeout(100);
    expect(await water.evaluate(canvas => canvas.toDataURL())).toBe(paused);
    await page.locator('.motion-control').click();
    await page.locator('.world-panorama').scrollIntoViewIfNeeded();
    await expect(page.locator('.world-panorama .magic-water-layer')).toHaveAttribute('data-water-state', 'running');
    await page.locator('.world-panorama').screenshot({ path: `/tmp/enchanted-water-v2-${width}.png` });
    for (const card of await page.locator('.spell-card').all()) await card.click();
    await expect(page.locator('[data-spell-status]')).toContainText('სამივე');
    await page.addScriptTag({ url: `${BASE}/mobile-nav.js` });
    await expect(page.locator('.mobile-bottom-nav a')).toHaveCount(3);
    await expect(page.locator('.mobile-bottom-nav a[href*="parent"]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(water).toHaveAttribute('data-water-state', 'paused');
    await expect(page.locator('.motion-control')).toBeDisabled();
    expect(errors).toEqual([]);
  });
}
for (const existingSession of [false, true]) {
  test(`Former parent account opens the academy (${existingSession ? 'existing session' : 'sign in'})`, async ({ page }) => {
    await page.route('https://cdn.jsdelivr.net/**', r => r.fulfill({ contentType: 'application/javascript', body: '' }));
    await page.route(url => url.pathname === '/academy.html', r => r.fulfill({ contentType: 'text/html', body: '<h1>Academy destination</h1>' }));
    await page.addInitScript(existing => {
      const user = { id: 'legacy-account' }; const session = { user };
      window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = {
        auth: { getSession: async () => ({ data: { session: existing ? session : null }, error: null }), signInWithPassword: async () => ({ data: { user, session }, error: null }) },
        from: () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { role: 'parent', grade: 0 }, error: null }) })
      };
    }, existingSession);
    const retiredRequests = []; page.on('request', request => { if (request.url().includes('parent-space')) retiredRequests.push(request.url()); });
    await page.goto(`${BASE}/login.html`);
    if (!existingSession) {
      await page.locator('#email').fill('legacy@example.test'); await page.locator('#password').fill('ExamplePass123'); await page.locator('#loginButton').click();
    }
    await page.waitForURL('**/academy.html');
    expect(retiredRequests).toEqual([]);
  });
}
test('The retired address opens the academy without the former panel', async ({ page }) => {
  await page.route(url => url.pathname === '/academy.html', r => r.fulfill({ contentType: 'text/html', body: '<h1>Academy destination</h1>' }));
  await page.goto(`${BASE}/parent-space.html`); await page.waitForURL('**/academy.html');
  await expect(page.locator('form')).toHaveCount(0);
});
test('The service worker redirects legacy navigation before reading old caches', async () => {
  const handlers = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8'), {
    self: { location: { origin: 'https://englishwithmariami.com.ge' }, addEventListener: (name, callback) => { handlers[name] = callback; } },
    URL, Response, Promise,
    fetch: () => { throw Error('Retired navigation must not fetch the former page'); }
  });
  let result;
  handlers.fetch({ request: { method: 'GET', mode: 'navigate', url: 'https://englishwithmariami.com.ge/parent-space.html' }, respondWith: promise => { result = promise; } });
  const response = await result;
  expect(response.status).toBe(302);
  expect(response.headers.get('location')).toBe('https://englishwithmariami.com.ge/academy.html');
});
