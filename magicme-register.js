'use strict';
// MAGICME_PRO_V11_REAL_REGISTRATION_BRIDGE — local site integration.
// Does not send data; the existing register.html signup handler does that.
(() => {
  const form = document.getElementById('registerForm');
  const stage = document.getElementById('mm11Bridge');
  const frame = document.getElementById('mm11Frame');
  if (!form || !stage || !frame) return;
  const $ = id => document.getElementById(id);
  const message = $('mm11Message');
  const confirm = $('mm11Confirm');
  const skip = $('mm11Skip');
  const details = $('mm11Details');
  const state = {confirmed:null, loaded:false};
  const valid = a => Boolean(a && (a.gender==='girl'||a.gender==='boy') &&
    Number.isInteger(a.outfit_index) && a.outfit_index>=0 && a.outfit_index<3 &&
    Number.isInteger(a.sneaker_index) && a.sneaker_index>=0 && a.sneaker_index<4);
  function peek() {
    let doc;
    try { doc=frame.contentDocument; } catch (_) { return null; }
    if (!doc || !doc.querySelector('#stage')) return null;
    const active = doc.querySelector('[data-gender][aria-pressed="true"]') ||
                   doc.querySelector('[data-gender].selected');
    const gender=active?.dataset?.gender;
    if (gender!=='girl'&&gender!=='boy') return null;
    const choose = el => el.classList.contains('active') || el.getAttribute('aria-pressed')==='true';
    const outfit = Array.from(doc.querySelectorAll('#magicOutfitButtons .magic-outfit-btn')).findIndex(choose);
    const sneaker = Array.from(doc.querySelectorAll('#mm2Shoe .mm2-choice')).findIndex(choose);
    const avatar={version:11,gender,outfit_index:outfit,sneaker_index:sneaker};
    return valid(avatar)?avatar:null;
  }
  function equal(a,b) { return valid(a)&&valid(b) &&
    a.gender===b.gender && a.outfit_index===b.outfit_index && a.sneaker_index===b.sneaker_index; }
  // Public API returns ONLY a narrow whitelist, never passwords/names/emails.
  window.magicMeReadRegistrationAvatar = () => {
    const now=peek();
    return (!skip.checked && equal(state.confirmed,now)) ?
      { magicme_avatar:{version:11,gender:now.gender,outfit_index:now.outfit_index,sneaker_index:now.sneaker_index} } : {};
  };
  function paint() {
    const a=peek();
    details.textContent=a ? `${a.gender==='girl'?'👧 Girl':'👦 Boy'} · Outfit ${a.outfit_index+1} · Sneakers ${a.sneaker_index+1}` : '3D სტუდია იტვირთება…';
    if(skip.checked) {
      message.textContent='ავატარის გარეშე რეგისტრაციას გააგრძელებ. სურვილის შემთხვევაში მოგვიანებით აირჩევ.';
      return;
    }
    if (equal(state.confirmed,a)) {
      message.textContent='✅ შენი 3D გმირი დადასტურებულია და რეგისტრაციისას ანგარიშს მიებმება.';
    } else if(state.confirmed) {
      state.confirmed=null;
      message.textContent='გარეგნობა შეიცვალა — დაადასტურე ახალი არჩევანი.';
    } else if(a) {
      message.textContent='აირჩიე სასურველი გმირი და დააჭირე „ავატარის დადასტურება“-ს.';
    } else {
      message.textContent='გმირის ჩატვირთვას ველოდებით; სურვილის შემთხვევაში შეგიძლია გამოტოვო.';
    }
  }
  confirm.addEventListener('click',()=>{
    const a=peek();
    if(!a){message.textContent='⚠️ ჯერ უნდა ჩაიტვირთოს 3D გმირი, სამოსი და სნიკერები.';return;}
    skip.checked=false;
    state.confirmed={...a};
    paint();
  });
  skip.addEventListener('change',()=>{
    if (skip.checked) state.confirmed=null;
    paint();
  });
  // The original signup handler is already on the form in bubble phase.
  // Capturing prevents a signup that silently loses an intended avatar.
  form.addEventListener('submit',e=>{
    const payload=window.magicMeReadRegistrationAvatar();
    if(!skip.checked && !payload.magicme_avatar){
      e.preventDefault(); e.stopImmediatePropagation();
      message.textContent='⚠️ ჯერ დაადასტურე გმირი ან მონიშნე „ავატარის გარეშე გაგრძელება“.';
      stage.scrollIntoView({behavior:'smooth',block:'start'});
    }
  },true);

  // V10-style responsive workspace: reparent nodes, preserving original form and listeners.
  const root=[...document.body.children].find(el=>el!==stage && el.contains(form) && el.contains(stage));
  if(root && root!==document.body){
    const workspace=document.createElement('div');
    workspace.id='mm11Workspace';
    const left=document.createElement('section'); left.className='mm11-visual';
    const right=document.createElement('section'); right.className='mm11-registration';
    root.parentNode.insertBefore(workspace,root);
    left.appendChild(stage);
    right.appendChild(root);
    workspace.append(left,right);
    document.body.classList.add('mm11-layout');
  }

  let scheduled=false;
  function heightFit(){
    scheduled=false;
    let doc;
    try { doc=frame.contentDocument; }catch(_){return;}
    const shell=doc?.querySelector('.shell');
    if (!shell) return;
    const h=Math.ceil(Math.max(shell.scrollHeight,shell.getBoundingClientRect().height)+12);
    if(h>250&&h<12000&&Math.abs(frame.getBoundingClientRect().height-h)>3){frame.style.height=h+'px';}
  }
  function scheduleHeight(){ if(!scheduled){scheduled=true;requestAnimationFrame(heightFit);} }
  let observer=null;
  function setupFrame() {
    let doc;
    try{doc=frame.contentDocument;}catch(_){message.textContent='სტუდია იმავე დომენზე უნდა იტვირთებოდეს.';return;}
    if(!doc?.head||!doc.querySelector('.stage-wrap'))return;
    if(!doc.getElementById('mm11-embedded-style')){
      const css=doc.createElement('style');css.id='mm11-embedded-style';
      css.textContent=`
        html,body{margin:0!important;min-height:0!important;height:auto!important;overflow:hidden!important}
        .shell{max-width:none!important;width:100%!important;padding:9px!important;margin:0!important}
        .heading{display:none!important}
        .layout{display:grid!important;grid-template-columns:minmax(0,1.2fr) minmax(240px,.8fr)!important;gap:12px!important;align-items:start!important}
        .stage-wrap{min-height:0!important;height:465px!important;border-radius:15px!important}
        .controls{max-height:465px!important;overflow-y:auto!important;min-width:0!important}
        .controls>.panel{padding:11px!important}
        .controls>.panel:nth-child(3),.controls>.disclaimer{display:none!important}
        .controls button{min-height:46px!important}
        @media(max-width:760px){.layout{grid-template-columns:minmax(0,1fr)!important;gap:9px!important}.stage-wrap{height:clamp(330px,95vw,455px)!important}.controls{max-height:none!important;overflow:visible!important}.controls button{min-height:48px!important}}
      `;
      doc.head.appendChild(css);
    }
    if(observer)observer.disconnect();
    const shell=doc.querySelector('.shell');
    if(typeof ResizeObserver==='function'&&shell){observer=new ResizeObserver(scheduleHeight);observer.observe(shell);}
    scheduleHeight();
  }
  frame.addEventListener('load',()=>{state.loaded=true;setupFrame();paint();});
  window.addEventListener('resize',()=>{if(state.loaded){scheduleHeight();paint();}});
  const timer=setInterval(()=>{if(!document.hidden){paint();if(state.loaded)scheduleHeight();}},750);
  window.addEventListener('pagehide',()=>{clearInterval(timer);if(observer)observer.disconnect();},{once:true});
  paint();
})();
