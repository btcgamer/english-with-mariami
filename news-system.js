(function(){
'use strict';
const state={grade:'all',rows:[]};
function client(){return window.__ENGLISH_MARIAMI_SUPABASE_CLIENT||window.supabaseClient||null}
function esc(v){return String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]))}
function render(){
 const grid=document.getElementById('academyNewsGrid'); if(!grid)return;
 const rows=state.rows.filter(x=>state.grade==='all'||String(x.grade)===state.grade);
 if(!rows.length){grid.innerHTML='<div class="status">📡 No news / სიახლეები ჯერ არ არის.</div>';return}
 grid.innerHTML=rows.map(x=>'<article class="neon-card" style="padding:20px"><span class="pill">🎓 Grade '+esc(x.grade)+' / კლასი '+esc(x.grade)+'</span><div style="margin:12px 0 8px;font-size:19px;font-weight:1000;color:var(--c)">'+esc(x.title_en)+'</div><div style="font-size:15px;font-weight:800;margin-bottom:10px">'+esc(x.title_ka)+'</div><p style="color:#a9ccd4;line-height:1.6;font-size:13px">'+esc(x.summary_en)+'</p><p style="color:#c8eaf2;line-height:1.6;font-size:13px;margin-top:7px">'+esc(x.summary_ka)+'</p><div style="margin-top:14px;color:#7faab5;font-size:11px">📅 '+new Date(x.published_at).toLocaleDateString('ka-GE')+'</div></article>').join('');
}
async function load(){
 const grid=document.getElementById('academyNewsGrid'), c=client();
 if(!grid)return;
 if(!c){grid.innerHTML='<div class="status">⚠️ Supabase is not ready / Supabase ჯერ მზად არ არის.</div>';return}
 const {data,error}=await c.from('academy_news').select('id,grade,title_en,title_ka,summary_en,summary_ka,published_at,image_url').order('published_at',{ascending:false});
 if(error){console.error('Academy News error:',error);grid.innerHTML='<div class="status">⚠️ News connection error / სიახლეების ჩატვირთვის შეცდომა.</div>';return}
 state.rows=data||[]; render();
}
document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.news-filter').forEach(b=>b.addEventListener('click',()=>{
  document.querySelectorAll('.news-filter').forEach(x=>x.classList.remove('active'));
  b.classList.add('active'); state.grade=b.dataset.grade; render();
 }));
 load();
});
window.addEventListener('englishMariamiSupabaseReady',load);
})();