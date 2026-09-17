#!/usr/bin/env node
/* Grade 9 Master QA: curriculum integrity and runtime contract checks. */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const curriculumDir = path.join(root, 'curriculum');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const worlds = [];
for (let world = 1; world <= 10; world += 1) {
  const file = path.join(curriculumDir, `grade9-world${world}.json`);
  check(fs.existsSync(file), `Missing curriculum file: grade9-world${world}.json`);
  if (!fs.existsSync(file)) continue;
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    worlds.push(data);
    check(data.grade === 9, `World ${world}: grade must be 9`);
    check(data.world === world, `World ${world}: world field mismatch`);
    check(Number(data.missionCount) === 20, `World ${world}: missionCount must be 20`);
    check(Array.isArray(data.missions), `World ${world}: missions must be an array`);
    check(data.missions?.length === 20, `World ${world}: must contain exactly 20 missions`);
    const ids = (data.missions || []).map((mission) => mission.id);
    check(new Set(ids).size === ids.length, `World ${world}: mission IDs must be unique`);
    check(ids.every((id, index) => id === index + 1), `World ${world}: mission IDs must be 1..20`);
    check(Array.isArray(data.grammar) && data.grammar.length > 0, `World ${world}: grammar content missing`);
    check(data.targets && typeof data.targets === 'object', `World ${world}: targets missing`);
    check(Array.isArray(data.realWorldScenarios) && data.realWorldScenarios.length > 0, `World ${world}: scenarios missing`);
    check(data.assessment && typeof data.assessment === 'object', `World ${world}: assessment missing`);
    for (const mission of data.missions || []) {
      check(typeof mission.title === 'string' && mission.title.trim().length > 0, `World ${world}, mission ${mission.id}: title missing`);
      check(typeof mission.focus === 'string' && mission.focus.trim().length > 0, `World ${world}, mission ${mission.id}: focus missing`);
    }
  } catch (error) {
    failures.push(`World ${world}: invalid JSON (${error.message})`);
  }
}

check(worlds.length === 10, `Expected 10 Grade 9 worlds, found ${worlds.length}`);
check(worlds.reduce((sum, world) => sum + (world.missions?.length || 0), 0) === 200, 'Expected exactly 200 Grade 9 missions in total');

const runtimePath = path.join(root, 'curriculum-runtime.js');
check(fs.existsSync(runtimePath), 'curriculum-runtime.js is missing');
if (fs.existsSync(runtimePath)) {
  const runtime = fs.readFileSync(runtimePath, 'utf8');
  check(/grade\$\{grade\}-world\$\{world\}\.json/.test(runtime), 'Runtime does not reference the Grade/World JSON contract');
  check(/localStorage/.test(runtime), 'Runtime progress persistence is missing');
  check(/unlock|Unlock/i.test(runtime), 'Runtime unlock logic is missing');
}

if (failures.length) {
  console.error(`Grade 9 Master QA failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Grade 9 Master QA passed: 10 worlds, 200 missions, schema/content checks, and runtime contract checks are valid.');
