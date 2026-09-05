# MAGIC NEON AI ACADEMY — GRADE 2 BATCH 1 PRE-WRITE QA

**Scope:** G2 L1–L10
**Purpose:** final safety gate before any Supabase content write
**Status:** NO Supabase write performed

## 1. Immutable identifiers

The existing lesson UUIDs must be preserved exactly:

| Lesson | UUID |
|---|---|
| G2 L1 | 14f3d5f6-a63e-4512-9f03-25a4a2644048 |
| G2 L2 | 35ea6696-f83a-4804-8ca4-1738de48f23d |
| G2 L3 | 44c247fa-fdde-4b38-b20a-8cfed9c94a2a |
| G2 L4 | 5de0e889-03e7-4004-a009-089628cacee2 |
| G2 L5 | 755ab6f5-d97f-4295-bd48-339eccf6577c |
| G2 L6 | 9e505fec-58cb-4e3c-8bda-5e36a42f8c10 |
| G2 L7 | c7a4fa38-f1c8-4fd5-b3a1-e8ba70665b00 |
| G2 L8 | ca58fef9-3212-4933-8a13-b080fc7d93d4 |
| G2 L9 | f0f6327b-d74a-4673-a120-51f7273f9d30 |
| G2 L10 | fd2c898a-d00b-440c-bff7-e478fdb0041e |

## 2. Content columns approved for lesson updates

Only these existing `lessons` content columns are candidates for replacement:

- title
- topic
- description
- grammar_rule
- grammar_examples
- listening_text
- speaking_phrases
- reading_text
- exercises

Do NOT change:

- id
- grade
- lesson_number
- created_at
- image_url
- audio_url

## 3. Child-table safety

`lesson_words` and `lesson_quizzes` retain their `lesson_id` relationships.

Existing Grade 2 Batch 1 word counts:

- L1: 41
- L2: 44
- L3: 43
- L4: 42
- L5: 44
- L6: 44
- L7: 44
- L8: 44
- L9: 40
- L10: 44

Existing quiz count: **15 rows per lesson = 150 rows total**.

The implementation must not delete/recreate child rows merely to change content. Existing child UUIDs should be preserved unless a later explicit migration decision requires otherwise.

## 4. Quiz acceptance gate

Every lesson must finish with exactly 15 concrete quiz questions.

For every quiz row:

- question is non-empty
- exactly four options exist
- options are distinct
- correct_answer is one of the four options
- sort_order is unique and runs 1–15 within the lesson
- question measures the lesson target
- vocabulary/context belongs to the lesson
- no accidental copy from another lesson
- no duplicate question within the lesson
- avoid identical question text across L1–L10 where possible

Target distribution should mix:

- vocabulary recognition
- grammar selection/completion
- reading comprehension
- listening comprehension
- simple one-step reasoning

## 5. Curriculum alignment gate

L1 Greetings & Introductions → be
L2 My Family → have got / has got
L3 Colors → It is + color
L4 Numbers 1–20 → How many?
L5 My Body → This is my...
L6 Animals → I like / I see
L7 Food I Like → I like / I don't like
L8 My Toys → This is my / These are my
L9 At School → a / an
L10 Weather → It is...

A lesson fails QA if its topic, grammar, reading, listening, exercises, or quiz materially belongs to another lesson.

## 6. Transaction/write gate

Before write:

1. Verify all 10 UUIDs exist.
2. Verify each UUID maps to the expected grade and lesson number.
3. Snapshot current relevant lesson content and child-row identifiers.
4. Validate the full replacement payload.
5. Execute the write atomically.
6. Re-query all 10 lessons and all 150 quizzes.
7. Verify UUIDs, relationships, counts, sort order, correct answers, and curriculum alignment.
8. If any post-write check fails, stop and report; do not continue to later batches.

## 7. Explicit authorization requirement

This document is a preparation/QA artifact only.

**No Supabase content write is authorized by this file.**

The actual database write requires an explicit user instruction such as:

> ჩაწერე Supabase-ში

