const SUPABASE_URL = "https://vtdhvsfqhwesxtwmduew.supabase.co";
const SUPABASE_KEY = "sb_publishable_MnrM2ulyJY_ugwfFVfpQYA_iV5wjCmt";

/* ==================================================
   ⚡ SHARED SUPABASE CLIENT
   Keep one Auth client per page. This avoids creating
   multiple Supabase clients on academy.html and makes
   login -> academy navigation faster.
================================================== */

(function(){
  if(!window.supabase || !window.supabase.createClient) return;

  const originalCreateClient = window.supabase.createClient.bind(window.supabase);

  if(!window.__ENGLISH_MARIAMI_SUPABASE_CLIENT){
    window.__ENGLISH_MARIAMI_SUPABASE_CLIENT = originalCreateClient(
      SUPABASE_URL,
      SUPABASE_KEY,
      {
        auth:{
          persistSession:true,
          autoRefreshToken:true,
          detectSessionInUrl:false
        }
      }
    );
  }

  window.supabase.createClient = function(){
    return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT;
  };
})();

/* ==================================================
   🔐 ACADEMY LOGOUT BUTTON
================================================== */

(function(){
  if(!/\/academy\.html$/i.test(window.location.pathname)) return;

  function addLogoutButton(){
    const nav = document.querySelector('.navlinks');
    if(!nav || document.getElementById('academyLogoutBtn')) return;

    const style = document.createElement('style');
    style.textContent = `
      #academyLogoutBtn{
        border:1px solid #ff6b6b99!important;
        background:linear-gradient(135deg,#ff5b5b,#d91e63)!important;
        color:#fff!important;
        font-weight:1000!important;
        cursor:pointer;
        box-shadow:0 0 18px #ff3b5b55;
      }
      #academyLogoutBtn:hover{
        background:linear-gradient(135deg,#ff7777,#ef2f75)!important;
        color:#fff!important;
        box-shadow:0 0 25px #ff416c99!important;
      }
    `;
    document.head.appendChild(style);

    const button = document.createElement('button');
    button.id = 'academyLogoutBtn';
    button.type = 'button';
    button.textContent = '🚪 გამოსვლა';

    button.addEventListener('click', async function(){
      button.disabled = true;
      button.textContent = 'გამოსვლა...';

      try{
        const client = window.__ENGLISH_MARIAMI_SUPABASE_CLIENT;
        const {error} = await client.auth.signOut();

        if(error) throw error;

        window.location.replace('login.html');
      }catch(error){
        console.error('Logout error:',error);
        button.disabled = false;
        button.textContent = '🚪 გამოსვლა';
        alert('გამოსვლისას მოხდა შეცდომა. სცადე თავიდან.');
      }
    });

    nav.appendChild(button);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',addLogoutButton);
  }else{
    addLogoutButton();
  }
})();

/* ==================================================
   📱 ENGLISH WITH MARIAMI — MOBILE APP UI
   Applies to academy + grade 2/3/4 pages.
   Desktop layout remains unchanged.
================================================== */

(function(){
  const page = window.location.pathname.toLowerCase();
  const isAppPage = /\/(academy|grade2|grade3|grade4)\.html$/.test(page);
  if(!isAppPage) return;

  const css = document.createElement('style');
  css.id = 'mariami-mobile-app-ui';
  css.textContent = `
    @media (max-width: 900px){
      :root{--app-cyan:#00eaff;--app-blue:#007cff;--app-dark:#020b19}

      body{
        padding-bottom:88px!important;
        -webkit-tap-highlight-color:transparent;
      }

      .top{
        position:sticky!important;
        top:0!important;
        z-index:100!important;
        background:rgba(2,15,32,.88)!important;
        border-bottom:1px solid rgba(0,234,255,.28)!important;
        box-shadow:0 8px 30px rgba(0,0,0,.28),0 0 25px rgba(0,234,255,.08)!important;
      }

      .nav{
        padding:10px 0!important;
        gap:9px!important;
      }

      .brand{
        font-size:15px!important;
        letter-spacing:.2px;
        white-space:nowrap;
      }

      .navlinks{
        display:flex!important;
        width:100%!important;
        gap:6px!important;
        flex-wrap:nowrap!important;
        overflow-x:auto!important;
        scrollbar-width:none!important;
        padding-bottom:2px;
      }
      .navlinks::-webkit-scrollbar{display:none}

      .navlinks a,
      #academyLogoutBtn{
        flex:0 0 auto!important;
        min-height:38px!important;
        padding:9px 11px!important;
        border-radius:13px!important;
        font-size:12px!important;
        white-space:nowrap!important;
      }

      .wrap{width:min(100% - 22px,760px)!important}

      .hero{
        min-height:auto!important;
        padding:34px 0 24px!important;
      }
      .hero-grid{gap:18px!important}
      .hero h1{
        font-size:clamp(37px,10vw,58px)!important;
        line-height:1.03!important;
      }
      .lead{font-size:16px!important;line-height:1.62!important}

      .buttons{gap:9px!important}
      .btn{
        min-height:46px!important;
        padding:12px 15px!important;
        border-radius:14px!important;
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        touch-action:manipulation;
      }

      .neon-card{
        border-radius:20px!important;
        box-shadow:0 12px 38px rgba(0,0,0,.45),0 0 24px rgba(0,234,255,.11)!important;
      }

      .teacher{padding:23px!important}
      .avatar{font-size:72px!important}

      .section{padding:35px 0!important}
      .section-title{margin-bottom:20px!important}
      .section-title h2{font-size:27px!important;line-height:1.15!important}

      .grid,.course,.feature-grid{
        gap:13px!important;
      }

      .grade,.course-card,.feature{
        min-width:0!important;
      }

      .grade{
        min-height:0!important;
      }

      .class-scene{height:205px!important}
      .grade-content{padding:19px!important}
      .grade h3{font-size:22px!important}
      .grade p{min-height:0!important;font-size:15px!important}

      /* App-like bottom navigation */
      .mariami-bottom-nav{
        position:fixed;
        left:10px;
        right:10px;
        bottom:10px;
        z-index:9999;
        display:grid;
        grid-template-columns:repeat(5,1fr);
        gap:4px;
        padding:8px 7px;
        border:1px solid rgba(0,234,255,.32);
        border-radius:22px;
        background:rgba(2,14,30,.92);
        box-shadow:0 12px 35px rgba(0,0,0,.65),0 0 30px rgba(0,234,255,.16);
        backdrop-filter:blur(18px);
        -webkit-backdrop-filter:blur(18px);
      }

      .mariami-bottom-nav a{
        min-width:0;
        min-height:58px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:3px;
        border-radius:16px;
        color:#bfefff;
        font-size:10px;
        font-weight:900;
        text-align:center;
        transition:transform .16s,background .16s,box-shadow .16s;
      }

      .mariami-bottom-nav a span:first-child{font-size:21px;line-height:1}
      .mariami-bottom-nav a.active{
        color:#fff;
        background:linear-gradient(145deg,rgba(0,201,242,.28),rgba(0,124,255,.18));
        box-shadow:inset 0 0 0 1px rgba(0,234,255,.18),0 0 18px rgba(0,234,255,.12);
      }

      .mariami-bottom-nav a:active{transform:scale(.93)}

      /* Touch wave / ripple */
      .mariami-ripple{
        position:fixed;
        z-index:99999;
        width:18px;
        height:18px;
        border-radius:50%;
        pointer-events:none;
        border:2px solid rgba(0,234,255,.95);
        box-shadow:0 0 12px rgba(0,234,255,.9),0 0 35px rgba(0,124,255,.65);
        transform:translate(-50%,-50%) scale(.2);
        animation:mariamiRipple .72s cubic-bezier(.15,.75,.2,1) forwards;
      }

      .mariami-ripple:after{
        content:"";
        position:absolute;
        inset:-7px;
        border:1px solid rgba(255,230,0,.8);
        border-radius:50%;
        animation:mariamiRipple .72s .08s cubic-bezier(.15,.75,.2,1) forwards;
      }

      @keyframes mariamiRipple{
        to{transform:translate(-50%,-50%) scale(11);opacity:0}
      }
    }

    @media (max-width:520px){
      .wrap{width:calc(100% - 18px)!important}
      .brand{font-size:14px!important}
      .top .nav{padding:8px 0!important}
      .hero h1{font-size:39px!important}
      .section-title h2{font-size:25px!important}
      .badge{font-size:11px!important;padding:7px 11px!important}
      .parent-content{width:94%!important}
      .mariami-bottom-nav{left:7px;right:7px;bottom:7px;border-radius:20px}
      .mariami-bottom-nav a{min-height:56px;font-size:9px}
      .mariami-bottom-nav a span:first-child{font-size:20px}
    }

    @media (prefers-reduced-motion:reduce){
      .mariami-ripple,.mariami-ripple:after{animation:none!important}
    }
  `;
  document.head.appendChild(css);

  function addMobileAppNav(){
    if(document.querySelector('.mariami-bottom-nav')) return;

    const nav = document.createElement('nav');
    nav.className = 'mariami-bottom-nav';
    nav.setAttribute('aria-label','მობილური მენიუ');

    const items = [
      ['🏠','მთავარი','index.html'],
      ['📚','გაკვეთილები','academy.html#grades'],
      ['📝','Quiz','academy.html#grades'],
      ['🏆','პროგრესი','academy.html#progress'],
      ['👤','პროფილი','academy.html#parents']
    ];

    items.forEach(function(item){
      const a = document.createElement('a');
      a.href = item[2];
      a.innerHTML = '<span>'+item[0]+'</span><span>'+item[1]+'</span>';
      nav.appendChild(a);
    });

    const path = window.location.pathname.toLowerCase();
    nav.children[0].classList.toggle('active',/\/index\.html$|\/$/.test(path));
    nav.children[1].classList.toggle('active',/\/(academy|grade2|grade3|grade4)\.html$/.test(path));
    if(location.hash === '#progress') nav.children[3].classList.add('active');
    if(location.hash === '#parents') nav.children[4].classList.add('active');

    document.body.appendChild(nav);
  }

  function addRipple(e){
    if(!window.matchMedia || !window.matchMedia('(max-width: 900px)').matches) return;
    const x = e.clientX;
    const y = e.clientY;
    if(typeof x !== 'number' || typeof y !== 'number') return;
    const ripple = document.createElement('span');
    ripple.className = 'mariami-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    document.body.appendChild(ripple);
    setTimeout(function(){ripple.remove()},850);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded',addMobileAppNav);
  }else{
    addMobileAppNav();
  }

  document.addEventListener('pointerdown',addRipple,{passive:true});
})();
