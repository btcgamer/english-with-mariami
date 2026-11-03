const { test, expect } = require('playwright/test');
// Serve the checkout root on port 4173, or set ACADEMY_BASE_URL.
const BASE = process.env.ACADEMY_BASE_URL || 'http://127.0.0.1:4173';
async function localClient(page) {
  await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route(/\/shared\/(magic-me-v10-pending|magic-me|magic-me-v10-academy)\.js/, route => route.fulfill({ contentType: 'application/javascript', body: '' }));
  await page.route('**/magicme-studio/vendor/three.module.js', route => route.fulfill({ contentType: 'application/javascript', body: 'throw Error("Layout test uses the static globe fallback");' }));
  await page.addInitScript(() => {
    const user = { id: 'regression-user', email: 'learner@example.test', user_metadata: {} };
    window.regressionSignup = null;
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = {
      auth: {
        getSession: async () => ({ data: { session: { user } }, error: null }),
        getUser: async () => ({ data: { user }, error: null }),
        signUp: async payload => { window.regressionSignup = payload; return { data: { user, session: null }, error: null }; }
      },
      from: () => ({
        select() { return this; }, eq() { return this; },
        maybeSingle: async () => ({ data: { user_id: user.id, role: 'student', grade: 2 }, error: null }),
        upsert: async () => ({ error: null })
      })
    };
  });
}
for (const width of [320, 390, 1440]) {
  test(`Roadmap text keeps a readable column at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await localClient(page);
    await page.goto(`${BASE}/academy.html?grade=2`);
    await expect(page.locator('html')).toHaveClass(/mariami-auth-ready/);
    // Existing service workers inject these two themes on the production academy.
    await page.addStyleTag({ url: `${BASE}/magic-ai-25c.css` });
    await page.addStyleTag({ url: `${BASE}/shared/future-neon-classroom.css` });
    const steps = page.locator('.premium-step');
    await expect(steps).toHaveCount(3);
    for (const step of await steps.all()) {
      const sizes = await step.evaluate(element => {
        const card = element.getBoundingClientRect();
        const text = element.querySelector(':scope > div').getBoundingClientRect();
        const button = element.querySelector('button').getBoundingClientRect();
        return { textWidth: text.width, height: card.height, contained: button.left >= card.left && button.right <= card.right + 1 };
      });
      expect(sizes.textWidth).toBeGreaterThanOrEqual(120);
      expect(sizes.height).toBeLessThan(240);
      expect(sizes.contained).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#premium-go-new').click();
    await expect(page.locator('#pro-practice')).toBeVisible();
  });
}
test('Registration submits without an avatar studio or avatar metadata', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await localClient(page);
  await page.goto(`${BASE}/register.html`);
  await expect(page.locator('.auth-password-toggle')).toBeVisible();
  await expect(page.locator('iframe, #mm11Bridge, .auth-avatar-hint')).toHaveCount(0);
  await page.locator('#fullName').fill('Test Learner');
  await page.locator('#email').fill('learner@example.test');
  await page.locator('#password').fill('ExamplePass123');
  await page.locator('#submitBtn').click();
  await expect(page.locator('#message')).toHaveClass(/success/);
  const metadata = await page.evaluate(() => window.regressionSignup.options.data);
  expect(metadata.role).toBe('student');
  expect(metadata.full_name).toBe('Test Learner');
  expect(metadata).not.toHaveProperty('magicme_avatar');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test('Word tap selects English speech and shows blocked-audio guidance next to the word', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await localClient(page);
  await page.addInitScript(() => {
    window.regressionSpeech = null;
    window.regressionResume = 0;
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { configurable: true, value: class { constructor(text) { this.text = text; } } });
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: {
      getVoices: () => [{ name: 'Georgian', lang: 'ka-GE', localService: true }, { name: 'English', lang: 'en-US', localService: true }],
      addEventListener() {}, cancel() {}, resume() { window.regressionResume++; },
      speak(utterance) { window.regressionSpeech = utterance; utterance.onstart(); }
    } });
  });
  await page.goto(`${BASE}/academy.html?grade=2`);
  await expect(page.locator('html')).toHaveClass(/mariami-auth-ready/);
  await page.locator('#academy-motion').click();
  const card = page.locator('.lesson .word-card').first();
  const word = await card.locator('b').innerText();
  await card.locator('button').click();
  expect(await page.evaluate(() => window.regressionSpeech.text)).toBe(word);
  expect(await page.evaluate(() => window.regressionSpeech.voice.lang)).toBe('en-US');
  expect(await page.evaluate(() => window.regressionResume)).toBe(1);
  await page.evaluate(() => window.regressionSpeech.onerror({ error: 'not-allowed' }));
  await expect(card.locator('.speech-help')).toContainText('Chrome');
  await expect(card.locator('.speech-help')).toContainText('Messenger');
});
