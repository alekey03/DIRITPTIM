(() => {
  const model=window.ProduccionModelo;
  const dialog=document.createElement('dialog');dialog.className='modal produccion-modal';dialog.setAttribute('aria-labelledby','produccionTitle');
  dialog.innerHTML=`<div class="modal-card"><header class="produccion-header"><div><small>REPORTE DE PRODUCCIÓN</small><h2 id="produccionTitle">Excel completo · 22 pestañas</h2></div><button type="button" class="secondary" data-close aria-label="Cerrar exportación">Cerrar</button></header><p>Incluye los registros guardados, también los borradores, de todas las categorías del formato. Cada hoja usa la fecha de su registro; cuando no tiene fecha propia, usa la del operativo.</p><p class="consulta-scope" data-scope></p><form><fieldset class="produccion-filters"><legend>Alcance del reporte</legend><label>Desde<input name="from" type="date"></label><label>Hasta<input name="to" type="date"></label><label>Dependencia<select name="unit"><option value="">Todas las autorizadas</option></select></label><button type="submit" class="primary" data-prepare>Preparar Excel</button></fieldset></form><p data-status role="status" aria-live="polite"></p><div data-preview></div><div class="produccion-footer"><p>Las 22 pestañas se conservan aunque no tengan registros. Se exporta la NI principal. Armas de fuego, OO. CC. y chips usan los encabezados anteriores porque la nueva plantilla los trae vacíos. «ENERO» en Personas ubicadas conserva el encabezado recibido y contiene el mes de cada registro.</p><button type="button" class="primary" data-download hidden>⇩ Descargar Excel completo</button></div></div>`;
  document.body.append(dialog);
  const $=selector=>dialog.querySelector(selector),form=$('form'),status=$('[data-status]'),preview=$('[data-preview]'),download=$('[data-download]'),fields=$('fieldset');
  let turn=0,report=null,sourceStamp=null,reportIdentity=null;
  const identity=()=>JSON.stringify([currentProfile?.id,currentProfile?.activo,currentProfile?.rol,currentProfile?.unidad]);
  const valid=()=>!!currentProfile?.id&&!!currentProfile?.activo;
  function clear(){report=null;sourceStamp=null;reportIdentity=null;preview.replaceChildren();download.hidden=true;}
  function close(){turn++;clear();fields.disabled=false;download.disabled=false;status.textContent='';dialog.close();form.reset();}
  $('[data-close]').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  form.addEventListener('input',()=>{clear();status.textContent='Filtros modificados. Prepare de nuevo el Excel.';});
  form.addEventListener('change',()=>{clear();status.textContent='Filtros modificados. Prepare de nuevo el Excel.';});
  async function open(){
    close();if(!valid())return;
    const token=++turn,profile=identity(),alive=()=>token===turn&&valid()&&identity()===profile;
    $('[data-scope]').textContent=currentProfile.rol==='administrador'?'Administrador general · dependencias autorizadas a nivel nacional':`Solo dependencias autorizadas para su cuenta · ${currentProfile.unidad||''}`;
    dialog.showModal();status.textContent='Consultando dependencias autorizadas…';fields.disabled=true;
    try{
      const parents=await model.readTable(supabaseClient,'intervenciones','id,tipo,unidad',alive);
      const units=[...new Set(parents.filter(p=>['operativo','megaoperativo'].includes(p.tipo)).map(p=>p.unidad).filter(Boolean))].sort();
      form.elements.unit.replaceChildren(new Option('Todas las autorizadas',''),...units.map(u=>new Option(u,u)));
      if(alive())status.textContent='Seleccione el periodo y prepare el reporte. Los filtros de la consulta por categoría no se aplican a este Excel completo.';
    }catch(error){if(alive())status.textContent=error.message;}
    finally{if(alive())fields.disabled=false;}
  }
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(fields.disabled||!valid()||!form.reportValidity())return;
    const filters=Object.fromEntries(['from','to','unit'].map(k=>[k,form.elements[k].value]));
    clear();try{model.validateFilters(filters);}catch(error){status.textContent=error.message;return;}
    const token=++turn,profile=identity(),alive=()=>token===turn&&valid()&&identity()===profile;
    fields.disabled=true;status.textContent='Preparando las 22 pestañas…';
    try{
      const data=await model.snapshot(supabaseClient,alive,message=>{if(alive())status.textContent=message;});
      if(!alive())return;
      report=model.build(data,filters);sourceStamp=model.stamp(data.intervenciones);reportIdentity=profile;
      const list=document.createElement('dl');list.className='produccion-counts';
      for(const sheet of report.sheets){const row=document.createElement('div'),title=document.createElement('dt'),count=document.createElement('dd');title.textContent=sheet.nombre;count.textContent=String(sheet.rows.length);row.append(title,count);list.append(row);}
      preview.append(list);
      for(const warning of report.warnings){const p=document.createElement('p');p.className='results-note';p.textContent=warning;preview.append(p);}
      status.textContent=`Listo: ${report.sheets.length} pestañas y ${report.total} filas. Las filas de distintas hojas no se suman como personas ni como operativos únicos.${report.total?'':' No hay registros en este alcance; puede descargar la plantilla con sus encabezados.'}`;
      download.hidden=false;
    }catch(error){if(alive()){clear();status.textContent=error.message;}}
    finally{if(alive())fields.disabled=false;}
  });
  download.addEventListener('click',async()=>{
    if(!report||!valid()||download.disabled)return;
    const token=turn,profile=identity(),alive=()=>token===turn&&valid()&&identity()===profile;
    download.disabled=true;fields.disabled=true;
    try{
      if(reportIdentity!==profile){clear();throw new Error('La cuenta cambió. Prepare de nuevo el Excel.');}
      if(!window.XLSX)throw new Error('No se pudo cargar el generador de Excel. Revise su conexión.');
      const parents=await model.readTable(supabaseClient,'intervenciones','id,tipo,version',alive);
      if(!alive())return;
      if(sourceStamp!==model.stamp(parents)){clear();throw new Error('Los registros o sus permisos cambiaron. Prepare de nuevo el Excel.');}
      const workbook=model.workbook(report,window.XLSX);
      if(!alive())return;
      const dates=[report.filters.from||'inicio',report.filters.to||'actual'].join('_');
      downloadStyledWorkbook(workbook,`PRODUCCION_DIRITPTIM_${dates}.xlsx`,{compression:true});
      status.textContent='Descarga iniciada. El archivo contiene las 22 pestañas y los registros autorizados del alcance elegido.';
    }catch(error){if(alive())status.textContent=error.message;}
    finally{if(alive()){download.disabled=false;fields.disabled=false;}}
  });
  for(const id of ['consultaRecordsView']){
    const toolbar=document.querySelector(`#${id} .records-toolbar`);if(!toolbar)continue;
    const button=document.createElement('button');button.type='button';button.className='primary';button.textContent='⇩ Excel completo · 22 pestañas';button.addEventListener('click',open);toolbar.append(button);
  }
  window.resetProduccion=close;
})();
