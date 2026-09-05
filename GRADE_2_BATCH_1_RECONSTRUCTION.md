# MAGIC NEON AI ACADEMY — GRADE 2 BATCH 1 RECONSTRUCTION

**Scope:** Grade 2 Lessons 1–10
**Authority:** `MASTER_CURRICULUM_MATRIX.md`
**Safety:** specification only; no Supabase writes

## Batch objective

Replace the current positional/template-driven bundle in G2 L1–L10 with ten coherent beginner lessons. Preserve lesson UUIDs and application contracts. Every lesson must connect title, topic, grammar, vocabulary, reading, listening, speaking, exercises and assessment.

## L1 — Hello! / Greetings & Introductions
- Grammar: be — I am / You are / He/She is
- Vocabulary: hello, hi, goodbye, name, friend, boy, girl, teacher
- Reading: 40–50 word micro-dialogue introducing two children
- Listening: different short greeting dialogue; identify speaker/name
- Production: say name + one simple fact
- Exercises: match greetings → choose be form → fill name → mini dialogue
- Quiz: identify who is who and correct be form

## L2 — My Family / Family
- Grammar: have got / has got
- Vocabulary: mother, father, sister, brother, grandmother, grandfather, family, baby
- Reading: short family description with named members
- Listening: family introduction; identify relationships
- Production: describe own/familiar family with 3–4 sentences
- Exercises: family-word matching → have/has → complete sentences → family description
- Quiz: relationship + have/has comprehension

## L3 — Colors / Colors Around Me
- Grammar: It is + color
- Vocabulary: red, blue, green, yellow, black, white, orange, pink, purple
- Reading: classroom/object color hunt
- Listening: objects and colors; identify correct color
- Production: describe 4 objects by color
- Exercises: color matching → sentence completion → classify → color hunt
- Quiz: object/color identification

## L4 — Numbers 1–20 / How many?
- Grammar: How many? / numbers 1–20
- Vocabulary: one–twenty, count, more, less
- Reading: counting game with concrete objects
- Listening: number sequence and quantity dialogue
- Production: count objects and answer How many?
- Exercises: number matching → missing number → count → short answer
- Quiz: number recognition + one-step quantity reasoning

## L5 — My Body / This is my...
- Grammar: This is my...
- Vocabulary: head, face, eye, ear, nose, mouth, hand, arm, leg, foot
- Reading: child labels a simple body picture
- Listening: body-part identification
- Production: point and name 5–7 body parts
- Exercises: label → match → sentence completion → describe
- Quiz: identify body part from simple clues

## L6 — Animals / I like / I see
- Grammar: I like... / I see...
- Vocabulary: cat, dog, bird, fish, horse, cow, lion, elephant, monkey
- Reading: short animal-park description
- Listening: animal spotting dialogue
- Production: say animals seen and liked
- Exercises: classify → complete I like/I see → match → animal identification
- Quiz: identify animal and speaker preference

## L7 — Food I Like / Preferences
- Grammar: I like / I don't like
- Vocabulary: apple, banana, bread, cheese, rice, soup, egg, cake, pizza, milk
- Reading: child food-preference mini survey
- Listening: two children discuss likes/dislikes
- Production: give 3 likes + 2 dislikes
- Exercises: food matching → like/don't like → survey → short response
- Quiz: infer one preference from dialogue

## L8 — My Toys / Possessive descriptions
- Grammar: This is my... / These are my...
- Vocabulary: ball, doll, car, kite, robot, teddy bear, blocks, toy, my, these
- Reading: toy box description
- Listening: child explains whose toys are where
- Production: describe own toy collection
- Exercises: singular/plural → possessive choice → matching → description
- Quiz: identify whose toy / singular-plural choice

## L9 — At School / a/an
- Grammar: a / an
- Vocabulary: book, pencil, pen, ruler, bag, eraser, desk, chair, school, classroom
- Reading: short classroom description
- Listening: teacher/student identifying classroom objects
- Production: name and describe 5 school objects
- Exercises: a/an choice → label → missing object → short description
- Quiz: choose a/an in context + object comprehension

## L10 — Weather / It is...
- Grammar: It is + weather adjective
- Vocabulary: sunny, rainy, cloudy, windy, snowy, hot, cold, weather, today
- Reading: simple weather report for one day
- Listening: different weather report; identify city/day/weather
- Production: give a 3–4 sentence weather report
- Exercises: weather matching → sentence completion → choose suitable item → mini report
- Quiz: identify weather from clues and choose correct sentence

## Cross-batch QA gate

Each lesson must pass:
- title/topic exact alignment
- grammar/context alignment
- vocabulary-topic alignment
- reading target alignment
- listening target alignment and non-copy requirement
- speaking/production alignment
- exercise progression: recognition → controlled use → production
- lesson-specific quiz
- no unrelated rotated input
- Grade 2 difficulty
- existing UUID preserved

## Implementation gate

This document is a reconstruction specification. It does not authorize database writes. The implementation layer must map each target bundle to the existing lesson UUID and preserve all unrelated application data.
