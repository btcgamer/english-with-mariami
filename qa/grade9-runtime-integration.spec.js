const { test, expect } = require('playwright/test');

const BASE = 'http://127.0.0.1:4173';
const URL = `${BASE}/advanced-academy.html?grade=9`;
const WORLD_COUNT = 10;
const MISSIONS_PER_WORLD = 20;

function captureErrors(page) {
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      consoleErrors.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });
  return { pageErrors, consoleErrors };
}

async function openGrade9(page) {
  await page.addInitScript(() => {
    localStorage.removeItem('magicCurriculumProgress:g9');
    localStorage.removeItem('magicCurriculumCompleted');
  });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-curriculum-title]')).not.toHaveText('Curriculum loading…');
  await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(MISSIONS_PER_WORLD);
}

async function completeCurrentWorld(page) {
  for (let mission = 1; mission <= MISSIONS_PER_WORLD; mission += 1) {
    await page.evaluate(m => window.MagicCurriculum.markMissionComplete(m), mission);
  }
  await expect(page.locator('[data-curriculum-world-progress]')).toHaveText(`${MISSIONS_PER_WORLD}/${MISSIONS_PER_WORLD}`);
}

test.describe('Grade 9 Runtime Integration QA', () => {
  test('World 1 mission UI awards progress and persists locally', async ({ page }) => {
    const { pageErrors, consoleErrors } = captureErrors(page);
    await openGrade9(page);

    await expect(page.locator('[data-curriculum-title]')).toContainText('GRADE 9');
    await expect(page.locator('[data-curriculum-level]')).toHaveText('C1+');
    await expect(page.locator('[data-curriculum-world-progress]')).toHaveText('0/20');
    await expect(page.locator('[data-curriculum-total-progress]')).toHaveText('0/200');

    await page.locator('[data-open-mission="1"]').click();
    await expect(page.locator('[data-curriculum-modal]')).toBeVisible();
    await expect(page.locator('[data-curriculum-modal-title]')).toContainText('MISSION 1');
    await expect(page.locator('[data-curriculum-complete]')).toBeEnabled();
    await page.locator('[data-curriculum-complete]').click();

    await expect(page.locator('[data-curriculum-modal]')).toBeVisible();
    await expect(page.locator('[data-curriculum-complete]')).toHaveText('COMPLETED ✓');
    await expect(page.locator('[data-curriculum-xp]')).toHaveText('50');
    await expect(page.locator('[data-curriculum-stars]')).toContainText('1');
    await expect(page.locator('[data-curriculum-world-progress]')).toHaveText('1/20');
    await expect(page.locator('[data-curriculum-total-progress]')).toHaveText('1/200');

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('magicCurriculumProgress:g9') || '[]'));
    expect(stored).toContain('9:1:1');
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test('Grade 9 completes all 10 worlds, unlocks sequentially, and reaches graduation', async ({ page }) => {
    const { pageErrors, consoleErrors } = captureErrors(page);
    await openGrade9(page);

    for (let world = 1; world <= WORLD_COUNT; world += 1) {
      if (world > 1) {
        const button = page.locator(`[data-curriculum-world="${world}"]`);
        await expect(button).toBeEnabled();
        await button.click();
        await expect(page.locator('[data-curriculum-title]')).toContainText(`WORLD ${world}`);
        await expect(page.locator('[data-curriculum-missions] .magic-mission-card')).toHaveCount(MISSIONS_PER_WORLD);
      }

      await completeCurrentWorld(page);

      const expectedCompleted = world * MISSIONS_PER_WORLD;
      const expectedXp = expectedCompleted * 50;
      const expectedStars = expectedCompleted;
      await expect(page.locator('[data-curriculum-total-progress]')).toHaveText(`${expectedCompleted}/200`);
      await expect(page.locator('[data-curriculum-xp]')).toHaveText(String(expectedXp));
      await expect(page.locator('[data-curriculum-stars]')).toContainText(String(expectedStars));

      if (world < WORLD_COUNT) {
        await expect(page.locator(`[data-curriculum-world="${world + 1}"]`)).toBeEnabled();
      }
    }

    await expect(page.locator('[data-curriculum-world-status]')).toHaveText('ALL WORLDS COMPLETE • MASTER STATUS');
    await expect(page.locator('[data-curriculum-total-progress]')).toHaveText('200/200');
    await expect(page.locator('[data-curriculum-xp]')).toHaveText('10000');
    await expect(page.locator('[data-curriculum-stars]')).toContainText('200');

    await expect(page.locator('[data-curriculum-title]')).toContainText('WORLD 10');
    await expect(page.locator('[data-curriculum-missions]')).toContainText('C1+ Global Mastery Graduation Challenge');
    await expect(page.locator('[data-curriculum-scenarios]')).toContainText('C1+ Graduation Capstone');
    await expect(page.locator('[data-curriculum-assessment]')).toContainText('Integrated C1+ global mastery and graduation assessment');
    await expect(page.locator('[data-curriculum-assessment]')).toContainText('advanced reading analysis');
    await expect(page.locator('[data-curriculum-assessment]')).toContainText('flexible and precise C1+ language control');

    const finalState = await page.evaluate(() => ({
      completed: JSON.parse(localStorage.getItem('magicCurriculumProgress:g9') || '[]'),
      total: window.MagicCurriculum.completedTotal(),
      xp: window.MagicCurriculum.xpTotal(),
      stars: window.MagicCurriculum.starsTotal(),
      world10Unlocked: window.MagicCurriculum.worldUnlocked(10),
      world10MissionCount: window.MagicCurriculum.state.worldData?.missions?.length || 0
    }));
    expect(finalState.completed).toHaveLength(200);
    expect(finalState.total).toBe(200);
    expect(finalState.xp).toBe(10000);
    expect(finalState.stars).toBe(200);
    expect(finalState.world10Unlocked).toBe(true);
    expect(finalState.world10MissionCount).toBe(20);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
});