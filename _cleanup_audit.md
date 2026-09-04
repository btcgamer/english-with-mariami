# Futuristic Learning Universe cleanup audit

## MAGIC NEON AI ACADEMY — 21st Century FUTURE MODE

### Final Production QA — 2026-09-04
- Grade 2 / Grade 3 / Grade 4 3D Future Mode scene definitions are present and grade-specific.
- The AI Companion is injected once per 3D scene and uses a non-interactive pointer-safe layer so it does not block the learning UI.
- Pointer Events are used for mouse, pen and modern touch interaction without a duplicate `touchstart` listener.
- Existing Grade 2 30-question quiz implementation remains in `3d-visuals.js`; the existing Grade 3 quiz implementation is preserved by the branch changes.
- The 3D scene and companion animations have mobile sizing rules plus `prefers-reduced-motion` protection.
- Progress bar styling is presentation-only: no progress data API or database write was introduced.
- Live progress reads authenticated user data only and clamps the displayed percentage to 0–100.
- Repeated quiz attempts are deduplicated by `quiz_id`; the best attempt per quiz is used for quiz performance.
- Future Command Center uses the same best-attempt-per-quiz rule, so quiz counts and perfect-quiz stars cannot be inflated by repeated attempts.
- Command Center is read-only and displays XP from `profiles.points`, streaks from `academy_streaks`, lesson progress from `lesson_progress`, and quiz results from `quiz_results`.
- Mission progress bars are clamped to 0–100 and do not write mission state back to Supabase.
- `config.js` loads the live progress and Command Center modules only on `academy.html` and leaves the existing Auth/Supabase client setup intact.
- The feature branch remains isolated from `main`.

### Responsive QA
- Desktop: cinematic 3D scene layout, neon grid, companion, progress HUD and Command Center have explicit layout/styling rules.
- Mobile: 650px and 430px breakpoints reduce scene height, companion size, object sizing and Command Center columns; quiz options remain touch-friendly.
- Horizontal tab overflow is handled for narrow screens.
- Reduced-motion users receive disabled/minimal animation timing.
- This is static source/CSS QA; no physical device/browser automation was available in this environment.

### Progress data sources checked
The current project contains compatible progress sources:
- `student_progress`: `words_learned`, `quiz_completed`, `score`, `best_quiz`, `quiz_attempts`, `last_active_at`.
- `lesson_progress`: lesson completion and scores by student/grade.
- `quiz_results`: quiz score/total and completion timestamps.
- `academy_activity`: activity completion and score/max_score.
- `academy_streaks`: current/best streak and last active date.
- `profiles`: grade and points.

### Lesson architecture / Grade isolation QA — 2026-09-05
- `lessons` contains exactly 60 lessons for each of Grades 2, 3 and 4, numbered 1–60.
- `lesson_words` is linked by `lesson_id`; `lesson_quizzes` is linked by `lesson_id`, so child content is structurally tied to its parent lesson.
- All 180 lessons currently have words, grammar rules, grammar examples, listening text and embedded exercises populated.
- Every lesson has quiz rows: 7 questions on average across the full curriculum, with the current range being 5–15.
- Grade 2 currently ranges from 8–46 words per lesson; Grade 3 from 8–53; Grade 4 from 8–55. This is valid data presence, but it is a curriculum/content-quality issue that needs a dedicated content pass if the goal is consistent lesson depth.
- No duplicate vocabulary words were detected within any single lesson.
- 11 lessons contain a duplicated quiz question (same normalized question text appears twice): Grade 2 lessons 1, 17, 47, 60; Grade 3 lessons 17, 47, 60; Grade 4 lessons 11, 17, 47, 60.
- The duplicated quiz questions are content-data issues, not cross-grade leakage. They should be corrected in the content source rather than silently hidden by the frontend.
- Several lesson titles intentionally repeat across grades (for example `My Family`, `My Hobbies`, `Nature and Environment`, `English Review`); title repetition alone is not evidence of leakage because each lesson has its own UUID and grade.
- `lesson.html` resolves numeric lesson parameters using both `grade` and `lesson_number`, and child words/quizzes using the resolved lesson UUID. UUID-based loading is additionally checked against the requested grade in the branch fix.

### Content-quality action list
1. Remove the 11 duplicated quiz questions from the authoritative lesson content while preserving question count and difficulty.
2. Review Grades 2–4 lesson depth, especially the later lessons with only 8 vocabulary items, against the intended curriculum progression.
3. Review difficulty progression: Grade 2 should remain simple and concrete; Grade 3 should introduce more complex texts/dialogues/descriptions; Grade 4 should be the most advanced.
4. Do not solve these content problems by adding frontend fallbacks that invent or mix content between grades.

### Safety / scope
- No Supabase schema, rows, auth settings, or production data were modified during this QA pass.
- No changes were made to `main`.
- Work remains isolated on `feat/magic-neon-future-mode`.
- `academy.html` was inspected but not replaced wholesale because its Auth/Supabase/progress logic is inline and should not be risked without a complete source rewrite.

## Current status
**MAGIC NEON AI ACADEMY — FUTURE MODE visual/architecture QA is strong, but curriculum content QA is still open.**

The next safe step is a dedicated Grade 2 → Grade 3 → Grade 4 curriculum/content pass. This should correct the identified duplicate questions and evaluate lesson depth/difficulty without changing Supabase schema or inventing cross-grade content.
