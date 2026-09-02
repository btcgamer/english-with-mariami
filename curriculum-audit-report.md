# English with Mariami — Curriculum Audit Report

## Scope
Cross-grade QA for Grades 2–4. This pass is diagnostic: no lesson IDs, progress state, authentication, Supabase, or PWA behavior is changed.

## Verified structure
- Grade 2: 12 missions.
- Grade 3: 24 missions.
- Grade 4: 24 lessons across 6 worlds.
- Existing final subject-course layer is additive and does not replace the underlying mission maps.

## Adjacent-grade vocabulary QA
### Grade 2 → Grade 3
Intentional reinforcement is visible in core beginner domains: animals, family, home, food, school, weather, colors, and numbers. Grade 3 generally moves these words into descriptions, complete answers, comprehension, or dialogue rather than simply replacing them.

Exact examples of intentional carry-over include `cat/dog/bird`, `mother/father/sister/brother`, `house/room/kitchen`, `apple/bread/water/milk`, `school/teacher/student/book`, `sunny/rainy/cloudy`, and common colors such as `red/blue/green/yellow/purple`.

QA note: Grade 2 and Grade 3 use different depth goals, so these overlaps are not treated as defects. The key requirement is that Grade 3 practice adds sentence-level or communication value.

### Grade 3 → Grade 4
Grade 4 deliberately revisits core grammar and high-frequency language while adding connected contexts. Examples include Present Simple, prepositions, weather, routine language, school vocabulary, and practical directions.

Some exact lexical overlap is useful reinforcement (`question`, `answer`, `like`, `read`, `sunny`, `rainy`, `windy`, `snowy`, `museum`, etc.), but Grade 4 should increasingly test meaning in context, transformation, explanation, and production.

## Category consistency findings
1. Grade 2's curriculum map calls the vehicle topic `Transport`, while the final subject layer labels it `Vehicles`. This is a naming mismatch, not a data-ID problem; the final layer should use the canonical key `transport` while displaying "Vehicles" if desired.
2. The final subject layer contains subject banks that are intentionally broader than the original mission maps. These should be treated as practice-layer content, not replacements for the curriculum maps.
3. The final subject layer advertises staged learning, but stage depth is not yet equivalent across every subject. A future content pass should make Learn/Listen/Match/Build/Read/Speak/Master behavior genuinely distinct instead of relying on generic prompts.

## Sentence difficulty progression
- Grade 2: concrete nouns and short patterns (`This is...`, `I have...`, `I like...`, `I can...`).
- Grade 3: complete answers, questions, Present Simple, time, prepositions, short comprehension, and mini conversations.
- Grade 4: negatives/questions, past states, connected descriptions, functional dialogues, reading comprehension, opinion + reason, directions, and mixed assessment.

This is the correct progression direction. The remaining QA task is to inspect the actual lesson activity implementations and verify that their runtime tasks match these stated goals.

## Reading/listening QA target
Grade 4 has dedicated reading/listening worlds and lesson goals, but this report does not claim every runtime activity is text-linked until the underlying lesson content/handlers are inspected. This remains an explicit verification item before any rewrite.

## Speaking QA target
Grade 3 and Grade 4 both define speaking outcomes, including mini conversations, one-minute talk, opinion responses, shopping role-play, and directions. Runtime verification is still required to ensure learners must produce an answer rather than only press a listen/repeat control.

## Final assessment coverage target
The Grade 4 final area covers grammar, vocabulary, sentence building, reading/listening, speaking, and mixed assessment at the curriculum-map level. Runtime coverage should next be checked against each named grammar target: Present Simple, Do/Does, Don't/Doesn't, There is/There are, Was/Were, prepositions, Can/Can't, and adjectives/adverbs.

## Safety gate
No automatic lesson-content rewrite was made from this audit. Existing mission IDs/state contracts remain untouched. The next implementation pass should change only verified runtime gaps and should remain additive where possible.
