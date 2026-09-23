(function(){
'use strict';
const state={grade:'all',rows:[],search:''};
const GRADE_META={
1:['🌱 Beginner / დამწყები','Academy / აკადემია'],
2:['🌱 Elementary / დაწყებითი','Daily English / ყოველდღიური ინგლისური'],
3:['🚀 Explorer / მკვლევარი','Stories / ისტორიები'],
4:['⭐ Explorer+ / მკვლევარი+','Skills / უნარები'],
5:['🧠 A2 Builder / A2 განვითარება','Everyday Skills / ყოველდღიური უნარები'],
6:['🔬 A2+ Builder / A2+ განვითარება','Real Life / რეალური ცხოვრება'],
7:['🌍 B1 Explorer / B1 მკვლევარი','Thinking / აზროვნება'],
8:['💫 B1+ World / B1+ სამყარო','Modern World / თანამედროვე სამყარო'],
9:['🎓 Academic / აკადემიური','Academic English / აკადემიური ინგლისური'],
10:['🚀 B2 Path / B2 გზა','Advanced Skills / მოწინავე უნარები'],
11:['🏆 Exam & Academic / გამოცდა და აკადემიური','Academic & Exam / აკადემიური და საგამოცდო'],
12:['👑 Future Ready / მომავლისთვის მზად','Future & Career / მომავალი და კარიერა']
};
function client(){return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null}
function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
function isNew(date){return (Date.now()-new Date(date).getTime())<7*86400000}
function injectTools(){
 const grid=document.getElementById('academyNewsGrid'); if(!grid||document.getElementById('newsSearch'))return;
 const box=document.createElement('div'); box.id='newsTools'; box.style.cssText='display:flex;gap:10px;flex-wrap:wrap;margin:0 0 18px';
 box.innerHTML='<input id="newsSearch" type="search" placeholder="🔎 Search news / მოძებნე სიახლე..." aria-label="Search news / სიახლეების ძიება" style="flex:1;min-width:220px;padding:13px 16px;border-radius:14px;border:1px solid rgba(90,220,255,.25);background:rgba(8,18,34,.72);color:#eaffff;outline:none"><span class="pill">🇬🇪 English + ქართული</span>';
 grid.parentElement.insertBefore(box,grid);
 document.getElementById('newsSearch').addEventListener('input',e=>{state.search=e.target.value.toLowerCase().trim();render()});
}
function ensureModal(){
 if(document.getElementById('newsModal'))return;
 const m=document.createElement('div'); m.id='newsModal'; m.hidden=true; m.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(1,5,15,.82);backdrop-filter:blur(12px);display:none;align-items:center;justify-content:center;padding:18px';
 m.innerHTML='<div id="newsModalCard" style="width:min(760px,100%);max-height:90vh;overflow:auto;border:1px solid rgba(92,226,255,.3);border-radius:24px;padding:24px;background:linear-gradient(145deg,rgba(10,25,48,.98),rgba(5,10,25,.98));box-shadow:0 0 50px rgba(0,220,255,.18);position:relative"><button id="newsClose" aria-label="Close / დახურვა" style="position:absolute;right:14px;top:14px;border:0;border-radius:50%;width:38px;height:38px;background:rgba(255,255,255,.08);color:white;font-size:20px;cursor:pointer">×</button><div id="newsModalBody"></div></div>';
 document.body.appendChild(m);
 const close=()=>{m.hidden=true;m.style.display='none';document.body.style.overflow=''};
 document.getElementById('newsClose').onclick=close;
 m.addEventListener('click',e=>{if(e.target===m)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!m.hidden)close()});
}
function openArticle(x){
 ensureModal(); const m=document.getElementById('newsModal'),body=document.getElementById('newsModalBody');
 const meta=GRADE_META[Number(x.grade)]||['🎓 Grade '+x.grade,'Academy / აკადემია'];
 const date=new Date(x.published_at).toLocaleDateString('ka-GE',{year:'numeric',month:'long',day:'numeric'});
 body.innerHTML='<div class="pill">'+esc(meta[0])+' • '+esc(meta[1])+'</div>'+
 (x.image_url?'<img src="'+esc(x.image_url)+'" alt="" style="width:100%;max-height:280px;object-fit:cover;border-radius:18px;margin:16px 0">':'')+
 '<h2 style="font-size:clamp(25px,5vw,38px);margin:16px 0 8px;color:#eaffff">'+esc(x.title_en)+'</h2>'+
 '<h3 style="margin:0 0 18px;color:#73e8ff">'+esc(x.title_ka)+'</h3>'+
 '<div style="font-size:12px;color:#83aeb9;margin-bottom:20px">📅 '+esc(date)+' • Grade '+esc(x.grade)+' / კლასი '+esc(x.grade)+'</div>'+
 '<div style="line-height:1.8;color:#d8f8ff;font-size:15px"><b>English</b><p>'+esc(x.summary_en)+'</p><hr style="border:0;border-top:1px solid rgba(255,255,255,.1)"><b>ქართული</b><p>'+esc(x.summary_ka)+'</p></div>';
 m.hidden=false;m.style.display='flex';document.body.style.overflow='hidden';
}
function render(){
 const grid=document.getElementById('academyNewsGrid'); if(!grid)return;
 const q=state.search;
 const rows=state.rows.filter(x=>(state.grade==='all'||String(x.grade)===state.grade)&&(!q||[x.title_en,x.title_ka,x.summary_en,x.summary_ka].some(v=>String(v||'').toLowerCase().includes(q))));
 if(!rows.length){grid.innerHTML='<div class="status">📡 No matching news / შესაბამისი სიახლე ვერ მოიძებნა.</div>';return}
 grid.innerHTML=rows.map((x,i)=>{
  const meta=GRADE_META[Number(x.grade)]||['🎓 Grade '+x.grade,'Academy / აკადემია'];
  const date=new Date(x.published_at).toLocaleDateString('ka-GE');
  return '<article class="neon-card academy-news-card" data-news-index="'+i+'" style="padding:20px;cursor:pointer;position:relative;transition:transform .2s ease,box-shadow .2s ease">'+
   (isNew(x.published_at)?'<span style="position:absolute;right:14px;top:14px;background:linear-gradient(90deg,#00e5ff,#8b5cf6);color:#fff;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:900">🆕 NEW / ახალი</span>':'')+
   '<span class="pill">'+esc(meta[0])+'</span><div style="margin:12px 0 7px;font-size:19px;font-weight:1000;color:var(--c)">'+esc(x.title_en)+'</div><div style="font-size:15px;font-weight:800;margin-bottom:10px">'+esc(x.title_ka)+'</div>'+
   '<p style="color:#a9ccd4;line-height:1.6;font-size:13px">'+esc(x.summary_en)+'</p><p style="color:#c8eaf2;line-height:1.6;font-size:13px;margin-top:7px">'+esc(x.summary_ka)+'</p>'+
   '<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:14px;color:#7faab5;font-size:11px"><span>📅 '+esc(date)+'</span><b style="color:#73e8ff">Read / წაკითხვა →</b></div></article>'
 }).join('');
 grid.querySelectorAll('.academy-news-card').forEach(card=>card.addEventListener('click',()=>openArticle(rows[Number(card.dataset.newsIndex)])));
}
async function load(){
 const grid=document.getElementById('academyNewsGrid'),c=client(); if(!grid)return;
 injectTools(); ensureModal();
 if(!c){grid.innerHTML='<div class="status">⚠️ Supabase is not ready / Supabase ჯერ მზად არ არის.</div>';return}
 const {data,error}=await c.from('academy_news').select('id,grade,title_en,title_ka,summary_en,summary_ka,published_at,image_url').order('published_at',{ascending:false});
 if(error){console.error('Academy News error:',error);grid.innerHTML='<div class="status">⚠️ News connection error / სიახლეების ჩატვირთვის შეცდომა.</div>';return}
 state.rows=data||[];render();
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.news-filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.news-filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.grade=b.dataset.grade;render()}));
 load();
});
window.addEventListener('englishMariamiSupabaseReady',load);
})();