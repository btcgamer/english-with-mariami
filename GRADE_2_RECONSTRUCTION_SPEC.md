# MAGIC NEON AI ACADEMY — GRADE 2 RECONSTRUCTION SPEC

**Authority:** `MASTER_CURRICULUM_MATRIX.md`
**Scope:** Grade 2, Lessons 1–60
**Mode:** specification only — no Supabase writes
**Audit date:** 2026-09-05

## Objective

Reconstruct the existing 60 Grade 2 lessons as coherent lesson bundles without changing lesson IDs, authentication, progress, XP, quiz-result relationships, or frontend contracts.

Required chain:

`Matrix Target → Title → Topic → Grammar → Vocabulary → Reading → Listening → Speaking → Exercises → Quiz`

## Reconstruction rules

1. Keep the existing lesson UUID for every lesson.
2. Do not reorder lessons.
3. Replace positional/template-driven content rather than patching isolated sentences.
4. Every grammar example must use the lesson's vocabulary/context.
5. Reading and listening must teach/apply the same target.
6. Exercises must move from recognition → controlled use → simple production.
7. Grade 2 input stays short and concrete; reasoning is literal or one-step inference.
8. Vocabulary is selected for the actual topic; accidental rotation is forbidden.
9. Quiz questions must be lesson-specific and duplicate-free where possible while preserving coverage.
10. Review lessons assess accumulated skills rather than becoming translation-only lists.

## Lesson-by-lesson target map

| L | Current defect | Required target | Required reconstruction |
|---:|---|---|---|
| 1 | Mostly aligned | Greetings & Introductions — be | Keep foundation; rewrite input around names/introduction; quiz asks who is speaking. |
| 2 | Topic/input is Introduction instead of family | My Family — have/has got | Family vocabulary, short family intro, family-word comprehension. |
| 3 | Topic/input = Family; grammar = this/that | Colors — It is + color | Color vocabulary, color hunt, object/color matching. |
| 4 | Topic/input = Friendship; grammar = there is/are | Numbers 1–20 — How many? | Counting dialogue, number recognition and missing-number task. |
| 5 | Topic/input = Colors; grammar = can | My Body — This is my... | Body vocabulary, labeling and body-part comprehension. |
| 6 | Topic/input = Numbers; grammar = Present Simple | Animals — I like / I see | Animal talk, classify/match, simple animal identification. |
| 7 | Topic/input = Numbers; grammar = Present Continuous | Food I Like — I like / I don't like | Food preferences, survey, comprehension of likes/dislikes. |
| 8 | Topic/input = Age; grammar = prepositions | My Toys — This is my / These are my | Toy vocabulary, possessive descriptions and whose-toy quiz. |
| 9 | Topic/input = Birthday; grammar = adjectives | At School — a/an | Classroom objects, labeling and missing-object comprehension. |
| 10 | Topic/input = Body Parts; grammar = past | Weather — It is... | Weather report, weather vocabulary and simple observation. |
| 11 | Topic/input = Feelings; grammar = future | My Clothes — I am wearing... | Clothing vocabulary and outfit description. |
| 12 | Topic/input = Clothes; grammar = question words | My Day — I + verb | Daily routine sequence from morning to night. |
| 13 | Topic/input = Weather | My Face — have got | Face description, eye/hair/feature vocabulary. |
| 14 | Topic/input = Seasons | My Bedroom — there is/are | Room tour and object location. |
| 15 | Topic/input = Days | My Kitchen — there is/are | Kitchen objects and table/room description. |
| 16 | Topic/input = Months | My Bathroom — I wash / I use | Bathroom routine and hygiene vocabulary. |
| 17 | Topic/input = Time | Big and Small — big/small, long/short | Concrete comparison and sorting. |
| 18 | Topic/input = Daily Routine | Happy and Sad — I am / He is | Feelings dialogue tied to situations. |
| 19 | Topic/input = School | Hot and Cold — It is / I feel | Temperature and suitable clothing/drink. |
| 20 | Topic/input = Classroom Commands | Fast and Slow — can/can't + verbs | Movement verbs and simple ability comparison. |
| 21 | Topic/input = School Subjects | My Garden — there is/are | Garden description and counting. |
| 22 | Topic/input = Home | Farm Animals — I can see | Farm visit, animal identification and egg-laying fact. |
| 23 | Topic/input = Furniture | Pets — have got | Pet-owner dialogue and pet needs. |
| 24 | Topic/input = Toys | Wild Animals — can/can't | Zoo listening, animal ability/characteristics. |
| 25 | Topic/input = Animals | Fruit — I like / some | Fruit shop interaction and purchase comprehension. |
| 26 | Topic/input = Pets | Vegetables — some/any | Healthy plate and vegetable classification. |
| 27 | Topic/input = Farm | Breakfast — I have for breakfast | Breakfast dialogue and meal choice. |
| 28 | Topic/input = Wildlife | Lunch — I want / I'd like | Lunch-order dialogue and menu comprehension. |
| 29 | Topic/input = Food | Drinks — I drink / I don't drink | Drink survey and preference chart. |
| 30 | Topic/input = Drinks | At the Shop — How much? | Simple shopping dialogue and price questions. |
| 31 | Topic/input = Fruit | My Birthday — I am ... years old | Birthday invitation and party-time comprehension. |
| 32 | Topic/input = Vegetables | Days of the Week — on Monday | Weekly routine and day sequencing. |
| 33 | Topic/input = Health | Months — in January | Calendar/birthday month tasks. |
| 34 | Topic/input = Sports | Seasons — in summer / It is | Seasons, weather and clothing. |
| 35 | Topic/input = Hobbies | Morning — routine verbs | Morning sequence and before/after comprehension. |
| 36 | Topic/input = Music | Evening — routine verbs | Evening diary and after-dinner sequence. |
| 37 | Topic/input = Transport | Time to Tell Time — What time is it? | Clock dialogue and clock-reading. |
| 38 | Topic/input = Town | Numbers 21–50 — How many are there? | Number game, dictation and missing numbers. |
| 39 | Topic/input = Directions | Shapes — It is a... | Shape hunt and sides/corners. |
| 40 | Topic/input = Shopping | Transport — I go by... | Travel dialogue and transport choice. |
| 41 | Topic/input = Money | At the Park — There is/are + can | Park picture description and location. |
| 42 | Topic/input = Restaurant | Sports — I can/can't | Sports abilities survey. |
| 43 | Topic/input = Jobs | Music — I like / play | Instruments and music preferences. |
| 44 | Topic/input = Nature | My Favorite Things — preferences | Interview/survey across favorite categories. |
| 45 | Topic/input = Beach | Please and Thank You — polite requests | Functional polite dialogue and response selection. |
| 46 | Topic/input = Places | Classroom Instructions — imperatives | Teacher commands with listen-and-act tasks. |
| 47 | Topic/input = Travel | City and Country — This is / I live in | Simple place description using Georgia/city/home vocabulary. |
| 48 | Topic/input = Hotel | Travel — I am going to... | Family travel dialogue and packing task. |
| 49 | Topic/input = Airport | Airport — I have a ticket | Check-in mini-dialogue and airport sequence. |
| 50 | Topic/input = Holidays | Holidays — We go / We visit | Holiday postcard and destination comprehension. |
| 51 | Topic = Grammar; input = Present Simple | Daily Routine Review — Present Simple | Review routines with comprehension and sequencing. |
| 52 | Topic = Grammar; input = Present Continuous | Now: What Are You Doing? — Present Continuous | Action picture, identify who is doing what. |
| 53 | Topic = Grammar; input = Have Got | Have Got Review | Possession text using family/home/pet vocabulary. |
| 54 | Topic = Grammar; input = Can and Can't | Can and Can't Review | Abilities table and dialogue comprehension. |
| 55 | Topic = Grammar; input = There Is/Are | There Is/There Are Review | Places, counting and questions. |
| 56 | Topic = Grammar; input = Prepositions | Prepositions — in/on/under/next to | Picture map and precise object location. |
| 57 | Review/template-driven | English Review 1 — mixed foundation | Integrated short text across family/home/food/school/animals/clothes/weather/routine. |
| 58 | Review/template-driven | English Review 2 — mixed grammar | Mini dialogue + text; choose/complete with simple reasoning. |
| 59 | Review/template-driven | English Review 3 — mixed skills | Practical dialogue covering town/travel/time/shopping/hobbies/holidays. |
| 60 | Partially aligned | Grade 2 English Challenge — integrated review | Multi-part mini story + listening + picture prompt; simple reasoning and evidence. |

## Required payload quality

### Reading

- L1–20: approximately 35–60 words where appropriate; very short dialogue/text.
- L21–40: approximately 45–75 words; slightly richer descriptions.
- L41–56: approximately 50–80 words; practical contexts.
- L57–60: integrated short passages with multiple familiar targets.

These are guidance ranges, not rigid counts; clarity and age appropriateness take priority.

### Listening

Listening must be independently understandable and not a copy of the reading. Use short dialogues, descriptions, announcements or mini-reports appropriate to the lesson target.

### Exercises

Each lesson should contain multiple exercise modes, not four copies of the same template. Prefer a mix of:

- matching
- choose
- fill one word
- order/sequence
- label
- classify
- short answer
- picture description
- mini-dialogue

### Quiz

Each quiz must answer: **What did this lesson actually teach?**

Avoid generic questions such as unrelated grammar drills. Questions should reference the lesson's vocabulary/context and include a small amount of one-step reasoning in later Grade 2 lessons.

## Acceptance criteria

A lesson passes only if:

- [ ] title matches matrix
- [ ] topic matches title
- [ ] grammar matches matrix
- [ ] grammar examples use target vocabulary
- [ ] vocabulary is topic-aligned
- [ ] reading matches target
- [ ] listening matches target
- [ ] speaking/production matches target
- [ ] exercises progress from guided to applied
- [ ] quiz measures the lesson target
- [ ] no accidental cross-lesson content remains
- [ ] Grade 2 difficulty is preserved
- [ ] existing lesson UUID remains unchanged

## Write gate

This specification does **not** authorize Supabase writes. It is the controlled blueprint for the next implementation stage.

The next implementation batch should be **Grade 2 Lessons 1–10**, followed by an isolated QA audit before proceeding to Lessons 11–20.
