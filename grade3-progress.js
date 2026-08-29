/* =========================================================
   ENGLISH WITH MARIAMI — GRADE 3 PROGRESS
   MY PROGRESS + SAFE SUPABASE SYNC
   ========================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------
     STORAGE KEYS
  --------------------------------------------------------- */

  const KEY = 'grade3LearnedWords';
  const QUIZ_KEY = 'grade3QuizAttempts';
  const BEST_KEY = 'grade3BestScore';


  /* ---------------------------------------------------------
     LOCAL STORAGE
  --------------------------------------------------------- */

  function getLearned() {
    try {
      const data = JSON.parse(
        localStorage.getItem(KEY) || '[]'
      );

      return new Set(
        Array.isArray(data) ? data : []
      );

    } catch (_) {
      return new Set();
    }
  }


  function saveLearned(set) {
    localStorage.setItem(
      KEY,
      JSON.stringify([...set])
    );
  }


  function getQuizAttempts() {
    const value = Number(
      localStorage.getItem(QUIZ_KEY) || 0
    );

    return Math.max(
      0,
      Number.isFinite(value) ? value : 0
    );
  }


  function getBestQuiz() {

    const value = Number(
      localStorage.getItem(BEST_KEY) || 0
    );

    return Math.max(
      0,
      Math.min(
        10,
        Number.isFinite(value) ? value : 0
      )
    );
  }


  /* ---------------------------------------------------------
     SUPABASE CLIENT
  --------------------------------------------------------- */

  function supabaseClient() {

    return (
      window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
      window.supabaseClient ||
      null
    );

  }


  /* ---------------------------------------------------------
     SUPABASE ACTIVITY SYNC
  --------------------------------------------------------- */

  async function syncActivity(
    type,
    id,
    score,
    maxScore,
    points
  ) {

    const client = supabaseClient();

    if (!client) return;

    try {

      const {
        data: {
          user
        }
      } = await client.auth.getUser();


      if (!user) return;


      const {
        data: profile
      } = await client
        .from('profiles')
        .select('role,grade')
        .eq('user_id', user.id)
        .maybeSingle();


      /*
        Only Grade 3 students are allowed
        to write Grade 3 progress.
      */

      if (
        String(profile?.role || '').toLowerCase() !== 'student' ||
        Number(profile?.grade) !== 3
      ) {
        return;
      }


      await client.rpc(
        'academy_record_activity',
        {
          p_grade: 3,

          p_activity_type:
            String(type || ''),

          p_activity_id:
            String(id || ''),

          p_score:
            Math.max(
              0,
              Math.min(
                Number(maxScore) || 0,
                Number(score) || 0
              )
            ),

          p_max_score:
            Math.max(
              1,
              Number(maxScore) || 1
            ),

          p_points:
            Math.max(
              0,
              Math.min(
                50,
                Number(points) || 0
              )
            )
        }
      );

    } catch (error) {

      /*
        Supabase errors should NEVER break
        the student's local progress.
      */

      console.warn(
        'Grade 3 progress sync skipped:',
        error
      );

    }

  }


  /* ---------------------------------------------------------
     WORD SYNC
  --------------------------------------------------------- */

  function syncLearnedWord(word) {

    const safe =
      String(word || '').trim();

    if (!safe) return;


    syncActivity(
      'word',
      'grade3-word-' +
        encodeURIComponent(safe),
      1,
      1,
      0
    );

  }


  /* ---------------------------------------------------------
     QUIZ SCORE
  --------------------------------------------------------- */

  function readQuizScore() {

    /*
      Different Grade 3 quiz implementations may
      store the score in different elements.
    */

    const possibleIds = [
      'quizScore',
      'score',
      'quizResult'
    ];


    for (const id of possibleIds) {

      const el =
        document.getElementById(id);

      if (!el) continue;


      const text =
        String(el.textContent || '');


      const match =
        text.match(/\d+(?:\.\d+)?/);


      if (match) {

        const value =
          Number(match[0]);


        if (
          Number.isFinite(value) &&
          value >= 0 &&
          value <= 10
        ) {

          return value;

        }

      }

    }


    return getBestQuiz();

  }


  /* ---------------------------------------------------------
     QUIZ SYNC
  --------------------------------------------------------- */

  function syncQuiz(score) {

    const safeScore =
      Math.max(
        0,
        Math.min(
          10,
          Number(score) || 0
        )
      );


    const attemptId =
      'grade3-quiz-' +
      Date.now() +
      '-' +
      Math.random()
        .toString(36)
        .slice(2, 8);


    syncActivity(
      'quiz',
      attemptId,
      safeScore,
      10,
      Math.min(
        50,
        safeScore * 5
      )
    );

  }


  /* ---------------------------------------------------------
     PROGRESS PANEL
  --------------------------------------------------------- */

  function ensurePanel() {

    let panel =
      document.getElementById(
        'grade3WorkingProgress'
      );


    if (panel) return panel;


    panel =
      document.createElement('section');


    panel.id =
      'grade3WorkingProgress';


    /*
      Works with both .section and .card layouts.
    */

    panel.className = 'section';


    panel.innerHTML = `

      <div class="section-title">

        <h2>🏆 MY PROGRESS</h2>

        <span>CLASS 3</span>

      </div>


      <p
        style="
          color:#b7d9e8;
          margin-bottom:20px;
        "
      >
        აქ გამოჩნდება შენი სწავლის შედეგები.
      </p>


      <div class="grade3-progress-grid">

        <div class="grade3-progress-card">

          <div class="grade3-progress-icon">
            📚
          </div>

          <div
            class="grade3-progress-number"
            id="grade3LearnedCount"
          >
            0
          </div>

          <div>
            ნასწავლი სიტყვა
          </div>

        </div>


        <div class="grade3-progress-card">

          <div class="grade3-progress-icon">
            📝
          </div>

          <div
            class="grade3-progress-number"
            id="grade3QuizCount"
          >
            0/10
          </div>

          <div>
            Quiz
          </div>

        </div>


        <div class="grade3-progress-card">

          <div class="grade3-progress-icon">
            📈
          </div>

          <div
            class="grade3-progress-number"
            id="grade3OverallProgress"
          >
            0%
          </div>

          <div>
            პროგრესი
          </div>


          <div class="grade3-mini-bar">

            <div
              id="grade3OverallFill"
            ></div>

          </div>

        </div>


        <div class="grade3-progress-card">

          <div class="grade3-progress-icon">
            ⭐
          </div>

          <div
            class="grade3-progress-number"
            id="grade3Level"
          >
            დამწყები
          </div>

          <div>
            დონე
          </div>

        </div>

      </div>


      <button
        class="btn btn-yellow"
        id="grade3ResetProgress"
        style="margin-top:20px"
        type="button"
      >
        🔄 პროგრესის თავიდან დაწყება
      </button>

    `;


    /* -------------------------------------------------------
       CSS
    ------------------------------------------------------- */

    const style =
      document.createElement('style');


    style.id =
      'grade3-progress-style';


    style.textContent = `

      #grade3WorkingProgress {
        margin-top: 30px;
      }


      #grade3WorkingProgress .section-title {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-bottom:10px;
      }


      #grade3WorkingProgress
      .section-title h2 {
        margin:0;
      }


      #grade3WorkingProgress
      .section-title span {
        padding:7px 11px;
        border-radius:10px;
        background:#061a32;
        border:1px solid #00eaff33;
        color:#ffe600;
        font-size:12px;
        font-weight:900;
      }


      .grade3-progress-grid {
        display:grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap:16px;
      }


      .grade3-progress-card {
        padding:22px 15px;
        border-radius:20px;

        background:
          linear-gradient(
            145deg,
            #09294e,
            #06162f
          );

        border:1px solid #00eaff33;

        text-align:center;

        box-shadow:
          0 12px 35px #0006;

        min-height:175px;

        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
      }


      .grade3-progress-icon {
        font-size:34px;
        margin-bottom:8px;
      }


      .grade3-progress-number {
        font-size:30px;
        font-weight:900;
        color:#00eaff;

        text-shadow:
          0 0 18px #00eaff55;

        margin-bottom:6px;
      }


      .grade3-mini-bar {
        width:100%;
        height:9px;

        background:#020c20;

        border-radius:20px;

        overflow:hidden;

        margin:
          14px 8px 0;
      }


      .grade3-mini-bar div {
        height:100%;
        width:0%;

        background:
          linear-gradient(
            90deg,
            #00eaff,
            #8200ff
          );

        transition:
          width .5s ease;
      }


      .grade3-learned-btn {
        margin-top:10px !important;

        font-size:12px !important;

        padding:
          8px 11px !important;
      }


      .grade3-learned-btn.learned {
        background:#5cff9a !important;
        color:#00151c !important;
      }


      .grade3-learned-btn:disabled {
        opacity:.85;
        cursor:default;
      }


      @media(max-width:800px) {

        .grade3-progress-grid {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

      }


      @media(max-width:500px) {

        .grade3-progress-grid {
          grid-template-columns:1fr;
        }


        .grade3-progress-card {
          min-height:145px;
        }


        #grade3WorkingProgress
        .section-title {
          flex-direction:column;
          align-items:flex-start;
        }

      }

    `;


    if (
      !document.getElementById(
        'grade3-progress-style'
      )
    ) {

      document.head.appendChild(style);

    }


    /* -------------------------------------------------------
       INSERT PANEL BEFORE FOOTER
    ------------------------------------------------------- */

    const footer =
      document.querySelector('footer');


    if (footer) {

      footer.parentNode.insertBefore(
        panel,
        footer
      );

    } else {

      const main =
        document.querySelector('main');


      if (main) {
        main.appendChild(panel);
      }

    }


    /* -------------------------------------------------------
       RESET
    ------------------------------------------------------- */

    const reset =
      document.getElementById(
        'grade3ResetProgress'
      );


    if (reset) {

      reset.addEventListener(
        'click',
        function () {

          const confirmed =
            window.confirm(
              'ნამდვილად გინდა პროგრესის თავიდან დაწყება?'
            );


          if (!confirmed) return;


          localStorage.removeItem(
            KEY
          );

          localStorage.removeItem(
            QUIZ_KEY
          );

          localStorage.removeItem(
            BEST_KEY
          );


          document
            .querySelectorAll(
              '.grade3-learned-btn'
            )
            .forEach(function (button) {

              button.classList.remove(
                'learned'
              );

              button.textContent =
                '✅ ვისწავლე';

            });


          update();

        }
      );

    }


    return panel;

  }


  /* ---------------------------------------------------------
     TOTAL WORDS
  --------------------------------------------------------- */

  function getTotalWords() {

    /*
      Preferred:
      Grade 3 page exposes an array.
    */

    if (
      Array.isArray(
        window.grade3WordsForProgress
      )
    ) {

      return (
        window.grade3WordsForProgress.length
      );

    }


    /*
      Try common Grade 3 data names.
    */

    const possibleArrays = [
      window.grade3Words,
      window.WORDS,
      window.words,
      window.vocabulary
    ];


    for (
      const array of possibleArrays
    ) {

      if (Array.isArray(array)) {
        return array.length;
      }

    }


    /*
      Last fallback:
      visible word cards.
    */

    const visible =
      document.querySelectorAll(
        '#words .word'
      );


    return visible.length;

  }


  /* ---------------------------------------------------------
     UPDATE PROGRESS
  --------------------------------------------------------- */

  function update() {

    const learned =
      getLearned();


    const total =
      getTotalWords();


    const learnedCount =
      learned.size;


    const percentage =
      total
        ? Math.min(
            100,
            Math.round(
              learnedCount /
              total *
              100
            )
          )
        : 0;


    const best =
      getBestQuiz();


    const learnedEl =
      document.getElementById(
        'grade3LearnedCount'
      );


    const quizEl =
      document.getElementById(
        'grade3QuizCount'
      );


    const progressEl =
      document.getElementById(
        'grade3OverallProgress'
      );


    const fill =
      document.getElementById(
        'grade3OverallFill'
      );


    const levelEl =
      document.getElementById(
        'grade3Level'
      );


    if (learnedEl) {

      learnedEl.textContent =
        learnedCount;

    }


    if (quizEl) {

      quizEl.textContent =
        best + '/10';

    }


    if (progressEl) {

      progressEl.textContent =
        percentage + '%';

    }


    if (fill) {

      fill.style.width =
        percentage + '%';

    }


    if (levelEl) {

      let level =
        'დამწყები';


      if (percentage >= 100) {

        level =
          '🏆 Master';

      } else if (
        percentage >= 75
      ) {

        level =
          '🚀 გმირი';

      } else if (
        percentage >= 50
      ) {

        level =
          '⭐ ვარსკვლავი';

      } else if (
        percentage >= 25
      ) {

        level =
          '🌟 Explorer';

      }


      levelEl.textContent =
        level;

    }

  }


  /* ---------------------------------------------------------
     ADD "I LEARNED" BUTTON
  --------------------------------------------------------- */

  function addLearnButtons() {

    const wordsBox =
      document.getElementById(
        'words'
      );


    if (!wordsBox) return;


    const learned =
      getLearned();


    wordsBox
      .querySelectorAll('.word')
      .forEach(function (card) {


        /*
          Don't add duplicate button.
        */

        if (
          card.querySelector(
            '.grade3-learned-btn'
          )
        ) {
          return;
        }


        /*
          Grade 3 cards normally use h3.
          Some versions may use strong.
        */

        const title =
          card.querySelector('h3') ||
          card.querySelector('strong');


        if (!title) return;


        const word =
          title.textContent.trim();


        if (!word) return;


        const button =
          document.createElement(
            'button'
          );


        button.type =
          'button';


        button.className =
          'btn btn-yellow grade3-learned-btn';


        if (
          learned.has(word)
        ) {

          button.classList.add(
            'learned'
          );

          button.textContent =
            '✓ ნასწავლია';

        } else {

          button.textContent =
            '✅ ვისწავლე';

        }


        button.addEventListener(
          'click',
          function () {

            const set =
              getLearned();


            if (
              set.has(word)
            ) {

              /*
                Allow removing the word
                from local progress.
              */

              set.delete(word);

            } else {

              set.add(word);

              /*
                Send the learning event
                to Supabase.
              */

              syncLearnedWord(
                word
              );

            }


            saveLearned(set);


            const isLearned =
              set.has(word);


            button.classList.toggle(
              'learned',
              isLearned
            );


            button.textContent =
              isLearned
                ? '✓ ნასწავლია'
                : '✅ ვისწავლე';


            update();

          }
        );


        card.appendChild(
          button
        );

      });

  }


  /* ---------------------------------------------------------
     WATCH VOCABULARY
  --------------------------------------------------------- */

  function watchWords() {

    const box =
      document.getElementById(
        'words'
      );


    if (!box) return;


    addLearnButtons();


    const observer =
      new MutationObserver(
        function () {

          addLearnButtons();

          update();

        }
      );


    observer.observe(
      box,
      {
        childList:true,
        subtree:true
      }
    );

  }


  /* ---------------------------------------------------------
     WATCH QUIZ
  --------------------------------------------------------- */

  function watchQuiz() {

    const quizBox =
      document.getElementById(
        'quizBox'
      );


    if (!quizBox) return;


    let counted =
      false;


    const observer =
      new MutationObserver(
        function () {

          /*
            Support several possible
            progress indicators.
          */

          const progress =
            document.getElementById(
              'quizProgress'
            );


          let finished =
            false;


          if (progress) {

            const width =
              String(
                progress.style.width ||
                ''
              );


            if (
              width === '100%' ||
              width === '100'
            ) {

              finished = true;

            }

          }


          /*
            Also support a finished
            quiz result element.
          */

          const result =
            document.getElementById(
              'quizResult'
            );


          if (
            result &&
            result.textContent.trim()
          ) {

            /*
              Only consider it finished
              if it contains score-like
              information.
            */

            if (
              /\d+\s*\/\s*10/.test(
                result.textContent
              ) ||
              /დასრულ/.test(
                result.textContent
              ) ||
              /finished/i.test(
                result.textContent
              )
            ) {

              finished = true;

            }

          }


          if (
            finished &&
            !counted
          ) {

            counted = true;


            const attempts =
              getQuizAttempts() + 1;


            localStorage.setItem(
              QUIZ_KEY,
              String(attempts)
            );


            const score =
              readQuizScore();


            const newBest =
              Math.max(
                getBestQuiz(),
                score
              );


            localStorage.setItem(
              BEST_KEY,
              String(newBest)
            );


            syncQuiz(
              score
            );


            update();

          }


          if (!finished) {

            counted = false;

          }

        }
      );


    observer.observe(
      quizBox,
      {
        childList:true,
        subtree:true,
        characterData:true,
        attributes:true,
        attributeFilter:[
          'style',
          'class'
        ]
      }
    );

  }


  /* ---------------------------------------------------------
     START
  --------------------------------------------------------- */

  function start() {

    /*
      This script should only run
      on grade3.html.
    */

    const path =
      location.pathname
        .toLowerCase();


    if (
      !path.endsWith(
        'grade3.html'
      )
    ) {

      return;

    }


    ensurePanel();


    addLearnButtons();


    watchWords();


    watchQuiz();


    update();


    /*
      Keep UI synchronized if another
      part of the page changes progress.
    */

    setInterval(
      update,
      1000
    );

  }


  /* ---------------------------------------------------------
     DOM READY
  --------------------------------------------------------- */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      start,
      {
        once:true
      }
    );

  } else {

    start();

  }

})();
