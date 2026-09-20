const { test, expect } = require('playwright/test');

const BASE = 'http://127.0.0.1:4173';
const GRADE = 12;
const WORLDS = 10;
const MISSIONS_PER_WORLD = 20;

async function waitForRuntime(page) {
  await expect.poll(async () => page.evaluate(() => Boolean(window.MagicCurriculum?.state?.worldData?.missions)), { timeout: 15000 }).toBe(true);
}

test('Grade 12 final graduation — all 10 worlds and 200 missions', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', e => pageErrors.push(e.message));

  await page.goto(`${BASE}/advanced-academy.html?grade=${GRADE}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForRuntime(page);

  const result = await page.evaluate(async ({ worlds, missionsPerWorld }) => {
    const runtime = window.MagicCurriculum;
    const seen = [];
    for (let world = 1; world <= worlds; world++) {
      const data = await runtime.fetchWorld(12, world);
      if (Number(data.grade) !== 12 || Number(data.world) !== world) throw new Error(`Invalid World ${world} identity`);
      if (!String(data.title || '').trim()) throw new Error(`World ${world} title missing`);
      if (!String(data.level || '').trim()) throw new Error(`World ${world} level missing`);
      if (!Array.isArray(data.missions) || data.missions.length !== missionsPerWorld) throw new Error(`World ${world} mission count invalid`);
      const nums = data.missions.map((m, i) => Number(m.mission || m.id || i + 1));
      if (new Set(nums).size !== missionsPerWorld || nums.some(n => n < 1 || n > missionsPerWorld)) throw new Error(`World ${world} mission numbering invalid`);
      data.missions.forEach((mission, index) => {
        if (!String(mission.title || mission.name || '').trim()) throw new Error(`World ${world} Mission ${index + 1} title missing`);
        if (!String(mission.focus || mission.description || mission.objective || '').trim()) throw new Error(`World ${world} Mission ${index + 1} focus missing`);
      });
      seen.push({ world, title: data.title, level: data.level, missions: data.missions.length });
      for (let mission = 1; mission <= missionsPerWorld; mission++) runtime.state.completed.add(`12:${world}:${mission}`);
      if (world < worlds) {
        if (!runtime.worldUnlocked(world + 1)) throw new Error(`World ${world + 1} did not unlock`);
        await runtime.loadWorld(12, world + 1);
      }
    }

    await runtime.loadWorld(12, worlds);
    localStorage.setItem('magicCurriculumProgress:g12', JSON.stringify([...runtime.state.completed]));
    return { seen, completed: runtime.completedTotal(), xp: runtime.xpTotal(), stars: runtime.starsTotal() };
  }, { worlds: WORLDS, missionsPerWorld: MISSIONS_PER_WORLD });

  expect(result.seen).toHaveLength(10);
  expect(new Set(result.seen.map(w => w.title)).size).toBe(10);
  expect(result.seen.every(w => w.missions === 20)).toBe(true);
  expect(result.completed).toBe(200);
  expect(result.xp).toBe(10000);
  expect(result.stars).toBe(200);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitForRuntime(page);
  await expect(page.locator('[data-curriculum-total-progress]')).toContainText('200/200');
  await expect(page.locator('[data-curriculum-world-status]')).toContainText('ALL WORLDS COMPLETE');
  expect(pageErrors).toEqual([]);
});

test('Grade 12 graduation progress persists after reload', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('magicCurriculumProgress:g12', JSON.stringify(Array.from({ length: 200 }, (_, i) => {
      const world = Math.floor(i / 20) + 1;
      const mission = (i % 20) + 1;
      return `12:${world}:${mission}`;
    })));
  });
  await page.goto(`${BASE}/advanced-academy.html?grade=${GRADE}&world=10`, { waitUntil: 'domcontentloaded' });
  await waitForRuntime(page);
  await expect(page.locator('[data-curriculum-total-progress]')).toContainText('200/200');
  await expect(page.locator('[data-curriculum-world-status]')).toContainText('ALL WORLDS COMPLETE');
  await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(20);
});
