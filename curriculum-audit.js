/* English with Mariami — cross-grade curriculum audit
   Safe diagnostic layer. It does not change lesson content or progress.
*/
(function(){
  'use strict';
  const maps={
    2:window.GRADE2_CURRICULUM_MAP||[],
    3:window.GRADE3_CURRICULUM_MAP||[],
    4:window.GRADE4_CURRICULUM_MAP||[]
  };
  function normalize(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function auditGrade(g){
    const map=maps[g];
    const ids=new Set();
    const issues=[];
    if(!Array.isArray(map)||!map.length)return {grade:g,count:0,issues:['curriculum map missing or empty']};
    map.forEach((item,i)=>{
      if(!item||item.id==null)issues.push(`item ${i+1}: missing id`);
      else if(ids.has(item.id))issues.push(`duplicate id: ${item.id}`);
      else ids.add(item.id);
      ['key','title','goal','practice'].forEach(k=>{if(!item?.[k])issues.push(`item ${item?.id??i+1}: missing ${k}`)});
    });
    return {grade:g,count:map.length,issues};
  }
  function run(){
    const report=[2,3,4].map(auditGrade);
    const all=[];
    report.forEach(r=>r.issues.forEach(x=>all.push(`G${r.grade}: ${x}`)));
    return {ok:all.length===0,grades:report,issues:all};
  }
  window.ENGLISH_MARIAMI_CURRICULUM_AUDIT={run,normalize};
})();
