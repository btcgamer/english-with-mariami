/* Grade 12 World 7 static content QA
 * Run: node qa/grade12-world7-content-qa.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'curriculum', 'grade12-world7.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const assert = (condition, message) => {
  if (!condition) throw new Error(`World 7 QA failed: ${message}`);
};

assert(data.grade === 12, 'grade must be 12');
assert(data.world === 7, 'world must be 7');
assert(data.level === 'C2+', 'level must be C2+');
assert(data.missionCount === 20, 'missionCount must be 20');
assert(Array.isArray(data.missions), 'missions must be an array');
assert(data.missions.length === 20, 'there must be exactly 20 missions');

const ids = data.missions.map((mission, index) => Number(mission.id ?? mission.mission ?? index + 1));
assert(ids.every(Number.isInteger), 'all mission identifiers must be integers');
assert(new Set(ids).size === 20, 'mission identifiers must be unique');
assert(ids.every((id, index) => id === index + 1), 'mission identifiers must be sequential 1..20');
assert(data.scenarios && Array.isArray(data.scenarios) && data.scenarios.length >= 3, 'at least 3 scenarios are required');
assert(data.assessment && typeof data.assessment === 'object', 'assessment object is required');
assert(Array.isArray(data.grammarFocus) && data.grammarFocus.length >= 8, 'grammarFocus must contain at least 8 entries');
assert(Array.isArray(data.successCriteria) && data.successCriteria.length >= 8, 'successCriteria must contain at least 8 entries');

console.log('Grade 12 World 7 Content QA: PASS');
console.log('20 sequential missions, C2+ metadata, scenarios, assessment, grammar and success criteria verified.');
