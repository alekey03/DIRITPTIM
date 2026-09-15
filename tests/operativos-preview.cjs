// Local component harness: no Supabase session, credentials or production writes.
// node tests/operativos-preview.cjs; open http://127.0.0.1:8766/
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<link[^>]+(?:https:)[^>]*>/gi, '');
const mock = `
let currentProfile={id:'fixture-user',activo:true,rol:'operador',unidad:'DEPITPTIM ABANCAY',departamento:'APURIMAC'};
let requests=[],records=new Map(),detained=[],drugs=[],materials=[],vehicles=[],failOnce=true;
function escapeHtml(value){return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatDate(value){return value;}

const supabaseClient={
 async rpc(name,p){
  requests.push(structuredClone(p));
  if(name==='guardar_vehiculo_operativo'){
   const old=vehicles.find(m=>m.id===p.p_id);const row={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,datos:p.p_datos,version:p.p_version+1};
   if(old)Object.assign(old,row);else vehicles.push(row);
   const parent=records.get(p.p_intervencion);parent.version++;
   return {data:{id:row.id,version:row.version,operativo_version:parent.version},error:null};
  }
  if(name==='guardar_material_operativo'){
   const old=materials.find(m=>m.id===p.p_id);const row={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,datos:p.p_datos,version:p.p_version+1};
   if(old)Object.assign(old,row);else materials.push(row);
   const parent=records.get(p.p_intervencion);parent.version++;
   return {data:{id:row.id,version:row.version,operativo_version:parent.version},error:null};
  }
  if(name==='guardar_droga_operativo'){
   const old=drugs.find(d=>d.id===p.p_id); const record={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,cantidad:p.p_cantidad,nombre_sustancia:p.p_nombre,version:p.p_version+1};
   if(old) Object.assign(old,record);else drugs.push(record);
   const parent=records.get(p.p_intervencion);parent.version++;
   return {data:{id:record.id,version:record.version,operativo_version:parent.version},error:null};
  }
  if(name==='seleccionar_resultados_operativo'){
   const record=records.get(p.p_id);record.resultados_previstos=p.p_categorias;record.version++;
   return {data:{version:record.version,categorias:p.p_categorias},error:null};
  }
  if(name==='guardar_detenido_atomico'){
   const record={...p.p_detencion,id:p.p_solicitud,codigo:'DET-FICTICIO',personas:p.p_persona};detained.push(record);
   return {data:{id:record.id,codigo:record.codigo},error:null};
  }

  if(failOnce){failOnce=false;throw new Error('Interrupción simulada');}
  const saved={...p.p_intervencion,id:p.p_id,version:p.p_version+2,unidad:currentProfile.unidad,departamento_registro:currentProfile.departamento,creado_por:currentProfile.id,resultados_previstos:[],intervencion_operativos:p.p_operativo};
  records.set(saved.id,saved);return {data:{id:saved.id,version:saved.version},error:null};
 },
 from(table){let id=null;return {select(){return this},in(){return this},order(){return this},eq(k,v){id=v;return this},async single(){return {data:records.get(id),error:null}},async range(a,b){return {data:(table==='intervencion_vehiculos'?vehicles.filter(d=>d.intervencion_id===id):table==='intervencion_materiales'?materials.filter(d=>d.intervencion_id===id):table==='intervencion_drogas'?drugs.filter(d=>d.intervencion_id===id):table==='detenciones'?detained.filter(d=>d.intervencion_id===id):[...records.values()]).slice(a,b+1),error:null}}};}
};
document.getElementById('loginScreen').style.display='none';
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===button.dataset.view));
 document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item===button));
 document.getElementById('pageHeading').textContent=button.dataset.view==='operativoResultsView'?'Resultados del operativo':button.dataset.view==='detaineeFormView'?'Registro de persona detenida':'Registro del operativo';
 if(button.dataset.view==='operativoView') window.initializeOperativoForm?.();
 if(button.dataset.view==='operativoRecordsView') window.loadOperativos?.();
}));
document.querySelectorAll('.nav-group-toggle').forEach(button=>button.addEventListener('click',()=>button.closest('.nav-group').classList.toggle('open')));
`;
const checks = `
(async()=>{
 const report=document.createElement('p');report.id='test-result';report.style='padding:12px;background:#fff';document.querySelector('main').prepend(report);
 const assert=(value,message)=>{if(!value)throw new Error(message)};
 const tick=()=>new Promise(resolve=>setTimeout(resolve,30));
 try{
  const form=document.getElementById('operativoForm');
  assert(form.querySelectorAll('[name]').length===38,'Faltan campos del Excel');
  document.querySelector('[data-view="operativoView"]').click();
  form.elements.namedItem('intervencion.tipo').value='operativo';
  form.elements.namedItem('intervencion.fecha').value='2026-09-15';
  form.elements.namedItem('operativo.personal_cargo').value='3';
  form.requestSubmit();await tick();
  assert(document.getElementById('operativoStatus').textContent.includes('No se confirmó'),'Debe mostrar error de conexión');
  assert(form.elements.namedItem('operativo.personal_cargo').value==='3','No debe perder datos');
  form.requestSubmit();await tick();
  assert(requests.length===2 && requests[0].p_solicitud===requests[1].p_solicitud,'Debe reutilizar la solicitud');
  assert(document.getElementById('operativoStatus').textContent.includes('Borrador guardado'),'Debe confirmar guardado');
  document.querySelector('[data-view="operativoRecordsView"]').click();await tick();
  assert(document.querySelectorAll('#operativosRows tr').length===1,'Debe listar el borrador');
  document.querySelector('#operativosRows button').click();await tick();
  assert(form.elements.namedItem('operativo.personal_cargo').value==='3','Debe reabrir datos');
  assert(!document.getElementById('saveOperativo').disabled,'Debe permitir edición propia');
  currentProfile={...currentProfile,id:'supervisor-fixture',rol:'supervisor'};
  document.querySelector('[data-view="operativoRecordsView"]').click();await tick();
  document.querySelector('#operativosRows button').click();await tick();
  assert(document.getElementById('saveOperativo').disabled,'Supervisor no debe editar registro ajeno');
  window.resetOperativoModule();
  assert(form.elements.namedItem('operativo.personal_cargo').value==='','Cambio de sesión debe limpiar datos');
  currentProfile={...currentProfile,id:'fixture-user',rol:'operador'};
  document.querySelector('[data-view="operativoView"]').click();

  await window.openOperativoResults([...records.keys()][0]);
  assert(document.querySelectorAll('#resultCards input').length===10,'Deben existir diez tipos de resultado');
  document.querySelector('#resultCards input[value="detenidos"]').click();
  document.querySelector('#resultCards input[value="bandas"]').click();
  document.getElementById('saveResults').click();await tick();
  assert(document.getElementById('resultsSelectionStatus').textContent.includes('guardada'),'Debe guardar selección');
  document.getElementById('addLinkedDetainee').click();await tick();
  assert(!document.getElementById('detaineeOperativoBanner').hidden,'Debe mostrar vínculo');
  const df=document.getElementById('detaineeForm');
  assert(df.elements.namedItem('fecha').value==='2026-09-15','Debe heredar fecha');
  df.elements.namedItem('apellidoPaterno').value='FICTICIO';df.elements.namedItem('nombres').value='PRUEBA';
  df.requestSubmit();await tick();await tick();
  assert(detained.length===1,'Debe registrar detenido');
  assert(detained[0].intervencion_id===[...records.keys()][0],'Debe conservar vínculo');
  assert(document.querySelectorAll('.linked-detainee-row').length===1,'Debe volver al listado vinculado');
  assert(!document.getElementById('resultsPendingNote').hidden,'Otros detalles pendientes deben estar señalados');
  document.querySelector('#resultCards input[value="drogas"]').click();
  const dtype=document.getElementById('drugType'),quantity=document.getElementById('drugQuantity');
  dtype.value='kg_sintetica';dtype.dispatchEvent(new Event('change'));
  assert(!document.getElementById('drugNameField').hidden,'Debe pedir nombre de droga sintética');
  document.getElementById('drugName').value='FICTICIA';quantity.value='1.25';
  document.getElementById('drugResultForm').requestSubmit();await tick();await tick();
  assert(drugs.length===1 && drugs[0].cantidad===1.25,'Debe guardar droga vinculada');
  document.querySelector('#drugRecords button').click();quantity.value='2.5';
  document.getElementById('drugResultForm').requestSubmit();await tick();await tick();
  assert(drugs.length===1 && drugs[0].cantidad===2.5,'Debe editar sin duplicar');
  dtype.value='env_cc';dtype.dispatchEvent(new Event('change'));quantity.value='1.5';
  assert(!quantity.checkValidity(),'Unidades debe rechazar fracciones');
  currentProfile={...currentProfile,id:'supervisor-fixture',rol:'supervisor'};
  await window.openOperativoResults([...records.keys()][0]);
  assert(document.getElementById('drugFields').disabled,'Consulta sin edición para supervisor');
  assert(document.querySelectorAll('#drugRecords button').length===0,'Supervisor sin botones de edición');
  window.resetResultadosModule();assert(document.getElementById('drugRecords').textContent==='','Limpiar resultados al salir');
  currentProfile={...currentProfile,id:'fixture-user',rol:'operador'};
  await window.openOperativoResults([...records.keys()][0]);
  document.querySelector('#resultCards input[value="armas"]').click();
  assert(document.querySelectorAll('#materialCards svg').length===5,'Cinco iconos');
  document.querySelector('[data-material="municion"]').click();
  let mf=document.getElementById('materialForm');mf.elements.namedItem('cantidad').value='15';mf.requestSubmit();await tick();await tick();
  assert(materials.length===1 && materials[0].datos.cantidad===15,'Alta de municiones');
  document.querySelector('#materialRecords button').click();mf.elements.namedItem('cantidad').value='18';mf.requestSubmit();await tick();await tick();
  assert(materials.length===1 && materials[0].datos.cantidad===18,'Edición sin duplicar');
  document.querySelector('[data-material="fuego"]').click();assert(mf.elements.namedItem('serie'),'Arma tiene serie');
  mf.elements.namedItem('tipo').value='TIPO FICTICIO';mf.elements.namedItem('situacion').value='FICTICIA';mf.elements.namedItem('serie').value='SOLO-PRUEBA';mf.requestSubmit();await tick();await tick();
  assert(materials.length===2,'Alta de arma');
  currentProfile={...currentProfile,id:'supervisor-fixture',rol:'supervisor'};await window.openOperativoResults([...records.keys()][0]);
  assert(document.querySelector('[data-material="fuego"]').disabled,'Supervisor no agrega');
  document.querySelector('#materialRecords button').click();assert(document.getElementById('saveMaterial').hidden,'Supervisor consulta sin guardar');
  window.resetResultadosModule();assert(document.getElementById('materialRecords').textContent==='','Limpieza de materiales');
  currentProfile={...currentProfile,id:'fixture-user',rol:'operador'};await window.openOperativoResults([...records.keys()][0]);
  document.querySelector('#resultCards input[value="vehiculos"]').click();
  assert(document.querySelectorAll('#vehicleCards svg').length===3,'Tres iconos de vehículos');
  for(const type of ['mayor','menor','maquinaria']){
   document.querySelector('[data-vehicle="'+type+'"]').click();const vf=document.getElementById('vehicleForm');
   vf.elements.namedItem('marca').value='FICTICIA';vf.elements.namedItem('situacion').value='FICTICIA';vf.elements.namedItem('valorizacion').value='125.50';vf.requestSubmit();await tick();await tick();
  }
  assert(vehicles.length===3,'Tres categorías guardadas');
  document.querySelector('#vehicleRecords button').click();const vf=document.getElementById('vehicleForm');vf.elements.namedItem('placa').value='TEST-001';vf.requestSubmit();await tick();await tick();
  assert(vehicles.length===3 && vehicles[0].datos.placa==='TEST-001','Editar sin duplicar');
  currentProfile={...currentProfile,id:'supervisor-fixture',rol:'supervisor'};await window.openOperativoResults([...records.keys()][0]);
  assert(document.querySelector('[data-vehicle="mayor"]').disabled,'Supervisor no agrega vehículos');document.querySelector('#vehicleRecords button').click();assert(document.getElementById('saveVehicle').hidden,'Consulta sin guardar');
  window.resetResultadosModule();assert(document.getElementById('vehicleRecords').textContent==='','Limpiar vehículos al salir');
  currentProfile={...currentProfile,id:'fixture-user',rol:'operador'};await window.openOperativoResults([...records.keys()][0]);
  report.textContent='PASS: Operativos, detenidos, drogas, materiales y vehículos; alta y edición, permisos, iconos y limpieza de sesión.';
 }catch(error){report.textContent='FAIL: '+error.message;}
})();
`;
html = html.replace('</body>', `<script>${mock}</script>
<script src="/catalogos.js"></script><script src="/dependencias.js"></script><script src="/catalogos-ui.js"></script>
<script src="/detenidos.js"></script><script src="/intervenciones.js"></script><script src="/materiales-catalogo.js"></script><script src="/materiales.js"></script><script src="/vehiculos-catalogo.js"></script><script src="/vehiculos.js"></script><script src="/resultados.js"></script><script>${checks}</script></body>`);
const allowed = new Set(['styles.css','catalogos.js','dependencias.js','catalogos-ui.js','intervenciones.js','detenidos.js','resultados.js','materiales.js','materiales-catalogo.js','vehiculos.js','vehiculos-catalogo.js','assets/logo-diriptim.png']);
http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1);
  if(!name){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html);}
  if(name==='migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,'supabase/migrations/202609150007_vehiculos_operativo.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(!allowed.has(name)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'image/png');
  res.end(fs.readFileSync(path.join(root,name)));
}).listen(8766,'127.0.0.1',()=>console.log('Component harness: http://127.0.0.1:8766/ (only fictional data)'));

