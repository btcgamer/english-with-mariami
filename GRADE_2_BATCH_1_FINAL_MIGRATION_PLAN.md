# MAGIC NEON AI ACADEMY — GRADE 2 BATCH 1 FINAL MIGRATION PLAN

**Scope:** Grade 2 Lessons 1–10 only
**Branch:** `feat/magic-neon-future-mode`
**Status:** FINAL PRE-WRITE PLAN — NOT EXECUTED

## 1. Safety contract

- Preserve the existing lesson UUIDs exactly.
- Preserve `grade=2` and `lesson_number=1..10`.
- Do not reorder lessons.
- Do not change authentication, XP, progress, quiz-result, or frontend contracts.
- Do not modify `main`.
- Do not delete/recreate lesson rows.
- Do not delete/recreate quiz rows until their final 15-question payload is explicitly prepared and validated.
- No Supabase write is authorized by this document alone.

## 2. Verified schema

`public.lessons`:
- `id uuid`
- `grade integer`
- `lesson_number integer`
- `title text`
- `topic text`
- `description text`
- `image_url text`
- `audio_url text`
- `created_at timestamptz`
- `grammar_rule text`
- `grammar_examples jsonb`
- `listening_text text`
- `speaking_phrases jsonb`
- `reading_text text`
- `exercises jsonb`

`public.lesson_words`:
- `id uuid`
- `lesson_id uuid`
- `word text`
- `translation text`
- `emoji text`
- `image_url text`
- `audio_url text`
- `sort_order integer`

`public.lesson_quizzes`:
- `id uuid`
- `lesson_id uuid`
- `question text`
- `options jsonb`
- `correct_answer text`
- `sort_order integer`

## 3. Existing lesson UUID mapping

| Lesson | UUID |
|---|---|
| G2 L1 | `14f3d5f6-a63e-4512-9f03-25a4a2644048` |
| G2 L2 | `35ea6696-f83a-4804-8ca4-1738de48f23d` |
| G2 L3 | `44c247fa-fdde-4b38-b20a-8cfed9c94a2a` |
| G2 L4 | `5de0e889-03e7-4004-a009-089628cacee2` |
| G2 L5 | `755ab6f5-d97f-4295-bd48-339eccf6577c` |
| G2 L6 | `9e505fec-58cb-4e3c-8bda-5e36a42f8c10` |
| G2 L7 | `c7a4fa38-f1c8-4fd5-b3a1-e8ba70665b00` |
| G2 L8 | `ca58fef9-3212-4933-8a13-b080fc7d93d4` |
| G2 L9 | `f0f6327b-d74a-4673-a120-51f7273f9d30` |
| G2 L10 | `fd2c898a-d00b-440c-bff7-e478fdb0041e` |

## 4. Pre-write gate

Run the following as a read-only transaction before any write:

```sql
begin;

select count(*) as expected_lessons
from public.lessons
where grade = 2
  and lesson_number between 1 and 10;

select id, grade, lesson_number, title
from public.lessons
where grade = 2
  and lesson_number between 1 and 10
order by lesson_number;

select lesson_id, count(*) as quiz_count
from public.lesson_quizzes
where lesson_id in (
  '14f3d5f6-a63e-4512-9f03-25a4a2644048',
  '35ea6696-f83a-4804-8ca4-1738de48f23d',
  '44c247fa-fdde-4b38-b20a-8cfed9c94a2a',
  '5de0e889-03e7-4004-a009-089628cacee2',
  '755ab6f5-d97f-4295-bd48-339eccf6577c',
  '9e505fec-58cb-4e3c-8bda-5e36a42f8c10',
  'c7a4fa38-f1c8-4fd5-b3a1-e8ba70665b00',
  'ca58fef9-3212-4933-8a13-b080fc7d93d4',
  'f0f6327b-d74a-4673-a120-51f7273f9d30',
  'fd2c898a-d00b-440c-bff7-e478fdb0041e'
)
group by lesson_id
order by lesson_id;

select lesson_id, count(*) as word_count
from public.lesson_words
where lesson_id in (
  '14f3d5f6-a63e-4512-9f03-25a4a2644048',
  '35ea6696-f83a-4804-8ca4-1738de48f23d',
  '44c247fa-fdde-4b38-b20a-8cfed9c94a2a',
  '5de0e889-03e7-4004-a009-089628cacee2',
  '755ab6f5-d97f-4295-bd48-339eccf6577c',
  '9e505fec-58cb-4e3c-8bda-5e36a42f8c10',
  'c7a4fa38-f1c8-4fd5-b3a1-e8ba70665b00',
  'ca58fef9-3212-4933-8a13-b080fc7d93d4',
  'f0f6327b-d74a-4673-a120-51f7273f9d30',
  'fd2c898a-d00b-440c-bff7-e478fdb0041e'
)
group by lesson_id
order by lesson_id;

rollback;
```

Expected pre-write result: exactly 10 lessons and exactly 15 quiz rows per lesson. Existing word counts are informational only and must not be used from any multiplying join.

## 5. Lesson-field write set

For each L1–L10, update only:

- `title`
- `topic`
- `description`
- `grammar_rule`
- `grammar_examples`
- `reading_text`
- `listening_text`
- `speaking_phrases`
- `exercises`

Do not alter:

- `id`
- `grade`
- `lesson_number`
- `created_at`
- `image_url`
- `audio_url`

The authoritative content source is `GRADE_2_BATCH_1_CONTENT_PAYLOAD.md`.

## 6. Content targets

| L | Title | Topic | Grammar |
|---|---|---|---|
| 1 | Greetings & Introductions | Greetings & Introductions | be — I am / You are / He is / She is |
| 2 | My Family | Family | have got / has got |
| 3 | Colors | Colors Around Me | It is + color |
| 4 | Numbers 1–20 | How many? | How many? + numbers 1–20 |
| 5 | My Body | My Body | This is my... |
| 6 | Animals | Animals | I like... / I see... |
| 7 | Food I Like | Food Preferences | I like / I don't like |
| 8 | My Toys | Toys | This is my... / These are my... |
| 9 | At School | Classroom Objects | a / an |
| 10 | Weather | Weather | It is... |

## 7. Vocabulary write strategy

The target vocabulary comes from `GRADE_2_BATCH_1_CONTENT_PAYLOAD.md`.

Before changing `lesson_words`, validate the current rows and their IDs. The implementation should prefer updating existing child rows in place where practical, preserving child UUIDs. If a lesson needs fewer/more rows than the existing count, the exact insert/delete delta must be reviewed separately before execution.

No blind `delete from lesson_words where lesson_id=...` operation is permitted in the final migration.

## 8. Quiz write strategy

Every G2 lesson currently has 15 quiz rows. The final implementation target is:

- exactly 15 lesson-specific questions per lesson;
- four options per question;
- `correct_answer` must equal one option exactly;
- `sort_order` 1–15;
- no accidental cross-lesson topic rotation;
- no duplicate questions within a lesson;
- questions must measure that lesson's target grammar/vocabulary/reading/listening objective.

The current content payload contains quiz directions but not the required 150 concrete quiz records. Therefore **quiz rows are NOT considered final-ready yet**. They must be expanded into a concrete 150-question payload before execution.

## 9. Transaction pattern

The eventual data write must use one transaction:

```sql
begin;
-- preconditions
-- lesson updates
-- vocabulary updates/inserts only after validation
-- quiz updates only after the 150-question payload is validated
-- postconditions
commit;
```

If any precondition or postcondition fails, use `rollback` and make no partial content change.

## 10. Post-write QA gate

Immediately after the authorized write, verify:

1. G2 L1–L10 UUIDs are unchanged.
2. `grade=2` and lesson numbers 1–10 are unchanged.
3. Titles/topics/grammar match the matrix.
4. Reading and listening are non-empty and lesson-specific.
5. Speaking and exercises are non-empty JSONB values.
6. Each lesson has exactly 15 quizzes.
7. Each quiz has 4 options and a valid correct answer.
8. Vocabulary is aligned to the lesson target.
9. No L1–L10 lesson contains the old positional topic rotation.
10. No frontend schema contract changed.

## 11. Current status

**SAFE TO PREPARE:** yes.

**SAFE TO EXECUTE:** not yet — the concrete 150-question quiz payload still needs to be generated and validated.

**Supabase writes performed by this plan:** none.
