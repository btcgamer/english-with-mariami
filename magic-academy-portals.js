/* English with Mariami — Magic Academy portal interactions. */
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase();
  const home=path==='/'||path.endsWith('/index.html')||path.endsWith('english-with-mariami.github.io/index.html');
  const academy=/\/academy\.html$/i.test(path);
  if(!home&&!academy)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function portal(icon,title,sub,href,cls){
    const a=document.createElement('a');
    a.className='magic-grade-portal '+cls;
    a.href=href;
    a.innerHTML='<span class="portal-icon">'+icon+'</span><strong>'+title+'</strong><small>'+sub+'</small>';
    return a;
  }
  function homeLayout(){
    if(!home||document.getElementById('ewm-home-grade-layout'))return;
    const style=document.createElement('style');
    style.id='ewm-home-grade-layout';
    style.textContent=`
      .hero{flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;min-height:auto!important;padding:58px 6% 48px!important}
      .hero-content{width:100%!important;max-width:1000px!important}
      .hero-buttons{margin-top:22px!important;margin-bottom:30px!important}
      .magic-home-portals{position:static!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:100%!important;margin:0 auto!important;padding:0!important;display:flex!important;flex-wrap:wrap!important;gap:14px!important;align-items:center!important;justify-content:center!important;z-index:5!important}
      .magic-home-portals .magic-grade-portal{flex:0 1 148px!important}
      @media(max-width:600px){
        .hero{padding:48px 16px 38px!important}
        .hero-buttons{margin-top:18px!important;margin-bottom:24px!important}
        .magic-home-portals{gap:9px!important}
        .magic-home-portals .magic-grade-portal{flex:1 1 30%!important;min-width:96px!important}
      }
    `;
    document.head.appendChild(style);
  }
  function mount(){
    if(home&&!document.querySelector('.magic-home-portals')){
      const wrap=document.createElement('nav');
      wrap.className='magic-home-portals';
      wrap.setAttribute('aria-label','Grade portals');
      wrap.append(
        portal('🌱','GRADE 2','Beginner','/grade2/','g2'),
        portal('🔮','GRADE 3','Explorer','/grade3/','g3'),
        portal('👑','GRADE 4','Master','/grade4/','g4')
      );
      const hero=document.querySelector('.hero');
      const buttons=document.querySelector('.hero-buttons');
      if(buttons&&buttons.parentNode) buttons.parentNode.appendChild(wrap);
      else if(hero) hero.appendChild(wrap);
      else document.body.appendChild(wrap);
    }
    if(home)homeLayout();
    if(academy&&!document.querySelector('.magic-academy-portals')){
      const aura=document.createElement('div'); aura.className='magic-academy-aura'; aura.setAttribute('aria-hidden','true'); document.body.appendChild(aura);
      const orbit=document.createElement('div'); orbit.className='magic-academy-orbit'; orbit.setAttribute('aria-hidden','true'); document.body.appendChild(orbit);
      const wrap=document.createElement('nav'); wrap.className='magic-academy-portals'; wrap.setAttribute('aria-label','Grade portals');
      wrap.append(
        portal('🌱','GRADE 2','Beginner','/grade2/','g2'),
        portal('🔮','GRADE 3','Explorer','/grade3/','g3'),
        portal('👑','GRADE 4','Master','/grade4/','g4')
      );
      document.body.appendChild(wrap);
    }
    if(reduced)return;
    document.querySelectorAll('.magic-grade-portal').forEach(el=>{
      if(el.dataset.ewmTiltBound)return;
      el.dataset.ewmTiltBound='1';
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        el.style.transform='perspective(700px) rotateX('+(-y*9).toFixed(2)+'deg) rotateY('+(x*11).toFixed(2)+'deg) translateY(-7px) scale(1.04)';
      },{passive:true});
      el.addEventListener('pointerleave',()=>{el.style.transform='';},{passive:true});
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
