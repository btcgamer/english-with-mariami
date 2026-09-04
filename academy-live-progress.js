(() => {
  "use strict";

  /*
   * MAGIC NEON ACADEMY — read-only live progress engine.
   * Uses the authenticated user's own Supabase rows only.
   * No inserts, updates, deletes, or schema changes.
   */

  const $ = (selector) => document.querySelector(selector);

  const waitForClient = async () => {
    const existing =
      window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
      window.supabaseClient ||
      null;

    if (existing) return existing;

    await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      window.addEventListener("englishMariamiSupabaseReady", finish, { once: true });
      window.setTimeout(finish, 5000);
    });

    return (
      window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
      window.supabaseClient ||
      null
    );
  };

  const numberOrZero = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };

  const setText = (selector, value) => {
    const el = $(selector);
    if (el) el.textContent = String(value);
  };

  const setProgress = (words, quizzes, percent, level) => {
    setText("#words-count", Math.round(words));
    setText("#quiz-count", Math.round(quizzes));
    setText("#progress-percent", `${Math.round(percent)}%`);
    setText("#student-level", level);

    const bar = $("#progress-bar");
    if (bar) {
      const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
      bar.style.width = `${safePercent}%`;
      bar.setAttribute("aria-valuenow", String(safePercent));
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuemax", "100");
    }
  };

  const levelFor = (percent) => {
    if (percent >= 95) return "🏆";
    if (percent >= 80) return "💎";
    if (percent >= 60) return "🚀";
    if (percent >= 35) return "⚡";
    if (percent > 0) return "🌱";
    return "⭐";
  };

  async function loadLiveProgress() {
    const client = await waitForClient();
    if (!client) return;

    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError || !sessionData?.session?.user) return;

    const user = sessionData.session.user;

    const profileResult = await client
      .from("profiles")
      .select("grade")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileResult.error) {
      console.error("Live progress profile error:", profileResult.error);
      return;
    }

    const grade = Number(profileResult.data?.grade || user.user_metadata?.grade || 0);
    if (![2, 3, 4].includes(grade)) return;

    const [studentResult, lessonsResult, quizzesResult] = await Promise.all([
      client
        .from("student_progress")
        .select("words_learned,quiz_completed,score,best_quiz,quiz_attempts,last_active_at")
        .eq("user_id", user.id)
        .eq("grade", grade)
        .maybeSingle(),

      client
        .from("lesson_progress")
        .select("lesson_id,completed,score")
        .eq("student_id", user.id)
        .eq("grade", grade),

      client
        .from("quiz_results")
        .select("quiz_id,score,total,completed_at")
        .eq("student_id", user.id)
        .eq("grade", grade)
        .order("completed_at", { ascending: false })
    ]);

    if (studentResult.error) console.warn("student_progress read:", studentResult.error);
    if (lessonsResult.error) console.warn("lesson_progress read:", lessonsResult.error);
    if (quizzesResult.error) console.warn("quiz_results read:", quizzesResult.error);

    const student = studentResult.data || {};
    const lessons = Array.isArray(lessonsResult.data) ? lessonsResult.data : [];
    const quizzes = Array.isArray(quizzesResult.data) ? quizzesResult.data : [];

    const words = numberOrZero(student.words_learned);

    /* One quiz counts once: use the best existing attempt for each quiz ID. */
    const bestQuizById = new Map();
    for (const row of quizzes) {
      const id = row?.quiz_id ? String(row.quiz_id) : "";
      const total = Number(row?.total);
      const score = Number(row?.score);
      if (!id || total <= 0 || !Number.isFinite(score)) continue;
      const safeScore = Math.max(0, Math.min(score, total));
      const previous = bestQuizById.get(id);
      if (!previous || safeScore / total > previous.score / previous.total) {
        bestQuizById.set(id, { score: safeScore, total });
      }
    }

    const uniqueCompletedQuizIds = new Set(bestQuizById.keys());
    const quizCount = Math.max(
      numberOrZero(student.quiz_completed),
      uniqueCompletedQuizIds.size
    );

    const completedLessons = lessons.filter((row) => row?.completed === true);
    const lessonIds = new Set(
      lessons
        .filter((row) => row?.lesson_id)
        .map((row) => String(row.lesson_id))
    );

    const completedLessonIds = new Set(
      completedLessons
        .filter((row) => row?.lesson_id)
        .map((row) => String(row.lesson_id))
    );

    const lessonPercent = lessonIds.size
      ? (completedLessonIds.size / lessonIds.size) * 100
      : 0;

    const bestQuizScores = [...bestQuizById.values()]
      .map(({ score, total }) => (score / total) * 100)
      .filter((value) => Number.isFinite(value));

    const quizPercent = bestQuizScores.length
      ? bestQuizScores.reduce((sum, value) => sum + value, 0) / bestQuizScores.length
      : 0;

    /*
     * Overall progress intentionally uses only real completion signals:
     * 60% lesson completion + 40% best-attempt quiz performance.
     * Repeated attempts cannot inflate the quiz performance metric.
     */
    const overall = Math.round((lessonPercent * 0.6) + (quizPercent * 0.4));
    const safeOverall = Math.max(0, Math.min(100, overall));

    setProgress(words, quizCount, safeOverall, levelFor(safeOverall));

    const message = $("#progress-message");
    if (message) {
      if (safeOverall >= 95) {
        message.textContent = "🏆 საოცარი შედეგია! აკადემიის უმაღლეს დონეს უახლოვდები.";
      } else if (safeOverall >= 80) {
        message.textContent = "💎 შესანიშნავი პროგრესია — ასე გააგრძელე!";
      } else if (safeOverall >= 60) {
        message.textContent = "🚀 ძალიან კარგი ტემპია — შემდეგი მისია გელოდება!";
      } else if (safeOverall > 0) {
        message.textContent = "⚡ პროგრესი ჩაიტვირთა რეალური სასწავლო შედეგებიდან.";
      } else {
        message.textContent = "დაიწყე სწავლა და შენი რეალური შედეგები აქ გამოჩნდება.";
      }
    }

    document.dispatchEvent(new CustomEvent("ewmAcademyLiveProgressReady", {
      detail: { grade, words, quizzes: quizCount, percent: safeOverall, level: levelFor(safeOverall) }
    }));
  }

  const start = () => {
    loadLiveProgress().catch((error) => {
      console.error("Live Academy progress error:", error);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
