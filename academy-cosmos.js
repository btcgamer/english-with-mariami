// Presentation only. The existing academy guard decides when this scene starts.
const root = document.documentElement;
const stage = document.getElementById('academy-earth-stage');
const canvas = document.getElementById('academy-earth');
const button = document.getElementById('academy-motion');
const status = document.getElementById('earth-status-label');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
let userPaused = false;
let sceneVisible = false;
let renderScene = () => {};
let schedule = () => {};
let cancel = () => {};
let webgl = false;
let contextLost = false;
let dragging = false;
const paused = () => userPaused || reduced.matches;
const running = () => webgl && !contextLost && !paused() && sceneVisible && !document.hidden;
function syncMotion() {
  document.body.classList.toggle('academy-motion-paused', paused());
  document.body.classList.toggle('academy-tab-hidden', document.hidden);
  button.setAttribute('aria-pressed', String(paused()));
  button.disabled = reduced.matches;
  button.lastElementChild.textContent = reduced.matches ? 'შემცირებული მოძრაობა' : userPaused ? 'ანიმაციის ჩართვა' : 'ანიმაციის შეჩერება';
  status.textContent = paused() ? 'მოძრაობა შეჩერებულია' : webgl ? 'შენი სამყარო მოძრაობაშია' : 'შენი სასწავლო სამყარო';
  canvas.dataset.renderState = contextLost ? 'fallback' : running() ? 'running' : webgl ? 'paused' : 'fallback';
  if (running()) schedule(); else { cancel(); if (!contextLost) renderScene(); }
}
button.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
reduced.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
const selectedGrade = () => {
  const value = document.getElementById('grade').value;
  document.querySelectorAll('.academy-grade-portals a').forEach(link => {
    const active = new URL(link.href).searchParams.get('grade') === value;
    link.classList.toggle('is-current', active);
    if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
};
document.addEventListener('mariami:lesson-rendered', selectedGrade);
async function startScene() {
  syncMotion();
  selectedGrade();
  let renderer;
  try {
    const T = await import('./magicme-studio/vendor/three.module.js');
    renderer = new T.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.25 : 1.5));
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(43, 1, 0.1, 50);
    camera.position.z = 5.15;
    scene.add(new T.AmbientLight(0x779dff, 1.9));
    const sun = new T.DirectionalLight(0xb2f7ff, 2.7);
    sun.position.set(-3, 2, 4); scene.add(sun);
    const purple = new T.PointLight(0xa57aff, 10, 15);
    purple.position.set(3, -1, 2); scene.add(purple);
    const world = new T.Group(); scene.add(world);
    const axis = new T.Group(); axis.rotation.z = -0.23; world.add(axis);
    const texture = await new T.TextureLoader().loadAsync('./assets/academy/neon-earth.svg');
    texture.colorSpace = T.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const earth = new T.Mesh(new T.SphereGeometry(1.05, 64, 40), new T.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0x52c9fa, emissiveIntensity: 0.7, roughness: 0.82, metalness: 0.15 }));
    earth.rotation.y = 1.7; axis.add(earth);
    const atmosphere = new T.Mesh(new T.SphereGeometry(1.09, 48, 32), new T.ShaderMaterial({
      uniforms: { glow: { value: new T.Color(0x57cfff) } },
      vertexShader: 'varying vec3 n; varying vec3 v; void main(){vec4 p=modelViewMatrix*vec4(position,1.0); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p;}',
      fragmentShader: 'uniform vec3 glow; varying vec3 n; varying vec3 v; void main(){float rim=pow(1.0-abs(dot(normalize(n),normalize(v))),2.4);gl_FragColor=vec4(glow,rim*0.8);}',
      blending: T.AdditiveBlending, transparent: true, depthWrite: false, side: T.BackSide
    })); axis.add(atmosphere);
    // A dimensional open book anchors the Earth in the academy's visual world.
    const book = new T.Group();
    book.position.set(0, -1.48, 0.3); book.rotation.x = 0.48;
    const pageMaterial = new T.MeshStandardMaterial({ color: 0xb7e7ff, emissive: 0x214d7a, emissiveIntensity: 0.5, roughness: 0.55 });
    const coverMaterial = new T.MeshStandardMaterial({ color: 0x22244e, emissive: 0x512d9c, emissiveIntensity: 0.4, metalness: 0.3, roughness: 0.4 });
    for (const side of [-1, 1]) {
      const wing = new T.Group(); wing.position.x = side * 0.46; wing.rotation.z = side * 0.13;
      const cover = new T.Mesh(new T.BoxGeometry(0.97, 0.05, 0.78), coverMaterial); cover.position.y = -0.03; wing.add(cover);
      const pages = new T.Mesh(new T.BoxGeometry(0.91, 0.07, 0.71), pageMaterial); pages.position.y = 0.025; wing.add(pages);
      const rim = new T.LineSegments(new T.EdgesGeometry(pages.geometry), new T.LineBasicMaterial({ color: 0x8deaff, transparent: true, opacity: 0.65 })); rim.position.copy(pages.position); wing.add(rim);
      for (let row = 0; row < 5; row++) {
        const length = row === 4 ? 0.38 : 0.62;
        const line = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-length / 2, 0.064, -0.22 + row * 0.09), new T.Vector3(length / 2, 0.064, -0.22 + row * 0.09)]), new T.LineBasicMaterial({ color: 0x437faa, transparent: true, opacity: 0.65 })); wing.add(line);
      }
      book.add(wing);
    }
    world.add(book);
    const paths = [];
    for (let i = 0; i < 3; i++) {
      const orbit = new T.Group();
      orbit.rotation.x = [0.55, -0.65, 0.25][i];
      orbit.rotation.z = [-0.3, 0.55, 1.0][i];
      const radius = [1.4, 1.65, 1.83][i];
      const points = [];
      for (let j = 0; j < 128; j++) { const angle = j / 128 * Math.PI * 2; points.push(new T.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius)); }
      orbit.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(points), new T.LineBasicMaterial({ color: [0x6feaff, 0xbb8aff, 0x789eff][i], transparent: true, opacity: [0.58, 0.55, 0.3][i] })));
      const satellite = new T.Mesh(new T.SphereGeometry(i === 1 ? 0.055 : 0.033, 16, 12), new T.MeshBasicMaterial({ color: [0x9df5ff, 0xe2b7ff, 0xa6c5ff][i] }));
      orbit.add(satellite); paths.push({ orbit, satellite, radius, angle: i * 2.2, speed: [0.38, -0.24, 0.17][i] }); world.add(orbit);
    }
    let seed = 8231;
    const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
    const stars = new Float32Array(240 * 3);
    for (let i = 0; i < stars.length; i += 3) { stars[i] = (random() - 0.5) * 6; stars[i + 1] = (random() - 0.5) * 4.2; stars[i + 2] = -1 - random() * 2; }
    const starGeometry = new T.BufferGeometry(); starGeometry.setAttribute('position', new T.BufferAttribute(stars, 3));
    const starfield = new T.Points(starGeometry, new T.PointsMaterial({ color: 0x9edfff, size: 0.012, transparent: true, opacity: 0.7, depthWrite: false })); scene.add(starfield);
    let frame = 0; let last = 0;
    let viewX = 0; let viewY = 0;
    function positionSatellites(delta) {
      for (const path of paths) {
        path.angle += delta * path.speed;
        path.satellite.position.set(Math.cos(path.angle) * path.radius, 0, Math.sin(path.angle) * path.radius);
      }
    }
    renderScene = () => { positionSatellites(0); renderer.render(scene, camera); };
    function tick(now) {
      frame = 0;
      if (!running()) return;
      const delta = last ? Math.min((now - last) / 1000, 0.06) : 0;
      // At most 40 fps desktop / 30 fps mobile; no background/offscreen loop.
      const interval = innerWidth < 760 ? 1000 / 30 : 1000 / 40;
      if (last && now - last < interval) { frame = requestAnimationFrame(tick); return; }
      last = now;
      earth.rotation.y += delta * 0.16;
      book.position.y = -1.48 + Math.sin(now * 0.00065) * 0.025;
      starfield.rotation.z += delta * 0.008;
      positionSatellites(delta);
      world.rotation.x += (viewX - world.rotation.x) * 0.045;
      world.rotation.y += (viewY - world.rotation.y) * 0.045;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(tick);
    }
    cancel = () => { cancelAnimationFrame(frame); frame = 0; last = 0; };
    schedule = () => { if (!frame && running()) frame = requestAnimationFrame(tick); };
    const resize = () => {
      const width = stage.clientWidth, height = stage.clientHeight;
      if (!width || !height || contextLost) return;
      camera.aspect = width / height; camera.updateProjectionMatrix();
      // Reserve room for the orbits even on narrow phone layouts.
      camera.position.z = camera.aspect < 0.9 ? 5.7 : 5.15;
      renderer.setSize(width, height, false); renderScene();
    };
    const sizes = new ResizeObserver(resize); sizes.observe(stage);
    const visibility = new IntersectionObserver(entries => { sceneVisible = entries[0].isIntersecting; syncMotion(); }, { threshold: 0.03 }); visibility.observe(stage);
    canvas.addEventListener('keydown', event => {
      if (contextLost || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      earth.rotation.y += event.key === 'ArrowLeft' ? -0.16 : 0.16;
      renderScene();
    });
    canvas.addEventListener('pointerdown', event => {
      if (paused() || !finePointer.matches) return;
      dragging = true; canvas.setPointerCapture(event.pointerId); canvas.style.cursor = 'grabbing';
    });
    canvas.addEventListener('pointermove', event => {
      if (paused() || !finePointer.matches) return;
      const rect = canvas.getBoundingClientRect();
      viewX = ((event.clientY - rect.top) / rect.height - 0.5) * 0.13;
      viewY = ((event.clientX - rect.left) / rect.width - 0.5) * 0.2;
      if (dragging) earth.rotation.y += Math.max(-30, Math.min(30, event.movementX || 0)) * 0.009;
    });
    const release = () => { dragging = false; canvas.style.cursor = 'grab'; viewX = viewY = 0; };
    canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', release); canvas.addEventListener('pointerleave', () => { if (!dragging) release(); });
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost = true; webgl = false; cancel(); stage.classList.remove('globe-is-live'); canvas.dataset.renderState = 'fallback'; status.textContent = 'ილუსტრირებული დედამიწა'; });
    webgl = true; stage.classList.add('globe-is-live'); canvas.style.cursor = finePointer.matches ? 'grab' : 'default'; resize(); syncMotion();
    addEventListener('pagehide', () => {
      cancel(); sizes.disconnect(); visibility.disconnect();
    }, { once: true });
    addEventListener('pageshow', event => { if (event.persisted) { sizes.observe(stage); visibility.observe(stage); resize(); syncMotion(); } });
  } catch (error) {
    webgl = false; cancel();
    if (renderer) renderer.dispose();
    stage.classList.remove('globe-is-live');
    canvas.dataset.renderState = 'fallback';
    console.warn('[Academy globe] Using the illustrated Earth fallback:', error.message);
    syncMotion();
  }
}
if (root.classList.contains('mariami-auth-ready')) startScene();
else {
  const authorization = new MutationObserver(() => {
    if (!root.classList.contains('mariami-auth-ready')) return;
    authorization.disconnect(); startScene();
  });
  authorization.observe(root, { attributes: true, attributeFilter: ['class'] });
}
