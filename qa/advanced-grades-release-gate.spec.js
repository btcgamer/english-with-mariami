const { test, expect } = require('playwright/test');

const GRADES = [10, 11, 12];
const WORLD_COUNT = 10;
const MISSIONS_PER_WORLD = 20;
const BASE = 'http://127.0.0.1:4173';

function worldUrl(grade, world) { return BASE + '/curriculum/grade' + grade + '-world' + world + '.json'; }

async function fetchWorld(request, grade, world) {
  const response = await request.get(worldUrl(grade, world));
  expect(response.ok(), 'G' + grade + ' W' + world + ' returned ' + response.status()).toBeTruthy();
  return response.json();
}

test.describe('Advanced Grades Release Gate — Grade 10/11/12 curriculum integrity', () => {
  for (const grade of GRADES) {
    test('G' + grade + ' has 10 worlds x 20 missions', async ({ request }) => {
      const titles = new Set();
      let total = 0;
      for (let world = 1; world <= WORLD_COUNT; world++) {
        const data = await fetchWorld(request, grade, world);
        expect(data.grade).toBe(grade);
        expect(data.world).toBe(world);
        expect(typeof data.title).toBe('string');
        expect(data.title.trim()).not.toBe('');
        expect(typeof data.level).toBe('string');
        expect(data.level.trim()).not.toBe('');
        expect(Array.isArray(data.missions)).toBeTruthy();
        expect(data.missions).toHaveLength(MISSIONS_PER_WORLD);
        expect(titles.has(data.title)).toBeFalsy();
        titles.add(data.title);
        data.missions.forEach((mission, index) => {
          expect(mission.id).toBe(index + 1);
          expect(String(mission.title || mission.name || '').trim()).not.toBe('');
          expect(String(mission.focus || mission.description || mission.objective || '').trim()).not.toBe('');
        });
        total += data.missions.length;
      }
      expect(total).toBe(200);
    });
  }

  test('G10 + G11 + G12 release gate totals exactly 600 missions', async ({ request }) => {
    let total = 0;
    for (const grade of GRADES) {
      for (let world = 1; world <= WORLD_COUNT; world++) {
        const data = await fetchWorld(request, grade, world);
        total += data.missions.length;
      }
    }
    expect(total).toBe(600);
  });
});

test.describe('Advanced Grades Release Gate — runtime smoke', () => {
  for (const grade of GRADES) {
    test('G' + grade + ' opens Mission 1 without page errors', async ({ page }) => {
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto(BASE + '/advanced-academy.html?grade=' + grade, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('.mission-task')).toBeVisible({ timeout: 15000 });
      await expect(page.locator('body')).toContainText(new RegExp('MISSION\\s+1\\s*/\\s*20', 'i'));
      expect(pageErrors, 'G' + grade + ' page errors: ' + pageErrors.join(' | ')).toEqual([]);
    });
  }
});
