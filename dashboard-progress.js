/* =========================================================
   ENGLISH WITH MARIAMI
   FUTURISTIC STUDENT ANALYTICS CENTER
   Teacher Dashboard — Supabase Progress Engine
   ========================================================= */

(function () {
  'use strict';

  const db =
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
    window.supabaseClient;

  if (!db) {
    console.warn('Supabase client not found.');
    return;
  }

  const path = (location.pathname || '').toLowerCase();

  if (!path.includes('teacher-dashboard.html')) {
    return;
  }


  /* =======================================================
     CONFIG
  ======================================================= */

  const CONFIG = {
    grades: {
      2: {
        icon: '🌱',
        title: 'Grade 2',
        maxWords: 300,
        color: '#00eaff'
      },

      3: {
        icon: '🚀',
        title: 'Grade 3',
        maxWords: 250,
        color: '#8b5cf6'
      },

      4: {
        icon: '⭐',
        title: 'Grade 4',
        maxWords: 250,
        color: '#ffe600'
      }
    },

    maxAttempts: 200
  };


  /* =======================================================
     HELPERS
  ======================================================= */

  const esc = value =>
    String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  const num = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const clamp = (value, min = 0, max = 100) =>
    Math.max(min, Math.min(max, value));

  const average = values => {
    if (!values.length) return 0;
    return Math.round(
      values.reduce((a, b) => a + num(b), 0) / values.length
    );
  };

  const formatDate = value => {
    if (!value) return '—';

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
      return '—';
    }

    return d.toLocaleString('ka-GE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const gradeConfig = grade =>
    CONFIG.grades[num(grade)] || {
      icon: '📘',
      title: `Grade ${grade}`,
      maxWords: 250,
      color: '#00eaff'
    };


  /* =======================================================
     CSS
  ======================================================= */

  function injectCSS() {

    if (document.getElementById('future-analytics-css')) {
      return;
    }

    const style = document.createElement('style');

    style.id = 'future-analytics-css';

    style.textContent = `

    /* =====================================================
       FUTURISTIC ANALYTICS
    ===================================================== */

    .fa-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 18px;

      background:
        radial-gradient(
          circle at 20% 20%,
          rgba(0,234,255,.10),
          transparent 30%
        ),
        radial-gradient(
          circle at 80% 80%,
          rgba(139,92,246,.12),
          transparent 35%
        ),
        rgba(1,5,15,.94);

      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);

      animation: faFade .25s ease;
    }

    @keyframes faFade {
      from {
        opacity: 0;
      }

      to {
        opacity: 1;
      }
    }


    .fa-modal {
      width: min(1280px, 100%);
      max-height: 95vh;

      overflow-x: hidden;
      overflow-y: auto;

      color: #fff;

      background:
        linear-gradient(
          145deg,
          rgba(5,20,42,.98),
          rgba(2,10,25,.98)
        );

      border:
        1px solid rgba(0,234,255,.30);

      border-radius: 28px;

      box-shadow:
        0 0 30px rgba(0,234,255,.10),
        0 0 90px rgba(0,234,255,.06),
        inset 0 0 50px rgba(0,234,255,.025);

      scrollbar-width: thin;
    }


    .fa-wrap {
      padding: 26px;
    }


    /* =====================================================
       HEADER
    ===================================================== */

    .fa-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 20px;

      padding-bottom: 22px;

      border-bottom:
        1px solid rgba(255,255,255,.08);
    }


    .fa-profile {
      display: flex;
      align-items: center;

      gap: 15px;

      min-width: 0;
    }


    .fa-avatar {
      width: 64px;
      height: 64px;

      flex: 0 0 64px;

      display: flex;
      align-items: center;
      justify-content: center;

      border-radius: 20px;

      font-size: 30px;

      background:
        linear-gradient(
          135deg,
          rgba(0,234,255,.16),
          rgba(139,92,246,.18)
        );

      border:
        1px solid rgba(0,234,255,.30);

      box-shadow:
        0 0 25px rgba(0,234,255,.12);
    }


    .fa-profile h2 {
      margin: 0;

      font-size: 24px;

      overflow-wrap: anywhere;
    }


    .fa-profile small {
      display: block;

      margin-top: 5px;

      color: #82a7b8;

      font-size: 12px;
    }


    .fa-close {
      min-height: 44px;

      border: 1px solid rgba(255,255,255,.10);

      border-radius: 12px;

      padding: 10px 16px;

      color: #fff;

      background:
        rgba(255,255,255,.05);

      cursor: pointer;

      transition:
        .2s ease;
    }


    .fa-close:hover {
      border-color: #00eaff;

      box-shadow:
        0 0 18px rgba(0,234,255,.18);

      transform: translateY(-1px);
    }


    /* =====================================================
       HERO SCORE
    ===================================================== */

    .fa-hero {
      display: grid;

      grid-template-columns:
        minmax(230px, .8fr)
        minmax(0, 2fr);

      gap: 18px;

      margin-top: 20px;
    }


    .fa-main-score {
      position: relative;

      min-height: 250px;

      display: flex;
      flex-direction: column;

      align-items: center;
      justify-content: center;

      overflow: hidden;

      border-radius: 24px;

      background:
        radial-gradient(
          circle,
          rgba(0,234,255,.13),
          transparent 65%
        ),
        rgba(4,22,42,.85);

      border:
        1px solid rgba(0,234,255,.20);
    }


    .fa-main-score::before {
      content: '';

      position: absolute;

      inset: -50%;

      background:
        conic-gradient(
          from 0deg,
          transparent,
          rgba(0,234,255,.12),
          transparent,
          rgba(139,92,246,.10),
          transparent
        );

      animation:
        faRotate 8s linear infinite;
    }


    @keyframes faRotate {
      to {
        transform: rotate(360deg);
      }
    }


    .fa-score-ring {
      position: relative;

      width: 150px;
      height: 150px;

      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      background:
        radial-gradient(
          circle,
          #06182c 58%,
          transparent 60%
        );

      border:
        7px solid rgba(0,234,255,.16);

      box-shadow:
        0 0 30px rgba(0,234,255,.15),
        inset 0 0 30px rgba(0,234,255,.08);
    }


    .fa-score-number {
      font-size: 40px;
      font-weight: 1000;

      color: #00eaff;

      text-shadow:
        0 0 20px rgba(0,234,255,.45);
    }


    .fa-score-label {
      position: relative;

      margin-top: 10px;

      color: #9db8c4;

      font-size: 12px;

      text-transform: uppercase;
      letter-spacing: 1px;
    }


    /* =====================================================
       KPI GRID
    ===================================================== */

    .fa-kpis {
      display: grid;

      grid-template-columns:
        repeat(4, minmax(0, 1fr));

      gap: 12px;
    }


    .fa-kpi {
      min-width: 0;

      padding: 18px;

      border-radius: 18px;

      background:
        linear-gradient(
          145deg,
          rgba(8,32,57,.90),
          rgba(3,16,32,.90)
        );

      border:
        1px solid rgba(255,255,255,.07);

      transition:
        transform .2s ease,
        border-color .2s ease,
        box-shadow .2s ease;
    }


    .fa-kpi:hover {
      transform: translateY(-3px);

      border-color:
        rgba(0,234,255,.30);

      box-shadow:
        0 10px 30px rgba(0,0,0,.25),
        0 0 20px rgba(0,234,255,.06);
    }


    .fa-kpi-icon {
      font-size: 25px;
    }


    .fa-kpi-value {
      margin-top: 8px;

      font-size: 27px;
      font-weight: 1000;
    }


    .fa-kpi-label {
      margin-top: 4px;

      color: #7896a4;

      font-size: 11px;
    }


    /* =====================================================
       SECTION
    ===================================================== */

    .fa-section {
      margin-top: 20px;

      padding: 19px;

      border-radius: 22px;

      background:
        rgba(5,22,41,.72);

      border:
        1px solid rgba(255,255,255,.07);
    }


    .fa-section-title {
      display: flex;

      align-items: center;
      justify-content: space-between;

      gap: 10px;

      margin-bottom: 15px;
    }


    .fa-section-title h3 {
      margin: 0;

      font-size: 17px;
    }


    .fa-section-title span {
      color: #6f909f;

      font-size: 11px;
    }


    /* =====================================================
       GRADE CARDS
    ===================================================== */

    .fa-grades {
      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 14px;
    }


    .fa-grade {
      position: relative;

      overflow: hidden;

      padding: 18px;

      border-radius: 20px;

      background:
        linear-gradient(
          145deg,
          rgba(7,29,52,.95),
          rgba(3,15,30,.95)
        );

      border:
        1px solid rgba(255,255,255,.07);
    }


    .fa-grade-top {
      display: flex;

      align-items: center;
      justify-content: space-between;
    }


    .fa-grade-name {
      display: flex;

      align-items: center;

      gap: 8px;

      font-size: 17px;
      font-weight: 900;
    }


    .fa-grade-percent {
      font-size: 22px;

      font-weight: 1000;

      color: #ffe600;
    }


    .fa-progress {
      width: 100%;
      height: 10px;

      margin: 15px 0;

      overflow: hidden;

      border-radius: 20px;

      background: #01101e;
    }


    .fa-progress > i {
      display: block;

      width: 0%;
      height: 100%;

      border-radius: inherit;

      background:
        linear-gradient(
          90deg,
          #0874ff,
          #00eaff,
          #ffe600
        );

      box-shadow:
        0 0 15px rgba(0,234,255,.35);

      transition:
        width 1s cubic-bezier(.2,.8,.2,1);
    }


    .fa-grade-stats {
      display: grid;

      grid-template-columns:
        repeat(3, 1fr);

      gap: 6px;
    }


    .fa-mini-stat {
      padding: 9px 6px;

      border-radius: 10px;

      text-align: center;

      background:
        rgba(0,0,0,.20);
    }


    .fa-mini-stat b {
      display: block;

      font-size: 15px;
    }


    .fa-mini-stat span {
      color: #718d99;

      font-size: 9px;
    }


    /* =====================================================
       CHARTS
    ===================================================== */

    .fa-charts {
      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 12px;
    }


    .fa-chart-card {
      padding: 15px;

      border-radius: 17px;

      background:
        rgba(2,13,28,.8);

      border:
        1px solid rgba(0,234,255,.08);
    }


    .fa-chart-header {
      display: flex;

      justify-content: space-between;

      gap: 10px;

      margin-bottom: 10px;
    }


    .fa-chart-header b {
      font-size: 14px;
    }


    .fa-chart-header span {
      color: #00eaff;

      font-weight: 900;
    }


    .fa-svg {
      width: 100%;
      height: 170px;

      display: block;
    }


    .fa-trend {
      margin-top: 7px;

      font-size: 12px;

      font-weight: 900;
    }


    .fa-up {
      color: #5cff9d;
    }


    .fa-down {
      color: #ff7373;
    }


    .fa-flat {
      color: #ffd35c;
    }


    /* =====================================================
       WORD CLOUD
    ===================================================== */

    .fa-word-cloud {
      display: flex;

      flex-wrap: wrap;

      gap: 7px;

      max-height: 210px;

      overflow: auto;
    }


    .fa-word {
      padding: 7px 10px;

      border-radius: 9px;

      color: #bfeef5;

      background:
        linear-gradient(
          135deg,
          rgba(0,234,255,.09),
          rgba(139,92,246,.09)
        );

      border:
        1px solid rgba(0,234,255,.10);

      font-size: 11px;
    }


    /* =====================================================
       QUIZ HISTORY
    ===================================================== */

    .fa-history {
      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 12px;
    }


    .fa-history-card {
      border-radius: 16px;

      background:
        rgba(2,14,29,.8);

      overflow: hidden;
    }


    .fa-history-title {
      padding: 13px;

      font-weight: 900;

      border-bottom:
        1px solid rgba(255,255,255,.06);
    }


    .fa-history-list {
      max-height: 280px;

      overflow-y: auto;
    }


    .fa-history-row {
      display: flex;

      align-items: center;
      justify-content: space-between;

      gap: 10px;

      padding: 10px 13px;

      border-bottom:
        1px solid rgba(255,255,255,.04);

      font-size: 11px;
    }


    .fa-history-date {
      color: #718d99;
    }


    .fa-history-score {
      color: #ffe600;

      font-weight: 1000;
    }


    /* =====================================================
       ACHIEVEMENTS
    ===================================================== */

    .fa-achievements {
      display: grid;

      grid-template-columns:
        repeat(6, minmax(0, 1fr));

      gap: 10px;
    }


    .fa-badge {
      min-width: 0;

      padding: 13px 8px;

      border-radius: 16px;

      text-align: center;

      background:
        linear-gradient(
          145deg,
          rgba(9,43,78,.85),
          rgba(4,21,40,.85)
        );

      border:
        1px solid rgba(0,234,255,.13);

      transition:
        .2s ease;
    }


    .fa-badge:hover {
      transform: translateY(-3px);

      box-shadow:
        0 0 20px rgba(0,234,255,.10);
    }


    .fa-badge.locked {
      opacity: .28;

      filter:
        grayscale(1);
    }


    .fa-badge-icon {
      display: block;

      font-size: 29px;
    }


    .fa-badge b {
      display: block;

      margin-top: 6px;

      font-size: 11px;
    }


    .fa-badge small {
      display: block;

      margin-top: 4px;

      color: #718d99;

      font-size: 9px;
    }


    /* =====================================================
       INSIGHTS
    ===================================================== */

    .fa-insights {
      display: grid;

      grid-template-columns:
        repeat(3, minmax(0, 1fr));

      gap: 12px;
    }


    .fa-insight {
      padding: 16px;

      border-radius: 16px;

      background:
        rgba(2,14,29,.85);

      border:
        1px solid rgba(255,255,255,.06);
    }


    .fa-insight-icon {
      font-size: 25px;
    }


    .fa-insight b {
      display: block;

      margin-top: 7px;

      font-size: 13px;
    }


    .fa-insight p {
      margin: 6px 0 0;

      color: #7896a4;

      font-size: 11px;

      line-height: 1.5;
    }


    /* =====================================================
       MOBILE
    ===================================================== */

    @media(max-width: 1000px) {

      .fa-kpis {
        grid-template-columns:
          repeat(2, 1fr);
      }

      .fa-grades,
      .fa-charts,
      .fa-history {
        grid-template-columns:
          repeat(2, 1fr);
      }

      .fa-achievements {
        grid-template-columns:
          repeat(3, 1fr);
      }

      .fa-insights {
        grid-template-columns:
          repeat(2, 1fr);
      }
    }


    @media(max-width: 650px) {

      .fa-overlay {
        padding: 7px;
      }

      .fa-modal {
        max-height: 97vh;

        border-radius: 20px;
      }

      .fa-wrap {
        padding: 13px;
      }

      .fa-header {
        align-items: flex-start;
      }

      .fa-profile h2 {
        font-size: 19px;
      }

      .fa-avatar {
        width: 52px;
        height: 52px;

        flex-basis: 52px;

        font-size: 24px;
      }

      .fa-hero {
        grid-template-columns: 1fr;
      }

      .fa-main-score {
        min-height: 210px;
      }

      .fa-kpis,
      .fa-grades,
      .fa-charts,
      .fa-history,
      .fa-insights {
        grid-template-columns: 1fr;
      }

      .fa-achievements {
        grid-template-columns:
          repeat(2, 1fr);
      }

      .fa-section {
        padding: 13px;
      }

      .fa-grade-stats {
        gap: 4px;
      }

      .fa-history-row {
        font-size: 10px;
      }
    }


    @media(max-width: 380px) {

      .fa-wrap {
        padding: 9px;
      }

      .fa-score-ring {
        width: 125px;
        height: 125px;
      }

      .fa-score-number {
        font-size: 32px;
      }

      .fa-achievements {
        grid-template-columns: 1fr;
      }
    }

    `;

    document.head.appendChild(style);
  }


  /* =======================================================
     SCORE EXTRACTION
  ======================================================= */

  function getScore(row) {

    return clamp(
      num(
        row?.score ??
        row?.best_score ??
        row?.percentage ??
        row?.result ??
        0
      )
    );
  }


  /* =======================================================
     BUILD DATA
  ======================================================= */

  function buildGradeData(rows, attempts) {

    return [2, 3, 4].map(grade => {

      const progress =
        rows.find(
          row => num(row.grade) === grade
        ) || {};

      const gradeAttempts =
        attempts
          .filter(
            row => num(row.grade) === grade
          )
          .sort(
            (a, b) =>
              new Date(a.created_at || 0) -
              new Date(b.created_at || 0)
          );

      const words =
        Array.isArray(progress.learned_words)
          ? progress.learned_words
          : [];

      const wordCount = Math.max(
        num(progress.words_learned),
        words.length
      );

      const scores =
        gradeAttempts.map(getScore);

      const best =
        Math.max(
          num(progress.best_quiz),
          ...scores,
          0
        );

      const avg =
        average(scores);

      const maxWords =
        gradeConfig(grade).maxWords;

      const progressPercent =
        clamp(
          Math.round(
            (wordCount / maxWords) * 100
          )
        );

      return {
        grade,
        config: gradeConfig(grade),

        words,
        wordCount,

        quizzes:
          Math.max(
            num(progress.quiz_completed),
            gradeAttempts.length
          ),

        best,
        average: avg,

        scores,
        attempts: gradeAttempts,

        progressPercent,

        updatedAt:
          progress.updated_at ||
          gradeAttempts.at(-1)?.created_at ||
          null
      };
    });
  }


  /* =======================================================
     OVERALL ANALYTICS
  ======================================================= */

  function buildOverall(grades, attempts) {

    const totalWords =
      grades.reduce(
        (sum, grade) =>
          sum + grade.wordCount,
        0
      );

    const uniqueWords = [
      ...new Set(
        grades.flatMap(
          grade => grade.words
        )
      )
    ];

    const scores =
      attempts.map(getScore);

    const best =
      Math.max(
        0,
        ...grades.map(g => g.best),
        ...scores
      );

    const avg =
      average(scores);

    const completedGrades =
      grades.filter(
        g => g.progressPercent >= 100
      ).length;

    const totalPossible =
      grades.reduce(
        (sum, g) =>
          sum + g.config.maxWords,
        0
      );

    const overallPercent =
      totalPossible
        ? clamp(
            Math.round(
              (totalWords / totalPossible) *
              100
            )
          )
        : 0;

    const xp =
      totalWords * 10 +
      scores.reduce(
        (sum, score) =>
          sum + score,
        0
      ) +
      completedGrades * 500;

    const level =
      Math.max(
        1,
        Math.floor(xp / 1000) + 1
      );

    return {
      totalWords,
      uniqueWords:
        uniqueWords.length ||
        totalWords,

      quizzes:
        attempts.length,

      best,
      average: avg,

      completedGrades,

      overallPercent,

      xp,
      level
    };
  }


  /* =======================================================
     TREND
  ======================================================= */

  function calculateTrend(attempts) {

    const scores =
      attempts
        .map(getScore)
        .filter(Boolean);

    if (scores.length < 2) {
      return {
        value: 0,
        type: 'flat'
      };
    }

    const half =
      Math.max(
        1,
        Math.floor(scores.length / 2)
      );

    const first =
      average(
        scores.slice(0, half)
      );

    const last =
      average(
        scores.slice(-half)
      );

    return {
      value:
        last - first,

      type:
        last > first
          ? 'up'
          : last < first
            ? 'down'
            : 'flat'
    };
  }


  /* =======================================================
     CHART
  ======================================================= */

  function renderChart(gradeData) {

    if (!gradeData.attempts.length) {

      return `
        <div class="fa-chart-card">

          <div class="fa-chart-header">
            <b>
              ${gradeData.config.icon}
              ${gradeData.config.title}
            </b>

            <span>—</span>
          </div>

          <div style="
            height:170px;
            display:flex;
            align-items:center;
            justify-content:center;
            color:#627f8d;
            font-size:12px;
          ">
            Quiz მონაცემები ჯერ არ არის
          </div>

        </div>
      `;
    }


    const values =
      gradeData.attempts
        .slice(-12)
        .map(getScore);


    const W = 500;
    const H = 190;

    const left = 22;
    const right = 15;
    const top = 18;
    const bottom = 25;

    const usableW =
      W - left - right;

    const usableH =
      H - top - bottom;


    const points =
      values.map(
        (value, index) => {

          const x =
            values.length === 1
              ? W / 2
              : left +
                index *
                (
                  usableW /
                  (values.length - 1)
                );

          const y =
            top +
            (
              100 -
              clamp(value)
            ) *
            (
              usableH / 100
            );

          return [x, y];
        }
      );


    const polyline =
      points
        .map(
          p => p.join(',')
        )
        .join(' ');


    const last =
      values.at(-1) || 0;

    const first =
      values[0] || 0;

    const difference =
      last - first;


    let trendHTML = '';

    if (difference > 0) {

      trendHTML = `
        <div class="fa-trend fa-up">
          📈 გაუმჯობესება +${difference}%
        </div>
      `;

    } else if (difference < 0) {

      trendHTML = `
        <div class="fa-trend fa-down">
          📉 ცვლილება ${difference}%
        </div>
      `;

    } else {

      trendHTML = `
        <div class="fa-trend fa-flat">
          ➡️ შედეგი სტაბილურია
        </div>
      `;
    }


    return `
      <div class="fa-chart-card">

        <div class="fa-chart-header">

          <b>
            ${gradeData.config.icon}
            ${gradeData.config.title}
          </b>

          <span>
            ${last}%
          </span>

        </div>

        <svg
          class="fa-svg"
          viewBox="0 0 ${W} ${H}"
          preserveAspectRatio="none"
        >

          <line
            x1="${left}"
            y1="${top}"
            x2="${W-right}"
            y2="${top}"
            stroke="#ffffff12"
          />

          <line
            x1="${left}"
            y1="${H/2}"
            x2="${W-right}"
            y2="${H/2}"
            stroke="#ffffff10"
          />

          <line
            x1="${left}"
            y1="${H-bottom}"
            x2="${W-right}"
            y2="${H-bottom}"
            stroke="#ffffff12"
          />

          <polyline
            points="${polyline}"
            fill="none"
            stroke="${gradeData.config.color}"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          ${points.map(
            (point, index) => `
              <circle
                cx="${point[0]}"
                cy="${point[1]}"
                r="4"
                fill="#ffe600"
              >
                <title>
                  Quiz ${index + 1}: ${values[index]}%
                </title>
              </circle>
            `
          ).join('')}

        </svg>

        ${trendHTML}

      </div>
    `;
  }


  /* =======================================================
     ACHIEVEMENTS
  ======================================================= */

  function renderAchievements(
    grades,
    overall
  ) {

    const definitions = [

      [
        '🌱',
        'First Word',
        'პირველი სიტყვა',
        overall.totalWords >= 1
      ],

      [
        '📚',
        '50 Words',
        '50 სიტყვა',
        overall.totalWords >= 50
      ],

      [
        '📖',
        '100 Words',
        '100 სიტყვა',
        overall.totalWords >= 100
      ],

      [
        '🔥',
        '200 Words',
        '200 სიტყვა',
        overall.totalWords >= 200
      ],

      [
        '💎',
        '500 Words',
        '500 სიტყვა',
        overall.totalWords >= 500
      ],

      [
        '📝',
        'First Quiz',
        'პირველი Quiz',
        overall.quizzes >= 1
      ],

      [
        '🎯',
        '10 Quizzes',
        '10 Quiz',
        overall.quizzes >= 10
      ],

      [
        '💯',
        'Perfect',
        '100% შედეგი',
        overall.best >= 100
      ],

      [
        '🥇',
        'Elite',
        '90%+ საუკეთესო შედეგი',
        overall.best >= 90
      ],

      [
        '🌟',
        'Grade Master',
        'ერთი Grade დასრულებული',
        overall.completedGrades >= 1
      ],

      [
        '🏅',
        'Double Master',
        'ორი Grade დასრულებული',
        overall.completedGrades >= 2
      ],

      [
        '👑',
        'Ultimate Master',
        'სამივე Grade დასრულებული',
        overall.completedGrades >= 3
      ]
    ];


    const unlocked =
      definitions.filter(
        item => item[3]
      ).length;


    return `
      <div class="fa-section">

        <div class="fa-section-title">

          <h3>
            🏆 Achievement Center
          </h3>

          <span>
            ${unlocked}/${definitions.length}
            unlocked
          </span>

        </div>


        <div class="fa-achievements">

          ${definitions.map(
            item => `

              <div
                class="fa-badge ${
                  item[3] ? '' : 'locked'
                }"
              >

                <span
                  class="fa-badge-icon"
                >
                  ${item[0]}
                </span>

                <b>
                  ${esc(item[1])}
                </b>

                <small>
                  ${
                    item[3]
                      ? '✅ მიღებულია'
                      : '🔒 ' + esc(item[2])
                  }
                </small>

              </div>

            `
          ).join('')}

        </div>

      </div>
    `;
  }


  /* =======================================================
     INSIGHTS
  ======================================================= */

  function renderInsights(
    grades,
    overall,
    trend
  ) {

    const strongest =
      [...grades]
        .sort(
          (a, b) =>
            b.average - a.average
        )[0];


    const weakest =
      [...grades]
        .filter(
          g => g.attempts.length
        )
        .sort(
          (a, b) =>
            a.average - b.average
        )[0];


    return `
      <div class="fa-section">

        <div class="fa-section-title">
          <h3>
            🧠 AI Learning Insights
          </h3>

          <span>
            ავტომატური ანალიზი
          </span>
        </div>


        <div class="fa-insights">

          <div class="fa-insight">

            <div class="fa-insight-icon">
              🟢
            </div>

            <b>
              ${
                strongest
                  ? `${strongest.config.title} — ძლიერი მხარე`
                  : 'სწავლის დაწყება'
              }
            </b>

            <p>
              ${
                strongest
                  ? `საშუალო Quiz შედეგი ${strongest.average}%-ია.`
                  : 'მოსწავლეს ჯერ საკმარისი Quiz მონაცემები არ აქვს.'
              }
            </p>

          </div>


          <div class="fa-insight">

            <div class="fa-insight-icon">
              ${
                trend.type === 'up'
                  ? '📈'
                  : trend.type === 'down'
                    ? '📉'
                    : '➡️'
              }
            </div>

            <b>
              ${
                trend.type === 'up'
                  ? 'შედეგი უმჯობესდება'
                  : trend.type === 'down'
                    ? 'საჭიროა დამატებითი პრაქტიკა'
                    : 'შედეგი სტაბილურია'
              }
            </b>

            <p>
              ${
                trend.value > 0
                  ? `ბოლო შედეგები ${trend.value}%-ით გაუმჯობესდა.`
                  : trend.value < 0
                    ? `ბოლო შედეგები ${Math.abs(trend.value)}%-ით შემცირდა.`
                    : 'შედეგებში მნიშვნელოვანი ცვლილება არ ჩანს.'
              }
            </p>

          </div>


          <div class="fa-insight">

            <div class="fa-insight-icon">
              🎯
            </div>

            <b>
              შემდეგი მიზანი
            </b>

            <p>
              ${
                overall.completedGrades < 3
                  ? `შემდეგი მიზანი: ${
                      overall.completedGrades === 0
                        ? 'პირველი Grade-ის დასრულება'
                        : overall.completedGrades === 1
                          ? 'მეორე Grade-ის დასრულება'
                          : 'Grade 4-ის დასრულება'
                    }.`
                  : 'ყველა Grade დასრულებულია — Master სტატუსი!'
              }
            </p>

          </div>


          ${
            weakest
              ? `
                <div class="fa-insight">

                  <div class="fa-insight-icon">
                    🟠
                  </div>

                  <b>
                    მეტი პრაქტიკა
                  </b>

                  <p>
                    ${weakest.config.title}
                    — საშუალო შედეგი
                    ${weakest.average}%.
                  </p>

                </div>
              `
              : ''
          }


          <div class="fa-insight">

            <div class="fa-insight-icon">
              ⚡
            </div>

            <b>
              Learning Level
            </b>

            <p>
              Level ${overall.level}
              • ${overall.xp} XP
              დაგროვილი.
            </p>

          </div>


          <div class="fa-insight">

            <div class="fa-insight-icon">
              📚
            </div>

            <b>
              Vocabulary
            </b>

            <p>
              ${
                overall.uniqueWords
              }
              უნიკალური ინგლისური სიტყვა
              ნასწავლია.
            </p>

          </div>

        </div>

      </div>
    `;
  }


  /* =======================================================
     SHOW ANALYTICS
  ======================================================= */

  async function showStudent(
    userId,
    studentName
  ) {

    injectCSS();


    const [
      progressResult,
      quizResult
    ] = await Promise.all([

      db
        .from('student_progress')
        .select(
          'grade,words_learned,quiz_completed,best_quiz,learned_words,updated_at'
        )
        .eq('user_id', userId)
        .in('grade', [2, 3, 4])
        .order('grade'),

      db
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', userId)
        .order(
          'created_at',
          { ascending: true }
        )
        .limit(CONFIG.maxAttempts)

    ]);


    if (progressResult.error) {

      alert(
        'პროგრესის ჩატვირთვა ვერ მოხერხდა:\n' +
        progressResult.error.message
      );

      return;
    }


    const rows =
      progressResult.data || [];

    const attempts =
      quizResult.error
        ? []
        : quizResult.data || [];


    const grades =
      buildGradeData(
        rows,
        attempts
      );


    const overall =
      buildOverall(
        grades,
        attempts
      );


    const trend =
      calculateTrend(
        attempts
      );


    const overlay =
      document.createElement('div');


    overlay.className =
      'fa-overlay';


    overlay.innerHTML = `

      <div class="fa-modal">

        <div class="fa-wrap">


          <!-- HEADER -->

          <div class="fa-header">

            <div class="fa-profile">

              <div class="fa-avatar">
                🧑‍🎓
              </div>

              <div>

                <h2>
                  ${esc(studentName)}
                </h2>

                <small>
                  FUTURISTIC STUDENT
                  ANALYTICS CENTER
                  • LEVEL ${overall.level}
                </small>

              </div>

            </div>


            <button
              class="fa-close"
              type="button"
            >
              ✕ დახურვა
            </button>

          </div>


          <!-- HERO -->

          <div class="fa-hero">


            <div class="fa-main-score">

              <div class="fa-score-ring">

                <span
                  class="fa-score-number"
                >
                  ${overall.overallPercent}%
                </span>

              </div>

              <div class="fa-score-label">
                Overall Progress
              </div>

            </div>


            <div class="fa-kpis">


              <div class="fa-kpi">

                <div class="fa-kpi-icon">
                  📚
                </div>

                <div class="fa-kpi-value">
                  ${overall.totalWords}
                </div>

                <div class="fa-kpi-label">
                  ნასწავლი სიტყვები
                </div>

              </div>


              <div class="fa-kpi">

                <div class="fa-kpi-icon">
                  🎯
                </div>

                <div class="fa-kpi-value">
                  ${overall.average}%
                </div>

                <div class="fa-kpi-label">
                  საშუალო Quiz
                </div>

              </div>


              <div class="fa-kpi">

                <div class="fa-kpi-icon">
                  🏆
                </div>

                <div class="fa-kpi-value">
                  ${overall.best}%
                </div>

                <div class="fa-kpi-label">
                  საუკეთესო შედეგი
                </div>

              </div>


              <div class="fa-kpi">

                <div class="fa-kpi-icon">
                  ⚡
                </div>

                <div class="fa-kpi-value">
                  ${overall.xp}
                </div>

                <div class="fa-kpi-label">
                  XP • Level ${overall.level}
                </div>

              </div>


            </div>

          </div>


          <!-- GRADES -->

          <div class="fa-section">

            <div class="fa-section-title">

              <h3>
                🎓 Grade Progress
              </h3>

              <span>
                ${overall.completedGrades}/3 completed
              </span>

            </div>


            <div class="fa-grades">

              ${grades.map(
                grade => `

                  <div class="fa-grade">

                    <div class="fa-grade-top">

                      <div class="fa-grade-name">

                        ${grade.config.icon}

                        ${grade.config.title}

                      </div>

                      <div
                        class="fa-grade-percent"
                        style="
                          color:${grade.config.color}
                        "
                      >
                        ${grade.progressPercent}%
                      </div>

                    </div>


                    <div class="fa-progress">

                      <i
                        style="
                          width:${grade.progressPercent}%;
                        "
                      ></i>

                    </div>


                    <div class="fa-grade-stats">

                      <div class="fa-mini-stat">

                        <b>
                          ${grade.wordCount}
                        </b>

                        <span>
                          WORDS
                        </span>

                      </div>


                      <div class="fa-mini-stat">

                        <b>
                          ${grade.quizzes}
                        </b>

                        <span>
                          QUIZ
                        </span>

                      </div>


                      <div class="fa-mini-stat">

                        <b>
                          ${grade.best}%
                        </b>

                        <span>
                          BEST
                        </span>

                      </div>

                    </div>


                    ${
                      grade.updatedAt
                        ? `
                          <div style="
                            margin-top:11px;
                            color:#637f8d;
                            font-size:9px;
                          ">
                            ბოლო განახლება:
                            ${formatDate(
                              grade.updatedAt
                            )}
                          </div>
                        `
                        : ''
                    }

                  </div>

                `
              ).join('')}

            </div>

          </div>


          <!-- CHARTS -->

          <div class="fa-section">

            <div class="fa-section-title">

              <h3>
                📈 Performance Intelligence
              </h3>

              <span>
                ბოლო 12 Quiz
              </span>

            </div>


            <div class="fa-charts">

              ${grades
                .map(renderChart)
                .join('')}

            </div>

          </div>


          <!-- INSIGHTS -->

          ${renderInsights(
            grades,
            overall,
            trend
          )}


          <!-- WORDS -->

          <div class="fa-section">

            <div class="fa-section-title">

              <h3>
                🧠 Vocabulary Matrix
              </h3>

              <span>
                ${overall.uniqueWords}
                unique words
              </span>

            </div>


            <div class="fa-word-cloud">

              ${
                grades
                  .flatMap(
                    grade => grade.words
                  )
                  .slice(0, 300)
                  .map(
                    word => `
                      <span
                        class="fa-word"
                      >
                        ${esc(word)}
                      </span>
                    `
                  )
                  .join('') ||

                `
                  <span
                    style="
                      color:#718d99;
                      font-size:12px;
                    "
                  >
                    ჯერ ნასწავლი სიტყვები არ არის
                  </span>
                `
              }

            </div>

          </div>


          <!-- QUIZ HISTORY -->

          <div class="fa-section">

            <div class="fa-section-title">

              <h3>
                📝 Quiz Intelligence
              </h3>

              <span>
                ${attempts.length}
                attempts
              </span>

            </div>


            <div class="fa-history">

              ${grades.map(
                grade => `

                  <div class="fa-history-card">

                    <div class="fa-history-title">

                      ${grade.config.icon}
                      ${grade.config.title}

                    </div>


                    <div class="fa-history-list">

                      ${
                        grade.attempts.length

                          ? grade.attempts
                              .slice()
                              .reverse()
                              .map(
                                (attempt, index) => `

                                  <div
                                    class="fa-history-row"
                                  >

                                    <div>

                                      <div>
                                        Quiz #${
                                          grade.attempts.length -
                                          index
                                        }
                                      </div>

                                      <div
                                        class="fa-history-date"
                                      >
                                        ${formatDate(
                                          attempt.created_at
                                        )}
                                      </div>

                                    </div>


                                    <div
                                      class="fa-history-score"
                                    >
                                      ${getScore(
                                        attempt
                                      )}%
                                    </div>

                                  </div>

                                `
                              )
                              .join('')

                          : `
                              <div
                                style="
                                  padding:15px;
                                  color:#637f8d;
                                  font-size:11px;
                                "
                              >
                                Quiz ისტორია არ არის
                              </div>
                            `
                      }

                    </div>

                  </div>

                `
              ).join('')}

            </div>

          </div>


          <!-- ACHIEVEMENTS -->

          ${renderAchievements(
            grades,
            overall
          )}


          <!-- WORD FOOTER -->

          <div
            style="
              margin-top:18px;
              text-align:center;
              color:#466574;
              font-size:9px;
              letter-spacing:1px;
            "
          >
            ENGLISH WITH MARIAMI
            • STUDENT ANALYTICS ENGINE
            • SUPABASE SYNC
          </div>


        </div>

      </div>
    `;


    document.body.appendChild(
      overlay
    );


    /* =====================================================
       CLOSE
    ===================================================== */

    const close =
      overlay.querySelector(
        '.fa-close'
      );


    close.onclick = () =>
      overlay.remove();


    overlay.addEventListener(
      'click',
      event => {

        if (
          event.target === overlay
        ) {
          overlay.remove();
        }

      }
    );


    document.addEventListener(
      'keydown',
      function escClose(event) {

        if (
          event.key === 'Escape' &&
          document.body.contains(overlay)
        ) {

          overlay.remove();

          document.removeEventListener(
            'keydown',
            escClose
          );
        }

      }
    );


    /* =====================================================
       PROGRESS ANIMATION
    ===================================================== */

    requestAnimationFrame(() => {

      overlay
        .querySelectorAll(
          '.fa-progress > i'
        )
        .forEach(bar => {

          const width =
            bar.style.width;

          bar.style.width = '0%';

          setTimeout(
            () => {
              bar.style.width = width;
            },
            80
          );

        });

    });

  }


  /* =======================================================
     FIND STUDENT ID
  ======================================================= */

  function extractStudentId(card) {

    const text =
      card.querySelector(
        '.small'
      )?.textContent || '';


    const uuid =
      text.match(
        /[0-9a-f]{8}-[0-9a-f-]{27,}/i
      );


    if (uuid) {
      return uuid[0];
    }


    const direct =
      card.dataset?.userId ||
      card.dataset?.userid ||
      card.getAttribute(
        'data-user-id'
      );


    return direct || null;
  }


  /* =======================================================
     ADD BUTTONS
  ======================================================= */

  function addButtons() {

    document
      .querySelectorAll(
        '.student-card'
      )
      .forEach(card => {

        if (
          card.querySelector(
            '.fa-analytics-button'
          )
        ) {
          return;
        }


        const userId =
          extractStudentId(card);


        if (!userId) {
          return;
        }


        const button =
          document.createElement(
            'button'
          );


        button.type =
          'button';


        button.className =
          'btn purple fa-analytics-button';


        button.innerHTML =
          '🧬 Analytics';


        button.style.cssText = `
          min-height:44px;
          margin-top:8px;
          font-weight:900;
        `;


        button.addEventListener(
          'click',
          event => {

            event.preventDefault();
            event.stopPropagation();


            const name =
              card.querySelector(
                '.student-name'
              )?.textContent
              ?.trim() ||
              'მოსწავლე';


            showStudent(
              userId,
              name
            );

          }
        );


        const container =
          card.querySelector(
            '.student-management'
          ) || card;


        container.appendChild(
          button
        );

      });

  }


  /* =======================================================
     BOOT
  ======================================================= */

  function boot() {

    addButtons();


    setTimeout(
      addButtons,
      800
    );


    setTimeout(
      addButtons,
      2000
    );


    setInterval(
      addButtons,
      5000
    );

  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      boot,
      { once: true }
    );

  } else {

    boot();

  }


  /* =======================================================
     PUBLIC API
  ======================================================= */

  window.ENGLISH_MARIAMI_DETAILED_PROGRESS = {
    show: showStudent
  };


})();
