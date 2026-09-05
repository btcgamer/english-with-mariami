# MAGIC NEON AI ACADEMY — MASTER CURRICULUM DIFF REPORT

**Branch:** `feat/magic-neon-future-mode`

**Matrix authority:** `MASTER_CURRICULUM_MATRIX.md`

**Matrix commit:** `aefc9b8470690c62e9f03f9086e5de16fdff04b1`

**Supabase project:** `vtdhvsfqhwesxtwmduew`

**Audit date:** 2026-09-05

## 1. Scope

This is a read-only audit of the existing 180 lesson rows against the authoritative 180-lesson Master Curriculum Matrix.

**No Supabase lesson/content rows were changed by this audit.**

The matrix defines the intended relationship:

`Title → Grammar → Vocabulary → Listening/Reading → Exercises → Quiz/Assessment`

and explicitly forbids positional/template-driven content, silent cross-lesson borrowing and frontend fallback substitution.

## 2. Current database inventory

| Grade | Lessons | Vocabulary rows | Quiz rows | Missing title | Missing grammar | Missing listening | Missing reading | Missing exercises |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Grade 2 | 60 | 905 | 420 | 0 | 0 | 0 | 0 | 0 |
| Grade 3 | 60 | 941 | 420 | 0 | 0 | 0 | 0 | 0 |
| Grade 4 | 60 | 966 | 420 | 0 | 0 | 0 | 0 | 0 |
| **Total** | **180** | **2812** | **1260** | **0** | **0** | **0** | **0** | **0** |

Structural completeness is therefore not the problem. The problem is **semantic alignment and lesson-specificity**.

## 3. Critical finding — positional/template-driven content remains

The current lesson rows show a repeated grammar sequence that is independent of the actual lesson topic.

For example, Grade 2 currently begins:

| Lesson | Current title | Current topic | Current grammar | Matrix target |
|---:|---|---|---|---|
| 1 | Hello! | Greetings | be | Greetings & Introductions / be |
| 2 | My Family | Introduction | have got / has got | My Family / have got |
| 3 | My Colors | Family | this/that + these/those | Colors / color language |
| 4 | Numbers | Friendship | there is/are | Numbers 1–20 / How many? |
| 5 | My Body | Colors | can/cannot | My Body / This is my... |
| 6 | Animals | Numbers | Present Simple | Animals / I like / I see |
| 7 | Food | Numbers | Present Continuous | Food I Like / preferences |
| 8 | My Toys | Age | prepositions | My Toys / possessives |
| 9 | My School | Birthday | adjectives | At School / a/an |
| 10 | Weather | Body Parts | simple past | Weather / It is... |

This demonstrates the central defect: the lesson title may look plausible, but **topic, grammar, vocabulary, input and assessment are not being treated as one intentional bundle**.

The same positional pattern continues through Grades 2–4. Grade 3 and Grade 4 likewise contain lesson-specific titles surrounded by generic/rotating grammar and topic values.

## 4. Target contract vs current state

### Title

**Target:** Every title must match the exact curriculum position and the intended skill/content bundle.

**Current:** Many titles are usable as titles, but the surrounding content does not consistently belong to that title.

### Topic

**Target:** Topic must describe the actual lesson focus.

**Current:** Topic values are frequently shifted/rotated relative to the title. Example: Grade 2 Lesson 3 is `My Colors` but its current topic is `Family`; Lesson 4 is `Numbers` but its topic is `Friendship`.

### Grammar

**Target:** Grammar must match the matrix grammar target and be applied using the lesson vocabulary/context.

**Current:** Grammar follows a repeating template sequence. Example: Grade 2 Lesson 10 `Weather` currently carries a simple-past rule, while the matrix requires `It is...` weather language.

### Vocabulary

**Target:** Vocabulary must be intentionally selected for the lesson topic, age and progression, with deliberate consolidation.

**Current:** The database contains substantial vocabulary volume (2,812 rows total), but quantity alone does not establish curriculum alignment. Vocabulary must be revalidated lesson-by-lesson against the matrix.

### Listening / Reading

**Target:** Input must actually teach/apply the lesson target. Reading and listening difficulty must increase by grade.

**Current:** All 180 rows have listening and reading fields populated, but the existence of text does not prove semantic alignment. The content must be rebuilt/validated against each lesson target.

### Exercises

**Target:** Exercises must progress from guided recognition to application and match the lesson objective.

**Current:** All 180 rows have exercise arrays, but the current uniform structure strongly indicates template reuse. Exercise semantics must be checked and reconstructed.

### Quiz / Assessment

**Target:** Quizzes must test the lesson target and follow grade-specific assessment progression.

**Current:** 1,260 quiz rows exist (420 per grade). Distinct-question counts are only 317/420 in Grade 2, 322/420 in Grade 3 and 328/420 in Grade 4, confirming meaningful question duplication. This violates the matrix rule requiring duplicate quiz questions to be removed while preserving assessment coverage.

## 5. Grade progression gap

The matrix requires:

- **Grade 2:** concrete language, short texts/dialogues, guided production, literal comprehension and one-step reasoning.
- **Grade 3:** connected language, longer/multi-turn input, independent short responses and simple inference.
- **Grade 4:** varied structures, longer input, evidence, inference, comparison, opinion, problem solving and integrated production.

The current database has the same structural lesson payload pattern across all three grades. Therefore the next reconstruction must not merely rename lessons; it must increase **content complexity, reasoning demand, input length and production independence** by grade.

## 6. Required reconstruction sequence

### Phase A — Content diff

For every `grade + lesson_number`:

`CURRENT → TARGET → DIFF → REQUIRED FIX`

Fields:

1. title
2. topic
3. grammar_rule
4. grammar_examples
5. lesson_words
6. listening_text / audio
7. reading_text
8. speaking_phrases
9. exercises
10. quizzes
11. assessment mode
12. grade difficulty

### Phase B — Content reconstruction

Rebuild lessons in controlled batches, preserving each lesson UUID and all application relationships.

Do **not** modify:

- Auth
- profiles
- lesson_progress
- student_progress
- quiz_results
- XP/progress logic
- existing lesson UUID relationships
- frontend lesson-loading contracts

### Phase C — QA

After each batch:

- matrix alignment audit
- vocabulary-topic alignment
- grammar-vocabulary coherence
- listening/reading coherence
- exercise progression
- quiz duplication check
- grade-difficulty check
- functional lesson check

### Phase D — Final 180-lesson audit

No lesson is considered complete until all required fields are aligned and the complete 180-lesson audit passes.

## 7. Immediate conclusion

The current database already contains the expected **180 lesson rows**, but the audit confirms that the reconstruction problem is real: the system is structurally populated while a substantial part of the content remains driven by a positional/template pattern.

Therefore the next engineering step is **not to add more lessons**. It is to reconstruct the existing 180 lessons so that each row becomes an intentional curriculum bundle defined by `MASTER_CURRICULUM_MATRIX.md`.

**Supabase remains read-only during the audit phase.**
