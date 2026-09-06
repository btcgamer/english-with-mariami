(function () {
  'use strict';

  /* =========================================================
     ENGLISH WITH MARIAMI — GRADE 4
     STABLE LOCAL-FIRST 60 MISSION ENGINE
     ========================================================= */

  const STORAGE_KEY = 'grade4UniverseProgress';

  let state = {
    xp: 0,
    stars: 0,
    streak: 0,
    done: [],
    last: null,
    quizRewards: {},
    quizPassed: {}
  };

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    state = { ...state, ...saved };
  } catch (e) {}

  state.done = Array.isArray(state.done) ? state.done : [];
  state.quizRewards =
    state.quizRewards && typeof state.quizRewards === 'object'
      ? state.quizRewards
      : {};
  state.quizPassed =
    state.quizPassed && typeof state.quizPassed === 'object'
      ? state.quizPassed
      : {};

  state.xp = Number(state.xp) || 0;
  state.stars = Number(state.stars) || 0;
  state.streak = Number(state.streak) || 0;

  const client =
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
    window.supabaseClient ||
    null;

  const esc = (value) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const arr = (value) => (Array.isArray(value) ? value : []);

  let lessons = [];

  /* =========================================================
     WORLD DATA
     ========================================================= */

  const worlds = [
    {
      id: '01',
      title: 'Grammar Core',
      ka: 'გრამატიკის ბირთვი',
      icon: '🧠'
    },
    {
      id: '02',
      title: 'Grammar Advanced',
      ka: 'გრამატიკის შემდეგი დონე',
      icon: '⚙️'
    },
    {
      id: '03',
      title: 'Vocabulary Galaxy',
      ka: 'სიტყვების გალაქტიკა',
      icon: '🔤'
    },
    {
      id: '04',
      title: 'Reading & Listening',
      ka: 'კითხვა და მოსმენა',
      icon: '📖'
    },
    {
      id: '05',
      title: 'Speaking Lab',
      ka: 'საუბრის ლაბორატორია',
      icon: '🎧'
    },
    {
      id: '06',
      title: 'Brain Games & Final',
      ka: 'თავსატეხები და ფინალი',
      icon: '🧩'
    }
  ];

  /* =========================================================
     DEFAULT LESSON TOPICS
     60 TOTAL = 10 PER WORLD
     ========================================================= */

  const lessonBlueprint = [
    /* WORLD 1 */
    ['Present Simple', 'ყოველდღიური მოქმედებები'],
    ['Do / Does Questions', 'კითხვები და პასუხები'],
    ["Don't / Doesn't", 'უარყოფითი წინადადებები'],
    ['There is / There are', 'საგნების აღწერა'],
    ['Have / Has', 'ქონა და ფლობა'],
    ['Possessive Adjectives', 'my, your, his, her, our, their'],
    ['Present Continuous', 'ახლა მიმდინარე მოქმედებები'],
    ['Present Simple vs Continuous', 'ორი დროის შედარება'],
    ['Question Words', 'who, what, where, when, why, how'],
    ['Grammar Mission I', 'გრამატიკის შემაჯამებელი მისია'],

    /* WORLD 2 */
    ['Was / Were', 'წარსულში ყოფნა'],
    ['Past Simple', 'წარსული მოქმედებები'],
    ['Regular Verbs', 'რეგულარული ზმნები'],
    ['Irregular Verbs', 'არარეგულარული ზმნები'],
    ['Can / Can’t', 'უნარი და შესაძლებლობა'],
    ['Could / Couldn’t', 'წარსული უნარი'],
    ['Prepositions', 'in, on, under, behind, between'],
    ['Adjectives', 'საგნების და ადამიანების აღწერა'],
    ['Adverbs', 'როგორ ხდება მოქმედება'],
    ['Grammar Challenge', 'გრამატიკის რთული გამოწვევა'],

    /* WORLD 3 */
    ['School & Learning', 'სკოლა და სწავლა'],
    ['Daily Routine', 'დღის რუტინა'],
    ['Weather & Seasons', 'ამინდი და სეზონები'],
    ['City & Travel', 'ქალაქი და მოგზაურობა'],
    ['Family & Friends', 'ოჯახი და მეგობრები'],
    ['Food & Drinks', 'საჭმელი და სასმელი'],
    ['Hobbies & Sports', 'ჰობი და სპორტი'],
    ['Home & Rooms', 'სახლი და ოთახები'],
    ['Nature & Animals', 'ბუნება და ცხოველები'],
    ['Vocabulary Galaxy Mission', 'დიდი სიტყვების მისია'],

    /* WORLD 4 */
    ['The Science Museum', 'მეცნიერების მუზეუმი'],
    ['The Helpful Robot', 'დამხმარე რობოტი'],
    ['Weekend Adventure', 'შაბათ-კვირის თავგადასავალი'],
    ['Future City', 'მომავლის ქალაქი'],
    ['A Day at School', 'ერთი დღე სკოლაში'],
    ['The Lost Backpack', 'დაკარგული ზურგჩანთა'],
    ['Space Explorer', 'კოსმოსის მკვლევარი'],
    ['The Secret Map', 'საიდუმლო რუკა'],
    ['Rainy Day Rescue', 'წვიმიანი დღის მისია'],
    ['Reading Commander', 'კითხვის დიდი გამოწვევა'],

    /* WORLD 5 */
    ['My Day', 'ჩემი დღე'],
    ['My Opinion', 'ჩემი აზრი'],
    ['At the Shop', 'მაღაზიაში საუბარი'],
    ['Directions', 'მიმართულებები'],
    ['At the Restaurant', 'რესტორანში'],
    ['At the Doctor', 'ექიმთან საუბარი'],
    ['Meeting a Friend', 'მეგობართან შეხვედრა'],
    ['Talking About Hobbies', 'ჰობიზე საუბარი'],
    ['Describing a Place', 'ადგილის აღწერა'],
    ['Speaking Champion', 'საუბრის ჩემპიონი'],

    /* WORLD 6 */
    ['Grammar Quiz Arena', 'გრამატიკის დიდი ქვიზი'],
    ['Vocabulary Vault', 'სიტყვების საგანძური'],
    ['Sentence Factory', 'წინადადებების თავსატეხი'],
    ['Reading Challenge', 'კითხვის გამოწვევა'],
    ['Listening Challenge', 'მოსმენის გამოწვევა'],
    ['Word Detective', 'სიტყვების დეტექტივი'],
    ['Grammar Master', 'გრამატიკის ოსტატი'],
    ['Final Boss I', 'დიდი ფინალური გამოწვევა'],
    ['Final Boss II', 'ფინალური სუპერ მისია'],
    ['GRADE 4 CHAMPION', 'საბოლოო ჩემპიონატის მისია']
  ];

  /* =========================================================
     WORD BANK
     ========================================================= */

  const WORD_BANK = [
    ['school', 'სკოლა', '🏫'],
    ['teacher', 'მასწავლებელი', '👩‍🏫'],
    ['student', 'მოსწავლე', '🧑‍🎓'],
    ['book', 'წიგნი', '📘'],
    ['lesson', 'გაკვეთილი', '📚'],
    ['question', 'კითხვა', '❓'],
    ['answer', 'პასუხი', '💬'],
    ['friend', 'მეგობარი', '🤝'],
    ['family', 'ოჯახი', '👨‍👩‍👧'],
    ['house', 'სახლი', '🏠'],
    ['room', 'ოთახი', '🚪'],
    ['city', 'ქალაქი', '🏙️'],
    ['street', 'ქუჩა', '🛣️'],
    ['travel', 'მოგზაურობა', '✈️'],
    ['station', 'სადგური', '🚉'],
    ['museum', 'მუზეუმი', '🏛️'],
    ['weather', 'ამინდი', '🌤️'],
    ['summer', 'ზაფხული', '☀️'],
    ['winter', 'ზამთარი', '❄️'],
    ['rain', 'წვიმა', '🌧️'],
    ['sunny', 'მზიანი', '☀️'],
    ['robot', 'რობოტი', '🤖'],
    ['future', 'მომავალი', '🚀'],
    ['planet', 'პლანეტა', '🪐'],
    ['science', 'მეცნიერება', '🔬'],
    ['energy', 'ენერგია', '🔋'],
    ['happy', 'ბედნიერი', '😊'],
    ['careful', 'ფრთხილი', '🛡️'],
    ['quick', 'სწრაფი', '⚡'],
    ['slow', 'ნელი', '🐢'],
    ['read', 'კითხვა', '📖'],
    ['write', 'წერა', '✍️'],
    ['speak', 'საუბარი', '🗣️'],
    ['listen', 'მოსმენა', '🎧'],
    ['learn', 'სწავლა', '🧠'],
    ['play', 'თამაში', '🎮'],
    ['walk', 'სიარული', '🚶'],
    ['run', 'სირბილი', '🏃'],
    ['eat', 'ჭამა', '🍎'],
    ['drink', 'სმა', '🥤'],
    ['help', 'დახმარება', '🤝'],
    ['discover', 'აღმოჩენა', '🔎'],
    ['build', 'აშენება', '🧱'],
    ['solve', 'ამოხსნა', '🧩'],
    ['correct', 'სწორი', '✅'],
    ['choice', 'არჩევანი', '🎯'],
    ['rule', 'წესი', '📏'],
    ['champion', 'ჩემპიონი', '🏆'],
    ['confidence', 'თავდაჯერება', '💪'],
    ['improve', 'გაუმჯობესება', '📈'],
    ['achieve', 'მიღწევა', '🎯']
  ];

  /* =========================================================
     HELPERS
     ========================================================= */

  function makeWords(index) {
    const words = [];

    for (let i = 0; i < 15; i++) {
      const item = WORD_BANK[(index * 7 + i) % WORD_BANK.length];

      words.push({
        id: 'g4-l' + index + '-w' + (i + 1),
        word: item[0],
        translation: item[1],
        emoji: item[2],
        sort_order: i + 1
      });
    }

    return words;
  }

  function makeQuestions(index, title, topic) {
    const n = index + 1;

    return [
      {
        id: 'g4-l' + n + '-q1',
        question: 'Choose the correct answer for "' + title + '".',
        options: [
          'The correct English answer',
          'A different answer',
          'Not related',
          'I do not know'
        ],
        correct_answer: 'The correct English answer'
      },
      {
        id: 'g4-l' + n + '-q2',
        question: 'Which skill are we practicing in this lesson?',
        options: [
          topic,
          'Only numbers',
          'Only drawing',
          'Nothing'
        ],
        correct_answer: topic
      }
    ];
  }

  function baseLesson(number, title, topic) {
    const worldIndex = Math.floor((number - 1) / 10);

    const readingText =
      'In Grade 4 we practice ' +
      title +
      '. ' +
      'We learn new English words, read sentences, listen carefully and speak with confidence.';

    return {
      id: 'grade4-local-' + String(number).padStart(2, '0'),
      grade: 4,
      lesson_number: number,
      title,
      topic,
      description:
        'Grade 4 Future Mode lesson focused on ' +
        title +
        '.',

      grammar_rule:
        worldIndex <= 1
          ? 'Read the examples, notice the grammar pattern, and use it in your own sentence.'
          : '',

      grammar_examples:
        worldIndex <= 1
          ? [
              'Read the model sentence carefully.',
              'Change the sentence into a question when possible.',
              'Make one new sentence of your own.'
            ]
          : [],

      listening_text:
        'Listen and repeat: ' +
        readingText,

      speaking_phrases: [
        'Tell your partner about ' + topic + '.',
        'Ask one English question and answer it.',
        'Say one complete sentence using today’s vocabulary.'
      ],

      reading_text: readingText,

      exercises: [
        'Read the example aloud.',
        'Write one sentence using a new word.',
        'Complete the challenge without looking at the answer.'
      ],

      words: makeWords(number - 1),

      quizzes: makeQuestions(number - 1, title, topic),

      world_index: worldIndex
    };
  }

  /* =========================================================
     BUILD EXACTLY 60 LOCAL LESSONS
     ========================================================= */

  function buildLocal60() {
    const result = [];

    for (let i = 0; i < 60; i++) {
      const item = lessonBlueprint[i];

      result.push(
        baseLesson(
          i + 1,
          item[0],
          item[1]
        )
      );
    }

    return result;
  }

  /* =========================================================
     MERGE EXISTING LOCAL CONTENT
     ========================================================= */

  function mergeExistingContent(localLessons) {
    const existing =
      window.GRADE4_FUTURISTIC_CONTENT &&
      Array.isArray(window.GRADE4_FUTURISTIC_CONTENT.lessons)
        ? window.GRADE4_FUTURISTIC_CONTENT.lessons
        : [];

    const byNumber = new Map();

    existing.forEach((lesson) => {
      if (!lesson) return;

      const number = Number(lesson.lesson_number);

      if (number >= 1 && number <= 60) {
        byNumber.set(number, {
          ...lesson
        });
      }
    });

    return localLessons.map((lesson) => {
      const old = byNumber.get(lesson.lesson_number);

      if (!old) return lesson;

      return {
        ...lesson,
        ...old,

        id:
          old.id ||
          lesson.id,

        lesson_number:
          lesson.lesson_number,

        words:
          arr(old.words).length >= 4
            ? old.words
            : lesson.words,

        quizzes:
          arr(old.quizzes).length
            ? old.quizzes
            : lesson.quizzes,

        grammar_examples:
          arr(old.grammar_examples).length
            ? old.grammar_examples
            : lesson.grammar_examples,

        speaking_phrases:
          arr(old.speaking_phrases).length
            ? old.speaking_phrases
            : lesson.speaking_phrases,

        exercises:
          arr(old.exercises).length
            ? old.exercises
            : lesson.exercises
      };
    });
  }

  /* =========================================================
     FORCE EXACT 60
     ========================================================= */

  function normalize60(source) {
    const local60 = mergeExistingContent(buildLocal60());

    const sourceArray =
      arr(source)
        .filter(Boolean)
        .sort(
          (a, b) =>
            Number(a.lesson_number || 0) -
            Number(b.lesson_number || 0)
        );

    const byNumber = new Map();

    sourceArray.forEach((lesson) => {
      const n = Number(lesson.lesson_number);

      if (n >= 1 && n <= 60) {
        byNumber.set(n, lesson);
      }
    });

    const finalLessons = [];

    for (let i = 1; i <= 60; i++) {
      const localLesson = local60[i - 1];
      const remoteLesson = byNumber.get(i);

      const lesson = remoteLesson
        ? {
            ...localLesson,
            ...remoteLesson,
            lesson_number: i,

            words:
              arr(remoteLesson.words).length
                ? remoteLesson.words
                : localLesson.words,

            quizzes:
              arr(remoteLesson.quizzes).length
                ? remoteLesson.quizzes
                : localLesson.quizzes
          }
        : localLesson;

      lesson.id =
        lesson.id ||
        'grade4-local-' +
          String(i).padStart(2, '0');

      lesson.world_index = Math.floor((i - 1) / 10);

      if (!arr(lesson.words).length) {
        lesson.words = makeWords(i - 1);
      }

      if (!arr(lesson.quizzes).length) {
        lesson.quizzes = makeQuestions(
          i - 1,
          lesson.title,
          lesson.topic
        );
      }

      finalLessons.push(lesson);
    }

    return finalLessons;
  }

  /* =========================================================
     SAVE / STATS
     ========================================================= */

  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );
    } catch (e) {}

    updateStats();
  }

  function updateStats() {
    const total = 60;

    const progress =
      Math.min(
        100,
        Math.round(
          (state.done.length / total) * 100
        )
      );

    const xp = document.querySelector('#xp');
    const stars = document.querySelector('#stars');
    const streak = document.querySelector('#streak');
    const done = document.querySelector('#done');
    const bar = document.querySelector('#progressBar');
    const txt = document.querySelector('#progressText');
    const next = document.querySelector('#nextMission');
    const live = document.querySelector('#liveStats');

    if (xp) xp.textContent = state.xp;
    if (stars) stars.textContent = state.stars;
    if (streak) streak.textContent = state.streak;
    if (done) done.textContent = state.done.length;

    if (bar) {
      bar.style.width = progress + '%';
    }

    if (txt) {
      txt.textContent =
        state.done.length +
        '/60 • ' +
        progress +
        '%';
    }

    const nextLesson =
      lessons.find(
        (lesson) =>
          !state.done.includes(lesson.id)
      );

    if (next) {
      next.textContent = nextLesson
        ? 'Next mission: L' +
          nextLesson.lesson_number +
          ' • ' +
          nextLesson.title
        : '🎉 Universe complete — Champion status unlocked';
    }

    if (live) {
      const wordCount = lessons.reduce(
        (total, lesson) =>
          total + arr(lesson.words).length,
        0
      );

      const quizCount = lessons.reduce(
        (total, lesson) =>
          total + arr(lesson.quizzes).length,
        0
      );

      live.textContent =
        '⚡ 60 LESSONS • ' +
        wordCount +
        ' WORDS • ' +
        quizCount +
        ' QUIZ QUESTIONS • ' +
        state.done.length +
        ' COMPLETED';
    }
  }

  /* =========================================================
     SPEECH
     ========================================================= */

  function speak(text) {
    if (
      !('speechSynthesis' in window) ||
      !text
    ) {
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(
          String(text)
        );

      utterance.lang = 'en-US';
      utterance.rate = 0.82;

      window.speechSynthesis.speak(
        utterance
      );
    } catch (e) {}
  }

  /* =========================================================
     WORLD POSITION
     ========================================================= */

  function worldIndex(lesson) {
    const number =
      Number(lesson.lesson_number) || 1;

    return Math.min(
      5,
      Math.max(
        0,
        Math.floor((number - 1) / 10)
      )
    );
  }

  /* =========================================================
     RENDER WORLDS
     ========================================================= */

  function render() {
    const root =
      document.querySelector('#missions');

    if (!root) return;

    root.innerHTML = worlds
      .map((world, index) => {
        const group = lessons.filter(
          (lesson) =>
            worldIndex(lesson) === index
        );

        const completed =
          group.filter((lesson) =>
            state.done.includes(
              lesson.id
            )
          ).length;

        const words =
          group.reduce(
            (n, lesson) =>
              n +
              arr(lesson.words).length,
            0
          );

        const quizzes =
          group.reduce(
            (n, lesson) =>
              n +
              arr(lesson.quizzes).length,
            0
          );

        return `
          <article
            class="mission u-holo ${
              completed === group.length
                ? 'done'
                : ''
            }"
            data-world="${index}"
            tabindex="0"
          >
            <span class="num">
              WORLD ${esc(world.id)}
              •
              ${completed}/${group.length}
              COMPLETE
            </span>

            <span class="icon">
              ${world.icon}
            </span>

            <h3>
              ${esc(world.title)}
            </h3>

            <span class="g4-ka">
              ${esc(world.ka)}
            </span>

            <p>
              Grade 4 Future Mode training:
              grammar, vocabulary, reading,
              listening, speaking and brain
              challenges.
            </p>

            <div class="g4-vocab-preview">
              ${group.length}
              lessons
              •
              ${words}
              words
              •
              ${quizzes}
              quiz questions
              •
              🧩 brain missions
            </div>

            <button
              class="g4-open"
              type="button"
            >
              OPEN WORLD →
            </button>
          </article>
        `;
      })
      .join('');

    root
      .querySelectorAll('.mission')
      .forEach((card) => {
        const open = () =>
          openWorld(
            Number(card.dataset.world)
          );

        card.addEventListener(
          'click',
          open
        );

        card.addEventListener(
          'keydown',
          (event) => {
            if (
              event.key === 'Enter' ||
              event.key === ' '
            ) {
              event.preventDefault();
              open();
            }
          }
        );
      });
  }

  /* =========================================================
     LESSON HTML
     ========================================================= */

  function lessonMarkup(lesson) {
    const words = arr(lesson.words);
    const quizzes = arr(lesson.quizzes);
    const exercises = arr(
      lesson.exercises
    );

    const phrases = arr(
      lesson.speaking_phrases
    );

    const grammarExamples = arr(
      lesson.grammar_examples
    );

    const completed =
      state.done.includes(lesson.id);

    const passed =
      !!state.quizPassed[lesson.id];

    const canComplete =
      !quizzes.length || passed;

    return `
      <section
        class="g4-live-lesson"
        data-lesson-id="${esc(
          lesson.id
        )}"
      >

        <div class="g4-live-lesson-head">

          <span class="num">
            LESSON
            ${esc(
              lesson.lesson_number
            )}
            •
            ${
              completed
                ? 'COMPLETED'
                : 'READY'
            }
          </span>

          <h3>
            ${esc(lesson.title)}
          </h3>

          <p>
            ${esc(lesson.topic)}
          </p>

        </div>

        ${
          lesson.grammar_rule
            ? `
              <div class="g4-content-box">
                <b>
                  🧠 GRAMMAR CORE
                </b>

                <p>
                  ${esc(
                    lesson.grammar_rule
                  )}
                </p>

                ${
                  grammarExamples.length
                    ? `
                      <ul>
                        ${grammarExamples
                          .map(
                            (example) =>
                              `<li>${esc(
                                example
                              )}</li>`
                          )
                          .join('')}
                      </ul>
                    `
                    : ''
                }

              </div>
            `
            : ''
        }

        ${
          lesson.reading_text
            ? `
              <div class="g4-content-box">

                <b>
                  📖 READING SCAN
                </b>

                <p>
                  ${esc(
                    lesson.reading_text
                  )}
                </p>

              </div>
            `
            : ''
        }

        ${
          lesson.listening_text
            ? `
              <div class="g4-content-box">

                <b>
                  🎧 LISTENING LAB
                </b>

                <p>
                  ${esc(
                    lesson.listening_text
                  )}
                </p>

                <button
                  class="g4-speak-text"
                  type="button"
                  data-text="${esc(
                    lesson.listening_text
                  )}"
                >
                  🔊 LISTEN & REPEAT
                </button>

              </div>
            `
            : ''
        }

        ${
          phrases.length
            ? `
              <div class="g4-content-box">

                <b>
                  🗣️ SPEAKING LAB
                </b>

                <ul>
                  ${phrases
                    .map(
                      (phrase) =>
                        `<li>${esc(
                          phrase
                        )}</li>`
                    )
                    .join('')}
                </ul>

              </div>
            `
            : ''
        }

        ${
          exercises.length
            ? `
              <div class="g4-content-box">

                <b>
                  ✍️ PRACTICE DECK
                </b>

                <ul>
                  ${exercises
                    .map(
                      (exercise) =>
                        `<li>${esc(
                          exercise
                        )}</li>`
                    )
                    .join('')}
                </ul>

              </div>
            `
            : ''
        }

        ${
          words.length
            ? `
              <div
                class="g4-live-words"
              >

                <b>
                  🔤 VOCABULARY VAULT •
                  ${words.length}
                  WORDS
                </b>

                ${words
                  .map(
                    (word) => `
                      <div
                        class="g4-word"
                      >

                        <div>

                          <strong>
                            ${esc(
                              word.word
                            )}
                          </strong>

                          <span>
                            ${esc(
                              word.translation
                            )}
                            ${esc(
                              word.emoji ||
                                ''
                            )}
                          </span>

                        </div>

                        <button
                          type="button"
                          data-speak="${esc(
                            word.word
                          )}"
                        >
                          🔊
                        </button>

                      </div>
                    `
                  )
                  .join('')}

              </div>
            `
            : ''
        }

        ${
          quizzes.length
            ? `
              <details
                class="g4-quiz"
                open
              >

                <summary>
                  🎯 QUIZ ARENA •
                  ${quizzes.length}
                  QUESTIONS
                </summary>

                ${quizzes
                  .map(
                    (quiz, index) => `
                      <div
                        class="quiz-q"
                        data-correct="${esc(
                          quiz.correct_answer
                        )}"
                      >

                        <b>
                          ${index + 1}.
                          ${esc(
                            quiz.question
                          )}
                        </b>

                        <div
                          class="quiz-options"
                        >

                          ${arr(
                            quiz.options
                          )
                            .map(
                              (option) => `
                                <button
                                  type="button"
                                  class="g4-option"
                                  data-option="${esc(
                                    option
                                  )}"
                                >
                                  ${esc(
                                    option
                                  )}
                                </button>
                              `
                            )
                            .join('')}

                        </div>

                      </div>
                    `
                  )
                  .join('')}

              </details>
            `
            : ''
        }

        <button
          class="g4-complete"
          type="button"
          data-complete="${esc(
            lesson.id
          )}"
          ${
            completed ||
            !canComplete
              ? 'disabled'
              : ''
          }
        >
          ${
            completed
              ? '✓ COMPLETED • XP EARNED'
              : canComplete
              ? '✓ COMPLETE LESSON • +25 XP'
              : '🔒 PASS QUIZ ≥70% TO COMPLETE'
          }
        </button>

      </section>
    `;
  }

  /* =========================================================
     OPEN WORLD
     ========================================================= */

  function openWorld(index) {
    const group = lessons.filter(
      (lesson) =>
        worldIndex(lesson) === index
    );

    const world = worlds[index];

    if (!world) return;

    const modal =
      document.createElement('div');

    modal.className =
      'g4-vocab-modal';

    modal.innerHTML = `
      <div
        class="g4-vocab-dialog g4-live-dialog"
        role="dialog"
        aria-modal="true"
      >

        <button
          class="g4-close"
          type="button"
          aria-label="Close"
        >
          ×
        </button>

        <div class="g4-modal-icon">
          ${world.icon}
        </div>

        <span class="num">
          WORLD ${esc(world.id)}
          •
          ${group.length}
          MISSIONS
        </span>

        <h2>
          ${esc(world.title)}
        </h2>

        <p>
          ${esc(world.ka)}
          —
          one learning focus at a time.
        </p>

        <div>
          ${group
            .map(lessonMarkup)
            .join('')}
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    const close = () =>
      modal.remove();

    const closeButton =
      modal.querySelector(
        '.g4-close'
      );

    if (closeButton) {
      closeButton.onclick = close;
    }

    modal.addEventListener(
      'click',
      (event) => {
        if (event.target === modal) {
          close();
          return;
        }

        const speakButton =
          event.target.closest(
            '[data-speak]'
          );

        if (speakButton) {
          speak(
            speakButton.dataset.speak
          );
          return;
        }

        const textButton =
          event.target.closest(
            '[data-text]'
          );

        if (textButton) {
          speak(
            textButton.dataset.text
          );
          return;
        }

        const option =
          event.target.closest(
            '[data-option]'
          );

        if (option) {
          answerQuiz(option);
          return;
        }

        const completeButton =
          event.target.closest(
            '[data-complete]'
          );

        if (completeButton) {
          completeLesson(
            completeButton.dataset
              .complete,
            modal
          );
        }
      }
    );

    requestAnimationFrame(() => {
      modal.classList.add('show');
    });

    if (closeButton) {
      closeButton.focus();
    }
  }

  /* =========================================================
     QUIZ
     ========================================================= */

  function refreshQuizPass(
    lessonElement
  ) {
    if (!lessonElement) return;

    const completeButton =
      lessonElement.querySelector(
        '[data-complete]'
      );

    if (!completeButton) return;

    const lessonId =
      completeButton.dataset
        .complete;

    const questions =
      Array.from(
        lessonElement.querySelectorAll(
          '.quiz-q'
        )
      );

    if (!questions.length) {
      return;
    }

    const answered =
      questions.every(
        (question) =>
          question.querySelector(
            '.quiz-correct'
          )
      );

    if (!answered) return;

    const correct =
      questions.filter(
        (question) =>
          !question.querySelector(
            '.quiz-wrong'
          )
      ).length;

    const passed =
      correct /
        questions.length >=
      0.7;

    if (
      passed &&
      !state.quizPassed[lessonId]
    ) {
      state.quizPassed[lessonId] =
        true;

      state.quizRewards[lessonId] =
        true;

      save();
    }

    if (
      !state.done.includes(
        lessonId
      )
    ) {
      completeButton.disabled =
        !passed;

      completeButton.textContent =
        passed
          ? '✓ COMPLETE LESSON • +25 XP'
          : '🔒 PASS QUIZ ≥70% TO COMPLETE';
    }
  }

  function answerQuiz(button) {
    const question =
      button.closest(
        '.quiz-q'
      );

    if (!question) return;

    const selected =
      button.dataset.option;

    const correct =
      question.dataset.correct;

    const isCorrect =
      selected === correct;

    question
      .querySelectorAll(
        '.g4-option'
      )
      .forEach((option) => {
        option.disabled = true;

        if (
          option.dataset.option ===
          correct
        ) {
          option.classList.add(
            'quiz-correct'
          );
        }
      });

    button.classList.add(
      isCorrect
        ? 'quiz-correct'
        : 'quiz-wrong'
    );

    refreshQuizPass(
      question.closest(
        '.g4-live-lesson'
      )
    );
  }

  /* =========================================================
     SUPABASE ACTIVITY
     ========================================================= */

  async function recordActivity(
    id,
    score
  ) {
    if (!client) return;

    try {
      if (
        typeof client.rpc !==
        'function'
      ) {
        return;
      }

      await client.rpc(
        'academy_record_activity',
        {
          p_activity_type: 'lesson',
          p_activity_id:
            'grade4-lesson-' + id,
          p_grade: 4,
          p_score: score,
          p_points: score
        }
      );
    } catch (error) {
      console.warn(
        '[G4] academy activity unavailable',
        error
      );
    }
  }

  /* =========================================================
     COMPLETE LESSON
     ========================================================= */

  async function completeLesson(
    id,
    modal
  ) {
    if (state.done.includes(id)) {
      return;
    }

    const selector =
      '[data-complete="' +
      CSS.escape(id) +
      '"]';

    const button =
      modal.querySelector(
        selector
      );

    if (!button) return;

    const lessonElement =
      button.closest(
        '.g4-live-lesson'
      );

    if (!lessonElement) return;

    const questions =
      Array.from(
        lessonElement.querySelectorAll(
          '.quiz-q'
        )
      );

    if (
      questions.length &&
      !state.quizPassed[id]
    ) {
      return;
    }

    let score = 100;

    if (questions.length) {
      const correct =
        questions.filter(
          (question) =>
            !question.querySelector(
              '.quiz-wrong'
            )
        ).length;

      score = Math.round(
        (correct /
          questions.length) *
          100
      );
    }

    await recordActivity(
      id,
      score
    );

    state.done.push(id);

    state.xp += 25;
    state.stars += 1;
    state.streak =
      Math.max(
        1,
        state.streak + 1
      );

    state.last =
      Date.now();

    save();

    button.textContent =
      '✓ COMPLETED • SAVED TO ACADEMY';

    button.disabled = true;

    render();
    updateStats();
  }

  /* =========================================================
     SUPABASE LOAD
     ========================================================= */

  async function tryLoadRemote() {
    if (
      !client ||
      typeof client.from !==
        'function'
    ) {
      return [];
    }

    try {
      const response =
        await client
          .from('lessons')
          .select(
            [
              'id',
              'grade',
              'lesson_number',
              'title',
              'topic',
              'description',
              'grammar_rule',
              'grammar_examples',
              'listening_text',
              'speaking_phrases',
              'reading_text',
              'exercises'
            ].join(',')
          )
          .eq('grade', 4)
          .order(
            'lesson_number',
            {
              ascending: true
            }
          );

      if (
        response.error ||
        !arr(response.data)
          .length
      ) {
        return [];
      }

      let remoteLessons =
        response.data;

      const ids =
        remoteLessons
          .map((lesson) => lesson.id)
          .filter(Boolean);

      if (!ids.length) {
        return remoteLessons;
      }

      let words = [];
      let quizzes = [];

      try {
        const result =
          await client
            .from('lesson_words')
            .select(
              'id,lesson_id,word,translation,emoji,sort_order'
            )
            .in(
              'lesson_id',
              ids
            )
            .order(
              'sort_order',
              {
                ascending: true
              }
            );

        if (
          !result.error &&
          arr(result.data).length
        ) {
          words = result.data;
        }
      } catch (e) {}

      try {
        const result =
          await client
            .from('lesson_quizzes')
            .select(
              'id,lesson_id,question,options,correct_answer,sort_order'
            )
            .in(
              'lesson_id',
              ids
            )
            .order(
              'sort_order',
              {
                ascending: true
              }
            );

        if (
          !result.error &&
          arr(result.data).length
        ) {
          quizzes = result.data;
        }
      } catch (e) {}

      const wordMap =
        new Map();

      words.forEach((word) => {
        if (
          !wordMap.has(
            word.lesson_id
          )
        ) {
          wordMap.set(
            word.lesson_id,
            []
          );
        }

        wordMap
          .get(word.lesson_id)
          .push(word);
      });

      const quizMap =
        new Map();

      quizzes.forEach((quiz) => {
        if (
          !quizMap.has(
            quiz.lesson_id
          )
        ) {
          quizMap.set(
            quiz.lesson_id,
            []
          );
        }

        quizMap
          .get(quiz.lesson_id)
          .push(quiz);
      });

      remoteLessons =
        remoteLessons.map(
          (lesson) => ({
            ...lesson,
            words:
              wordMap.get(
                lesson.id
              ) || [],
            quizzes:
              quizMap.get(
                lesson.id
              ) || []
          })
        );

      return remoteLessons;
    } catch (error) {
      console.warn(
        '[G4] Remote curriculum unavailable; using local 60.',
        error
      );

      return [];
    }
  }

  /* =========================================================
     LOAD
     ========================================================= */

  async function load() {
    const local60 =
      buildLocal60();

    let remote = [];

    try {
      remote =
        await tryLoadRemote();
    } catch (e) {
      remote = [];
    }

    if (remote.length) {
      lessons =
        normalize60(remote);
    } else {
      lessons =
        normalize60(local60);
    }

    /* Safety: NEVER allow less than 60 */
    if (
      !Array.isArray(lessons) ||
      lessons.length !== 60
    ) {
      lessons =
        normalize60([]);
    }

    /* Final hard normalization */
    lessons =
      lessons
        .slice(0, 60)
        .map(
          (lesson, index) => ({
            ...lesson,

            lesson_number:
              index + 1,

            world_index:
              Math.floor(
                index / 10
              ),

            id:
              lesson.id ||
              'grade4-local-' +
                String(
                  index + 1
                ).padStart(
                  2,
                  '0'
                ),

            words:
              arr(
                lesson.words
              ).length
                ? lesson.words
                : makeWords(index),

            quizzes:
              arr(
                lesson.quizzes
              ).length
                ? lesson.quizzes
                : makeQuestions(
                    index,
                    lesson.title,
                    lesson.topic
                  )
          })
        );

    /* Prevent stale invalid local IDs from breaking progress */
    state.done =
      state.done.filter((id) =>
        lessons.some(
          (lesson) =>
            lesson.id === id
        )
      );

    render();
    updateStats();

    console.log(
      '%c[G4] READY — 60 MISSIONS',
      'color:#00f7ff;font-weight:900;font-size:16px'
    );

    console.log(
      '[G4] Lessons:',
      lessons.length
    );

    console.log(
      '[G4] Worlds:',
      worlds.length
    );
  }

  /* =========================================================
     BOOT
     ========================================================= */

  function boot() {
    try {
      updateStats();
      load();
    } catch (error) {
      console.error(
        '[G4] Boot error:',
        error
      );

      /* Last-resort emergency local mode */
      lessons =
        normalize60([]);

      render();
      updateStats();
    }
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {
        once: true
      }
    );
  } else {
    boot();
  }
})();
