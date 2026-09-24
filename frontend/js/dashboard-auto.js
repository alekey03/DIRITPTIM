// Refresh only visible, authorized dashboards; queries retain their existing RLS.
(() => {
  const root=document.getElementById('generalDashboardView');
  if(!root)return;
  let running=false,queued=null;
  const status=document.createElement('small');
  status.className='dash-auto-status';
  status.textContent='Actualización automática · cada 30 segundos';
  root.querySelector('.dash-hero-actions').append(status);
  const eligible=()=>document.visibilityState==='visible'&&root.classList.contains('active')&&currentProfile?.activo;
  async function refresh(){
    if(running||!eligible()||root.getAttribute('aria-busy')==='true'||root.querySelector('.production-overview[aria-busy="true"]')||root.querySelector('form')?.contains(document.activeElement))return;
    running=true;
    try{await Promise.allSettled([window.refreshDashboardAutomatically?.(),window.refreshOverviewAutomatically?.()]);}
    finally{running=false;}
  }
  function schedule(){clearTimeout(queued);if(eligible())queued=setTimeout(refresh,1200);}
  setInterval(refresh,30000);
  new MutationObserver(schedule).observe(root,{attributes:true,attributeFilter:['class']});
  document.addEventListener('visibilitychange',schedule);
  window.addEventListener('online',schedule);
  window.addEventListener('focus',schedule);
  root.querySelector('form')?.addEventListener('focusout',schedule);
  schedule();
})();