(()=>{
  if(!/\/academy\.html$/i.test(location.pathname)) return;
  // The Academy page already has its own complete visual design.
  // Remove only the extra runtime visual override that was causing the
  // main page to look distorted. No data, auth, navigation, or Supabase
  // functionality is changed.
  const cleanup=()=>{
    document.querySelectorAll('style').forEach(style=>{
      const css=style.textContent||'';
      if(css.includes('.neon-world{background:#010713 url(\'academy-bg.svg\')') || css.includes('#academy-3d-overlay')){
        style.remove();
      }
    });
    const overlay=document.getElementById('academy-3d-overlay');
    if(overlay) overlay.remove();
  };
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',cleanup,{once:true});
  }else{
    cleanup();
  }
})();