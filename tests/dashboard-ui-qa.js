(async()=>{
 const report=document.createElement('pre');report.id='dashboardQa';report.style='position:fixed;bottom:0;left:0;right:0;background:#edf8f1;color:#173d29;padding:12px;z-index:99999;white-space:pre-wrap';document.body.append(report);
 const d=document.getElementById('generalDashboardView'),r=document.getElementById('consultaRecordsView'),set=(name,v)=>{d.querySelector(`[name="${name}"]`).value=v;},assert=(x,m)=>{if(!x)throw Error(m);},submit=()=>d.querySelector('form').dispatchEvent(new Event('submit',{cancelable:true})),change=name=>d.querySelector(`[name="${name}"]`).dispatchEvent(new Event('change',{bubbles:true}));
 try{
 await loadGeneralDashboard();assert(d.querySelector('.dash-status').textContent.startsWith('248 de 248'),'carga inicial');
 set('facet_nacionalidad','Venezuela');set('ageMin','18');submit();const expected=records.detenciones_reportables.filter(x=>x.personas.nacionalidad==='Venezuela'&&x.personas.edad>=18).length;assert(d.querySelector('.dash-status').textContent.startsWith(expected+' de 248'),'filtros simultáneos');
 d.querySelector('[data-records]').click();await loadConsultaRecords();assert(r.querySelector('tbody').children.length===Math.min(expected,25),'enlace exacto a registros');
 resetConsulta();currentProfile={id:'area',activo:true,rol:'estadistico_depitptim',unidad:'DEPITPTIM AREQUIPA'};await loadGeneralDashboard();assert(d.querySelector('.dash-status').textContent.startsWith('28 de 28'),'alcance operador');assert(!d.querySelector('[name="unit"]').textContent.includes('CUSCO'),'sin unidades ajenas');
 set('category','dinero');await loadGeneralDashboard();assert(!d.querySelector('[name="ageMin"]'),'dinero no pide edad');assert(!!d.querySelector('[name="currency"]'),'dinero tiene moneda');
 set('category','drogas');await loadGeneralDashboard();assert(d.querySelector('.dash-status').textContent.startsWith('0 de 0'),'vacío real por permisos');
 resetConsulta();assert(!d.querySelector('[data-kpis]').textContent&&!r.querySelector('tbody').textContent,'limpieza de sesión');assert(d.querySelector('[name="unit"]').options.length===1,'limpieza de opciones');
 currentProfile={id:'demo',activo:true,rol:'administrador',unidad:'ADMINISTRACIÓN GENERAL DIRITPTIM'};set('category','drogas');await loadGeneralDashboard();assert(d.querySelector('[data-kpis]').textContent.includes('3.8'),'kg separados');assert(d.querySelector('[data-kpis]').textContent.includes('120'),'envoltorios separados');
 set('from','2027-01-01');set('to','2026-01-01');submit();assert(d.querySelector('.dash-status').textContent.includes('posterior'),'periodo inválido');assert(!d.querySelector('[data-kpis]').textContent,'sin cifras obsoletas en error');
 resetConsulta();document.querySelector('[data-view="generalDashboardView"]').click();await loadGeneralDashboard();report.textContent='PASS: filtros combinados, enlace exacto, operador restringido, cambio de categoría, estado vacío, limpieza de sesión, unidades independientes y fechas inválidas.';
 }catch(e){report.textContent='FAIL: '+e.stack;}
})();
