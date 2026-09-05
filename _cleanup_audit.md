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

### Grade 2 Curriculum Pass — 2026-09-05
A read-only content audit of all Grade 2 lessons (1–60), including lesson metadata, grammar, listening text, exercises, vocabulary and quiz questions, found that the current dataset is structurally complete but **curriculum alignment is not production-ready**.

#### Critical structural/content pattern
- Lessons 1–12 are relatively rich (40–46 vocabulary items and 15 quiz questions each), but the content is already showing systematic listening-topic offsets: for example L2 `My Family` listens to `Introducing Yourself`, L3 `My Colors` listens to `My Family`, and L4 `Numbers` listens to `My Friends`.
- From L13 onward, the dataset becomes a repeated template rather than a coherent progression: lessons generally contain exactly 8 vocabulary items and 5 quizzes.
- Grammar cycles repeatedly through the same 12 rules instead of progressing in difficulty. L13–24 repeat the grammar sequence introduced in L1–12; L25–36 repeat it again; L37–48 repeat it again; L49–60 repeat/review the same sequence.
- Many lesson titles are offset from their vocabulary/listening content. Examples: L13 `My Face` contains weather vocabulary; L14 `My Bedroom` contains seasons; L15 `My Kitchen` contains days; L17 `Big and Small` contains telling-time vocabulary; L25 `Fruit` contains wild animals; L30 `At the Shop` contains drinks; L37 `Time to Tell Time` contains transport; L42 `Sports` contains restaurant vocabulary.
- L47 `Prepositions: In and On` is a direct alignment failure: its grammar is future plans (`will / going to`), its vocabulary is travel, and its listening topic is `Travel`.
- Review/final lessons are too thin to function as meaningful assessment. L57–59 have only 8 vocabulary items and 5 direct translation quizzes; L60 also has 8 vocabulary items and 5 quizzes, including a duplicated `კითხვა` question.
- Exercise content is effectively identical across the Grade 2 curriculum (`Match`, `Complete`, `Read and answer`, `Speak for one minute`) and therefore does not demonstrate the requested progression from simple guided practice to richer reading, dialogue, picture description and reasoning tasks.

#### Grade 2 phase assessment
| Phase | Lessons | Status | Finding |
|---|---:|---|---|
| Foundation | 1–12 | 🟡 | Stronger vocabulary volume, but listening topics are offset and grammar/content alignment needs cleanup. |
| Core A | 13–24 | 🔴 | Titles, vocabulary and listening topics are systematically shifted; grammar simply repeats L1–12. |
| Core B | 25–36 | 🔴 | Same structural offset continues; 8-word/5-quiz template dominates. |
| Practical English | 37–48 | 🔴 | Useful real-life topics exist, but lesson titles and grammar are mismatched; L47 is a confirmed critical mismatch. |
| Review / Challenge | 49–60 | 🔴 | Review sequence is too shallow and remains mostly direct translation; final challenge lacks integrated reading/listening/reasoning assessment. |

#### Required Grade 2 target blueprint before any data write
- **L1–12 Foundation:** greetings, family, colors, numbers, body, animals, food, toys, school, weather, clothes, daily routine. Each lesson should have matching title → vocabulary → grammar → listening → exercises → quiz.
- **L13–24 Home & People:** face/body description, bedroom, kitchen, bathroom, size/opposites, feelings, temperature, movement, garden, farm animals, pets, wild animals. Introduce short dialogues and one-step comprehension.
- **L25–36 Food, Time & Hobbies:** fruit, vegetables, breakfast, lunch, drinks, shopping, birthday, days, months, seasons, morning/evening, hobbies/music. Use simple functional dialogues and short fill-in tasks.
- **L37–48 Around Town & Travel:** telling time, numbers 21–50, shapes, transport, park, sports, music, favorite things, polite expressions, classroom instructions, city/country, travel. Add simple map/picture-description and practical dialogues.
- **L49–56 Consolidation:** airport, holidays, daily routines, present simple/continuous, have got, can/can't, there is/are, prepositions. Reuse learned vocabulary intentionally rather than introducing unrelated replacement sets.
- **L57–60 Assessment:** integrated review lessons with short reading, listening, dialogue, picture description, one-word completion, comprehension and simple reasoning. L60 should be a genuine Grade 2 challenge rather than five translation questions.

#### Safe correction strategy
1. Do **not** patch this with frontend fallbacks or automatic cross-lesson content substitution.
2. Build the authoritative Grade 2 lesson content matrix first.
3. Correct each lesson as a coherent bundle: title, grammar, examples, listening, vocabulary, exercises and quizzes.
4. Preserve Grade 2 difficulty: short sentences, concrete vocabulary, guided tasks and simple reasoning.
5. Increase content depth gradually rather than making every lesson artificially identical in word/quiz count.
6. Remove duplicated quiz questions while preserving assessment coverage.
7. Only after the matrix is approved should targeted Supabase content updates be considered.

### Grade 3 Curriculum Pass — 2026-09-05
A read-only audit of all Grade 3 lessons (1–60) confirms the same underlying **content-template corruption pattern** found in Grade 2. The database structure is intact, but the curriculum is not aligned enough for production.

#### Grade 3 findings
- **L1–12 are substantially richer**: 37–53 vocabulary items and 15 quizzes each. These lessons have a plausible grammar progression on paper: `be` → `have got/has got` → demonstratives → there is/are → can/cannot → Present Simple → Present Continuous → prepositions → adjectives → Past Simple → future → question words.
- However, even the strong first block contains unnecessary cross-topic vocabulary inherited from earlier templates. For example L3 `My Home` includes family vocabulary, and L10 `My Town` includes body-part vocabulary. This is a smaller alignment problem than the later blocks but still needs cleanup.
- **L13–24 are critically misaligned.** The lesson titles are grammar-focused (`Subject Pronouns`, `Verb To Be`, `Have and Has`, etc.), while vocabulary is shifted to unrelated topics such as weather, seasons, weekdays, months, time, routine and school supplies. Grammar also rotates through rules that belong to different lessons. Example: L13 is `Subject Pronouns` but its grammar is `be` while its vocabulary is weather.
- **L25–36 continue the same offset.** `Food and Meals` contains wild-animal vocabulary; `Healthy Habits` contains pets; `Hobbies and Free Time` contains farm animals; `Sports and Abilities` contains wild animals; `Weather and Seasons` contains food; `Daily Routine` contains drinks; `Time and Schedules` contains fruit; `Days and Dates` contains vegetables; `Places in Town` contains healthy habits; `Directions` contains sports; `Transport and Travel` contains hobbies; `At the Airport` contains music.
- **L37–56 have the same systematic rotation.** Examples include `Clothes and Colors` with transport vocabulary, `My Town`-style vocabulary under body/house titles, `My Neighborhood` with shopping vocabulary, `Animals and Habitats` with money vocabulary, `Nature and Environment` with restaurant vocabulary, and `Past: Was and Were` with jobs vocabulary.
- **L47–56 are especially problematic for Grade 3's requested skill progression.** Lessons titled `Reading: A School Day`, `Reading: My Pet`, `Speaking: About Me`, `Writing: My Day`, `Useful Classroom English`, `Shopping Conversation`, `Restaurant English`, `At the Doctor`, `Celebrations`, and `Countries and Languages` all contain only 8 vocabulary items and 5 direct-translation quizzes. They therefore do not actually implement the promised reading, speaking, writing and functional-dialogue progression.
- **L57–60 are too shallow as assessment.** Each has 8 vocabulary items and 5 quizzes. L60 duplicates the `კითხვა` question pattern also seen in Grades 2 and 4. The final challenge is not an integrated Grade 3 assessment.
- Grammar progression also becomes disconnected from lesson titles after L13. Examples: L20 `Comparing Things` has a prepositions rule; L22 `There Is and There Are` has Past Simple; L23 `Some and Any` has future plans; L24 `Countable Nouns` has question words; L43 `Past: Was and Were` has Present Continuous; L44 `Past Simple: Regular Verbs` has prepositions; L45 `Past Simple: Irregular Verbs` has adjectives; L46 `Question Words` has Past Simple.

#### Grade 3 phase assessment
| Phase | Lessons | Status | Finding |
|---|---:|---|---|
| Foundation | 1–12 | 🟡 | Good vocabulary volume and plausible grammar progression, but several topic/template leaks need cleanup. |
| Grammar Core A | 13–24 | 🔴 | Lesson titles, grammar and vocabulary are systematically out of sync; grammar sequence is shifted. |
| Thematic Core B | 25–36 | 🔴 | Major title→vocabulary rotation and shallow 8-word/5-quiz template. |
| Functional English | 37–48 | 🔴 | Useful themes are present, but vocabulary/grammar are attached to the wrong lessons. |
| Skills / Assessment | 49–60 | 🔴 | Reading/speaking/writing/functional titles are not reflected in the actual task structure; final assessment is too weak. |

#### Required Grade 3 target blueprint before any data write
- **L1–12 Foundation:** self, family, home, school, animals, food, hobbies, weather, clothes, town, routine, useful English. Keep richer vocabulary but remove unrelated template leftovers.
- **L13–24 Grammar Core:** subject pronouns/be, have/has, Present Simple, do/does, adjectives/comparison, prepositions, there is/are, some/any, countable nouns. Each lesson must use vocabulary and listening that directly exercise the target grammar.
- **L25–36 Thematic Expansion:** food/health, hobbies, sports, weather, routine, time, dates, town, directions, transport, airport and travel. Add short multi-sentence texts and dialogues.
- **L37–48 Integration:** clothes/body/house/neighborhood/animals/nature, Past Simple and question words, then reading passages and comprehension. Introduce picture description and simple inference questions.
- **L49–56 Functional Skills:** speaking, writing, classroom English, shopping, restaurant, doctor, celebrations, countries/languages. Each lesson should contain a real mini-dialogue or writing task rather than translation-only quizzes.
- **L57–60 Assessment:** integrated reading + listening + dialogue + picture description + grammar application + reasoning. Increase difficulty beyond Grade 2 rather than simply repeating Grade 2 review vocabulary.

#### Grade 3 correction rule
Grade 3 should be **meaningfully harder than Grade 2**, not merely larger vocabulary lists. The authoritative rewrite should increase text length, sentence complexity, dialogue turns, comprehension depth and reasoning while keeping tasks age-appropriate. No frontend substitution should be used to hide the current database mismatch.

### Grade 4 Curriculum Pass — 2026-09-05
A read-only audit of all Grade 4 lessons (1–60) confirms that the database structure is complete, but the curriculum is **not production-ready as a Grade 4 progression**. The same template-offset problem appears here, with an additional concern: later lessons are labeled as advanced skills but do not contain advanced skill tasks.

#### Grade 4 findings
- **L1–12 are the richest block**: approximately 43–55 vocabulary items and 15 quizzes per lesson. Titles are generally coherent with their main vocabulary theme, but cross-topic leftovers appear: L2 `My Best Friend` contains generic introduction language; L3 `My Family Tree` contains demonstratives; L10 `My City` contains body-part vocabulary; L11 `Travel` contains emotion vocabulary.
- The first block's grammar sequence is also not reliably tied to its title. Examples include L3 `My Family Tree` with `this/that`, L7 `Healthy Food` with Present Continuous, L10 `My City` with Past Simple and L11 `Travel` with future plans. These grammar rules can be useful, but they need to be intentionally integrated with the lesson topic rather than inherited by position.
- **L13–42 show systematic title→vocabulary rotation.** Examples: L13 `Present Simple Review` contains weather; L14 `Present Continuous` contains seasons; L15 `Present Simple vs Continuous` contains weekdays; L16 `Past Simple Review` contains months; L18 `Future with Going To` contains daily routine; L19 `Future with Will` contains school objects; L21 `Must and Have To` contains school subjects; L24 `Comparatives` contains toys; L25 `Superlatives` contains wild animals; L29 `Object Pronouns` contains food; L34 `Directions and Maps` contains sports; L35 `Travel Plans` contains hobbies; L36 `At the Hotel` contains music; L37 `At the Airport` contains transport; L38 `Restaurant Conversation` contains town places; L39 `Shopping and Prices` contains directions; L40 `Healthy Lifestyle` contains shopping; L41 `Nature and Environment` contains money; L42 `Animals and Facts` contains restaurant vocabulary.
- **L43–56 are a major skills-implementation failure.** The titles promise `Reading: A Day in the City`, `Reading: A Travel Story`, `Writing: My Best Day`, `Writing: My Future Plans`, `Speaking: My Opinion`, `Speaking: Problem Solving`, `Communication Skills`, `Grammar Challenge`, vocabulary builders and conversation lessons. Yet each has only 8 vocabulary items and 5 translation-style quiz questions, so the actual data does not implement the stated reading, writing, speaking, problem-solving or communication objectives.
- **L47 `Speaking: My Opinion`** contains travel vocabulary and repeats the same Georgian target (`მოგზაურობა`) twice in its five quiz questions. This is both a skill mismatch and a duplicate-question issue.
- **L49 `Communication Skills`** is actually airport vocabulary; **L50 `Grammar Challenge 1`** is holidays/festivals; **L51 `Grammar Challenge 2`** is frequency adverbs; **L52–56** are effectively grammar/topic fragments rather than a designed skills sequence.
- **L57–60 are too shallow for the highest grade.** L57–59 have only 8 vocabulary items and 5 quizzes. L60 `Grade 4 English Challenge` has only 8 generic learning words and 5 translation questions. It does not measure integrated Grade 4 reading, listening, grammar application, writing, speaking, inference or problem solving.
- Grade 4 therefore has the same data-quality symptoms as Grades 2–3, but the mismatch is more serious because the expected learning outcome is the highest difficulty level. Simply expanding word counts would not fix it; the tasks themselves must become more complex.

#### Grade 4 phase assessment
| Phase | Lessons | Status | Finding |
|---|---:|---|---|
| Foundation / Core | 1–12 | 🟡 | Richer content exists, but grammar and some vocabulary need deliberate topic alignment. |
| Grammar Expansion | 13–24 | 🔴 | Systematic title→vocabulary rotation and inherited grammar sequence undermine progression. |
| Thematic / Functional Expansion | 25–42 | 🔴 | Topics are useful but frequently attached to the wrong lessons; 8-word/5-quiz template dominates. |
| Integrated Skills | 43–56 | 🔴 | Skill labels promise reading/writing/speaking/problem solving that the underlying tasks do not implement. |
| Review / Challenge | 57–60 | 🔴 | Final assessment is far too shallow for Grade 4 and lacks integrated production/reasoning. |

#### Required Grade 4 target blueprint before any data write
- **L1–12 Foundation-to-Intermediate:** personal information, friendship, family, home, school, nature, health, hobbies, weekend, city, travel, everyday communication. Use topic-specific grammar in context and richer listening than Grades 2–3.
- **L13–24 Grammar Expansion:** Present Simple/Continuous contrast, Past Simple review, future forms, modals (`can/could/may`, `must/have to`, `should`), frequency adverbs, comparatives/superlatives, possessives, object pronouns, question formation. Every grammar lesson needs contextual vocabulary, examples, a short reading/listening passage and application tasks.
- **L25–36 Thematic/Functional Expansion:** animals/facts, food/drinks, fruit/vegetables, health, sports, hobbies, music, transport, town, directions, travel, hotel/airport. Build multi-turn dialogues, short factual texts and practical problem-solving tasks.
- **L37–48 Integrated English:** airport, restaurant, shopping, health, nature, animals, jobs, reading stories, writing, speaking, opinion and problem solving. Each lesson must actually contain the named skill rather than a translation-only quiz.
- **L49–56 Functional/Production Skills:** communication, grammar challenges, vocabulary-in-context, present/past/future consolidation, mini-dialogues, guided writing, opinion, scenario-based problem solving and comprehension.
- **L57–60 Final Assessment:** integrated reading, listening, grammar application, vocabulary-in-context, multi-turn dialogue, picture description, short writing, inference and reasoning. L60 should be a genuine Grade 4 capstone.

#### Grade 4 correction rule
Grade 4 must be **meaningfully harder than Grade 3**. Difficulty should rise through longer and more connected texts, broader grammar application, multi-step instructions, multi-turn dialogues, inference, justification of answers, guided writing and scenario-based speaking—not just more vocabulary.

### Cross-grade curriculum matrix — target progression before any data write
| Stage | Grade 2 | Grade 3 | Grade 4 |
|---|---|---|---|
| Foundation | Concrete vocabulary; short sentences; guided practice | Longer sentences; connected mini-texts | Intermediate connected texts; contextual grammar |
| Grammar | One clear rule at a time; simple application | Rule + contrast + short comprehension | Rule contrast + application in context + editing/reasoning |
| Reading | 3–5 short sentences; literal questions | 5–8 sentences; detail + simple inference | 8–12+ sentences; inference + evidence |
| Listening | Short familiar dialogues/descriptions | Multi-sentence dialogue/story | Longer dialogue/story with key-detail and inference questions |
| Speaking | 1–3 sentence guided response | Short description/dialogue with prompts | Multi-turn role-play, opinion and problem solving |
| Writing | Word/sentence completion; 3–5 sentence guided text | 5–8 sentence guided paragraph | Structured paragraph/message with reasons/details |
| Picture tasks | Name/identify and describe simple objects | Describe people/places/actions | Describe, compare, infer and explain |
| Reasoning | One-step choice/inference | Two-step reasoning | Multi-step reasoning and justification |
| Assessment | Integrated but heavily guided | Mixed skills with moderate independence | Integrated capstone with meaningful production and inference |

### Global content reconstruction rules
1. Treat the current Supabase rows as a corrupted content source, not as an authoritative curriculum.
2. Build one authoritative 180-lesson matrix before performing bulk content updates.
3. Every lesson must be a coherent bundle: title → target grammar → grammar examples → vocabulary → listening → exercises → quizzes.
4. Do not move vocabulary/listening from one lesson to another merely to make titles look correct; rebuild the intended lesson bundle.
5. Preserve grade isolation and existing lesson UUID relationships.
6. Remove duplicated quiz questions while preserving coverage and appropriate difficulty.
7. Avoid identical exercise templates across all lessons; task variety must follow the grade progression.
8. Do not add frontend fallbacks that substitute content from another lesson or grade.
9. Keep Supabase schema/auth/progress logic unchanged; content-only writes should be targeted and auditable.
10. Validate every rewritten lesson after data updates, then run a final 180-lesson cross-grade QA.

### Content-quality action list
1. Complete the authoritative 180-lesson matrix using the target progression above.
2. Reconstruct Grades 2–4 lesson bundles from that matrix.
3. Remove the 11 duplicated quiz questions and replace them with non-duplicate questions of equivalent or better assessment value.
4. Verify every lesson's title, grammar, vocabulary, listening, exercises and quizzes agree semantically.
5. Verify Grade 2 < Grade 3 < Grade 4 difficulty using text length, sentence complexity, dialogue turns, reasoning and writing demands.
6. Re-run full structural/content QA after reconstruction.

### Safety / scope
- No Supabase schema, rows, auth settings, or production data were modified during this curriculum audit.
- No changes were made to `main`.
- Work remains isolated on `feat/magic-neon-future-mode`.
- `academy.html` was inspected but not replaced wholesale because its Auth/Supabase/progress logic is inline and should not be risked without a complete source rewrite.

## Current status
**MAGIC NEON AI ACADEMY — FUTURE MODE visual/architecture QA is strong, but curriculum content QA has now completed its first full read-only pass for Grades 2, 3 and 4. All three grades require authoritative content reconstruction before production data edits.**

The next safe implementation step is to create the authoritative **180-lesson curriculum matrix** and use it as the sole source for targeted content reconstruction. Only after that matrix is internally consistent should Supabase content rows be updated.
