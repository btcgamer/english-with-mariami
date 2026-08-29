(function () {
  'use strict';

  /*
   * ============================================================
   * TEACHER DASHBOARD
   * File: teacher-dashboard.js
   * Page: teacher-dashboard.html
   * ============================================================
   */

  if (!location.pathname.toLowerCase().endsWith('/teacher-dashboard.html')) {
    return;
  }

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let db = null;
  let teacher = null;
  let teacherProfile = null;

  let students = [];
  let currentLesson = null;
  let currentAttendance = null;

  let initialized = false;
  let loadingStudents = false;
  let loadingHistory = false;

  const $ = (id) => document.getElementById(id);

  /* ============================================================
     HELPERS
     ============================================================ */

  const esc = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  const sleep = wait;

  function isValidUUID(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      String(value || '')
    );
  }

  function localDateISO(date = new Date()) {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();

    return new Date(d.getTime() - offset * 60000)
      .toISOString()
      .slice(0, 10);
  }

  function localTimeISO(date = new Date()) {
    return new Date(date)
      .toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
  }

  function formatDate(date) {
    if (!date) return '';

    try {
      return new Date(`${date}T00:00:00`).toLocaleDateString('ka-GE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return String(date);
    }
  }

  function formatDateTime(value) {
    if (!value) return '';

    try {
      return new Date(value).toLocaleString('ka-GE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return String(value);
    }
  }

  function formatTime(value) {
    if (!value) return '—';

    try {
      if (String(value).includes('T')) {
        return new Date(value).toLocaleTimeString('ka-GE', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return String(value).slice(0, 5);
    } catch {
      return String(value).slice(0, 5);
    }
  }

  function normalizeGrade(value) {
    const grade = Number(value);
    return [2, 3, 4].includes(grade) ? grade : null;
  }

  function getStudent(id) {
    return students.find(s => s.user_id === id) || null;
  }

  function isMyStudent(student) {
    if (!student || !teacher) return false;

    return Array.isArray(student.linkedTeachers) &&
      student.linkedTeachers.includes(teacher.id);
  }

  function statusText(status) {
    switch (String(status || '').toLowerCase()) {
      case 'live':
        return '🟢 მიმდინარეობს';

      case 'done':
        return '🔵 დასრულებული';

      case 'cancelled':
        return '🔴 გაუქმებული';

      case 'scheduled':
      case 'planned':
      default:
        return '🟡 დაგეგმილი';
    }
  }

  function attendanceText(status) {
    switch (String(status || '').toLowerCase()) {
      case 'present':
        return '✅ მოსვლა';

      case 'late':
        return '⏰ დაგვიანება';

      case 'absent':
        return '❌ გაცდენა';

      default:
        return 'დაფიქსირებული არ არის';
    }
  }

  function safeError(error, fallback = 'ოპერაცია ვერ შესრულდა.') {
    if (!error) return fallback;

    return (
      error.message ||
      error.details ||
      error.hint ||
      fallback
    );
  }

  /* ============================================================
     MESSAGE / UI
     ============================================================ */

  function msg(text, error = false) {
    const box = $('message');

    if (!box) {
      console[error ? 'error' : 'log'](text);
      return;
    }

    box.textContent = String(text || '');

    box.className =
      'message show ' +
      (error ? 'error' : 'ok');

    clearTimeout(msg.timer);

    msg.timer = setTimeout(() => {
      box.className = 'message';
    }, 5000);
  }

  function setLoading(element, text = '⏳ იტვირთება...') {
    if (!element) return;

    element.innerHTML = `
      <div class="muted loading-state">
        ${esc(text)}
      </div>
    `;
  }

  function setButtonLoading(button, loading, text) {
    if (!button) return;

    if (loading) {
      button.dataset.originalText =
        button.dataset.originalText || button.innerHTML;

      button.disabled = true;
      button.innerHTML = text || '⏳ იტვირთება...';
    } else {
      button.disabled = false;

      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    }
  }

  /* ============================================================
     SUPABASE
     ============================================================ */

  async function getDB() {
    if (db) return db;

    for (let i = 0; i < 80; i++) {
      db =
        window.__ENGLISH_MARIAMI_SUPABASE_CLIENT ||
        window.supabaseClient ||
        window.supabase;

      if (db && typeof db.from === 'function') {
        return db;
      }

      await sleep(150);
    }

    throw new Error(
      'Supabase ვერ ჩაიტვირთა. შეამოწმე Supabase-ის კონფიგურაცია.'
    );
  }

  async function getSession() {
    const response = await db.auth.getSession();

    if (response.error) {
      throw response.error;
    }

    return response?.data?.session || null;
  }

  /* ============================================================
     INITIALIZATION
     ============================================================ */

  async function init() {
    if (initialized) return;

    initialized = true;

    try {
      await getDB();

      const session = await getSession();

      if (!session) {
        location.replace(
          'login.html?redirect=teacher-dashboard.html'
        );
        return;
      }

      teacher = session.user;

      if (!teacher?.id) {
        throw new Error('მასწავლებლის ანგარიში ვერ მოიძებნა.');
      }

      await loadTeacherProfile();

      if (
        String(teacherProfile?.role || '').toLowerCase() !==
        'teacher'
      ) {
        location.replace('academy.html');
        return;
      }

      renderTeacherProfile();
      setToday();
      bind();

      await Promise.all([
        loadStudents(),
        loadHistory()
      ]);

      await loadDashboardStats();

    } catch (error) {
      console.error('Teacher dashboard init error:', error);

      msg(
        safeError(
          error,
          'მასწავლებლის სივრცე ვერ ჩაიტვირთა.'
        ),
        true
      );
    }
  }

  async function loadTeacherProfile() {
    const result = await db
      .from('profiles')
      .select('user_id,full_name,role,grade,created_at')
      .eq('user_id', teacher.id)
      .maybeSingle();

    if (result.error) {
      throw result.error;
    }

    teacherProfile = result.data;

    if (!teacherProfile) {
      throw new Error(
        'მასწავლებლის პროფილი ვერ მოიძებნა.'
      );
    }
  }

  function renderTeacherProfile() {
    if ($('teacherName')) {
      $('teacherName').textContent =
        teacherProfile?.full_name ||
        'მასწავლებელი';
    }

    if ($('teacherEmail')) {
      $('teacherEmail').textContent =
        teacher?.email || '';
    }

    if ($('teacherRole')) {
      $('teacherRole').textContent =
        'მასწავლებელი';
    }

    if ($('teacherAvatar')) {
      const name =
        teacherProfile?.full_name ||
        'მ';

      $('teacherAvatar').textContent =
        name.trim().charAt(0).toUpperCase();
    }
  }

  /* ============================================================
     EVENTS
     ============================================================ */

  function bind() {
    /*
     * TABS
     */
    document
      .querySelectorAll('.tab')
      .forEach(button => {
        button.addEventListener('click', async () => {
          const tab = button.dataset.tab;

          if (!tab) return;

          document
            .querySelectorAll('.tab')
            .forEach(x => x.classList.remove('active'));

          document
            .querySelectorAll('.panel')
            .forEach(x => x.classList.remove('active'));

          button.classList.add('active');

          const panel = $(tab);

          if (panel) {
            panel.classList.add('active');
          }

          try {
            if (tab === 'students') {
              await loadStudents();
            }

            if (tab === 'history') {
              await loadHistory();
            }

            if (tab === 'attendance') {
              await loadAttendance();
            }

            if (tab === 'grades') {
              await loadGrades();
            }

            if (
              tab === 'dashboard' ||
              tab === 'home'
            ) {
              await loadDashboardStats();
            }
          } catch (error) {
            console.error(error);

            msg(
              safeError(
                error,
                'მონაცემების ჩატვირთვა ვერ მოხერხდა.'
              ),
              true
            );
          }
        });
      });

    /*
     * CLASS
     */
    $('classSelect')?.addEventListener(
      'change',
      loadLessonStudents
    );

    /*
     * LESSON
     */
    $('findLessonBtn')?.addEventListener(
      'click',
      findLesson
    );

    $('newLessonBtn')?.addEventListener(
      'click',
      newLesson
    );

    $('saveLessonBtn')?.addEventListener(
      'click',
      saveLesson
    );

    $('startLessonBtn')?.addEventListener(
      'click',
      startLesson
    );

    $('finishLessonBtn')?.addEventListener(
      'click',
      finishLesson
    );

    /*
     * ATTENDANCE
     */
    $('loadAttendanceBtn')?.addEventListener(
      'click',
      loadAttendance
    );

    /*
     * GRADES
     */
    $('saveGradeBtn')?.addEventListener(
      'click',
      saveGrade
    );

    $('gradeStudent')?.addEventListener(
      'change',
      loadGrades
    );

    /*
     * HISTORY
     */
    $('historyRefreshBtn')?.addEventListener(
      'click',
      loadHistory
    );

    /*
     * STUDENTS
     */
    $('loadStudentsAdminBtn')?.addEventListener(
      'click',
      loadStudents
    );

    $('studentSearch')?.addEventListener(
      'input',
      renderStudents
    );

    $('studentFilterGrade')?.addEventListener(
      'change',
      renderStudents
    );

    $('studentFilterLink')?.addEventListener(
      'change',
      renderStudents
    );

    /*
     * LOGOUT
     */
    $('logoutBtn')?.addEventListener(
      'click',
      logout
    );

    /*
     * HISTORY DATE FILTER
     */
    $('historyDate')?.addEventListener(
      'change',
      loadHistory
    );

    /*
     * ENTER KEY IN SEARCH
     */
    $('studentSearch')?.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          event.target.value = '';
          renderStudents();
        }
      }
    );
  }

  /* ============================================================
     DATE
     ============================================================ */

  function setToday() {
    const today = localDateISO();

    if ($('lessonDate')) {
      $('lessonDate').value = today;
    }

    if ($('historyDate')) {
      $('historyDate').value = today;
    }
  }

  /* ============================================================
     STUDENTS
     ============================================================ */

  async function loadStudents() {
    if (loadingStudents) return;

    const list = $('assignmentList');

    if (!list) return;

    loadingStudents = true;

    setLoading(list, 'მოსწავლეები იტვირთება...');

    try {
      const result = await db
        .from('profiles')
        .select(
          'user_id,full_name,grade,created_at'
        )
        .eq('role', 'student')
        .order('created_at', {
          ascending: false
        });

      if (result.error) {
        throw result.error;
      }

      const data = result.data || [];

      const ids = data
        .map(student => student.user_id)
        .filter(Boolean);

      let links = [];

      /*
       * Get teacher/student relations.
       */
      if (ids.length) {
        const relation = await db
          .from('teacher_students')
          .select(
            'teacher_id,student_id'
          )
          .in('student_id', ids);

        if (relation.error) {
          throw relation.error;
        }

        links = relation.data || [];
      }

      const relationMap = new Map();

      links.forEach(link => {
        if (!relationMap.has(link.student_id)) {
          relationMap.set(
            link.student_id,
            []
          );
        }

        relationMap
          .get(link.student_id)
          .push(link.teacher_id);
      });

      students = data.map(student => ({
        ...student,
        grade: normalizeGrade(student.grade),
        linkedTeachers:
          relationMap.get(student.user_id) || []
      }));

      renderStudents();

      await fillGradeStudentSelects();
      await loadLessonStudents();

      updateStudentCounters();

    } catch (error) {
      console.error(
        'loadStudents error:',
        error
      );

      list.innerHTML = `
        <div class="muted error-state">
          ❌ მოსწავლეების ჩატვირთვა ვერ მოხერხდა.
        </div>
      `;

      msg(
        safeError(
          error,
          'მოსწავლეების ჩატვირთვა ვერ მოხერხდა.'
        ),
        true
      );
    } finally {
      loadingStudents = false;
    }
  }

  function renderStudents() {
    const list = $('assignmentList');

    if (!list) return;

    const query =
      String(
        $('studentSearch')?.value || ''
      )
        .trim()
        .toLowerCase();

    const gradeFilter =
      String(
        $('studentFilterGrade')?.value ||
        'all'
      );

    const linkFilter =
      String(
        $('studentFilterLink')?.value ||
        'all'
      );

    const filtered = students.filter(student => {
      const name =
        String(
          student.full_name || ''
        ).toLowerCase();

      const grade =
        Number(student.grade || 0);

      const mine =
        isMyStudent(student);

      const linked =
        Array.isArray(student.linkedTeachers) &&
        student.linkedTeachers.length > 0;

      const matchesSearch =
        !query ||
        name.includes(query);

      const matchesGrade =
        gradeFilter === 'all' ||
        grade === Number(gradeFilter);

      let matchesLink = true;

      if (linkFilter === 'mine') {
        matchesLink = mine;
      }

      if (linkFilter === 'unlinked') {
        matchesLink = !linked;
      }

      return (
        matchesSearch &&
        matchesGrade &&
        matchesLink
      );
    });

    if ($('studentToolsInfo')) {
      $('studentToolsInfo').textContent =
        `ნაჩვენებია ${filtered.length} / ${students.length}`;
    }

    if (!filtered.length) {
      list.innerHTML = `
        <div class="muted empty-state">
          🔎 მოსწავლე ვერ მოიძებნა.
        </div>
      `;

      return;
    }

    list.innerHTML = filtered
      .map(studentCard)
      .join('');

    bindStudentActions(list);
  }

  function studentCard(student) {
    const grade =
      normalizeGrade(student.grade);

    const mine =
      isMyStudent(student);

    const linked =
      Array.isArray(student.linkedTeachers) &&
      student.linkedTeachers.length > 0;

    const initials =
      String(
        student.full_name ||
        'მოსწავლე'
      )
        .trim()
        .split(/\s+/)
        .map(x => x.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return `
      <div
        class="assignment-card"
        data-student-card="${esc(student.user_id)}"
      >

        <div class="student-main">

          <div class="student-avatar">
            ${esc(initials || 'მ')}
          </div>

          <div class="student-info">

            <div class="student-name">
              ${esc(
                student.full_name ||
                'მოსწავლე'
              )}
            </div>

            <div class="small">
              ${
                grade
                  ? `🎓 მე-${grade} კლასი`
                  : '⏳ კლასი არ არის მინიჭებული'
              }
            </div>

            <div class="small">
              ${
                mine
                  ? '🟢 ჩემი მოსწავლე'
                  : linked
                    ? '🟡 სხვა მასწავლებელთან'
                    : '⚪ მასწავლებელი არ ჰყავს'
              }
            </div>

          </div>

        </div>

        <div class="student-actions">

          <select
            data-grade-for="${esc(student.user_id)}"
            aria-label="კლასი"
          >
            <option value="">
              ${grade
                ? `კლასის შეცვლა`
                : 'აირჩიე კლასი'}
            </option>

            <option value="2">
              მე-2 კლასი
            </option>

            <option value="3">
              მე-3 კლასი
            </option>

            <option value="4">
              მე-4 კლასი
            </option>
          </select>

          <div class="actions">

            <button
              type="button"
              class="btn primary"
              data-assign="${esc(student.user_id)}"
            >
              ${grade
                ? '🔄 შეცვლა'
                : '🎓 მინიჭება'}
            </button>

            <button
              type="button"
              class="btn gray"
              data-reset="${esc(student.user_id)}"
            >
              ↩️ განულება
            </button>

            <button
              type="button"
              class="btn red"
              data-delete="${esc(student.user_id)}"
            >
              🗑️ წაშლა
            </button>

          </div>

        </div>

      </div>
    `;
  }

  function bindStudentActions(container) {
    container
      .querySelectorAll('[data-assign]')
      .forEach(button => {
        button.onclick = () =>
          assignStudent(
            button.dataset.assign
          );
      });

    container
      .querySelectorAll('[data-reset]')
      .forEach(button => {
        button.onclick = () =>
          resetStudent(
            button.dataset.reset
          );
      });

    container
      .querySelectorAll('[data-delete]')
      .forEach(button => {
        button.onclick = () =>
          deleteStudent(
            button.dataset.delete
          );
      });
  }

  async function assignStudent(id) {
    if (!isValidUUID(id)) {
      return msg(
        'მოსწავლის ID არასწორია.',
        true
      );
    }

    const selector =
      document.querySelector(
        `[data-grade-for="${CSS.escape(id)}"]`
      );

    const grade =
      normalizeGrade(selector?.value);

    if (!grade) {
      return msg(
        'აირჩიე კლასი.',
        true
      );
    }

    const button =
      document.querySelector(
        `[data-assign="${CSS.escape(id)}"]`
      );

    setButtonLoading(
      button,
      true,
      '⏳ ინახება...'
    );

    try {
      const result = await db.rpc(
        'teacher_assign_student_grade',
        {
          p_student_id: id,
          p_grade: grade
        }
      );

      if (result.error) {
        throw result.error;
      }

      msg(
        `✅ მოსწავლეს მიენიჭა მე-${grade} კლასი.`
      );

      await loadStudents();

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'კლასის მინიჭება ვერ მოხერხდა.'
        ),
        true
      );

    } finally {
      setButtonLoading(
        button,
        false
      );
    }
  }

  async function resetStudent(id) {
    const student =
      getStudent(id);

    if (!student) {
      return msg(
        'მოსწავლე ვერ მოიძებნა.',
        true
      );
    }

    const name =
      student.full_name ||
      'მოსწავლე';

    const confirmed = confirm(
      `ნამდვილად გინდა „${name}“-ის განულება?\n\n` +
      `კლასი გახდება „არ არის მინიჭებული“ ` +
      `და მასწავლებელთან კავშირი მოიხსნება.`
    );

    if (!confirmed) return;

    try {
      const result = await db.rpc(
        'teacher_reset_student',
        {
          p_student_id: id
        }
      );

      if (result.error) {
        throw result.error;
      }

      msg(
        '↩️ მოსწავლის კლასი განულდა.'
      );

      await loadStudents();

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'განულება ვერ მოხერხდა.'
        ),
        true
      );
    }
  }

  async function deleteStudent(id) {
    const student =
      getStudent(id);

    if (!student) {
      return msg(
        'მოსწავლე ვერ მოიძებნა.',
        true
      );
    }

    const name =
      student.full_name ||
      'მოსწავლე';

    const confirmed = confirm(
      `⚠️ ყურადღება!\n\n` +
      `წაიშლება „${name}“-ის სასწავლო მონაცემები ` +
      `და ანგარიში.\n\n` +
      `ეს მოქმედება შეუქცევადია.\n\n` +
      `გაგრძელება?`
    );

    if (!confirmed) return;

    const verification =
      prompt(
        `დადასტურებისთვის ჩაწერე ზუსტად:\n\n${name}`
      );

    if (verification !== name) {
      return msg(
        'წაშლა გაუქმდა — ტექსტი არ დაემთხვა.',
        true
      );
    }

    try {
      const result = await db.rpc(
        'teacher_delete_student',
        {
          p_student_id: id
        }
      );

      if (result.error) {
        throw result.error;
      }

      msg(
        '🗑️ მოსწავლე და მისი მონაცემები წაიშალა.'
      );

      await loadStudents();

      await loadHistory();

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'მოსწავლის წაშლა ვერ მოხერხდა.'
        ),
        true
      );
    }
  }

  function updateStudentCounters() {
    const total =
      students.length;

    const mine =
      students.filter(isMyStudent).length;

    const unlinked =
      students.filter(
        s =>
          !Array.isArray(s.linkedTeachers) ||
          s.linkedTeachers.length === 0
      ).length;

    const grade2 =
      students.filter(
        s => Number(s.grade) === 2
      ).length;

    const grade3 =
      students.filter(
        s => Number(s.grade) === 3
      ).length;

    const grade4 =
      students.filter(
        s => Number(s.grade) === 4
      ).length;

    setText(
      'totalStudents',
      total
    );

    setText(
      'myStudents',
      mine
    );

    setText(
      'unlinkedStudents',
      unlinked
    );

    setText(
      'grade2Count',
      grade2
    );

    setText(
      'grade3Count',
      grade3
    );

    setText(
      'grade4Count',
      grade4
    );
  }

  function setText(id, value) {
    const element = $(id);

    if (element) {
      element.textContent =
        String(value ?? '');
    }
  }

  /* ============================================================
     SELECTS
     ============================================================ */

  async function fillGradeStudentSelects() {
    const mine =
      students.filter(student =>
        isMyStudent(student) &&
        [2, 3, 4].includes(
          Number(student.grade)
        )
      );

    fillSelect(
      'gradeStudent',
      'მოსწავლე აირჩიე',
      mine,
      true
    );
  }

  function fillSelect(
    id,
    placeholder,
    list,
    showGrade = false
  ) {
    const select = $(id);

    if (!select) return;

    const previous =
      select.value;

    select.innerHTML =
      `<option value="">${esc(
        placeholder
      )}</option>` +
      list.map(student => `
        <option value="${esc(
          student.user_id
        )}">
          ${esc(
            student.full_name ||
            'მოსწავლე'
          )}
          ${
            showGrade
              ? ` — მე-${student.grade}`
              : ''
          }
        </option>
      `).join('');

    if (
      list.some(
        student =>
          student.user_id === previous
      )
    ) {
      select.value = previous;
    }
  }

  async function loadLessonStudents() {
    const classSelect =
      $('classSelect');

    const studentSelect =
      $('studentSelect');

    if (!studentSelect) return;

    const grade =
      normalizeGrade(
        classSelect?.value
      );

    studentSelect.innerHTML =
      '<option value="">⏳ იტვირთება...</option>';

    if (!grade) {
      studentSelect.innerHTML =
        '<option value="">ჯერ აირჩიე კლასი</option>';

      return;
    }

    const mine =
      students.filter(student =>
        isMyStudent(student) &&
        Number(student.grade) === grade
      );

    studentSelect.innerHTML =
      '<option value="">აირჩიე მოსწავლე</option>' +
      mine.map(student => `
        <option value="${esc(
          student.user_id
        )}">
          ${esc(
            student.full_name ||
            'მოსწავლე'
          )}
        </option>
      `).join('');
  }

  /* ============================================================
     LESSON
     ============================================================ */

  function newLesson() {
    currentLesson = null;
    currentAttendance = null;

    setText(
      'lessonId',
      'ახალი გაკვეთილი'
    );

    setText(
      'lessonStatus',
      '🟡 დაგეგმილი'
    );

    setText(
      'timeDisplay',
      '—'
    );

    if ($('notes')) {
      $('notes').value = '';
    }

    if ($('subject')) {
      $('subject').value =
        'English';
    }

    if ($('startTime')) {
      $('startTime').value = '';
    }

    if ($('endTime')) {
      $('endTime').value = '';
    }

    if ($('classSelect')) {
      $('classSelect').value = '';
    }

    if ($('studentSelect')) {
      $('studentSelect').innerHTML =
        '<option value="">ჯერ აირჩიე კლასი</option>';
    }

    setToday();

    updateLessonButtons(
      'new'
    );

    msg(
      '✨ ახალი გაკვეთილის შექმნა შეგიძლია.'
    );
  }

  async function saveLesson() {
    const studentId =
      $('studentSelect')?.value;

    const lessonDate =
      $('lessonDate')?.value;

    const startTime =
      $('startTime')?.value;

    const endTime =
      $('endTime')?.value;

    const subject =
      String(
        $('subject')?.value ||
        'English'
      ).trim();

    const notes =
      String(
        $('notes')?.value ||
        ''
      ).trim();

    if (!studentId) {
      return msg(
        'აირჩიე მოსწავლე.',
        true
      );
    }

    if (!lessonDate) {
      return msg(
        'აირჩიე გაკვეთილის თარიღი.',
        true
      );
    }

    if (!startTime) {
      return msg(
        'მიუთითე დაწყების დრო.',
        true
      );
    }

    if (
      endTime &&
      endTime <= startTime
    ) {
      return msg(
        'დასრულების დრო უნდა იყოს დაწყების შემდეგ.',
        true
      );
    }

    if (!isValidUUID(studentId)) {
      return msg(
        'მოსწავლის ID არასწორია.',
        true
      );
    }

    const payload = {
      teacher_id: teacher.id,
      student_id: studentId,
      lesson_date: lessonDate,
      start_time: startTime,
      end_time: endTime || null,
      subject:
        subject || 'English',
      notes:
        notes || null
    };

    const button =
      $('saveLessonBtn');

    setButtonLoading(
      button,
      true,
      '⏳ ინახება...'
    );

    try {
      let result;

      if (currentLesson?.id) {
        result = await db
          .from('schedules')
          .update(payload)
          .eq(
            'id',
            currentLesson.id
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .select()
          .single();

      } else {
        result = await db
          .from('schedules')
          .insert(payload)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      currentLesson =
        result.data;

      showLesson(
        currentLesson
      );

      msg(
        currentLesson?.id
          ? '✅ გაკვეთილი შენახულია.'
          : '✅ გაკვეთილი შეიქმნა.'
      );

      await loadHistory();

      await loadDashboardStats();

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'გაკვეთილის შენახვა ვერ მოხერხდა.'
        ),
        true
      );

    } finally {
      setButtonLoading(
        button,
        false
      );
    }
  }

  async function findLesson() {
    const studentId =
      $('studentSelect')?.value;

    const lessonDate =
      $('lessonDate')?.value;

    if (!studentId) {
      return msg(
        'ჯერ აირჩიე მოსწავლე.',
        true
      );
    }

    if (!lessonDate) {
      return msg(
        'ჯერ აირჩიე თარიღი.',
        true
      );
    }

    try {
      const result =
        await db
          .from('schedules')
          .select('*')
          .eq(
            'teacher_id',
            teacher.id
          )
          .eq(
            'student_id',
            studentId
          )
          .eq(
            'lesson_date',
            lessonDate
          )
          .order(
            'start_time',
            {
              ascending: true
            }
          );

      if (result.error) {
        throw result.error;
      }

      if (!result.data?.length) {
        showNoLesson();

        return msg(
          '🔎 ამ დღეს გაკვეთილი ვერ მოიძებნა.',
          true
        );
      }

      /*
       * If there are multiple lessons,
       * open the last one.
       */
      const lesson =
        result.data[
          result.data.length - 1
        ];

      await showLesson(lesson);

      msg(
        '🔎 გაკვეთილი მოიძებნა.'
      );

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'გაკვეთილის მოძებნა ვერ მოხერხდა.'
        ),
        true
      );
    }
  }

  function showNoLesson() {
    currentLesson = null;
    currentAttendance = null;

    setText(
      'lessonId',
      'გაკვეთილი არჩეული არ არის'
    );

    setText(
      'lessonStatus',
      'აირჩიე კლასი, მოსწავლე და თარიღი.'
    );

    setText(
      'timeDisplay',
      '—'
    );

    updateLessonButtons(
      'none'
    );
  }

  async function showLesson(lesson) {
    if (!lesson) {
      showNoLesson();
      return;
    }

    currentLesson = lesson;

    setText(
      'lessonId',
      lesson.id
        ? `#${lesson.id}`
        : 'გაკვეთილი'
    );

    setText(
      'lessonStatus',
      statusText(
        lesson.status
      )
    );

    const time =
      `${formatDate(
        lesson.lesson_date
      )} • ${formatTime(
        lesson.start_time
      )}` +
      (
        lesson.end_time
          ? ` — ${formatTime(
              lesson.end_time
            )}`
          : ''
      );

    setText(
      'timeDisplay',
      time
    );

    if ($('subject')) {
      $('subject').value =
        lesson.subject ||
        'English';
    }

    if ($('notes')) {
      $('notes').value =
        lesson.notes || '';
    }

    if ($('lessonDate')) {
      $('lessonDate').value =
        lesson.lesson_date || '';
    }

    if ($('startTime')) {
      $('startTime').value =
        String(
          lesson.start_time || ''
        ).slice(0, 5);
    }

    if ($('endTime')) {
      $('endTime').value =
        String(
          lesson.end_time || ''
        ).slice(0, 5);
    }

    const student =
      getStudent(
        lesson.student_id
      );

    if ($('classSelect')) {
      $('classSelect').value =
        student?.grade || '';

      await loadLessonStudents();

      if ($('studentSelect')) {
        $('studentSelect').value =
          lesson.student_id || '';
      }
    }

    updateLessonButtons(
      lesson.status
    );
  }

  function updateLessonButtons(status) {
    const start =
      $('startLessonBtn');

    const finish =
      $('finishLessonBtn');

    if (start) {
      start.disabled =
        !currentLesson ||
        status === 'live' ||
        status === 'done' ||
        status === 'none';
    }

    if (finish) {
      finish.disabled =
        !currentLesson ||
        status !== 'live';
    }
  }

  async function startLesson() {
    if (!currentLesson?.id) {
      return msg(
        'ჯერ აირჩიე გაკვეთილი.',
        true
      );
    }

    const button =
      $('startLessonBtn');

    setButtonLoading(
      button,
      true,
      '▶️ იწყება...'
    );

    try {
      const result =
        await db
          .from('schedules')
          .update({
            status: 'live',
            started_at:
              new Date().toISOString()
          })
          .eq(
            'id',
            currentLesson.id
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .select()
          .single();

      if (result.error) {
        throw result.error;
      }

      await showLesson(
        result.data
      );

      msg(
        '▶️ გაკვეთილი დაიწყო.'
      );

      await loadDashboardStats();

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'გაკვეთილის დაწყება ვერ მოხერხდა.'
        ),
        true
      );

    } finally {
      setButtonLoading(
        button,
        false
      );
    }
  }

  async function finishLesson() {
    if (!currentLesson?.id) {
      return msg(
        'ჯერ აირჩიე მიმდინარე გაკვეთილი.',
        true
      );
    }

    const confirmed =
      confirm(
        'დარწმუნებული ხარ, რომ გინდა გაკვეთილის დასრულება?'
      );

    if (!confirmed) return;

    const button =
      $('finishLessonBtn');

    setButtonLoading(
      button,
      true,
      '⏹️ სრულდება...'
    );

    try {
      const result =
        await db
          .from('schedules')
          .update({
            status: 'done',
            finished_at:
              new Date().toISOString()
          })
          .eq(
            'id',
            currentLesson.id
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .select()
          .single();

      if (result.error) {
        throw result.error;
      }

      await showLesson(
        result.data
      );

      msg(
        '⏹️ გაკვეთილი დასრულდა.'
      );

      await loadHistory();

      await loadDashboardStats();

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'გაკვეთილის დასრულება ვერ მოხერხდა.'
        ),
        true
      );

    } finally {
      setButtonLoading(
        button,
        false
      );
    }
  }

  /* ============================================================
     ATTENDANCE
     ============================================================ */

  async function loadAttendance() {
    const box =
      $('attendanceList');

    if (!box) return;

    if (!currentLesson?.id) {
      box.innerHTML = `
        <div class="muted">
          ჯერ აირჩიე გაკვეთილი „გაკვეთილის მართვიდან“.
        </div>
      `;

      return;
    }

    setLoading(
      box,
      'დასწრების მონაცემები იტვირთება...'
    );

    try {
      const result =
        await db
          .from('attendance')
          .select('*')
          .eq(
            'schedule_id',
            currentLesson.id
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .maybeSingle();

      if (result.error) {
        throw result.error;
      }

      currentAttendance =
        result.data || null;

      renderAttendance(
        currentAttendance
      );

    } catch (error) {
      console.error(error);

      box.innerHTML = `
        <div class="muted">
          ❌ დასწრების მონაცემები ვერ ჩაიტვირთა.
        </div>
      `;

      msg(
        safeError(
          error,
          'დასწრების ჩატვირთვა ვერ მოხერხდა.'
        ),
        true
      );
    }
  }

  function renderAttendance(row) {
    const box =
      $('attendanceList');

    if (!box) return;

    const student =
      getStudent(
        currentLesson?.student_id
      );

    const status =
      row?.status || '';

    const arrival =
      row?.arrival_time
        ? ` • მოსვლა ${formatTime(
            row.arrival_time
          )}`
        : '';

    const departure =
      row?.departure_time
        ? ` • წასვლა ${formatTime(
            row.departure_time
          )}`
        : '';

    box.innerHTML = `
      <div class="student-card">

        <div class="student-main">

          <div class="student-avatar">
            🧑‍🎓
          </div>

          <div>

            <div class="student-name">
              ${esc(
                student?.full_name ||
                'მოსწავლე'
              )}
            </div>

            <div class="small">
              ${
                status
                  ? attendanceText(status)
                  : 'დასწრება ჯერ არ დაფიქსირებულა'
              }
              ${arrival}
              ${departure}
            </div>

          </div>

        </div>

        <div class="attendance-buttons">

          <button
            type="button"
            class="att-btn ${
              status === 'present'
                ? 'active-present'
                : ''
            }"
            data-status="present"
          >
            ✅ მოსვლა
          </button>

          <button
            type="button"
            class="att-btn ${
              status === 'late'
                ? 'active-late'
                : ''
            }"
            data-status="late"
          >
            ⏰ დაგვიანება
          </button>

          <button
            type="button"
            class="att-btn ${
              status === 'absent'
                ? 'active-absent'
                : ''
            }"
            data-status="absent"
          >
            ❌ გაცდენა
          </button>

          <button
            type="button"
            class="att-btn"
            data-departure="1"
          >
            🚪 წასვლა
          </button>

        </div>

      </div>
    `;

    box
      .querySelectorAll('[data-status]')
      .forEach(button => {
        button.onclick = () =>
          setAttendance(
            button.dataset.status
          );
      });

    box
      .querySelector(
        '[data-departure]'
      )
      ?.addEventListener(
        'click',
        departure
      );
  }

  async function setAttendance(status) {
    if (!currentLesson?.id) {
      return msg(
        'ჯერ აირჩიე გაკვეთილი.',
        true
      );
    }

    if (
      ![
        'present',
        'late',
        'absent'
      ].includes(status)
    ) {
      return;
    }

    try {
      const now =
        new Date().toISOString();

      const existing =
        await db
          .from('attendance')
          .select('id')
          .eq(
            'schedule_id',
            currentLesson.id
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .maybeSingle();

      if (existing.error) {
        throw existing.error;
      }

      const payload = {
        schedule_id:
          currentLesson.id,

        student_id:
          currentLesson.student_id,

        teacher_id:
          teacher.id,

        status,

        arrival_time:
          status === 'absent'
            ? null
            : (
                currentAttendance?.arrival_time ||
                now
              )
      };

      let result;

      if (existing.data?.id) {
        result =
          await db
            .from('attendance')
            .update(payload)
            .eq(
              'id',
              existing.data.id
            )
            .select()
            .single();

      } else {
        result =
          await db
            .from('attendance')
            .insert(payload)
            .select()
            .single();
      }

      if (result.error) {
        throw result.error;
      }

      currentAttendance =
        result.data;

      msg(
        `${attendanceText(
          status
        )} დაფიქსირდა.`
      );

      await loadAttendance();

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'დასწრების შენახვა ვერ მოხერხდა.'
        ),
        true
      );
    }
  }

  async function departure() {
    if (!currentLesson?.id) {
      return msg(
        'ჯერ აირჩიე გაკვეთილი.',
        true
      );
    }

    try {
      const result =
        await db.rpc(
          'teacher_mark_departure',
          {
            p_schedule_id:
              currentLesson.id,

            p_student_id:
              currentLesson.student_id
          }
        );

      if (result.error) {
        throw result.error;
      }

      msg(
        '🚪 წასვლა დაფიქსირდა.'
      );

      await loadAttendance();

    } catch (error) {
      console.error(error);

      /*
       * Fallback:
       * If RPC doesn't exist, try direct update.
       */
      try {
        const now =
          new Date().toISOString();

        const existing =
          await db
            .from('attendance')
            .select('id')
            .eq(
              'schedule_id',
              currentLesson.id
            )
            .eq(
              'teacher_id',
              teacher.id
            )
            .maybeSingle();

        if (existing.error) {
          throw existing.error;
        }

        if (!existing.data?.id) {
          throw error;
        }

        const update =
          await db
            .from('attendance')
            .update({
              departure_time:
                now
            })
            .eq(
              'id',
              existing.data.id
            );

        if (update.error) {
          throw update.error;
        }

        msg(
          '🚪 წასვლა დაფიქსირდა.'
        );

        await loadAttendance();

      } catch (fallbackError) {
        msg(
          safeError(
            fallbackError,
            'წასვლის დაფიქსირება ვერ მოხერხდა.'
          ),
          true
        );
      }
    }
  }

  /* ============================================================
     GRADES
     ============================================================ */

  async function saveGrade() {
    const studentId =
      $('gradeStudent')?.value;

    const score =
      Number(
        $('gradeScore')?.value
      );

    const comment =
      String(
        $('gradeComment')?.value ||
        ''
      ).trim();

    if (!studentId) {
      return msg(
        'აირჩიე მოსწავლე.',
        true
      );
    }

    if (
      !Number.isFinite(score) ||
      score < 0 ||
      score > 10
    ) {
      return msg(
        'შეფასება უნდა იყოს 0-დან 10-მდე.',
        true
      );
    }

    const payload = {
      student_id:
        studentId,

      teacher_id:
        teacher.id,

      grade:
        score,

      comment:
        comment || null,

      lesson_id:
        currentLesson?.id
          ? String(
              currentLesson.id
            )
          : null
    };

    const button =
      $('saveGradeBtn');

    setButtonLoading(
      button,
      true,
      '⭐ ინახება...'
    );

    try {
      const result =
        await db
          .from('student_grades')
          .insert(payload);

      if (result.error) {
        throw result.error;
      }

      msg(
        '⭐ შეფასება წარმატებით შეინახა.'
      );

      if ($('gradeScore')) {
        $('gradeScore').value = '';
      }

      if ($('gradeComment')) {
        $('gradeComment').value = '';
      }

      await loadGrades();

      await loadDashboardStats();

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'შეფასება ვერ შეინახა.'
        ),
        true
      );

    } finally {
      setButtonLoading(
        button,
        false
      );
    }
  }

  async function loadGrades() {
    const box =
      $('gradesList');

    if (!box) return;

    const studentId =
      $('gradeStudent')?.value;

    if (!studentId) {
      box.innerHTML = `
        <div class="muted">
          ⭐ აირჩიე მოსწავლე შეფასებების სანახავად.
        </div>
      `;

      return;
    }

    setLoading(
      box,
      'შეფასებები იტვირთება...'
    );

    try {
      const result =
        await db
          .from('student_grades')
          .select(
            'id,grade,comment,lesson_id,created_at'
          )
          .eq(
            'student_id',
            studentId
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .order(
            'created_at',
            {
              ascending: false
            }
          )
          .limit(50);

      if (result.error) {
        throw result.error;
      }

      renderGrades(
        result.data || []
      );

      renderGradeAverage(
        result.data || []
      );

    } catch (error) {
      console.error(error);

      box.innerHTML = `
        <div class="muted">
          ❌ შეფასებების ჩატვირთვა ვერ მოხერხდა.
        </div>
      `;

      msg(
        safeError(
          error,
          'შეფასებების ჩატვირთვა ვერ მოხერხდა.'
        ),
        true
      );
    }
  }

  function renderGrades(rows) {
    const box =
      $('gradesList');

    if (!box) return;

    if (!rows.length) {
      box.innerHTML = `
        <div class="muted">
          ⭐ ამ მოსწავლეს შეფასებები ჯერ არ აქვს.
        </div>
      `;

      return;
    }

    box.innerHTML =
      rows.map(row => `
        <div class="history-row grade-row">

          <b>
            ⭐ ${esc(row.grade)}/10
          </b>

          <span>
            ${esc(
              row.comment ||
              'შეფასების კომენტარი არ არის'
            )}
          </span>

          <small>
            ${esc(
              formatDateTime(
                row.created_at
              )
            )}
          </small>

        </div>
      `).join('');
  }

  function renderGradeAverage(rows) {
    if (!rows.length) {
      setText(
        'gradeAverage',
        '—'
      );

      return;
    }

    const values =
      rows
        .map(row =>
          Number(row.grade)
        )
        .filter(
          Number.isFinite
        );

    if (!values.length) {
      setText(
        'gradeAverage',
        '—'
      );

      return;
    }

    const average =
      values.reduce(
        (a, b) => a + b,
        0
      ) / values.length;

    setText(
      'gradeAverage',
      average.toFixed(1)
    );
  }

  /* ============================================================
     HISTORY
     ============================================================ */

  async function loadHistory() {
    const box =
      $('historyList');

    if (!box || !db || !teacher) {
      return;
    }

    if (loadingHistory) return;

    loadingHistory = true;

    setLoading(
      box,
      'გაკვეთილების ისტორია იტვირთება...'
    );

    try {
      let query =
        db
          .from('schedules')
          .select('*')
          .eq(
            'teacher_id',
            teacher.id
          )
          .order(
            'lesson_date',
            {
              ascending: false
            }
          )
          .order(
            'start_time',
            {
              ascending: false
            }
          )
          .limit(100);

      /*
       * Optional date filter.
       */
      const historyDate =
        $('historyDate')?.value;

      if (historyDate) {
        /*
         * We intentionally filter only when
         * a date is selected and the HTML has
         * an explicit historyDate field.
         */
        const useDateFilter =
          $('historyDate')?.dataset
            ?.filter === 'true';

        if (useDateFilter) {
          query =
            query.eq(
              'lesson_date',
              historyDate
            );
        }
      }

      const result =
        await query;

      if (result.error) {
        throw result.error;
      }

      const schedules =
        result.data || [];

      const ids =
        [
          ...new Set(
            schedules
              .map(
                item =>
                  item.student_id
              )
              .filter(Boolean)
          )
        ];

      let profiles = [];

      if (ids.length) {
        const profileResult =
          await db
            .from('profiles')
            .select(
              'user_id,full_name,grade'
            )
            .in(
              'user_id',
              ids
            );

        if (profileResult.error) {
          throw profileResult.error;
        }

        profiles =
          profileResult.data || [];
      }

      const profileMap =
        new Map(
          profiles.map(
            profile => [
              profile.user_id,
              profile
            ]
          )
        );

      renderHistory(
        schedules,
        profileMap
      );

    } catch (error) {
      console.error(error);

      box.innerHTML = `
        <div class="muted">
          ❌ ისტორიის ჩატვირთვა ვერ მოხერხდა.
        </div>
      `;

      msg(
        safeError(
          error,
          'გაკვეთილების ისტორია ვერ ჩაიტვირთა.'
        ),
        true
      );

    } finally {
      loadingHistory = false;
    }
  }

  function renderHistory(
    schedules,
    profileMap
  ) {
    const box =
      $('historyList');

    if (!box) return;

    if (!schedules.length) {
      box.innerHTML = `
        <div class="muted empty-state">
          📚 გაკვეთილების ისტორია ცარიელია.
        </div>
      `;

      return;
    }

    box.innerHTML =
      schedules.map(lesson => {
        const profile =
          profileMap.get(
            lesson.student_id
          );

        const grade =
          profile?.grade
            ? `მე-${profile.grade}`
            : 'კლასი ?';

        const start =
          formatTime(
            lesson.start_time
          );

        const end =
          lesson.end_time
            ? ` — ${formatTime(
                lesson.end_time
              )}`
            : '';

        return `
          <div
            class="history-row"
            data-history-id="${esc(
              lesson.id
            )}"
          >

            <div class="history-main">

              <b>
                🧑‍🎓 ${esc(
                  profile?.full_name ||
                  'მოსწავლე'
                )}
              </b>

              <span>
                ${esc(grade)}
                •
                ${esc(
                  formatDate(
                    lesson.lesson_date
                  )
                )}
                •
                ${esc(start)}
                ${esc(end)}
              </span>

              <small>
                ${statusText(
                  lesson.status
                )}
                •
                ${esc(
                  lesson.subject ||
                  'English'
                )}
              </small>

            </div>

            <button
              type="button"
              class="btn gray"
              data-open="${esc(
                lesson.id
              )}"
            >
              👁️ გახსნა
            </button>

          </div>
        `;
      }).join('');

    box
      .querySelectorAll('[data-open]')
      .forEach(button => {
        button.onclick = () =>
          openHistoryLesson(
            button.dataset.open,
            profileMap
          );
      });
  }

  async function openHistoryLesson(
    id,
    profileMap
  ) {
    if (!id) return;

    try {
      const result =
        await db
          .from('schedules')
          .select('*')
          .eq(
            'id',
            id
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .maybeSingle();

      if (result.error) {
        throw result.error;
      }

      if (!result.data) {
        return msg(
          'გაკვეთილი ვერ მოიძებნა.',
          true
        );
      }

      /*
       * Activate lesson tab.
       */
      const tab =
        document.querySelector(
          '[data-tab="lesson"]'
        );

      if (tab) {
        tab.click();
      }

      await showLesson(
        result.data
      );

      const profile =
        profileMap?.get(
          result.data.student_id
        ) ||
        getStudent(
          result.data.student_id
        );

      if ($('classSelect')) {
        $('classSelect').value =
          profile?.grade || '';

        await loadLessonStudents();

        if ($('studentSelect')) {
          $('studentSelect').value =
            result.data.student_id;
        }
      }

      msg(
        '📖 გაკვეთილი გაიხსნა.'
      );

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'გაკვეთილის გახსნა ვერ მოხერხდა.'
        ),
        true
      );
    }
  }

  /* ============================================================
     DASHBOARD STATISTICS
     ============================================================ */

  async function loadDashboardStats() {
    if (!teacher || !db) return;

    try {
      updateStudentCounters();

      /*
       * Current teacher schedules.
       */
      const schedulesResult =
        await db
          .from('schedules')
          .select(
            'id,status,lesson_date,start_time'
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .order(
            'lesson_date',
            {
              ascending: false
            }
          )
          .limit(500);

      if (schedulesResult.error) {
        throw schedulesResult.error;
      }

      const schedules =
        schedulesResult.data || [];

      const today =
        localDateISO();

      const todayLessons =
        schedules.filter(
          lesson =>
            lesson.lesson_date === today
        );

      const live =
        schedules.filter(
          lesson =>
            lesson.status === 'live'
        ).length;

      const done =
        schedules.filter(
          lesson =>
            lesson.status === 'done'
        ).length;

      const planned =
        schedules.filter(
          lesson =>
            lesson.status !== 'done' &&
            lesson.status !== 'live' &&
            lesson.status !== 'cancelled'
        ).length;

      setText(
        'todayLessons',
        todayLessons.length
      );

      setText(
        'liveLessons',
        live
      );

      setText(
        'completedLessons',
        done
      );

      setText(
        'plannedLessons',
        planned
      );

      /*
       * Optional attendance statistics.
       */
      await loadAttendanceStats();

    } catch (error) {
      console.error(
        'Dashboard stats:',
        error
      );
    }
  }

  async function loadAttendanceStats() {
    try {
      const result =
        await db
          .from('attendance')
          .select(
            'status'
          )
          .eq(
            'teacher_id',
            teacher.id
          )
          .limit(1000);

      if (result.error) {
        return;
      }

      const rows =
        result.data || [];

      const present =
        rows.filter(
          row =>
            row.status === 'present'
        ).length;

      const late =
        rows.filter(
          row =>
            row.status === 'late'
        ).length;

      const absent =
        rows.filter(
          row =>
            row.status === 'absent'
        ).length;

      setText(
        'presentCount',
        present
      );

      setText(
        'lateCount',
        late
      );

      setText(
        'absentCount',
        absent
      );

      const total =
        present +
        late +
        absent;

      const attendancePercent =
        total
          ? Math.round(
              (
                (present + late) /
                total
              ) * 100
            )
          : 0;

      setText(
        'attendancePercent',
        `${attendancePercent}%`
      );

    } catch (error) {
      console.error(
        'Attendance statistics:',
        error
      );
    }
  }

  /* ============================================================
     LOGOUT
     ============================================================ */

  async function logout() {
    const confirmed =
      confirm(
        'ნამდვილად გინდა გამოსვლა?'
      );

    if (!confirmed) return;

    try {
      const result =
        await db.auth.signOut();

      if (result.error) {
        throw result.error;
      }

      location.replace(
        'login.html'
      );

    } catch (error) {
      console.error(error);

      msg(
        safeError(
          error,
          'ანგარიშიდან გამოსვლა ვერ მოხერხდა.'
        ),
        true
      );
    }
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */

  window.teacherDashboard = {
    reload: async function () {
      await loadStudents();
      await loadHistory();
      await loadDashboardStats();
    },

    reloadStudents:
      loadStudents,

    reloadHistory:
      loadHistory,

    reloadStats:
      loadDashboardStats,

    newLesson:
      newLesson,

    findLesson:
      findLesson,

    loadAttendance:
      loadAttendance,

    loadGrades:
      loadGrades,

    getCurrentLesson:
      () => currentLesson,

    getStudents:
      () => [...students]
  };

  /* ============================================================
     START
     ============================================================ */

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }

})();
