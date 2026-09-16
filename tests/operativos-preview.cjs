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
let requests=[],records=new Map(),detained=[],drugs=[],materials=[],vehicles=[],groups=[],prostitucion=[],prostitucionFailOnce=true,victims=[],victimFailOnce=true,minors=[],minorFailOnce=true,notes=[],noteFailOnce=true,rqs=[],rqFailOnce=true,failOnce=true;
function escapeHtml(value){return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatDate(value){return value;}

const supabaseClient={
 async rpc(name,p){
  requests.push(structuredClone(p));
  if(name==='guardar_prostitucion_operativo'){
   const old=prostitucion.find(r=>r.id===p.p_id),parent=records.get(p.p_intervencion);
   if(old&&old.version===p.p_version+1&&JSON.stringify(old.datos)===JSON.stringify(p.p_datos))return {data:{id:old.id,version:old.version,operativo_version:parent.version},error:null};
   const row={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,datos:p.p_datos,version:p.p_version+1};if(old)Object.assign(old,row);else prostitucion.push(row);parent.version++;
   if(prostitucionFailOnce){prostitucionFailOnce=false;throw new Error('Respuesta perdida de prostitucion');}
   return {data:{id:row.id,version:row.version,operativo_version:parent.version},error:null};
  }
  if(name==='guardar_victima_operativo'){
   const old=victims.find(r=>r.id===p.p_id),parent=records.get(p.p_intervencion);
   if(old&&old.version===p.p_version+1&&JSON.stringify(old.datos)===JSON.stringify(p.p_datos))return {data:{id:old.id,version:old.version,operativo_version:parent.version},error:null};
   const row={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,datos:p.p_datos,version:p.p_version+1};if(old)Object.assign(old,row);else victims.push(row);parent.version++;
   if(victimFailOnce){victimFailOnce=false;throw new Error('Respuesta perdida de victima');}
   return {data:{id:row.id,version:row.version,operativo_version:parent.version},error:null};
  }
  if(name==='guardar_menor_operativo'){
   const old=minors.find(r=>r.id===p.p_id),parent=records.get(p.p_intervencion);
   if(old&&old.version===p.p_version+1&&JSON.stringify(old.datos)===JSON.stringify(p.p_datos))return {data:{id:old.id,version:old.version,operativo_version:parent.version},error:null};
   const row={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,datos:p.p_datos,version:p.p_version+1};if(old)Object.assign(old,row);else minors.push(row);parent.version++;
   if(minorFailOnce){minorFailOnce=false;throw new Error('Respuesta perdida de menor');}
   return {data:{id:row.id,version:row.version,operativo_version:parent.version},error:null};
  }
  if(name==='guardar_requisitoriado_independiente'||name==='guardar_ampliacion_operativo'){
   const collection=name==='guardar_ampliacion_operativo'?notes:rqs,old=collection.find(r=>r.id===p.p_id),parent=records.get(p.p_intervencion);
   if(old&&old.version===p.p_version+1&&JSON.stringify(old.datos)===JSON.stringify(p.p_datos))return {data:{id:old.id,version:old.version,operativo_version:parent.version},error:null};
   const row={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,datos:p.p_datos,version:p.p_version+1};if(old)Object.assign(old,row);else collection.push(row);parent.version++;
   if(name==='guardar_requisitoriado_independiente'&&rqFailOnce){rqFailOnce=false;throw new Error('Respuesta RQ perdida');}
   if(name==='guardar_ampliacion_operativo'&&noteFailOnce){noteFailOnce=false;throw new Error('Respuesta NI perdida');}
   return {data:{id:row.id,version:row.version,operativo_version:parent.version},error:null};
  }
  if(name==='guardar_grupo_operativo'){
   const old=groups.find(g=>g.id===p.p_id);const row={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,nombre:p.p_nombre,modalidad:p.p_modalidad,referencia_lugar:p.p_referencia,version:p.p_version+1,intervencion_grupo_integrantes:p.p_integrantes};
   if(old)Object.assign(old,row);else groups.push(row);const parent=records.get(p.p_intervencion);parent.version++;
   return {data:{id:row.id,version:row.version,operativo_version:parent.version},error:null};
  }
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
 from(table){let id=null;return {select(){return this},in(){return this},order(){return this},eq(k,v){id=v;return this},async single(){return {data:records.get(id),error:null}},async range(a,b){return {data:(table==='intervencion_prostitucion'?prostitucion.filter(d=>d.intervencion_id===id):table==='intervencion_victimas'?victims.filter(d=>d.intervencion_id===id):table==='intervencion_notas'?notes.filter(d=>d.intervencion_id===id):table==='intervencion_menores'?minors.filter(d=>d.intervencion_id===id):table==='intervencion_requisitoriados'?rqs.filter(d=>d.intervencion_id===id):table==='intervencion_grupos'?groups.filter(d=>d.intervencion_id===id):table==='intervencion_vehiculos'?vehicles.filter(d=>d.intervencion_id===id):table==='intervencion_materiales'?materials.filter(d=>d.intervencion_id===id):table==='intervencion_drogas'?drugs.filter(d=>d.intervencion_id===id):['detenciones','detenciones_reportables'].includes(table)?detained.filter(d=>d.intervencion_id===id):[...records.values()]).slice(a,b+1),error:null}}};}
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
 const wait=async predicate=>{for(let n=0;n<100;n++){if(predicate())return;await tick();}throw Error("Tiempo de espera de comprobación agotado");};
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
  assert(document.querySelectorAll('#resultCards input').length===12,'Deben existir doce tipos de resultado');
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
  document.querySelector('#resultCards input[value="otros"]').click();
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
  let minorTestForm=document.getElementById('materialForm');minorTestForm.elements.namedItem('cantidad').value='15';minorTestForm.requestSubmit();await tick();await tick();
  assert(materials.length===1 && materials[0].datos.cantidad===15,'Alta de municiones');
  document.querySelector('#materialRecords button').click();minorTestForm.elements.namedItem('cantidad').value='18';minorTestForm.requestSubmit();await tick();await tick();
  assert(materials.length===1 && materials[0].datos.cantidad===18,'Edición sin duplicar');
  document.querySelector('[data-material="fuego"]').click();assert(minorTestForm.elements.namedItem('serie'),'Arma tiene serie');
  minorTestForm.elements.namedItem('tipo').value='TIPO FICTICIO';minorTestForm.elements.namedItem('situacion').value='FICTICIA';minorTestForm.elements.namedItem('serie').value='SOLO-PRUEBA';minorTestForm.requestSubmit();await tick();await tick();
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
  detained[0].integra_organizacion=true;detained[0].tipo_organizacion='banda';detained[0].nombre_organizacion='GRUPO FICTICIO';detained[0].rol_organizacion='Integrante';
  detained.push({...structuredClone(detained[0]),id:'00000000-0000-0000-0000-000000000012',tipo_organizacion:'organizacion',nombre_organizacion:'ORGANIZACION FICTICIA'});
  await window.openOperativoResults([...records.keys()][0]);
  document.querySelector('#resultCards input[value="organizaciones"]').click();
  assert(document.querySelectorAll('#groupCards svg').length===2,'Dos iconos de grupos');
  for(const tipo of ['banda','organizacion']){
   document.querySelector('[data-group="'+tipo+'"]').click();const gf=document.getElementById('groupForm');
   assert(document.querySelectorAll('#groupMembers input[data-member]').length===1,'Solo candidatos del tipo');
   document.querySelector('#groupMembers input[data-member]').click();gf.elements.modalidad.value='MODALIDAD FICTICIA';gf.requestSubmit();await tick();await tick();
  }
  assert(groups.length===2,'Dos grupos creados');assert(groups[0].intervencion_grupo_integrantes.length===1,'Vínculo sin duplicar persona');
  document.querySelector('#groupRecords button').click();const gf=document.getElementById('groupForm');gf.elements.modalidad.value='ACTUALIZADA';gf.requestSubmit();await tick();await tick();
  assert(groups.length===2&&groups[0].modalidad==='ACTUALIZADA','Edición de grupo');
  currentProfile={...currentProfile,id:'supervisor-fixture',rol:'supervisor'};await window.openOperativoResults([...records.keys()][0]);
  assert(document.querySelector('[data-group="banda"]').disabled,'Supervisor no crea grupos');document.querySelector('#groupRecords button').click();assert(document.getElementById('saveGroup').hidden,'Supervisor consulta grupos');
  window.resetResultadosModule();assert(!document.getElementById('groupRecords').textContent,'Limpieza de grupos al salir');
  currentProfile={...currentProfile,id:'fixture-user',rol:'operador'};await window.openOperativoResults([...records.keys()][0]);
  document.querySelector('#groupRecords button').click();
  document.querySelector('#resultCards input[value="requisitoriados"]').click();document.querySelector('[data-rq="registro"]').click();
  const rqFormTest=document.getElementById('rqForm'),rqField=k=>rqFormTest.elements.namedItem(k),detentionsBeforeRq=detained.length;
  assert(!rqFormTest.checkValidity(),'RQ requiere identidad propia');assert(!document.getElementById('rqDetention'),'RQ no exige selector de detenido');
  rqField('apellido_paterno').value='FICTICIO';rqField('nombres').value='SOLO RQ';rqField('fecha').value='2026-09-15';rqField('tipo').value='ORDEN DE CAPTURA';rqField('mas_buscado').value='No';
  assert(rqField('entidad_publica').disabled,'Funcionario No deshabilita entidad');rqField('es_funcionario').value='Sí';rqField('es_funcionario').dispatchEvent(new Event('change'));rqField('entidad_publica').value='FICTICIA';rqField('es_funcionario').value='No';rqField('es_funcionario').dispatchEvent(new Event('change'));assert(!rqField('entidad_publica').value,'No limpia entidad');
  rqFormTest.requestSubmit();await tick();await tick();assert(rqs.length===1&&!rqFormTest.hidden,'RQ conserva formulario tras error de red');rqFormTest.requestSubmit();await tick();await tick();assert(rqs.length===1&&detained.length===detentionsBeforeRq,'RQ no duplica ni crea detenidos');
  document.querySelector('#rqRecords button').click();rqField('tipo').value='RQ INTERNACIONAL';rqFormTest.requestSubmit();await tick();await tick();assert(rqs[0].datos.tipo==='RQ INTERNACIONAL','Edición RQ');
  const operativeBeforeNotes=records.size;records.values().next().value.nota_sicpip='NI PRINCIPAL';await window.openOperativoResults([...records.keys()][0]);
  document.querySelector('[data-note="registro"]').click();const nf=document.getElementById('noteForm'),ni=k=>nf.elements.namedItem(k);
  assert(!nf.checkValidity(),'Ampliación exige número fecha detalle');ni('numero').value='NI 2';ni('fecha').value='2026-09-16';ni('detalle').value='Celular adicional.';nf.requestSubmit();await tick();await tick();assert(notes.length===1&&!nf.hidden,'NI conserva formulario tras respuesta perdida');nf.requestSubmit();await tick();await tick();assert(notes.length===1&&nf.hidden,'NI reintento sin duplicar');
  document.querySelector('[data-note="registro"]').click();ni('numero').value='NI 3';ni('fecha').value='2026-09-16';ni('detalle').value='Otro hallazgo.';nf.requestSubmit();await tick();await tick();assert(notes.length===2&&records.size===operativeBeforeNotes,'Varias NI mismo operativo');assert(document.getElementById('notePrimary').textContent.includes('NI PRINCIPAL'),'Conserva NI principal visible');
  currentProfile={...currentProfile,id:'supervisor-fixture',rol:'supervisor'};await window.openOperativoResults([...records.keys()][0]);assert(document.querySelector('[data-note="registro"]').disabled,'Supervisor no crea NI');document.querySelector('#noteRecords button').click();assert(document.getElementById('saveNote').hidden&&document.getElementById('noteFields').disabled,'NI solo consulta');document.getElementById('cancelNote').click();document.querySelector('#rqRecords button').click();assert(document.getElementById('saveRq').hidden,'RQ solo consulta');
  window.resetResultadosModule();assert(!document.getElementById('rqRecords').textContent&&!document.getElementById('noteRecords').textContent,'Limpieza RQ y NI');
  currentProfile={...currentProfile,id:'fixture-user',rol:'operador'};await window.openOperativoResults([...records.keys()][0]);
  document.querySelector('#resultCards input[value="menores"]').click();document.querySelector('[data-minor="menor"]').click();
  const minorCaptureForm=document.getElementById('minorForm'),field=n=>minorCaptureForm.elements.namedItem(n);
  assert(!minorCaptureForm.checkValidity(),'Menor requiere identidad y edad');assert(field('edad').options.length===17,'16 edades del Excel y opción vacía');
  assert(!field('esFuncionario'),'Menores no pide funcionario');assert(field('nombre_grupo').disabled,'Ninguno deshabilita nombre de grupo');
  field('apellido_paterno').value='FICTICIO';field('nombres').value='MENOR PRUEBA';field('edad').value='15';field('fecha').value='2026-09-15';
  field('grupo').value='Banda criminal';field('grupo').dispatchEvent(new Event('change'));assert(field('nombre_grupo').required&&!field('nombre_grupo').disabled,'Banda requiere nombre');
  field('nombre_grupo').value='FICTICIA';field('grupo').value='Ninguno';field('grupo').dispatchEvent(new Event('change'));assert(!field('nombre_grupo').value,'Ninguno limpia nombre');
  minorCaptureForm.requestSubmit();await tick();await tick();assert(minors.length===1&&!minorCaptureForm.hidden,'Pérdida de respuesta conserva formulario');minorCaptureForm.requestSubmit();await tick();await tick();assert(minors.length===1&&minorCaptureForm.hidden,'Reintento no duplica menor');
  document.querySelector('#minorRecords button').click();field('nombres').value='MENOR EDITADO';minorCaptureForm.requestSubmit();await tick();await tick();assert(minors[0].datos.nombres==='MENOR EDITADO','Edición de menor');
  currentProfile={...currentProfile,id:'supervisor-fixture',rol:'supervisor'};await window.openOperativoResults([...records.keys()][0]);assert(document.querySelector('[data-minor="menor"]').disabled,'Supervisor no registra menor');document.querySelector('#minorRecords button').click();assert(document.getElementById('saveMinor').hidden&&document.getElementById('minorFields').disabled,'Supervisor solo consulta');document.getElementById('cancelMinor').click();assert(minorCaptureForm.hidden,'Supervisor puede cerrar consulta');
  window.resetResultadosModule();assert(!document.getElementById('minorRecords').textContent&&!document.getElementById('minorInputs').textContent,'Limpieza de menores');
  currentProfile={...currentProfile,id:'fixture-user',rol:'operador'};await window.openOperativoResults([...records.keys()][0]);document.querySelector('#minorRecords button').click();
  await window.openOperativoResults([...records.keys()][0]);const victimBox=document.querySelector('#resultCards input[value="victimas"]');victimBox.checked=true;victimBox.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#victimCards button').click();
  const victimCaptureForm=document.getElementById('victimForm');assert(!victimCaptureForm.hidden,'Formulario de víctimas visible');assert(!victimCaptureForm.querySelector('input[type="file"]'),'Víctimas sin fotografías');
  for(const [key,value]of Object.entries({apellido_paterno:'FICTICIO',nombres:'PRUEBA VICTIMA',edad:'17',situacion:'VICTIMA RESCATADA',entidad_disposicion:'UPE'})){victimCaptureForm.elements.namedItem(key).value=value;victimCaptureForm.elements.namedItem(key).dispatchEvent(new Event('input',{bubbles:true}));}
  const previousConfirm=window.confirm;window.confirm=()=>false;document.getElementById('addLinkedDetainee').click();await tick();assert(!victimCaptureForm.hidden&&victimCaptureForm.elements.nombres.value==='PRUEBA VICTIMA','Conservar víctima al cancelar cambio a detenido');window.confirm=previousConfirm;
  assert(victimCaptureForm.elements.condicion_edad.value==='MENOR'&&victimCaptureForm.elements.condicion_edad.readOnly,'Condición calculada');victimCaptureForm.elements.edad.value='18';victimCaptureForm.elements.edad.dispatchEvent(new Event('input',{bubbles:true}));assert(victimCaptureForm.elements.condicion_edad.value==='MAYOR','Frontera de 18 años');
  victimCaptureForm.dispatchEvent(new Event('submit',{cancelable:true}));await wait(()=>document.getElementById('victimStatus').textContent.includes('No se confirmó'));assert(victims.length===1,'Alta con respuesta perdida');victimCaptureForm.dispatchEvent(new Event('submit',{cancelable:true}));await wait(()=>victimCaptureForm.hidden);assert(victims.length===1,'Reintento sin duplicar');
  document.querySelector('#victimRecords button').click();victimCaptureForm.elements.nombres.value='PRUEBA EDITADA';victimCaptureForm.elements.nombres.dispatchEvent(new Event('input',{bubbles:true}));victimCaptureForm.dispatchEvent(new Event('submit',{cancelable:true}));await wait(()=>victimCaptureForm.hidden);assert(victims[0].datos.nombres==='PRUEBA EDITADA','Edición víctima');
  currentProfile={...currentProfile,id:'fixture-supervisor',rol:'supervisor'};await window.openOperativoResults([...records.keys()][0]);document.querySelector('#victimRecords button').click();assert(document.getElementById('victimFields').disabled&&document.getElementById('saveVictim').hidden,'Víctimas consulta por supervisor');document.getElementById('cancelVictim').click();assert(victimCaptureForm.hidden,'Cerrar consulta');window.resetResultadosModule();assert(!document.getElementById('victimRecords').textContent&&!document.getElementById('victimInputs').textContent,'Limpieza de víctimas');
  currentProfile={...currentProfile,id:'fixture-user',rol:'operador'};
  await window.openOperativoResults([...records.keys()][0]);const prostitucionBox=document.querySelector('#resultCards input[value="prostitucion"]');prostitucionBox.checked=true;prostitucionBox.dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('#prostitucionCards button').click();
  const prostitucionCaptureForm=document.getElementById('prostitucionForm');assert(!prostitucionCaptureForm.hidden,'Formulario de prostitución visible');assert(!prostitucionCaptureForm.querySelector('input[type="file"]'),'Prostitución sin fotografías');
  for(const [key,value]of Object.entries({apellido_paterno:'FICTICIO',nombres:'PRUEBA PERSONA',edad:'25',tipo_documento:'DNI',numero_documento:'00123456'})){prostitucionCaptureForm.elements.namedItem(key).value=value;prostitucionCaptureForm.elements.namedItem(key).dispatchEvent(new Event('input',{bubbles:true}));}
  const prostitucionPreviousConfirm=window.confirm;window.confirm=()=>false;document.getElementById('addLinkedDetainee').click();await tick();assert(!prostitucionCaptureForm.hidden&&prostitucionCaptureForm.elements.nombres.value==='PRUEBA PERSONA','Conservar registro al cancelar cambio a detenido');window.confirm=prostitucionPreviousConfirm;
  prostitucionCaptureForm.dispatchEvent(new Event('submit',{cancelable:true}));await wait(()=>document.getElementById('prostitucionStatus').textContent.includes('No se confirmó'));assert(prostitucion.length===1,'Alta con respuesta perdida');prostitucionCaptureForm.dispatchEvent(new Event('submit',{cancelable:true}));await wait(()=>prostitucionCaptureForm.hidden);assert(prostitucion.length===1,'Reintento sin duplicar');
  document.querySelector('#prostitucionRecords button').click();prostitucionCaptureForm.elements.nombres.value='PRUEBA EDITADA';prostitucionCaptureForm.elements.nombres.dispatchEvent(new Event('input',{bubbles:true}));prostitucionCaptureForm.dispatchEvent(new Event('submit',{cancelable:true}));await wait(()=>prostitucionCaptureForm.hidden);assert(prostitucion[0].datos.numero_documento==='00123456'&&prostitucion[0].datos.nombres==='PRUEBA EDITADA','Edición del registro');
  currentProfile={...currentProfile,id:'fixture-supervisor',rol:'supervisor'};await window.openOperativoResults([...records.keys()][0]);document.querySelector('#prostitucionRecords button').click();assert(document.getElementById('prostitucionFields').disabled&&document.getElementById('saveProstitucion').hidden,'Prostitución consulta por supervisor');document.getElementById('cancelProstitucion').click();assert(prostitucionCaptureForm.hidden,'Cerrar consulta');window.resetResultadosModule();assert(!document.getElementById('prostitucionRecords').textContent&&!document.getElementById('prostitucionInputs').textContent,'Limpieza de prostitución');
  report.textContent='PASS: Prostitución: alta/edición, documento, reintentos, roles y limpieza. Víctimas: alta/edición, edad, sin fotos, reintentos y roles. Menores: 48 columnas, validación, grupos, alta, edición, reintentos, consulta por roles y limpieza. RQ independiente y ampliaciones NI: altas, ediciones, reintentos, conteos separados, roles y limpieza.  Bandas y organizaciones; alta, edición, vínculos, tipos, permisos y limpieza.  Operativos, detenidos, drogas, materiales y vehículos; alta y edición, permisos, iconos y limpieza de sesión.';
 }catch(error){report.textContent='FAIL: '+error.message;}
})();
`;
html = html.replace('</body>', `<script>${mock}</script>
<script src="/catalogos.js"></script><script src="/dependencias.js"></script><script src="/catalogos-ui.js"></script>
<script src="/detenidos.js"></script><script src="/intervenciones.js"></script><script src="/materiales-catalogo.js"></script><script src="/materiales.js"></script><script src="/vehiculos-catalogo.js"></script><script src="/vehiculos.js"></script><script src="/grupos.js"></script><script src="/requisitoriados-catalogo.js"></script><script src="/notas-catalogo.js"></script><script src="/notas.js"></script><script src="/requisitoriados.js"></script><script src="/menores-catalogo.js"></script><script src="/menores.js"></script><script src="/prostitucion-catalogo.js"></script><script src="/prostitucion.js"></script><script src="/victimas-catalogo.js"></script><script src="/victimas.js"></script><script src="/resultados.js"></script><script>${checks}</script></body>`);
const allowed = new Set(['prostitucion.js','prostitucion-catalogo.js','victimas.js','victimas-catalogo.js','notas.js','notas-catalogo.js','requisitoriados-catalogo.js','menores.js','menores-catalogo.js','styles.css','catalogos.js','dependencias.js','catalogos-ui.js','intervenciones.js','detenidos.js','resultados.js','requisitoriados.js','grupos.js','materiales.js','materiales-catalogo.js','vehiculos.js','vehiculos-catalogo.js','assets/logo-diriptim.png']);
http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1);
  if(!name){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html);}
  if(name==='prostitucion-migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,'supabase/migrations/202609160015_prostitucion_operativo.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(name==='victims-migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,'supabase/migrations/202609160014_victimas_operativo.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(name==='migration'||name==='notes-migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,name==='notes-migration'?'supabase/migrations/202609160013_ampliaciones_ni.sql':'supabase/migrations/202609160012_requisitoriados_independientes.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(!allowed.has(name)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'image/png');
  res.end(fs.readFileSync(path.join(root,name)));
}).listen(8766,'127.0.0.1',()=>console.log('Component harness: http://127.0.0.1:8766/ (only fictional data)'));

