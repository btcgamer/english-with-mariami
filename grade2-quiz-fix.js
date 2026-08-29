/* English with Mariami — Grade 2 Quiz
   30 questions + safe Supabase progress sync
*/
(function(){
  'use strict';

  const QUESTIONS = [
    ['mother','დედა'],
    ['father','მამა'],
    ['sister','და'],
    ['brother','ძმა'],
    ['family','ოჯახი'],
    ['friend','მეგობარი'],
    ['school','სკოლა'],
    ['teacher','მასწავლებელი'],
    ['student','მოსწავლე'],
    ['book','წიგნი'],
    ['notebook','რვეული'],
    ['pen','კალამი'],
    ['pencil','ფანქარი'],
    ['bag','ჩანთა'],
    ['desk','მერხი'],
    ['red','წითელი'],
    ['blue','ლურჯი'],
    ['green','მწვანე'],
    ['yellow','ყვითელი'],
    ['pink','ვარდისფერი'],
    ['dog','ძაღლი'],
    ['cat','კატა'],
    ['bird','ჩიტი'],
    ['fish','თევზი'],
    ['horse','ცხენი'],
    ['apple','ვაშლი'],
    ['banana','ბანანი'],
    ['bread','პური'],
    ['milk','რძე'],
    ['water','წყალი']
  ];

  const TOTAL_QUESTIONS = 30;
  const POINTS_PER_CORRECT = 10;
  const MAX_POINTS = TOTAL_QUESTIONS * POINTS_PER_CORRECT;

  let currentQuestions = [];
  let answered = 0;
  let correctAnswers = 0;
  let earned = 0;

  const byId = id => document.getElementById(id);

  function shuffle(array){
    const result = array.slice();

    for(let i = result.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function escapeHtml(value){
    return String(value).replace(
      /[&<>"']/g,
      char => ({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
      }[char])
    );
  }

  function getClient(){
    return (
      window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
      window.supabaseClient ||
      null
    );
  }

  async function syncQuizResult(score){
    const client = getClient();

    if(!client) return;

    try{
      const {
        data: userData,
        error: userError
      } = await client.auth.getUser();

      if(userError || !userData?.user){
        return;
      }

      const user = userData.user;

      const {
        data: profile,
        error: profileError
      } = await client
        .from('profiles')
        .select('role,grade')
        .eq('user_id',user.id)
        .maybeSingle();

      if(profileError){
        console.warn(
          'Grade 2 profile check skipped:',
          profileError
        );
        return;
      }

      const role = String(
        profile?.role || ''
      ).trim().toLowerCase();

      const grade = Number(
        profile?.grade || 0
      );

      /*
       * Only a Grade 2 student may
       * record Grade 2 quiz progress.
       */
      if(
        role !== 'student' ||
        grade !== 2
      ){
        return;
      }

      const activityId =
        'grade2-quiz-' +
        Date.now() +
        '-' +
        Math.random()
          .toString(36)
          .slice(2,8);

      const safeScore = Math.max(
        0,
        Math.min(TOTAL_QUESTIONS, Number(score) || 0)
      );

      const safePoints = Math.max(
        0,
        Math.min(MAX_POINTS, safeScore * POINTS_PER_CORRECT)
      );

      const { error } = await client.rpc(
        'academy_record_activity',
        {
          p_grade: 2,
          p_activity_type: 'quiz',
          p_activity_id: activityId,
          p_score: safeScore,
          p_max_score: TOTAL_QUESTIONS,
          p_points: safePoints
        }
      );

      if(error){
        console.warn(
          'Grade 2 progress sync failed:',
          error
        );
      }

    }catch(error){
      /*
       * Quiz itself must continue working
       * even if Supabase progress sync fails.
       */
      console.warn(
        'Grade 2 progress sync skipped:',
        error
      );
    }
  }

  function updateLocalScore(points){
    try{
      const oldPoints = Number(
        localStorage.getItem('g2_points') || 0
      );

      const oldQuizPoints = Number(
        localStorage.getItem('g2_quiz_points') || 0
      );

      const newPoints = oldPoints + points;
      const newQuizPoints = oldQuizPoints + points;

      localStorage.setItem(
        'g2_points',
        String(newPoints)
      );

      localStorage.setItem(
        'g2_quiz_points',
        String(newQuizPoints)
      );

    }catch(error){
      console.warn(
        'Grade 2 local score update failed:',
        error
      );
    }

    const pointsElement = byId('points');
    const quizElement = byId('quizScore');

    if(pointsElement){
      try{
        pointsElement.textContent =
          localStorage.getItem('g2_points') || '0';
      }catch(error){
        pointsElement.textContent = '0';
      }
    }

    if(quizElement){
      try{
        quizElement.textContent =
          localStorage.getItem('g2_quiz_points') || '0';
      }catch(error){
        quizElement.textContent = '0';
      }
    }
  }

  function showQuizResult(){
    const result = byId('quizResult');

    if(!result) return;

    const percent = Math.round(
      (correctAnswers / TOTAL_QUESTIONS) * 100
    );

    syncQuizResult(correctAnswers);

    result.innerHTML = `
      <div class="quiz-result">
        <div>🎉 ქვიზი დასრულებულია!</div>

        <strong>
          ⭐ ${earned} / ${MAX_POINTS}
        </strong>

        <div style="margin-top:8px">
          სწორი პასუხები:
          ${correctAnswers} / ${TOTAL_QUESTIONS}
          • ${percent}%
        </div>

        <br>

        <button
          type="button"
          class="btn"
          id="grade2NewQuiz"
        >
          🔄 ახალი 30-კითხვიანი ქვიზი
        </button>
      </div>
    `;

    const newQuizButton = byId('grade2NewQuiz');

    if(newQuizButton){
      newQuizButton.addEventListener(
        'click',
        buildQuiz,
        {once:true}
      );
    }
  }

  function buildQuiz(){
    const box = byId('quizBox');
    const result = byId('quizResult');

    if(!box) return;

    currentQuestions = shuffle(
      QUESTIONS
    ).slice(0,TOTAL_QUESTIONS);

    answered = 0;
    correctAnswers = 0;
    earned = 0;

    if(result){
      result.innerHTML = '';
    }

    box.innerHTML = currentQuestions
      .map((question,index) => {

        const correctAnswer = question[1];

        const wrongAnswers = shuffle(
          QUESTIONS.filter(
            item => item[0] !== question[0]
          )
        ).slice(0,3);

        const options = shuffle([
          question,
          ...wrongAnswers
        ]);

        return `
          <div
            class="lesson quiz-question"
            data-index="${index}"
            data-answered="0"
          >
            <b>
              ${index + 1}.
              რას ნიშნავს
              <span style="color:#ffe600">
                “${escapeHtml(question[0])}”
              </span>?
            </b>

            <div class="quiz-options">
              ${options.map(option => `
                <button
                  type="button"
                  class="option"
                  data-answer="${escapeHtml(option[1])}"
                >
                  ${escapeHtml(option[1])}
                </button>
              `).join('')}
            </div>
          </div>
        `;
      })
      .join('');

    box
      .querySelectorAll('.quiz-question')
      .forEach(questionElement => {

        const buttons =
          questionElement.querySelectorAll('.option');

        buttons.forEach(button => {

          button.addEventListener(
            'click',
            function(){

              if(
                questionElement.dataset.answered === '1'
              ){
                return;
              }

              questionElement.dataset.answered = '1';
              answered++;

              const index = Number(
                questionElement.dataset.index
              );

              const correctAnswer =
                currentQuestions[index][1];

              const selectedAnswer =
                this.dataset.answer;

              /*
               * Disable all options
               * for this question.
               */
              buttons.forEach(
                button => {
                  button.disabled = true;
                }
              );

              if(selectedAnswer === correctAnswer){

                this.classList.add('correct');

                this.innerHTML =
                  '✅ სწორია! +10 ქულა';

                correctAnswers++;
                earned += POINTS_PER_CORRECT;

                updateLocalScore(
                  POINTS_PER_CORRECT
                );

              }else{

                this.classList.add('wrong');

                this.innerHTML =
                  '❌ არასწორია';

                /*
                 * Show the correct answer.
                 */
                buttons.forEach(button => {

                  if(
                    button.dataset.answer ===
                    correctAnswer
                  ){
                    button.classList.add('correct');

                    button.innerHTML =
                      '✅ სწორი პასუხი';
                  }

                });
              }

              /*
               * Quiz finished.
               */
              if(
                answered ===
                currentQuestions.length
              ){
                showQuizResult();
              }
            }
          );

        });

      });
  }

  function boot(){
    const quizBox = byId('quizBox');

    if(!quizBox){
      setTimeout(boot,300);
      return;
    }

    buildQuiz();
  }

  if(
    document.readyState === 'loading'
  ){
    document.addEventListener(
      'DOMContentLoaded',
      boot,
      {once:true}
    );
  }else{
    boot();
  }

})();
