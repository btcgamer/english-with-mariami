/* English with Mariami — shared Grade 2/3/4 lesson engine
   Reads ALL lesson content from Supabase:
   lessons, lesson_words, lesson_quizzes.
   No hardcoded lesson content.
*/
(function () {
  'use strict';

  const DB = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient || null;
  const root = document.body;
  const grade = Number(root && root.dataset.grade);
  const $ = (id) => document.getElementById(id);

  const state = {
    user: null,
    profile: null,
    lessons: [],
    words: [],
    quizzes: [],
    filter: 'all',
    search: '',
    currentLesson: null,
    quizAnswers: {},
    quizSubmitted: false
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[c]));
  }

  function arr(value) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') return Object.values(value);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (_) {
        return value.trim() ? [value] : [];
      }
    }
    return [];
  }

  function text(value) {
    if (value == null) return '';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  }

  function lessonWords(lessonId) {
    return state.words.filter((w) => w.lesson_id === lessonId).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  function lessonQuizzes(lessonId) {
    return state.quizzes.filter((q) => q.lesson_id === lessonId).sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  }

  function normalizeOptions(value) {
    return arr(value).map(text).filter(Boolean);
  }

  function iconFor(index) {
    return ['🚀', '🌱', '🧠', '📚', '🎯', '⭐', '🌍', '💡', '🔥', '🏆'][index % 10];
  }

  function toast(message, error) {
    let el = $('gradeToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'gradeToast';
      el.className = 'grade-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.toggle('error', !!error);
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  function closeModal() {
    const modal = $('lessonModal');
    if (modal) modal.classList.remove('open');
    state.currentLesson = null;
    state.quizAnswers = {};
    state.quizSubmitted = false;
  }

  function openModal() {
    const modal = $('lessonModal');
    if (modal) modal.classList.add('open');
  }

  function setStat(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function renderStats() {
    setStat('lessonCount', state.lessons.length);
    setStat('wordCount', state.words.length);
    setStat('quizCount', state.quizzes.length);
    setStat('contentCount', state.lessons.length * 7);
  }

  function lessonMatches(lesson) {
    const haystack = [lesson.title, lesson.topic, lesson.description, lesson.grammar_rule, lesson.listening_text, lesson.reading_text].join(' ').toLowerCase();
    const searchOk = !state.search || haystack.includes(state.search);
    if (!searchOk) return false;
    if (state.filter === 'all') return true;
    if (state.filter === 'vocabulary') return lessonWords(lesson.id).length > 0;
    if (state.filter === 'grammar') return !!lesson.grammar_rule || arr(lesson.grammar_examples).length > 0;
    if (state.filter === 'listening') return !!lesson.listening_text || !!lesson.audio_url;
    if (state.filter === 'speaking') return arr(lesson.speaking_phrases).length > 0;
    if (state.filter === 'reading') return !!lesson.reading_text;
    if (state.filter === 'exercises') return arr(lesson.exercises).length > 0;
    if (state.filter === 'quiz') return lessonQuizzes(lesson.id).length > 0;
    return true;
  }

  function renderTopics() {
    const host = $('lessonGrid');
    if (!host) return;

    const visible = state.lessons.filter(lessonMatches);
    if (!visible.length) {
      host.innerHTML = '<div class="empty-state">🔎 ამ ფილტრით გაკვეთილი ვერ მოიძებნა.</div>';
      return;
    }

    host.innerHTML = visible.map((lesson, index) => {
      const words = lessonWords(lesson.id).length;
      const quizzes = lessonQuizzes(lesson.id).length;
      const sections = [
        lesson.grammar_rule || arr(lesson.grammar_examples).length ? 'Grammar' : '',
        lesson.listening_text || lesson.audio_url ? 'Listening' : '',
        arr(lesson.speaking_phrases).length ? 'Speaking' : '',
        lesson.reading_text ? 'Reading' : '',
        arr(lesson.exercises).length ? 'Exercises' : '',
        words ? 'Words' : '',
        quizzes ? 'Quiz' : ''
      ].filter(Boolean);

      return `<article class="lesson-card" data-lesson-id="${esc(lesson.id)}">
        <div class="lesson-icon">${iconFor(index)}</div>
        <div class="lesson-number">LESSON ${esc(lesson.lesson_number)}</div>
        <h3>${esc(lesson.title || 'Untitled lesson')}</h3>
        <div class="lesson-topic">${esc(lesson.topic || 'English')}</div>
        <p>${esc(lesson.description || 'Open the lesson to see the complete learning material.')}</p>
        <div class="lesson-meta">
          <span>📚 ${words} words</span>
          <span>🎯 ${quizzes} quiz</span>
        </div>
        <div class="section-pills">${sections.map(s => `<span>${esc(s)}</span>`).join('')}</div>
        <button class="open-lesson" data-open-lesson="${esc(lesson.id)}">OPEN LESSON →</button>
      </article>`;
    }).join('');

    host.querySelectorAll('[data-open-lesson]').forEach((button) => {
      button.addEventListener('click', () => openLesson(button.dataset.openLesson));
    });
  }

  function renderWords(words) {
    if (!words.length) return '<div class="empty-state">No vocabulary for this lesson.</div>';
    return `<div class="words-grid">${words.map((w) => `
      <div class="word-card">
        <div class="word-top">
          <strong>${esc(w.emoji || '🔤')} ${esc(w.word)}</strong>
          ${w.audio_url ? `<button class="mini-audio" data-audio="${esc(w.audio_url)}">🔊</button>` : ''}
        </div>
        <span>${esc(w.translation || '')}</span>
        ${w.image_url ? `<img src="${esc(w.image_url)}" alt="${esc(w.word)}" loading="lazy">` : ''}
      </div>`).join('')}</div>`;
  }

  function renderList(items, className) {
    if (!items.length) return '<div class="empty-state">No material available.</div>';
    return `<div class="${className}">${items.map((item, i) => {
      if (typeof item === 'object' && item !== null) {
        const title = item.title || item.question || item.instruction || item.task || `Item ${i + 1}`;
        const body = item.text || item.answer || item.description || item.content || item.example || '';
        return `<div class="material-item"><b>${esc(title)}</b>${body ? `<p>${esc(body)}</p>` : ''}</div>`;
      }
      return `<div class="material-item"><span class="material-index">${i + 1}</span>${esc(item)}</div>`;
    }).join('')}</div>`;
  }

  function renderTab(tab) {
    const lesson = state.currentLesson;
    if (!lesson) return '';
    const words = lessonWords(lesson.id);
    const quizzes = lessonQuizzes(lesson.id);

    if (tab === 'overview') {
      return `<div class="overview-grid">
        <div class="material-card"><small>TOPIC</small><h3>${esc(lesson.topic || 'English')}</h3><p>${esc(lesson.description || '')}</p></div>
        ${lesson.image_url ? `<div class="material-card media-card"><img src="${esc(lesson.image_url)}" alt="${esc(lesson.title)}"></div>` : ''}
      </div>`;
    }
    if (tab === 'grammar') {
      return `<div class="material-card"><h3>📘 Grammar Rule</h3><p class="large-text">${esc(lesson.grammar_rule || 'No grammar rule provided.')}</p>
        <h3>✏️ Examples</h3>${renderList(arr(lesson.grammar_examples), 'material-list')}</div>`;
    }
    if (tab === 'listening') {
      return `<div class="material-card"><h3>🎧 Listening</h3><p class="large-text">${esc(lesson.listening_text || 'No listening text provided.')}</p>
        ${lesson.audio_url ? `<div class="audio-wrap"><audio controls preload="none" src="${esc(lesson.audio_url)}"></audio></div>` : '<div class="empty-state">Audio file not attached to this lesson.</div>'}</div>`;
    }
    if (tab === 'speaking') {
      return `<div class="material-card"><h3>🗣️ Speaking Phrases</h3>${renderList(arr(lesson.speaking_phrases), 'phrase-list')}</div>`;
    }
    if (tab === 'reading') {
      return `<div class="material-card"><h3>📖 Reading</h3><div class="reading-text">${esc(lesson.reading_text || 'No reading text provided.')}</div></div>`;
    }
    if (tab === 'exercises') {
      return `<div class="material-card"><h3>📝 Exercises</h3>${renderList(arr(lesson.exercises), 'exercise-list')}</div>`;
    }
    if (tab === 'words') {
      return `<div class="material-card"><h3>🔤 Vocabulary <span class="count-chip">${words.length}</span></h3>${renderWords(words)}</div>`;
    }
    if (tab === 'quiz') {
      return renderQuiz(quizzes);
    }
    return '';
  }

  function renderQuiz(quizzes) {
    if (!quizzes.length) return '<div class="material-card"><div class="empty-state">No quiz questions for this lesson.</div></div>';
    const answered = Object.keys(state.quizAnswers).length;
    const score = state.quizSubmitted ? quizzes.reduce((sum, q) => sum + (state.quizAnswers[q.id] === String(q.correct_answer) ? 1 : 0), 0) : 0;

    return `<div class="material-card"><div class="quiz-head"><div><h3>🎯 Quiz</h3><p>${answered}/${quizzes.length} answered</p></div>${state.quizSubmitted ? `<strong class="quiz-score">${score}/${quizzes.length} • ${Math.round(score / quizzes.length * 100)}%</strong>` : ''}</div>
      ${quizzes.map((q, qi) => {
        const options = normalizeOptions(q.options);
        const selected = state.quizAnswers[q.id];
        return `<div class="quiz-question"><b>${qi + 1}. ${esc(q.question)}</b>${options.map((option) => {
          const isSelected = selected === option;
          const isCorrect = state.quizSubmitted && option === String(q.correct_answer);
          const isWrong = state.quizSubmitted && isSelected && !isCorrect;
          return `<button class="quiz-option ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}" data-qid="${esc(q.id)}" data-answer="${esc(option)}" ${state.quizSubmitted ? 'disabled' : ''}>${isSelected ? '◉ ' : '○ '}${esc(option)}</button>`;
        }).join('')}</div>`;
      }).join('')}
      ${state.quizSubmitted ? `<div class="quiz-result">${score === quizzes.length ? '🏆 Perfect! Excellent work!' : `You scored ${Math.round(score / quizzes.length * 100)}%. Try again and improve your score!`}</div>` : `<button class="submit-quiz" id="submitQuiz">CHECK QUIZ</button>`}
    </div>`;
  }

  function openLesson(id) {
    const lesson = state.lessons.find((x) => x.id === id);
    if (!lesson) return;
    state.currentLesson = lesson;
    state.quizAnswers = {};
    state.quizSubmitted = false;
    const title = $('modalTitle');
    const body = $('modalContent');
    if (!title || !body) return;
    title.innerHTML = `LESSON ${esc(lesson.lesson_number)} — ${esc(lesson.title)}`;
    body.innerHTML = `<div class="lesson-summary">${esc(lesson.topic || 'English')} • Complete lesson material</div>
      <div class="lesson-tabs" id="lessonTabs">
        ${['overview','grammar','listening','speaking','reading','exercises','words','quiz'].map((tab, i) => `<button class="lesson-tab ${i === 0 ? 'active' : ''}" data-tab="${tab}">${tab.toUpperCase()}</button>`).join('')}
      </div><div id="tabContent">${renderTab('overview')}</div>`;
    body.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => switchTab(button.dataset.tab)));
    openModal();
  }

  function switchTab(tab) {
    document.querySelectorAll('.lesson-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    const content = $('tabContent');
    if (!content) return;
    content.innerHTML = renderTab(tab);
    if (tab === 'quiz') bindQuiz();
    bindAudioButtons();
  }

  function bindAudioButtons() {
    document.querySelectorAll('[data-audio]').forEach((button) => {
      button.addEventListener('click', () => {
        const audio = new Audio(button.dataset.audio);
        audio.play().catch(() => toast('Audio could not be played.', true));
      });
    });
  }

  function bindQuiz() {
    document.querySelectorAll('.quiz-option:not([disabled])').forEach((button) => {
      button.addEventListener('click', () => {
        state.quizAnswers[button.dataset.qid] = button.dataset.answer;
        const qid = button.dataset.qid;
        document.querySelectorAll(`.quiz-option[data-qid="${CSS.escape(qid)}"]`).forEach((b) => b.classList.remove('selected'));
        button.classList.add('selected');
        switchTab('quiz');
      });
    });
    const submit = $('submitQuiz');
    if (submit) submit.addEventListener('click', submitQuiz);
  }

  async function submitQuiz() {
    const lesson = state.currentLesson;
    const quizzes = lessonQuizzes(lesson.id);
    if (!quizzes.length) return;
    const missing = quizzes.filter((q) => state.quizAnswers[q.id] == null).length;
    if (missing) {
      toast(`უპასუხე ყველა კითხვას (${missing} დარჩა).`, true);
      return;
    }
    state.quizSubmitted = true;
    const score = quizzes.reduce((sum, q) => sum + (state.quizAnswers[q.id] === String(q.correct_answer) ? 1 : 0), 0);
    switchTab('quiz');
    toast(`Quiz დასრულდა: ${score}/${quizzes.length}`);

    if (state.user) {
      try {
        await DB.from('quiz_results').insert({
          student_id: state.user.id,
          quiz_id: String(lesson.id),
          grade,
          score,
          total: quizzes.length,
          completed_at: new Date().toISOString()
        });
      } catch (error) {
        console.warn('quiz_results insert:', error);
      }
    }
  }

  function buildFilter() {
    const select = $('topicSelect');
    if (!select) return;
    const topics = [...new Set(state.lessons.map((l) => String(l.topic || '').trim()).filter(Boolean))];
    select.innerHTML = '<option value="all">ყველა თემა</option>' + topics.map((topic) => `<option value="${esc(topic)}">${esc(topic)}</option>`).join('');
    select.addEventListener('change', () => {
      state.search = select.value === 'all' ? state.search : state.search;
      renderTopics();
    });
  }

  function bindControls() {
    const search = $('search');
    if (search) search.addEventListener('input', () => {
      state.search = search.value.trim().toLowerCase();
      renderTopics();
    });

    document.querySelectorAll('[data-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.filter = button.dataset.filter;
        document.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('active', b === button));
        renderTopics();
      });
    });

    const select = $('topicSelect');
    if (select) select.addEventListener('change', () => {
      state.topic = select.value;
      renderTopics();
    });

    const close = $('closeModal');
    if (close) close.addEventListener('click', closeModal);
    const modal = $('lessonModal');
    if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    const reload = $('reload');
    if (reload) reload.addEventListener('click', loadData);

    const home = $('homeBtn');
    if (home) home.addEventListener('click', () => { window.location.href = 'student-dashboard.html'; });

    const logout = $('logoutBtn');
    if (logout) logout.addEventListener('click', async () => {
      if (DB) await DB.auth.signOut({ scope: 'global' }).catch(() => {});
      window.location.replace('login.html?logout=1');
    });
  }

  async function loadData() {
    if (!DB) throw new Error('Supabase client ვერ მოიძებნა.');
    if (![2, 3, 4].includes(grade)) throw new Error('Invalid grade page.');

    const topics = $('lessonGrid');
    if (topics) topics.innerHTML = '<div class="loading-state">⚡ Syncing complete Grade content...</div>';

    const auth = await DB.auth.getUser();
    if (auth.error) throw auth.error;
    state.user = auth.data && auth.data.user ? auth.data.user : null;

    if (state.user) {
      const profile = await DB.from('profiles').select('full_name,grade,role').eq('user_id', state.user.id).maybeSingle();
      if (!profile.error) state.profile = profile.data;
      if (state.profile && String(state.profile.role || '').toLowerCase() === 'student' && Number(state.profile.grade) !== grade) {
        window.location.replace(`grade${Number(state.profile.grade)}.html`);
        return;
      }
    }

    const lessonsResult = await DB.from('lessons').select('id,grade,lesson_number,title,topic,description,image_url,audio_url,created_at,grammar_rule,grammar_examples,listening_text,speaking_phrases,reading_text,exercises').eq('grade', grade).order('lesson_number', { ascending: true });
    if (lessonsResult.error) throw lessonsResult.error;
    state.lessons = lessonsResult.data || [];

    const ids = state.lessons.map((l) => l.id).filter(Boolean);
    if (ids.length) {
      const [wordsResult, quizResult] = await Promise.all([
        DB.from('lesson_words').select('id,lesson_id,word,translation,emoji,image_url,audio_url,sort_order,created_at').in('lesson_id', ids).order('sort_order', { ascending: true }),
        DB.from('lesson_quizzes').select('id,lesson_id,question,options,correct_answer,sort_order,created_at').in('lesson_id', ids).order('sort_order', { ascending: true })
      ]);
      if (wordsResult.error) throw wordsResult.error;
      if (quizResult.error) throw quizResult.error;
      state.words = wordsResult.data || [];
      state.quizzes = quizResult.data || [];
    } else {
      state.words = [];
      state.quizzes = [];
    }

    renderStats();
    buildFilter();
    renderTopics();
  }

  async function boot() {
    bindControls();
    try {
      await loadData();
    } catch (error) {
      console.error('Grade content:', error);
      const host = $('lessonGrid');
      if (host) host.innerHTML = `<div class="empty-state error">❌ ${esc(error.message || 'მასალების ჩატვირთვა ვერ მოხერხდა.')}</div>`;
    }
  }

  window.openGradeLesson = openLesson;
  window.closeGradeLesson = closeModal;
  boot();
})();
