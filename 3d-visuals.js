(() => {
  const path = location.pathname.toLowerCase();
  let grade = path.includes('grade2') ? '2' : path.includes('grade3') ? '3' : path.includes('grade4') ? '4' : null;
  if (!grade || document.getElementById('grade-3d-visual')) return;

  const scenes = {
    '2': `
      <div class="grade3d-wrap" id="grade-3d-visual" aria-label="მე-2 კლასის 3D სასწავლო სივრცე">
        <div class="grade3d-label">🌱 მე-2 კლასი • 3D Learning World</div>
        <div class="obj obj-book float1">📚<span class="page">ABC</span></div>
        <div class="obj obj-pencil float2">✏️</div>
        <div class="obj obj-teddy spin3d">🧸</div>
        <div class="abc-block float2"><span>A</span><span>B</span><span>C</span></div>
        <div class="obj" style="left:48%;top:63%;font-size:55px;animation:letterJump 2.4s ease-in-out infinite">🔤</div>
      </div>`,
    '3': `
      <div class="grade3d-wrap" id="grade-3d-visual" aria-label="მე-3 კლასის 3D კოსმოსური სასწავლო სივრცე">
        <div class="grade3d-label">🚀 მე-3 კლასი • 3D Space Learning</div>
        <div class="starfield"><i></i><i></i><i></i><i></i></div>
        <div class="planet one"></div><div class="planet two"></div>
        <div class="obj obj-rocket spin3d">🚀</div>
        <div class="obj obj-globe float1">🌍</div>
        <div class="obj" style="left:40%;top:61%;font-size:65px;animation:objFloat2 4s ease-in-out infinite">📖</div>
        <div class="obj" style="right:37%;bottom:17%;font-size:45px;animation:twinkle 2s infinite">⭐</div>
      </div>`,
    '4': `
      <div class="grade3d-wrap" id="grade-3d-visual" aria-label="მე-4 კლასის 3D სასწავლო ქალაქი">
        <div class="grade3d-label">⭐ მე-4 კლასი • 3D English City</div>
        <div class="obj obj-car spin3d">🚗</div>
        <div class="obj obj-cap float1">🎓</div>
        <div class="obj obj-books float2">📚</div>
        <div class="letters3d"><span>W</span><span>H</span><span>Y</span></div>
        <div class="obj" style="right:17%;top:20%;font-size:60px;animation:twinkle 2.2s ease-in-out infinite">💡</div>
        <div class="obj" style="left:43%;bottom:16%;font-size:55px;animation:letterJump 2.6s ease-in-out infinite">📝</div>
      </div>`
  };

  const hero = document.querySelector('.hero');
  const main = document.querySelector('main');
  const target = hero || main;
  if (!target) return;
  target.insertAdjacentHTML(hero ? 'afterend' : 'afterbegin', scenes[grade]);

  // Grade 2: replace the old short quiz with a full 30-question quiz.
  if (grade === '2') {
    const quizBox = document.getElementById('quiz');
    if (!quizBox) return;

    const questions = [
      ['What is “mother” in Georgian?', ['დედა','მამა','და','ძმა'], 'დედა'],
      ['What is “father” in Georgian?', ['ბებია','მამა','ბაბუა','მეგობარი'], 'მამა'],
      ['What is “sister” in Georgian?', ['და','ძმა','დედა','ბავშვი'], 'და'],
      ['What is “brother” in Georgian?', ['მეგობარი','ძმა','მამა','მოსწავლე'], 'ძმა'],
      ['What color is “red”?', ['წითელი','ლურჯი','მწვანე','ყვითელი'], 'წითელი'],
      ['What color is “blue”?', ['შავი','ლურჯი','თეთრი','ვარდისფერი'], 'ლურჯი'],
      ['What is “dog” in Georgian?', ['კატა','ძაღლი','ცხვენი','თევზი'], 'ძაღლი'],
      ['What is “cat” in Georgian?', ['კატა','ძაღლი','კურდღელი','ლომი'], 'კატა'],
      ['What is “book” in Georgian?', ['რვეული','წიგნი','კალამი','ჩანთა'], 'წიგნი'],
      ['What is “pencil” in Georgian?', ['საშლელი','ფანქარი','მერხი','კარი'], 'ფანქარი'],
      ['Choose the correct sentence:', ['I am a student.','I is a student.','I are a student.','I am student are.'], 'I am a student.'],
      ['Choose the correct sentence:', ['She are happy.','She am happy.','She is happy.','She be happy.'], 'She is happy.'],
      ['Choose the correct word: “I ___ a book.”', ['has','have','is','are'], 'have'],
      ['Choose the correct word: “She ___ a cat.”', ['have','has','are','am'], 'has'],
      ['What does “can” mean?', ['შემიძლია','მაქვს','ვარ','მიყვარს'], 'შემიძლია'],
      ['Choose the correct answer: “Can you swim?”', ['Yes, I can.','Yes, I am.','Yes, I have.','Yes, I is.'], 'Yes, I can.'],
      ['What is “apple” in Georgian?', ['ბანანი','ვაშლი','ფორთოხალი','პური'], 'ვაშლი'],
      ['What is “milk” in Georgian?', ['წყალი','წვენი','რძე','ყავა'], 'რძე'],
      ['What is “water” in Georgian?', ['რძე','წყალი','პური','ყველი'], 'წყალი'],
      ['What is “head” in Georgian?', ['ხელი','თავი','ფეხი','ყური'], 'თავი'],
      ['What is “eye” in Georgian?', ['ცხვირი','თვალი','პირი','თმა'], 'თვალი'],
      ['What is “hand” in Georgian?', ['ფეხი','ხელი','თავი','თითი'], 'ხელი'],
      ['What is “house” in Georgian?', ['ოთახი','სახლი','სკოლა','ბაღი'], 'სახლი'],
      ['What is “bedroom” in Georgian?', ['სამზარეულო','აბაზანა','საძინებელი','მისაღები'], 'საძინებელი'],
      ['What is “shirt” in Georgian?', ['ქუდი','პერანგი','ფეხსაცმელი','წინდები'], 'პერანგი'],
      ['What is “shoes” in Georgian?', ['ფეხსაცმელი','ქურთუკი','ქუდი','კაბა'], 'ფეხსაცმელი'],
      ['What is “tree” in Georgian?', ['ყვავილი','ხე','ბალახი','ცა'], 'ხე'],
      ['What is “sun” in Georgian?', ['მთვარე','ვარსკვლავი','მზე','წვიმა'], 'მზე'],
      ['What is “happy” in Georgian?', ['სევდიანი','ბედნიერი','დაღლილი','გაბრაზებული'], 'ბედნიერი'],
      ['Choose the correct sentence:', ['I can run.','I can runs.','I can running.','I can to run.'], 'I can run.']
    ];

    let current = 0;
    let score = 0;
    let answered = false;

    function renderQuiz() {
      if (current >= questions.length) {
        quizBox.innerHTML = `<div class="lesson" style="text-align:center"><h3>🏆 ქვიზი დასრულდა!</h3><p style="font-size:24px"><b>${score} / 30</b></p><p>${score >= 27 ? '🌟 შესანიშნავი შედეგია!' : score >= 21 ? '👏 ძალიან კარგი შედეგია!' : score >= 15 ? '👍 კარგი მცდელობა!' : '💪 კიდევ ერთხელ სცადე!'}</p><button class="btn" onclick="window.g2QuizRestart()">🔄 თავიდან დაწყება</button></div>`;
        const qs = document.getElementById('quizScore');
        if (qs) qs.textContent = score;
        return;
      }

      const [question, options, correct] = questions[current];
      const shuffled = [...options].sort(() => Math.random() - 0.5);
      quizBox.innerHTML = `<div class="lesson"><div style="color:#00eaff;font-weight:900;margin-bottom:8px">კითხვა ${current + 1} / 30</div><div class="progress" style="margin-bottom:16px"><i style="width:${(current / 30) * 100}%"></i></div><h3>${question}</h3>${shuffled.map(o => `<button class="option" onclick="window.g2QuizAnswer(this,${JSON.stringify(o)},${JSON.stringify(correct)})">${o}</button>`).join('')}<div id="g2-feedback" style="min-height:28px;margin-top:12px;font-weight:900"></div></div>`;
    }

    window.g2QuizAnswer = function(el, answer, correct) {
      if (answered) return;
      answered = true;
      document.querySelectorAll('#quiz .option').forEach(b => b.disabled = true);
      const feedback = document.getElementById('g2-feedback');
      if (answer === correct) {
        score++;
        el.classList.add('correct');
        feedback.textContent = '✅ სწორია! +1 ქულა';
        feedback.style.color = '#ffe600';
      } else {
        el.classList.add('wrong');
        feedback.textContent = '❌ არასწორია! სწორი პასუხია: ' + correct;
        feedback.style.color = '#ff9aaa';
        document.querySelectorAll('#quiz .option').forEach(b => { if (b.textContent === correct) b.classList.add('correct'); });
      }
      const qs = document.getElementById('quizScore');
      if (qs) qs.textContent = score;
      setTimeout(() => { current++; answered = false; renderQuiz(); }, 750);
    };

    window.g2QuizRestart = function() {
      current = 0;
      score = 0;
      answered = false;
      const qs = document.getElementById('quizScore');
      if (qs) qs.textContent = '0';
      renderQuiz();
    };

    renderQuiz();
  }
})();