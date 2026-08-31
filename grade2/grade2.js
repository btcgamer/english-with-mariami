/* =========================================================
   ENGLISH WITH MARIAMI — GRADE 2 DASHBOARD
   Safe UI layer. Supabase sync remains in the bridge files.
========================================================= */
(function () {
  'use strict';

  const KEY = 'grade2_neon_progress_v3';

  const lessons = [
    { number:'01', title:'Animals', theme:'Hologram Zoo', icon:'🐾' },
    { number:'02', title:'Numbers', theme:'Space Numbers', icon:'🔢' },
    { number:'03', title:'Colors', theme:'Neon Color Lab', icon:'🎨' },
    { number:'04', title:'Family', theme:'Family Galaxy', icon:'👨‍👩‍👧' },
    { number:'05', title:'Home', theme:'Smart Home', icon:'🏠' },
    { number:'06', title:'Food', theme:'Food Planet', icon:'🍎' },
    { number:'07', title:'Clothes', theme:'Fashion Station', icon:'👕' },
    { number:'08', title:'Weather', theme:'Weather Lab', icon:'🌦️' },
    { number:'09', title:'School', theme:'Future School', icon:'🎒' },
    { number:'10', title:'Transport', theme:'Transport Zone', icon:'🚀' },
    { number:'11', title:'Nature', theme:'Nature World', icon:'🌳' },
    { number:'12', title:'Review', theme:'Final Challenge', icon:'🏆' }
  ];

  const defaultProgress = { xp:0, stars:0, done:[], daily:'' };

  function readProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      return Object.assign({}, defaultProgress, saved || {});
    } catch (_) {
      return Object.assign({}, defaultProgress);
    }
  }

  function writeProgress(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {}
  }

  function getDone() {
    const p = readProgress();
    return Array.isArray(p.done) ? p.done : [];
  }

  function updateStats() {
    const p = readProgress();
    const done = getDone();
    const xp = Number(p.xp || 0);
    const stars = Number(p.stars || 0);
    const progress = Math.min(100, Math.round((done.length / lessons.length) * 100));
    const level = Math.max(1, Math.floor(xp / 100) + 1);
    const streak = Math.min(30, done.length ? Math.max(1, done.length) : 0);
    const badges = Math.min(12, Math.floor(done.length / 3));

    const xpEl = document.getElementById('xpValue');
    const starsEl = document.getElementById('badgeValue');
    const streakEl = document.getElementById('streakValue');
    const levelEl = document.getElementById('level');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');

    if (xpEl) xpEl.textContent = xp;
    if (starsEl) starsEl.textContent = badges;
    if (streakEl) streakEl.textContent = streak;
    if (levelEl) levelEl.textContent = level;
    if (progressText) progressText.textContent = progress + '%';
    if (progressBar) progressBar.style.width = progress + '%';

    return { p, done, xp, stars, progress, level };
  }

  function renderLessons() {
    const grid = document.getElementById('lessonGrid');
    if (!grid) return;

    const done = getDone();

    grid.innerHTML = lessons.map(function (lesson, index) {
      const completed = done.indexOf(index) !== -1;
      const finalClass = lesson.number === '12' ? ' final-lesson' : '';
      const status = completed ? '✓ COMPLETED' : 'ENTER →';

      return `
        <article class="lesson${finalClass}" data-lesson="${lesson.number}" tabindex="0" role="button" aria-label="Open Lesson ${lesson.number} ${lesson.title}">
          <div class="lesson-number">${lesson.number === '12' ? 'FINAL MISSION' : 'LESSON ' + lesson.number}</div>
          <div class="lesson-icon">${lesson.icon}</div>
          <h3>${lesson.title}</h3>
          <p>${lesson.theme}</p>
          <div class="lesson-bottom">
            <div class="stars">${completed ? '★★★★★' : '☆☆☆☆☆'}</div>
            <button class="enter-btn" type="button">${status}</button>
          </div>
        </article>`;
    }).join('');
  }

  function showModal(title, theme, number) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="mission">GRADE 2 • MISSION ${number}</div>
      <h3>${title}</h3>
      <p>${theme}</p>
      <p style="margin-top:10px">The visual mission hub is ready. Your existing lesson content and Supabase progress system are kept separate and safe.</p>
      <button class="mission-button" type="button" id="missionDoneButton">MARK MISSION COMPLETE</button>
    `;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    const doneButton = document.getElementById('missionDoneButton');
    if (doneButton) {
      doneButton.addEventListener('click', function () {
        const p = readProgress();
        const index = lessons.findIndex(x => x.number === number);
        if (index >= 0) {
          if (!Array.isArray(p.done)) p.done = [];
          if (!p.done.includes(index)) {
            p.done.push(index);
            p.xp = Number(p.xp || 0) + 25;
            p.stars = Number(p.stars || 0) + 1;
            writeProgress(p);
          }
        }
        closeModal();
        renderLessons();
        updateStats();
      });
    }
  }

  function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function openLesson(number) {
    const lesson = lessons.find(x => x.number === number);
    if (!lesson) return;
    showModal(lesson.title, lesson.theme, lesson.number);
  }

  function continueMission() {
    const done = getDone();
    const next = lessons.find((_, index) => done.indexOf(index) === -1) || lessons[11];
    openLesson(next.number);
  }

  function finalReview() {
    openLesson('12');
  }

  function dailyChallenge() {
    const p = readProgress();
    const today = new Date().toISOString().slice(0,10);
    if (p.daily === today) {
      alert('Daily Boost already completed today. Come back tomorrow!');
      return;
    }
    p.daily = today;
    p.xp = Number(p.xp || 0) + 10;
    writeProgress(p);
    updateStats();
    alert('🎯 Daily Boost complete! +10 XP');
  }

  function bindEvents() {
    const grid = document.getElementById('lessonGrid');
    if (grid) {
      grid.addEventListener('click', function (event) {
        const card = event.target.closest('[data-lesson]');
        if (card) openLesson(card.dataset.lesson);
      });
      grid.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        const card = event.target.closest('[data-lesson]');
        if (card) { event.preventDefault(); openLesson(card.dataset.lesson); }
      });
    }

    const close = document.getElementById('closeModal');
    if (close) close.addEventListener('click', closeModal);

    const modal = document.getElementById('modal');
    if (modal) modal.addEventListener('click', function (event) {
      if (event.target === modal) closeModal();
    });

    const daily = document.getElementById('dailyButton');
    if (daily) daily.addEventListener('click', dailyChallenge);
  }

  window.closeModal = closeModal;
  window.continueMission = continueMission;
  window.finalReview = finalReview;
  window.dailyChallenge = dailyChallenge;
  window.Grade2Dashboard = { lessons, openLesson, continueMission, finalReview, dailyChallenge, updateStats };

  renderLessons();
  updateStats();
  bindEvents();
})();
