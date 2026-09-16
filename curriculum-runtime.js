/* MAGIC ENGLISH — Advanced Curriculum Runtime v1
   New Grades runtime: Grade 5–12 curriculum JSON worlds.
   Intentionally isolated from the legacy Grade 2/3/4 lesson engine.
*/
(function () {
  'use strict';

  const DEFAULT_CONFIG = {
    root: 'curriculum',
    worldCount: 10,
    missionCount: 20
  };

  const state = {
    grade: 0,
    world: 1,
    worldData: null,
    cache: new Map(),
    loading: false
  };

  function esc(value) {
    return String(value ?? '').replace(/[&<>\"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#039;'
    }[c]));
  }

  function getConfig() {
    return Object.assign({}, DEFAULT_CONFIG, window.MAGIC_CURRICULUM_CONFIG || {});
  }

  function getGrade() {
    const fromBody = document.body && Number(document.body.dataset.grade);
    const fromGlobal = Number(window.MAGIC_CURRICULUM_GRADE);
    const value = fromBody || fromGlobal;
    return Number.isInteger(value) ? value : 0;
  }

  function worldUrl(grade, world) {
    const config = getConfig();
    return `${String(config.root).replace(/\/$/, '')}/grade${grade}-world${world}.json`;
  }

  async function fetchWorld(grade, world) {
    const key = `${grade}:${world}`;
    if (state.cache.has(key)) return state.cache.get(key);

    const response = await fetch(worldUrl(grade, world), {
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`Curriculum World ${world} ვერ ჩაიტვირთა (${response.status}).`);

    const data = await response.json();
    validateWorld(data, grade, world);
    state.cache.set(key, data);
    return data;
  }

  function validateWorld(data, grade, world) {
    if (!data || Number(data.grade) !== grade || Number(data.world) !== world) {
      throw new Error(`არასწორი curriculum ფაილი: Grade ${grade} World ${world}.`);
    }
    if (!Array.isArray(data.missions)) {
      throw new Error(`Grade ${grade} World ${world}: missions მასივი ვერ მოიძებნა.`);
    }
  }

  function renderWorldNav(host, grade, activeWorld) {
    if (!host) return;
    const config = getConfig();
    host.innerHTML = Array.from({ length: config.worldCount }, (_, i) => {
      const world = i + 1;
      return `<button class="magic-world-btn ${world === activeWorld ? 'active' : ''}" data-curriculum-world="${world}">WORLD ${world}</button>`;
    }).join('');
    host.querySelectorAll('[data-curriculum-world]').forEach(button => {
      button.addEventListener('click', () => loadWorld(grade, Number(button.dataset.curriculumWorld)));
    });
  }

  function renderTargets(targets) {
    if (!targets || typeof targets !== 'object') return '';
    return Object.entries(targets).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
      return `<div class="magic-target"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;
    }).join('');
  }

  function renderMissions(missions) {
    return missions.map((mission, index) => {
      const number = mission.mission || mission.id || index + 1;
      const title = mission.title || mission.name || `Mission ${number}`;
      const focus = mission.focus || mission.description || mission.objective || '';
      return `<article class="magic-mission-card" data-mission="${esc(number)}">
        <div class="magic-mission-number">MISSION ${esc(number)}</div>
        <h3>${esc(title)}</h3>
        ${focus ? `<p>${esc(focus)}</p>` : ''}
        <button type="button" class="magic-mission-open" data-open-mission="${esc(number)}">ACTIVATE →</button>
      </article>`;
    }).join('');
  }

  function renderWorld(data) {
    const title = document.querySelector('[data-curriculum-title]');
    const level = document.querySelector('[data-curriculum-level]');
    const targets = document.querySelector('[data-curriculum-targets]');
    const missions = document.querySelector('[data-curriculum-missions]');
    const scenarios = document.querySelector('[data-curriculum-scenarios]');
    const assessment = document.querySelector('[data-curriculum-assessment]');

    if (title) title.textContent = data.title || `Grade ${data.grade} World ${data.world}`;
    if (level) level.textContent = data.level || '';
    if (targets) targets.innerHTML = renderTargets(data.targets);
    if (missions) missions.innerHTML = renderMissions(data.missions || []);
    if (scenarios) scenarios.innerHTML = renderGenericList(data.realWorldScenarios);
    if (assessment) assessment.innerHTML = renderGenericList(data.assessment);

    document.querySelectorAll('[data-open-mission]').forEach(button => {
      button.addEventListener('click', () => openMission(Number(button.dataset.openMission)));
    });
  }

  function renderGenericList(value) {
    if (!value) return '<div class="magic-empty">No data available.</div>';
    const items = Array.isArray(value) ? value : [value];
    return `<div class="magic-list">${items.map((item, index) => {
      if (typeof item === 'string' || typeof item === 'number') return `<div>${esc(item)}</div>`;
      const title = item.title || item.name || item.scenario || item.area || `Item ${index + 1}`;
      const body = item.description || item.task || item.outcome || item.criteria || item.details || '';
      return `<div><strong>${esc(title)}</strong>${body ? `<p>${esc(body)}</p>` : ''}</div>`;
    }).join('')}</div>`;
  }

  function openMission(number) {
    const data = state.worldData;
    const mission = (data?.missions || []).find((item, index) => Number(item.mission || item.id || index + 1) === number);
    if (!mission) return;

    const event = new CustomEvent('magicCurriculumMissionOpen', {
      detail: { grade: state.grade, world: state.world, mission, worldData: data }
    });
    window.dispatchEvent(event);

    const modal = document.querySelector('[data-curriculum-modal]');
    if (!modal) return;
    const title = modal.querySelector('[data-curriculum-modal-title]');
    const body = modal.querySelector('[data-curriculum-modal-body]');
    if (title) title.textContent = `MISSION ${number} — ${mission.title || mission.name || 'Mission'}`;
    if (body) body.innerHTML = renderMissionDetail(mission);
    modal.hidden = false;
    modal.classList.add('open');
  }

  function renderMissionDetail(mission) {
    const omit = new Set(['mission', 'id', 'title', 'name']);
    return `<div class="magic-mission-detail">${Object.entries(mission).filter(([key, value]) => !omit.has(key) && value != null).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
      const content = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      return `<section><h4>${esc(label)}</h4><p>${esc(content)}</p></section>`;
    }).join('')}</div>`;
  }

  async function loadWorld(grade, world) {
    if (state.loading) return;
    state.loading = true;
    const loading = document.querySelector('[data-curriculum-loading]');
    if (loading) loading.hidden = false;

    try {
      const data = await fetchWorld(grade, world);
      state.grade = grade;
      state.world = world;
      state.worldData = data;
      renderWorld(data);
      renderWorldNav(document.querySelector('[data-curriculum-world-nav]'), grade, world);
      window.dispatchEvent(new CustomEvent('magicCurriculumWorldLoaded', { detail: { grade, world, data } }));
    } catch (error) {
      console.error('[Magic Curriculum]', error);
      const errorHost = document.querySelector('[data-curriculum-error]');
      if (errorHost) {
        errorHost.hidden = false;
        errorHost.textContent = error.message || 'Curriculum ჩატვირთვა ვერ მოხერხდა.';
      }
    } finally {
      state.loading = false;
      if (loading) loading.hidden = true;
    }
  }

  function bindModal() {
    const modal = document.querySelector('[data-curriculum-modal]');
    if (!modal) return;
    const close = () => {
      modal.hidden = true;
      modal.classList.remove('open');
    };
    modal.querySelectorAll('[data-curriculum-close]').forEach(button => button.addEventListener('click', close));
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  }

  async function boot() {
    const grade = getGrade();
    if (!grade || grade < 5) return;
    window.MagicCurriculum = {
      state,
      loadWorld,
      fetchWorld,
      openMission,
      worldUrl
    };
    bindModal();
    const requestedWorld = Number(new URLSearchParams(window.location.search).get('world')) || 1;
    await loadWorld(grade, Math.min(Math.max(requestedWorld, 1), getConfig().worldCount));
  }

  boot();
})();
