/* Grade 2 dashboard bridge — additive/safe integration. */
(function(){
  'use strict';
  const path=(location.pathname||'').toLowerCase();
  const isGrade2=path.endsWith('/grade2/index.html');
  if(!isGrade2) return;
  const badge=document.createElement('div');
  badge.id='grade2SyncBadge';
  badge.textContent='LOCAL-FIRST • SYNC READY';
  badge.style.cssText='position:fixed;right:12px;bottom:12px;z-index:9999;padding:7px 10px;border:1px solid #00eaff55;border-radius:10px;background:#02040ddd;color:#00eaff;font:700 10px Arial;letter-spacing:1px;backdrop-filter:blur(10px)';
  document.body.appendChild(badge);
})();
