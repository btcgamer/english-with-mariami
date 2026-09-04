(() => {
  // Keep teacher access/functionality, but hide the visible teacher-mode status label.
  function hideTeacherModeLabel(root = document) {
    const elements = root.querySelectorAll ? root.querySelectorAll('body *') : [];
    elements.forEach(el => {
      if (el.dataset && el.dataset.teacherLabelHidden === '1') return;
      const text = String(el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (text.includes('მასწავლებლის რეჟიმი') && text.includes('კლასი')) {
        const childMatch = Array.from(el.children || []).some(child => {
          const childText = String(child.textContent || '').replace(/\s+/g, ' ').trim();
          return childText.includes('მასწავლებლის რეჟიმი') && childText.includes('კლასი');
        });
        if (!childMatch) {
          el.style.display = 'none';
          el.dataset.teacherLabelHidden = '1';
        }
      }
    });
  }

  const startTeacherLabelHider = () => {
    hideTeacherModeLabel();
    const observer = new MutationObserver(() => hideTeacherModeLabel());
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTeacherLabelHider, { once: true });
  } else {
    startTeacherLabelHider();
  }

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

  const scene = document.getElementById('grade-3d-visual');
  if (scene) {
    const companion = document.createElement('div');
    companion.className = 'ai-companion';
    companion.setAttribute('aria-label', `AI სასწავლო კომპანიონი — მე-${grade} კლასი`);
    companion.innerHTML = '<div class="ai-face"><i class="ai-eye left"></i><i class="ai-eye right"></i></div><i class="ai-core"></i>';
    scene.appendChild(companion);

    const wakeCompanion = (event) => {
      const rect = scene.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      scene.style.setProperty('--touch-x', `${x}%`);
      scene.style.setProperty('--touch-y', `${y}%`);
      scene.classList.remove('touch-glow', 'touch-wave');
      companion.classList.remove('is-thinking');
      void scene.offsetWidth;
      scene.classList.add('touch-glow', 'touch-wave');
      companion.classList.add('is-thinking');
      window.setTimeout(() => {
        scene.classList.remove('touch-glow', 'touch-wave');
        companion.classList.remove('is-thinking');
      }, 900);
    };

    // Pointer Events cover mouse, pen and modern touch without double-firing touchstart.
    scene.addEventListener('pointerdown', wakeCompanion, { passive: true });
  }

  // Grade 2: 30-question quiz.
  if (grade === '2') {
    const quizBox = document.getElementById('quiz');
    if (!quizBox) return;
    const questions = [
      ['What is “mother” in Georgian?', ['დედა','მამა','და','ძმა'], 'დედა'],['What is “father” in Georgian?', ['ბებია','მამა','ბაბუა','მეგობარი'], 'მამა'],['What is “sister” in Georgian?', ['და','ძმა','დედა','ბავშვი'], 'და'],['What is “brother” in Georgian?', ['მეგობარი','ძმა','მამა','მოსწავლე'], 'ძმა'],['What color is “red”?', ['წითელი','ლურჯი','მწვანე','ყვითელი'], 'წითელი'],['What color is “blue”?', ['შავი','ლურჯი','თეთრი','ვარდისფერი'], 'ლურჯი'],['What is “dog” in Georgian?', ['კატა','ძაღლი','ცხენი','თევზი'], 'ძაღლი'],['What is “cat” in Georgian?', ['კატა','ძაღლი','კურდღელი','ლომი'], 'კატა'],['What is “book” in Georgian?', ['რვეული','წიგნი','კალამი','ჩანთა'], 'წიგნი'],['What is “pencil” in Georgian?', ['საშლელი','ფანქარი','მერხი','კარი'], 'ფანქარი'],['Choose the correct sentence:', ['I am a student.','I is a student.','I are a student.','I am student are.'], 'I am a student.'],['Choose the correct sentence:', ['She are happy.','She am happy.','She is happy.','She be happy.'], 'She is happy.'],['Choose the correct word: “I ___ a book.”', ['has','have','is','are'], 'have'],['Choose the correct word: “She ___ a cat.”', ['have','has','are','am'], 'has'],['What does “can” mean?', ['შემიძლია','მაქვს','ვარ','მიყვარს'], 'შემიძლია'],['Choose the correct answer: “Can you swim?”', ['Yes, I can.','Yes, I am.','Yes, I have.','Yes, I is.'], 'Yes, I can.'],['What is “apple” in Georgian?', ['ბანანი','ვაშლი','ფორთოხალი','პური'], 'ვაშლი'],['What is “milk” in Georgian?', ['წყალი','წვენი','რძე','ყავა'], 'რძე'],['What is “water” in Georgian?', ['რძე','წყალი','პური','ყველი'], 'წყალი'],['What is “head” in Georgian?', ['ხელი','თავი','ფეხი','ყური'], 'თავი'],['What is “eye” in Georgian?', ['ცხვირი','თვალი','პირი','თმა'], 'თვალი'],['What is “hand” in Georgian?', ['ფეხი','ხელი','თავი','თითი'], 'ხელი'],['What is “house” in Georgian?', ['ოთახი','სახლი','სკოლა','ბაღი'], 'სახლი'],['What is “bedroom” in Georgian?', ['სამზარეულო','აბაზანა','საძინებელი','მისაღები'], 'საძინებელი'],['What is “shirt” in Georgian?', ['ქუდი','პერანგი','ფეხსაცმელი','წინდები'], 'პერანგი'],['What is “shoes” in Georgian?', ['ფეხსაცმელი','ქურთუკი','ქუდი','კაბა'], 'ფეხსაცმელი'],['What is “tree” in Georgian?', ['ყვავილი','ხე','ბალახი','ცა'], 'ხე'],['What is “sun” in Georgian?', ['მთვარე','ვარსკვლავი','მზე','წვიმა'], 'მზე'],['What is “happy” in Georgian?', ['სევდიანი','ბედნიერი','დაღლილი','გაბრაზებული'], 'ბედნიერი'],['Choose the correct sentence:', ['I can run.','I can runs.','I can running.','I can to run.'], 'I can run.']
    ];
    let current=0,score=0,answered=false;
    function renderQuiz(){
      if(current>=questions.length){quizBox.innerHTML=`<div class="lesson" style="text-align:center"><h3>🏆 ქვიზი დასრულდა!</h3><p style="font-size:24px"><b>${score} / 30</b></p><p>${score>=27?'🌟 შესანიშნავი შედეგია!':score>=21?'👏 ძალიან კარგი შედეგია!':score>=15?'👍 კარგი მცდელობა!':'💪 კიდევ ერთხელ სცადე!'}</p><button class="btn" onclick="window.g2QuizRestart()">🔄 თავიდან დაწყება</button></div>`;const qs=document.getElementById('quizScore');if(qs)qs.textContent=score;return;}
      const [question,options,correct]=questions[current];const shuffled=[...options].sort(()=>Math.random()-.5);quizBox.innerHTML=`<div class="lesson"><div style="color:#00eaff;font-weight:900;margin-bottom:8px">კითხვა ${current+1} / 30</div><div class="progress" style="margin-bottom:16px"><i style="width:${(current/30)*100}%"></i></div><h3>${question}</h3>${shuffled.map(o=>`<button class="option" onclick="window.g2QuizAnswer(this,${JSON.stringify(o)},${JSON.stringify(correct)})">${o}</button>`).join('')}<div id="g2-feedback" style="min-height:28px;margin-top:12px;font-weight:900"></div></div>`;
    }
    window.g2QuizAnswer=function(el,answer,correct){if(answered)return;answered=true;document.querySelectorAll('#quiz .option').forEach(b=>b.disabled=true);const feedback=document.getElementById('g2-feedback');if(answer===correct){score++;el.classList.add('correct');feedback.textContent='✅ სწორია! +1 ქულა';feedback.style.color='#ffe600';}else{el.classList.add('wrong');feedback.textContent='❌ არასწორია! სწორი პასუხია: '+correct;feedback.style.color='#ff9aaa';document.querySelectorAll('#quiz .option').forEach(b=>{if(b.textContent===correct)b.classList.add('correct');});}const qs=document.getElementById('quizScore');if(qs)qs.textContent=score;setTimeout(()=>{current++;answered=false;renderQuiz();},750);};
    window.g2QuizRestart=function(){current=0;score=0;answered=false;const qs=document.getElementById('quizScore');if(qs)qs.textContent='0';renderQuiz();};
    renderQuiz();
  }

  // Grade 3: 30-question quiz.
  if (grade === '3') {
    const quizBox = document.getElementById('quiz');
    if (!quizBox) return;
    const questions = [
      ['What time does Mari get up?', ['At six o’clock','At seven o’clock','At eight o’clock','At nine o’clock'], 1],
      ['Which subject does Nino like best?', ['Maths','Art','English','Science'], 2],
      ['Choose the correct sentence.', ['She play tennis.','She plays tennis.','She playing tennis.','She plays tennis every yesterday.'], 1],
      ['_____ you like apples?', ['Do','Does','Is','Are'], 0],
      ['_____ she read books?', ['Do','Does','Can','Have'], 1],
      ['Choose the correct answer: Can you swim?', ['Yes, I can.','Yes, I do.','Yes, I am.','Yes, I have.'], 0],
      ['Choose the correct form: He _____ a dog.', ['have','has','haves','having'], 1],
      ['There _____ three books on the table.', ['is','am','are','be'], 2],
      ['The cat is _____ the chair.', ['under','happy','seven','read'], 0],
      ['What is the opposite of “big”?', ['long','small','fast','new'], 1],
      ['What is the opposite of “hot”?', ['cold','clean','old','short'], 0],
      ['What does “morning” mean?', ['საღამო','ღამე','დილა','შუადღე'], 2],
      ['What does “tomorrow” mean?', ['გუშინ','დღეს','ხვალ','ახლა'], 2],
      ['Which word is a verb?', ['school','happy','run','blue'], 2],
      ['Which word is a colour?', ['Monday','green','teacher','family'], 1],
      ['Choose the correct sentence.', ['I goes to school.','I go to school.','I going school.','I goes school every.'], 1],
      ['Choose the correct sentence.', ['She have a red bag.','She has a red bag.','She haves a red bag.','She having a red bag.'], 1],
      ['What does “favourite” mean?', ['საყვარელი','სწრაფი','დიდი','მშიერი'], 0],
      ['What does “umbrella” mean?', ['ქოლგა','ჩანთა','ფანქარი','ფანჯარა'], 0],
      ['What does Anna take on a rainy day?', ['A ball','An umbrella','A book','A bike'], 1],
      ['What does Anna drink at lunch?', ['Milk','Juice','Water','Tea'], 2],
      ['After school, where does Anna play?', ['At home','In the park','At the shop','At the library'], 1],
      ['What is the plural of “book”?', ['bookes','books','bookies','book'], 1],
      ['What is the plural of “child”?', ['childs','childes','children','childrens'], 2],
      ['Choose the correct preposition: The book is _____ the bag.', ['in','under','next','between'], 0],
      ['Choose the correct preposition: The school is _____ to the park.', ['on','next','in','under'], 1],
      ['Which sentence is in Present Simple?', ['I am reading now.','I play every day.','I played yesterday.','I will play tomorrow.'], 1],
      ['Choose the correct question.', ['Does she like apples?','Does she likes apples?','Do she like apples?','Is she like apples?'], 0],
      ['How do you say „მადლობა“ in English?', ['Sorry','Please','Thank you','Welcome'], 2],
      ['How do you say „ნახვამდის“ in English?', ['Goodbye','Good morning','Excuse me','Hello'], 0]
    ];
    let current=0,score=0,answered=false;
    const renderQuiz=()=>{
      if(current>=questions.length){const p=Math.round(score/30*100);const msg=p>=90?'🏆 შესანიშნავი შედეგია!':p>=70?'🌟 ძალიან კარგი შედეგია!':p>=50?'👍 კარგი დასაწყისია!':'💪 კიდევ ერთხელ სცადე!';quizBox.innerHTML=`<div class="lesson" style="text-align:center"><div style="font-size:34px">🎉</div><h3>ქვიზი დასრულებულია!</h3><p style="font-size:24px"><b>${score} / 30</b> • ${p}%</p><p>${msg}</p><button class="btn" onclick="window.g3QuizRestart()">🔄 თავიდან დაწყება</button></div>`;return;}
      const [question,options,correct]=questions[current];const shuffled=options.map((text,index)=>({text,index})).sort(()=>Math.random()-.5);quizBox.innerHTML=`<div class="lesson"><div style="color:#00eaff;font-weight:900;margin-bottom:8px">კითხვა ${current+1} / 30 • ქულა: ${score}</div><div class="progress" style="margin-bottom:16px"><i style="width:${(current/30)*100}%"></i></div><h3>${question}</h3>${shuffled.map(o=>`<button class="option" data-i="${o.index}">${o.text}</button>`).join('')}<div id="g3-feedback" style="min-height:28px;margin-top:12px;font-weight:900"></div></div>`;
      quizBox.querySelectorAll('.option').forEach(btn=>btn.addEventListener('click',()=>answer(btn,Number(btn.dataset.i),correct)));
    };
    const answer=(el,a,correct)=>{if(answered)return;answered=true;quizBox.querySelectorAll('.option').forEach(b=>b.disabled=true);const feedback=document.getElementById('g3-feedback');if(a===correct){score++;el.classList.add('correct');feedback.textContent='✅ სწორია! +1 ქულა';feedback.style.color='#ffe600';}else{el.classList.add('wrong');const right=questions[current][1][correct];quizBox.querySelectorAll('.option').forEach(b=>{if(Number(b.dataset.i)===correct)b.classList.add('correct');});feedback.textContent='❌ არასწორია! სწორი პასუხია: '+right;feedback.style.color='#ff9aaa';}setTimeout(()=>{current++;answered=false;renderQuiz();},750);};
    window.g3QuizRestart=()=>{current=0;score=0;answered=false;renderQuiz();};
    renderQuiz();
  }
})();
