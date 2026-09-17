const { test, expect } = require('@playwright/test');

const WORLDS = Array.from({ length: 10 }, (_, i) => i + 1);

for (const world of WORLDS) {
  test(`Grade 12 World ${world} curriculum loads with 20 missions`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await page.goto(`http://127.0.0.1:4173/advanced-academy.html?grade=12&world=${world}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-curriculum-title]')).not.toHaveText('Curriculum loading…', { timeout: 10000 });
    await expect(page.locator('[data-curriculum-level]')).toHaveText('C2+');
    await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(20);
    await expect(page.locator('[data-curriculum-error]')).toBeHidden();
    expect(errors).toEqual([]);

    const result = await page.evaluate(async ({ world }) => {
      const response = await fetch(`curriculum/grade12-world${world}.json`, { cache: 'no-store' });
      const data = await response.json();
      return { status: response.status, grade: data.grade, world: data.world, missionCount: data.missions?.length };
    }, { world });

    expect(result).toEqual({ status: 200, grade: 12, world, missionCount: 20 });
  });
}

test('Grade 12 runtime exposes isolated progress API', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/advanced-academy.html?grade=12&world=1', { waitUntil: 'networkidle' });
  const api = await page.evaluate(() => ({
    grade: window.MagicCurriculum?.state?.grade,
    world: window.MagicCurriculum?.state?.world,
    completed: window.MagicCurriculum?.completedTotal?.(),
    xp: window.MagicCurriculum?.xpTotal?.(),
    stars: window.MagicCurriculum?.starsTotal?.(),
    worldUrl: window.MagicCurriculum?.worldUrl?.(12, 10)
  }));

  expect(api.grade).toBe(12);
  expect(api.world).toBe(1);
  expect(api.completed).toBe(0);
  expect(api.xp).toBe(0);
  expect(api.stars).toBe(0);
  expect(api.worldUrl).toBe('curriculum/grade12-world10.json');
});
