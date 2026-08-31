/* English with Mariami — direct material browser for Grade 2/3/4
   Keeps the existing lesson engine intact and adds a direct-access view:
   ALL WORDS / GRAMMAR / LISTENING / SPEAKING / READING / EXERCISES / QUIZ.
   Reads only from the existing Supabase curriculum tables.
*/
(function () {
  'use strict';

  const DB = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient || window.supabase;
  const body = document.body;
  const grade = Number(body && body.dataset.grade);
  if (!DB || ![2, 3, 4].includes(grade)) return;

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const arr = (v) => {
    if (Array.isArray(v)) return v;
    if (v && typeof v === 'object') return Object.values(v);
    if (typeof v === 'string') {
      try { const p = JSON.parse(v); return Array.isArray(p) ? p : (p == null ? [] : [p]); }
      catch (_) { return v.trim() ? [v] : []; }
    }
    return [];
  };
  const asText = (v) => {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    return JSON.stringify(v);
  };
  const content = (lesson) => ({
    grammar: Boolean(String(lesson.grammar_rule || '').trim()) || arr(lesson.grammar_examples).length > 0,
    listening: Boolean(String(lesson.listening_text || '').trim()) || Boolean(String(lesson.audio_url || '').trim()),
    speaking: arr(lesson.speaking_phrases).length > 0,
    reading: Boolean(String(lesson.reading_text || '').trim()),
    exercises: arr(lesson.exercises).length > 0
  });

  const state = { lessons: [], words: [], quizzes: [], section: 'all', search: '', answers: {}, checked: false };

  function style() {
    if (document.getElementById('ewm-accessible-style')) return;
    const s = document.createElement('style');
    s.id = 'ewm-accessible-style';
    s.textContent = `
      #ewmAccessible{margin:18px 0 55px}
      #ewmAccessible .ea-nav{display:grid;grid-template-columns:repeat(8,minmax(90px,1fr));gap:8px;margin:0 0 16px}
      #ewmAccessible .ea-btn{border:1px solid rgba(0,239,255,.2);border-radius:14px;padding:13px 10px;background:rgba(4,17,34,.88);color:#d9edf7;font-weight:1000;cursor:pointer;text-align:center;transition:.18s}
      #ewmAccessible .ea-btn:hover,#ewmAccessible .ea-btn.active{border-color:#00efff;color:#fff;background:linear-gradient(135deg,rgba(8,120,255,.45),rgba(0,239,255,.16));box-shadow:0 0 22px rgba(0,239,255,.12);transform:translateY(-1px)}
      #ewmAccessible .ea-panel{border:1px solid rgba(0,239,255,.18);border-radius:24px;padding:18px;background:linear-gradient(145deg,rgba(5,22,45,.94),rgba(2,10,24,.94));box-shadow:0 20px 60px rgba(0,0,0,.25)}
      #ewmAccessible .ea-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:15px}
      #ewmAccessible .ea-title{font-size:24px;font-weight:1000}.ea-sub{color:#91a8bb;font-size:12px;margin-top:3px}
      #ewmAccessible .ea-search{min-width:240px;max-width:390px;flex:1;padding:11px 13px;border-radius:12px;border:1px solid rgba(0,239,255,.16);background:#031226;color:white;outline:none}
      #ewmAccessible .ea-lessons{display:grid;gap:12px}
      #ewmAccessible .ea-lesson{border:1px solid rgba(255,255,255,.08);border-radius:18px;background:#06172c;padding:16px}
      #ewmAccessible .ea-lesson-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ea-lesson h3{margin:0 0 4px}.ea-topic{color:#00efff;font-size:11px;font-weight:900}.ea-number{color:#7890a7;font-size:10px;font-weight:1000}
      #ewmAccessible .ea-card{margin-top:12px;padding:14px;border-radius:14px;background:#041326;border:1px solid rgba(0,239,255,.09)}
      #ewmAccessible .ea-card h4{margin:0 0 9px}.ea-text{white-space:pre-wrap;line-height:1.75;color:#c6d7e2}.ea-items{display:grid;gap:7px}.ea-item{padding:10px 12px;border-radius:11px;background:#071c34;border:1px solid rgba(255,255,255,.06);line-height:1.55;color:#d5e2e9}
      #ewmAccessible .ea-words{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.ea-word{padding:11px;border-radius:12px;background:#071c34;border:1px solid rgba(0,239,255,.1)}.ea-word strong{display:block}.ea-word small{display:block;color:#b8cad6;margin-top:4px}.ea-word img{width:100%;max-height:130px;object-fit:cover;border-radius:9px;margin-top:8px}.ea-audio{border:0;border-radius:8px;background:#0a2946;color:#fff;padding:5px 8px;cursor:pointer;float:right}
      #ewmAccessible .ea-quiz{display:grid;gap:10px}.ea-q{padding:14px;border-radius:14px;background:#071c34;border:1px solid rgba(255,255,255,.07)}.ea-q b{display:block;margin-bottom:9px}.ea-opt{display:block;width:100%;text-align:left;margin:5px 0;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.1);background:#09233f;color:#fff;cursor:pointer}.ea-opt.selected{border-color:#00efff}.ea-opt.correct{border-color:#00ffad;background:rgba(0,255,173,.12)}.ea-opt.wrong{border-color:#ff416c;background:rgba(255,65,108,.1)}.ea-check{margin-top:10px;padding:12px 18px;border:0;border-radius:11px;background:linear-gradient(135deg,#0878ff,#00cfe8);color:#fff;font-weight:1000;cursor:pointer}.ea-result{margin-top:10px;padding:12px;border-radius:11px;color:#00ffad;background:rgba(0,255,173,.08)}
      #ewmAccessible .ea-empty{padding:30px;text-align:center;color:#91a8bb}.ea-muted{color:#91a8bb}
      @media(max-width:1000px){#ewmAccessible .ea-nav{grid-template-columns:repeat(4,1fr)}#ewmAccessible .ea-words{grid-template-columns:repeat(3,1fr)}}
      @media(max-width:650px){#ewmAccessible .ea-nav{grid-template-columns:repeat(2,1fr)}#ewmAccessible .ea-words{grid-template-columns:repeat(2,1fr)}#ewmAccessible .ea-search{min-width:100%;max-width:none}}
    `;
    document.head.appendChild(s);
  }

  async function load() {
    const auth = await DB.auth.getUser();
    if (auth.error || !auth.data || !auth.data.user) return false;
    const profile = await DB.from('profiles').select('role,grade').eq('user_id', auth.data.user.id).maybeSingle();
    if (profile.error) throw profile.error;
    const role = String(profile.data?.role || '').trim().toLowerCase();
    const assigned = Number(profile.data?.grade || 0);
    if (role === 'student' && assigned !== grade) return false;
    if (role !== 'student' && role !== 'teacher' && role !== 'parent') return false;

    const lessons = await DB.from('lessons').select('id,grade,lesson_number,title,topic,description,image_url,audio_url,grammar_rule,grammar_examples,listening_text,speaking_phrases,reading_text,exercises').eq('grade', grade).order('lesson_number', {ascending:true});
    if (lessons.error) throw lessons.error;
    state.lessons = lessons.data || [];
    const ids = state.lessons.map(x => x.id).filter(Boolean);
    if (ids.length) {
      const [words, quizzes] = await Promise.all([
        DB.from('lesson_words').select('id,lesson_id,word,translation,emoji,image_url,audio_url,sort_order').in('lesson_id', ids).order('sort_order', {ascending:true}),
        DB.from('lesson_quizzes').select('id,lesson_id,question,options,correct_answer,sort_order').in('lesson_id', ids).order('sort_order', {ascending:true})
      ]);
      if (words.error) throw words.error;
      if (quizzes.error) throw quizzes.error;
      state.words = words.data || [];
      state.quizzes = quizzes.data || [];
    }
    return true;
  }

  function wordsFor(id) { return state.words.filter(w => w.lesson_id === id); }
  function quizzesFor(id) { return state.quizzes.filter(q => q.lesson_id === id); }
  function correct(q, opts) {
    const raw = q.correct_answer;
    if (raw == null) return '';
    const v = String(raw);
    if (opts.includes(v)) return v;
    const n = Number(raw);
    if (Number.isInteger(n) && n >= 0 && n < opts.length) return opts[n];
    if (Number.isInteger(n) && n >= 1 && n <= opts.length) return opts[n - 1];
    return v;
  }
  function itemList(value) {
    const items = arr(value);
    if (!items.length) return '<div class="ea-empty">No material available.</div>';
    return `<div class="ea-items">${items.map((x,i)=>{
      if (x && typeof x === 'object') {
        const title = x.title || x.question || x.instruction || x.task || `Item ${i+1}`;
        const body = x.text || x.description || x.content || x.example || x.answer || '';
        return `<div class="ea-item"><b>${esc(title)}</b>${body ? `<div class="ea-text">${esc(asText(body))}</div>` : ''}</div>`;
      }
      return `<div class="ea-item"><span class="ea-muted">${i+1}.</span> ${esc(asText(x))}</div>`;
    }).join('')}</div>`;
  }
  function renderWords(items) {
    if (!items.length) return '<div class="ea-empty">No words found.</div>';
    return `<div class="ea-words">${items.map(w=>`<div class="ea-word">${w.audio_url?`<button class="ea-audio" data-audio="${esc(w.audio_url)}">🔊</button>`:''}<strong>${esc(w.emoji || '🔤')} ${esc(w.word)}</strong><small>${esc(w.translation || '')}</small>${w.image_url?`<img src="${esc(w.image_url)}" alt="${esc(w.word)}" loading="lazy">`:''}</div>`).join('')}</div>`;
  }
  function renderSection(lesson, section) {
    const c = content(lesson);
    if (section === 'words') return `<div class="ea-card"><h4>🔤 Words — ${wordsFor(lesson.id).length}</h4>${renderWords(wordsFor(lesson.id))}</div>`;
    if (section === 'grammar' && c.grammar) return `<div class="ea-card"><h4>📘 Grammar</h4>${lesson.grammar_rule?`<div class="ea-text">${esc(lesson.grammar_rule)}</div>`:''}${lesson.grammar_examples?`<div style="margin-top:10px"><b>Examples</b>${itemList(lesson.grammar_examples)}</div>`:''}</div>`;
    if (section === 'listening' && c.listening) return `<div class="ea-card"><h4>🎧 Listening</h4>${lesson.listening_text?`<div class="ea-text">${esc(lesson.listening_text)}</div>`:''}${lesson.audio_url?`<div style="margin-top:10px"><audio controls preload="none" src="${esc(lesson.audio_url)}" style="width:100%"></audio></div>`:''}</div>`;
    if (section === 'speaking' && c.speaking) return `<div class="ea-card"><h4>🗣️ Speaking</h4>${itemList(lesson.speaking_phrases)}</div>`;
    if (section === 'reading' && c.reading) return `<div class="ea-card"><h4>📖 Reading</h4><div class="ea-text">${esc(lesson.reading_text)}</div></div>`;
    if (section === 'exercises' && c.exercises) return `<div class="ea-card"><h4>📝 Exercises</h4>${itemList(lesson.exercises)}</div>`;
    if (section === 'quiz') return renderQuiz(lesson);
    return '';
  }
  function renderQuiz(lesson) {
    const qs = quizzesFor(lesson.id);
    if (!qs.length) return '<div class="ea-card"><h4>🎯 Quiz</h4><div class="ea-empty">No quiz questions found.</div></div>';
    return `<div class="ea-card"><h4>🎯 Quiz — ${qs.length} questions</h4><div class="ea-quiz">${qs.map((q,i)=>{const opts=arr(q.options).map(asText).filter(Boolean);const selected=state.answers[q.id];const ok=correct(q,opts);return `<div class="ea-q"><b>${i+1}. ${esc(q.question)}</b>${opts.map(o=>`<button class="ea-opt ${selected===o?'selected':''} ${state.checked&&o===ok?'correct':''} ${state.checked&&selected===o&&o!==ok?'wrong':''}" data-qid="${esc(q.id)}" data-answer="${esc(o)}" ${state.checked?'disabled':''}>${selected===o?'◉ ':'○ '}${esc(o)}</button>`).join('')}</div>`;}).join('')}</div>${state.checked?`<div class="ea-result">Score: ${qs.reduce((n,q)=>n+(state.answers[q.id]===correct(q,arr(q.options).map(asText))?1:0),0)} / ${qs.length}</div>`:'<button class="ea-check" id="eaCheckQuiz">CHECK QUIZ</button>'}</div>`;
  }

  function matches(lesson) {
    const q = state.search.trim().toLowerCase();
    if (!q) return true;
    return [lesson.title,lesson.topic,lesson.description,lesson.grammar_rule,lesson.grammar_examples,lesson.listening_text,lesson.speaking_phrases,lesson.reading_text,lesson.exercises, ...wordsFor(lesson.id).map(w=>`${w.word} ${w.translation||''}`)].map(asText).join(' ').toLowerCase().includes(q);
  }
  function hasSection(lesson, section) {
    if (section === 'all') return true;
    if (section === 'words') return wordsFor(lesson.id).length > 0;
    if (section === 'quiz') return quizzesFor(lesson.id).length > 0;
    return content(lesson)[section];
  }
  function render() {
    const host = document.getElementById('ewmAccessible');
    if (!host) return;
    const sections = [['all','📚','ALL'],['words','🔤','ALL WORDS'],['grammar','📘','GRAMMAR'],['listening','🎧','LISTENING'],['speaking','🗣️','SPEAKING'],['reading','📖','READING'],['exercises','📝','EXERCISES'],['quiz','🎯','QUIZ']];
    const visible = state.lessons.filter(l=>matches(l)&&hasSection(l,state.section));
    host.innerHTML = `<div class="ea-nav">${sections.map(s=>`<button class="ea-btn ${state.section===s[0]?'active':''}" data-ea-section="${s[0]}">${s[1]}<br>${s[2]}</button>`).join('')}</div><div class="ea-panel"><div class="ea-head"><div><div class="ea-title">${state.section==='all'?'All Learning Material':sections.find(s=>s[0]===state.section)?.[2] || 'Material'}</div><div class="ea-sub">Grade ${grade} • ${visible.length} lesson${visible.length===1?'':'s'} • პირდაპირ ხელმისაწვდომი მასალა</div></div><input class="ea-search" id="eaSearch" value="${esc(state.search)}" placeholder="🔎 Search this material..."></div><div class="ea-lessons">${visible.length?visible.map(l=>{const sectionsToShow=state.section==='all'?['grammar','listening','speaking','reading','exercises','words','quiz']:[state.section];return `<article class="ea-lesson"><div class="ea-lesson-head"><div><h3>${esc(l.title||'Untitled lesson')}</h3><div class="ea-topic">${esc(l.topic||'English')}</div></div><div class="ea-number">LESSON ${esc(l.lesson_number)}</div></div>${l.description?`<div class="ea-text" style="margin-top:8px">${esc(l.description)}</div>`:''}${sectionsToShow.map(s=>renderSection(l,s)).join('')}</article>`;}).join(''):'<div class="ea-empty">🔎 ამ ძიებით ან კატეგორიით მასალა ვერ მოიძებნა.</div>'}</div></div>`;
    host.querySelectorAll('[data-ea-section]').forEach(b=>b.addEventListener('click',()=>{state.section=b.dataset.eaSection;state.checked=false;render();}));
    const search=document.getElementById('eaSearch'); if(search){search.addEventListener('input',()=>{state.search=search.value;render();const n=document.getElementById('eaSearch');if(n){n.focus();n.setSelectionRange(state.search.length,state.search.length);}});}
    host.querySelectorAll('[data-audio]').forEach(b=>b.addEventListener('click',()=>new Audio(b.dataset.audio).play().catch(()=>{})));
    host.querySelectorAll('.ea-opt:not([disabled])').forEach(b=>b.addEventListener('click',()=>{state.answers[b.dataset.qid]=b.dataset.answer;render();}));
    const check=document.getElementById('eaCheckQuiz'); if(check) check.addEventListener('click',()=>{state.checked=true;render();});
  }

  async function boot() {
    try {
      style();
      const ok = await load();
      if (!ok) return;
      const old = document.getElementById('lessonGrid');
      if (old) old.style.display = 'none';
      const host = document.createElement('section');
      host.id = 'ewmAccessible';
      const grid = document.getElementById('lessonGrid');
      if (grid && grid.parentNode) grid.parentNode.insertBefore(host, grid);
      else document.querySelector('main')?.appendChild(host);
      render();
    } catch (e) {
      console.error('[English with Mariami] Accessible material:', e);
      const host = document.getElementById('ewmAccessible');
      if (host) host.innerHTML = '<div class="ea-panel"><div class="ea-empty">მასალის ჩატვირთვა ვერ მოხერხდა. გთხოვ Refresh სცადე.</div></div>';
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
