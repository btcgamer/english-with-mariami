# MAGIC NEON AI ACADEMY — GRADE 2 BATCH 1 DB WRITE MANIFEST

**Batch:** Grade 2 Lessons 1–10  
**Status:** READY FOR EXPLICIT DB-WRITE AUTHORIZATION  
**Branch:** `feat/magic-neon-future-mode`  
**Supabase content writes:** NONE performed by this manifest

## 1. Schema verified

### `lessons`
- `id` uuid
- `grade` integer
- `lesson_number` integer
- `title` text
- `topic` text nullable
- `description` text nullable
- `image_url` text nullable
- `audio_url` text nullable
- `created_at` timestamptz
- `grammar_rule` text nullable
- `grammar_examples` jsonb
- `listening_text` text nullable
- `speaking_phrases` jsonb
- `reading_text` text nullable
- `exercises` jsonb

### `lesson_words`
- `id` uuid
- `lesson_id` uuid -> `lessons.id` ON DELETE CASCADE
- `word` text
- `translation` text nullable
- `emoji` text nullable
- `image_url` text nullable
- `audio_url` text nullable
- `sort_order` integer
- `created_at` timestamptz

### `lesson_quizzes`
- `id` uuid
- `lesson_id` uuid -> `lessons.id` ON DELETE CASCADE
- `question` text
- `options` jsonb
- `correct_answer` text
- `sort_order` integer
- `created_at` timestamptz

## 2. Existing lesson UUID map — DO NOT CHANGE

| Lesson | UUID |
|---:|---|
| G2 L1 | `35ea6696-f83a-4804-8ca4-1738de48f23d` |
| G2 L2 | `44c247fa-fdde-4b38-b20a-8cfed9c94a2a` |
| G2 L3 | `9e505fec-58cb-4e3c-8bda-5e36a42f8c10` |
| G2 L4 | `5de0e889-03e7-4004-a009-089628cacee2` |
| G2 L5 | `f0f6327b-d74a-4673-a120-51f7273f9d30` |
| G2 L6 | `c7a4fa38-f1c8-4fd5-b3a1-e8ba70665b00` |
| G2 L7 | `fd2c898a-d00b-440c-bff7-e478fdb0041e` |
| G2 L8 | `755ab6f5-d97f-4295-bd48-339eccf6577c` |
| G2 L9 | `14f3d5f6-a63e-4512-9f03-25a4a2644048` |
| G2 L10 | `ca58fef9-3212-4933-8a13-b080fc7d93d4` |

## 3. Current child-row inventory

Every L1–L10 currently has exactly **15 quiz rows**.

Current lesson-word counts:

| Lesson | Words | Quizzes |
|---:|---:|---:|
| L1 | 41 | 15 |
| L2 | 44 | 15 |
| L3 | 43 | 15 |
| L4 | 42 | 15 |
| L5 | 44 | 15 |
| L6 | 44 | 15 |
| L7 | 44 | 15 |
| L8 | 44 | 15 |
| L9 | 40 | 15 |
| L10 | 44 | 15 |

These counts were obtained with independent correlated subqueries to avoid the previous join-multiplication counting error.

## 4. Write strategy

### Lessons
Update **content fields only** on the existing lesson UUIDs:
- `title`
- `topic`
- `grammar_rule`
- `grammar_examples`
- `reading_text`
- `listening_text`
- `speaking_phrases`
- `exercises`

Do not modify:
- `id`
- `grade`
- `lesson_number`
- `created_at`
- auth/progress/XP/result data

### Vocabulary
The existing child rows contain far more entries than the new Grade 2 target vocabulary. Before writing, map the target vocabulary by `sort_order`, then remove only surplus child rows after verifying that no other table references `lesson_words.id`. Do not change the parent lesson UUID.

### Quizzes
Each lesson already has 15 quiz rows. Prefer updating the existing quiz rows by `lesson_id + sort_order` so their UUIDs remain stable. Replace question/options/correct answer with lesson-specific content. Do not alter `lesson_id` or `sort_order`.

## 5. Required pre-write gate

Before any write is executed:
1. Verify all 10 parent UUIDs still exist.
2. Verify every UUID still maps to the same grade and lesson number.
3. Verify child-row foreign-key relationships.
4. Verify there are no references to child UUIDs that would make replacement unsafe.
5. Load the complete approved content payload.
6. Validate JSON shape for `grammar_examples`, `speaking_phrases`, and `exercises` against the frontend contract.
7. Execute in a transaction-safe manner.
8. Immediately run isolated L1–L10 QA.

## 6. Acceptance gate after write

For every lesson L1–L10:
- title matches matrix
- topic matches title
- grammar matches target
- grammar examples use lesson vocabulary
- reading teaches/applies target
- listening teaches/applies target and is not a copy of reading
- speaking matches target
- exercises progress recognition -> controlled use -> production
- all 15 quizzes are lesson-specific
- no accidental positional-topic rotation
- Grade 2 difficulty remains appropriate
- lesson UUID unchanged

## 7. Current state

**READY — awaiting explicit authorization to modify Supabase content.**

No database content has been changed by this manifest.
