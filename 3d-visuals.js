(() => {
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
})();