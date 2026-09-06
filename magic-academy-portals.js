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
      (hero||document.body).appendChild(wrap);
    }
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
