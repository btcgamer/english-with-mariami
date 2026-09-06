# Grade 3 — Static QA Audit

Date: 2026-09-06

## Curriculum coverage

- 12 Worlds present.
- 5 mission types mapped by `(mission - 1) % 5`.
- 60 missions reachable through `current` values 1–60.
- 8 vocabulary items are present in each World.
- Each World contains dialogue, reading, comprehension question/answer, and critical-thinking prompt.
- Grade 3 uses its own localStorage namespace: `magic-neon-grade-3`.

## Interaction coverage

- World navigation is wired through `data-m`.
- Previous / Next navigation is wired.
- Mission completion updates `done`, stars, streak and current mission.
- Speech synthesis controls are wired through `data-speak`.
- Choice feedback is wired through `.choice`.
- Thinking answers are saved locally under `grade3-answer-{mission}`.

## Findings for next hardening pass

1. Grammar generation currently derives verbs directly from vocabulary words. Some generated sentences are grammatically awkward (for example, a vocabulary noun can be inserted after `to`). This should be replaced with curated Grade 3 grammar sets.
2. `Complete Mission` currently does not require the learner to answer the interactive task first. A completion gate should be added for Vocabulary, Dialogue, Reading and Grammar missions; Thinking missions should require a non-empty answer.
3. Dialogue correctness currently extracts the text after the first em dash. Curated answer metadata would be more reliable than parsing display text.
4. Reading/Comprehension choices are functional, but distractors are generic. They should become lesson-specific distractors to increase assessment quality.
5. Runtime browser QA is still pending. This audit is static/code-level QA and does not claim browser execution.

## QA status

**Static coverage: PASS**

**Pedagogical hardening: IN PROGRESS**

**Browser runtime QA: PENDING**
