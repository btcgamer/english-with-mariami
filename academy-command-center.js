(() => {
  'use strict';

  /* MAGIC NEON ACADEMY — read-only Command Center. */
  const isAcademy = /(?:^|\/)academy\.html$/.test((window.location.pathname || '').toLowerCase());
  if (!isAcademy || document.documentElement.dataset.ewmCommandCenter === '1') return;
  document.documentElement.dataset.ewmCommandCenter = '1';

  const $ = (selector) => document.querySelector(selector);
  const numberOrZero = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const waitForClient = async () => {
    const existing = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient || null;
    if (existing) return existing;
    await new Promise((resolve) => {
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      window.addEventListener('englishMariamiSupabaseReady', finish, { once: true });
      window.setTimeout(finish, 5000);
    });
    return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT || window.supabaseClient || null;
  };

  const style = document.createElement('style');
  style.dataset.ewmCommandCenterStyle = '1';
  style.textContent = `
    .future-command-center{position:relative;margin-top:22px;padding:18px;border:1px solid rgba(0,234,255,.32);border-radius:20px;background:linear-gradient(145deg,rgba(0,234,255,.07),rgba(139,92,255,.07) 55%,rgba(255,54,217,.05));box-shadow:inset 0 0 28px rgba(0,234,255,.045),0 0 28px rgba(0,234,255,.08);overflow:hidden}
    .future-command-center::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(0,234,255,.12),transparent);transform:translateX(-100%);animation:ewmHudSweep 7s linear infinite;pointer-events:none}
    .future-command-center__head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
    .future-command-center__title{font-weight:1000;letter-spacing:.7px;color:#fff;text-shadow:0 0 12px #00eaff}
    .future-command-center__status{font-size:11px;font-weight:900;color:#ffe600;padding:6px 9px;border:1px solid rgba(255,230,0,.3);border-radius:999px;background:rgba(255,230,0,.06)}
    .future-command-center__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .future-hud-stat{min-height:86px;padding:13px;border:1px solid rgba(0,234,255,.18);border-radius:15px;background:rgba(1,12,27,.62);text-align:center}
    .future-hud-stat b{display:block;font-size:25px;color:#fff;text-shadow:0 0 13px #00eaff;margin-bottom:4px}
    .future-hud-stat span{font-size:11px;color:#bdebf7}
    .future-missions{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
    .future-mission{padding:11px 12px;border-radius:14px;border:1px solid rgba(139,92,255,.22);background:rgba(8,22,45,.58);font-size:12px;color:#d9f7ff}
    .future-mission b{display:block;color:#ffe600;margin-bottom:4px}
    .future-mission.is-done{border-color:rgba(0,234,255,.42);box-shadow:0 0 15px rgba(0,234,255,.08)}
    .future-mission__bar{height:5px;margin-top:8px;border-radius:10px;background:#020914;overflow:hidden}
    .future-mission__bar i{display:block;height:100%;border-radius:10px;background:linear-gradient(90deg,#00eaff,#008cff,#8b5cff);box-shadow:0 0 10px rgba(0,234,255,.5)}
    @keyframes ewmHudSweep{to{transform:translateX(100%)}}
    @media(max-width:650px){.future-command-center{padding:14px}.future-command-center__grid{grid-template-columns:repeat(2,1fr)}.future-missions{grid-template-columns:1fr}.future-command-center__head{align-items:flex-start;flex-direction:column}}
    @media(prefers-reduced-motion:reduce){.future-command-center::before{animation:none}}
  `;
  document.head.appendChild(style);

  function injectHud() {
    const box = $('.progress-box');
    if (!box || $('#future-command-center')) return;
    const hud = document.createElement('div');
    hud.id = 'future-command-center';
    hud.className = 'future-command-center';
    hud.innerHTML = `
      <div class="future-command-center__head">
        <div class="future-command-center__title">🧠 FUTURE COMMAND CENTER</div>
        <div class="future-command-center__status" id="hud-status">SYNCING • READ ONLY</div>
      </div>
      <div class="future-command-center__grid">
        <div class="future-hud-stat"><b id="hud-xp">0</b><span>⚡ XP</span></div>
        <div class="future-hud-stat"><b id="hud-stars">0</b><span>⭐ STARS</span></div>
        <div class="future-hud-stat"><b id="hud-streak">0</b><span>🔥 CURRENT STREAK</span></div>
        <div class="future-hud-stat"><b id="hud-best-streak">0</b><span>🏆 BEST STREAK</span></div>
      </div>
      <div class="future-missions">
        <div class="future-mission" id="mission-lessons"><b>🎯 LESSON MISSION</b><span>0 completed</span><div class="future-mission__bar"><i style="width:0%"></i></div></div>
        <div class="future-mission" id="mission-quizzes"><b>🧪 QUIZ MISSION</b><span>0 completed</span><div class="future-mission__bar"><i style="width:0%"></i></div></div>
        <div class="future-mission" id="mission-stars"><b>✨ STAR MISSION</b><span>0 earned</span><div class="future-mission__bar"><i style="width:0%"></i></div></div>
      </div>`;
    box.appendChild(hud);
  }

  function setHudValue(id, value) {
    const el = $('#' + id);
    if (el) el.textContent = String(value);
  }

  function setMission(id, text, percent, done) {
    const el = $('#' + id);
    if (!el) return;
    const span = el.querySelector('span');
    const bar = el.querySelector('i');
    if (span) span.textContent = text;
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    el.classList.toggle('is-done', !!done);
  }

  async function load() {
    injectHud();
    const client = await waitForClient();
    if (!client) return;

    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError || !sessionData?.session?.user) return;
    const user = sessionData.session.user;

    const profileResult = await client.from('profiles').select('grade,points').eq('user_id', user.id).maybeSingle();
    if (profileResult.error) { console.warn('Command Center profile read:', profileResult.error); return; }
    const grade = Number(profileResult.data?.grade || user.user_metadata?.grade || 0);
    if (![2,3,4].includes(grade)) return;

    const [lessonsResult, quizzesResult, streakResult] = await Promise.all([
      client.from('lesson_progress').select('lesson_id,completed,score').eq('student_id', user.id).eq('grade', grade),
      client.from('quiz_results').select('quiz_id,score,total,completed_at').eq('student_id', user.id).eq('grade', grade).order('completed_at', { ascending: false }),
      client.from('academy_streaks').select('current_streak,best_streak').eq('student_id', user.id).maybeSingle()
    ]);

    const lessons = Array.isArray(lessonsResult.data) ? lessonsResult.data : [];
    const quizzes = Array.isArray(quizzesResult.data) ? quizzesResult.data : [];
    const streak = streakResult.data || {};

    const completedLessonIds = new Set(lessons.filter(r => r?.completed === true && r?.lesson_id).map(r => String(r.lesson_id)));
    const lessonIds = new Set(lessons.filter(r => r?.lesson_id).map(r => String(r.lesson_id)));

    /* One quiz counts once: use the best existing attempt for each quiz ID. */
    const bestQuizById = new Map();
    for (const row of quizzes) {
      const id = row?.quiz_id ? String(row.quiz_id) : '';
      const total = Number(row?.total);
      const score = Number(row?.score);
      if (!id || total <= 0 || !Number.isFinite(score)) continue;
      const safeScore = Math.max(0, Math.min(score, total));
      const previous = bestQuizById.get(id);
      if (!previous || safeScore / total > previous.score / previous.total) {
        bestQuizById.set(id, { score: safeScore, total });
      }
    }

    const quizCount = bestQuizById.size;
    const perfectQuizzes = [...bestQuizById.values()].filter(r => r.score >= r.total).length;
    const completedLessons = completedLessonIds.size;
    const stars = (completedLessons * 1) + (perfectQuizzes * 2);
    const xp = Math.round(numberOrZero(profileResult.data?.points));

    const lessonTarget = Math.max(5, lessonIds.size || 5);
    const quizTarget = Math.max(5, quizCount || 5);
    const starTarget = 10;
    const currentStreak = Math.round(numberOrZero(streak.current_streak));
    const bestStreak = Math.round(numberOrZero(streak.best_streak));

    setHudValue('hud-xp', xp.toLocaleString());
    setHudValue('hud-stars', stars);
    setHudValue('hud-streak', currentStreak);
    setHudValue('hud-best-streak', bestStreak);

    setMission('mission-lessons', `${completedLessons}/${lessonTarget} completed`, completedLessons / lessonTarget * 100, completedLessons >= lessonTarget);
    setMission('mission-quizzes', `${quizCount}/${quizTarget} completed`, quizCount / quizTarget * 100, quizCount >= quizTarget);
    setMission('mission-stars', `${stars}/${starTarget} earned`, stars / starTarget * 100, stars >= starTarget);

    const status = $('#hud-status');
    if (status) status.textContent = '● LIVE • READ ONLY';
  }

  const start = () => load().catch(error => console.error('Command Center error:', error));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
