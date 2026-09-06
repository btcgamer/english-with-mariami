# Grade 4 — Automatic Mapping Audit

Date: 2026-09-06
Source: `grade4/grade4-core.js`

## Global checks

| Check | Result |
|---|---|
| World count | PASS — 12 |
| Vocabulary count | PASS — 8 per world / 96 total |
| Mission count | PASS — 60 |
| Mission type count | PASS — 5 types, repeated 12 times each |
| Grammar world sets | PASS — 12 sets |
| Grammar tasks | PASS — 5 per world / 60 total |
| Dialogue fields | PASS — 12 dialogue + reply pairs |
| Reading fields | PASS — 12 reading + question + answer sets |
| Thinking prompts | PASS — 12 |
| World mapping | PASS — missions 1–5 → World 1 through missions 56–60 → World 12 |
| Mission-type mapping | PASS — `(n-1)%5` gives one of each mission type per world |
| Grammar mapping | PASS — `floor((n-1)/5)` selects the matching world and `(n-1)%5` selects its grammar task |
| Vocabulary mapping | PASS — vocabulary quest derives its target from the active world's 8-word array |
| Thinking mapping | PASS — each mission uses the active world's thinking prompt and first four vocabulary hints |

## World-by-world mapping

| World | Missions | Vocabulary | Dialogue | Reading | Grammar | Thinking |
|---|---:|---:|---|---|---:|---|
| 1 Identity & Goals | 1–5 | 8 | PASS | PASS | 5 | PASS |
| 2 Family & Relationships | 6–10 | 8 | PASS | PASS | 5 | PASS |
| 3 Time & Productivity | 11–15 | 8 | PASS | PASS | 5 | PASS |
| 4 Learning & Projects | 16–20 | 8 | PASS | PASS | 5 | PASS |
| 5 Health & Choices | 21–25 | 8 | PASS | PASS | 5 | PASS |
| 6 Community & Places | 26–30 | 8 | PASS | PASS | 5 | PASS |
| 7 Style & Decisions | 31–35 | 8 | PASS | PASS | 5 | PASS |
| 8 Climate & Environment | 36–40 | 8 | PASS | PASS | 5 | PASS |
| 9 Animals & Science | 41–45 | 8 | PASS | PASS | 5 | PASS |
| 10 Skills & Creativity | 46–50 | 8 | PASS | PASS | 5 | PASS |
| 11 Experiences & Memories | 51–55 | 8 | PASS | PASS | 5 | PASS |
| 12 Ideas & Opinions | 56–60 | 8 | PASS | PASS | 5 | PASS |

## Mapping assertions

1. `world(n)` uses `Math.floor((n-1)/5)%12`, so every block of five missions resolves to exactly one world.
2. Mission type is selected with `(n-1)%5`, producing Vocabulary, Dialogue, Reading, Grammar, and Thinking in a stable repeating sequence.
3. Grammar uses the same world block index plus the mission offset, preventing cross-world grammar leakage.
4. Vocabulary Quest selects only from the active world's vocabulary array.
5. Dialogue Lab reads the active world's dialogue/reply pair and derives the answer from the reply after the em dash.
6. Reading Mission uses the active world's reading/question/answer fields.
7. Critical Thinking uses the active world's thinking prompt and vocabulary hints.
8. All 60 mission numbers are reachable because the UI clamps the current mission to 1–60 and the navigation increments/decrements within that range.

## Result

**GRADE 4 MAPPING AUDIT: PASS — 12/12 worlds and 60/60 missions structurally mapped.**

### Limitation

This is a source-level automatic/static mapping audit. It does not claim real browser/device execution. Browser rendering, speech synthesis, touch behavior, and live DOM event behavior still require runtime QA.
