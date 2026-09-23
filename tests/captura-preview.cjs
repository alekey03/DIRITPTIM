// Local component harness: no Supabase session, credentials or production writes.
// node tests/operativos-preview.cjs; open http://127.0.0.1:8789/
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const asset=n=>path.join(root,n);
let html = fs.readFileSync(asset('index.html'), 'utf8')
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<link[^>]+(?:https:)[^>]*>/gi, '');
const mock = `
let currentProfile={id:'fixture-user',activo:true,rol:'operador',unidad:'DEPITPTIM ABANCAY',departamento:'APURIMAC'};
let complements=[],complementFailOnce=true;
let requests=[],records=new Map(),detained=[],drugs=[],materials=[],vehicles=[],groups=[],prostitucion=[],prostitucionFailOnce=true,victims=[],victimFailOnce=true,minors=[],minorFailOnce=true,notes=[],noteFailOnce=true,rqs=[],rqFailOnce=true,failOnce=true;
function escapeHtml(value){return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatDate(value){return value;}

const supabaseClient={
 async rpc(name,p){
  requests.push(structuredClone(p));
  if(name==='guardar_complementarios_operativo'){
   const old=complements.find(r=>r.id===p.p_id),parent=records.get(p.p_intervencion);
   if(old&&old.version===p.p_version+1&&JSON.stringify(old.datos)===JSON.stringify(p.p_datos))return {data:{id:old.id,version:old.version,operativo_version:parent.version},error:null};
   const row={id:p.p_id,intervencion_id:p.p_intervencion,tipo:p.p_tipo,datos:p.p_datos,version:p.p_version+1};if(old)Object.assign(old,row);else complements.push(row);parent.version++;
   if(complementFailOnce){complementFailOnce=false;throw new Error('Respuesta perdida de complements');}
   return {data:{id:row.id,version:row.version,operativo_version:parent.version},error:null};
  }
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
 from(table){let id=null;return {select(){return this},in(){return this},order(){return this},eq(k,v){id=v;return this},async single(){return {data:records.get(id),error:null}},async range(a,b){return {data:(table==='intervencion_complementarios'?complements.filter(d=>d.intervencion_id===id):table==='intervencion_prostitucion'?prostitucion.filter(d=>d.intervencion_id===id):table==='intervencion_victimas'?victims.filter(d=>d.intervencion_id===id):table==='intervencion_notas'?notes.filter(d=>d.intervencion_id===id):table==='intervencion_menores'?minors.filter(d=>d.intervencion_id===id):table==='intervencion_requisitoriados'?rqs.filter(d=>d.intervencion_id===id):table==='intervencion_grupos'?groups.filter(d=>d.intervencion_id===id):table==='intervencion_vehiculos'?vehicles.filter(d=>d.intervencion_id===id):table==='intervencion_materiales'?materials.filter(d=>d.intervencion_id===id):table==='intervencion_drogas'?drugs.filter(d=>d.intervencion_id===id):['detenciones','detenciones_reportables'].includes(table)?detained.filter(d=>d.intervencion_id===id):[...records.values()]).slice(a,b+1),error:null}}};}
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
const checks = fs.readFileSync(path.join(__dirname,'captura-ui-qa.js'),'utf8');
html = html.replace('</body>', `<script>${mock}</script><script src="/frontend/js/perfiles-estadisticos.js"></script>
<script src="/frontend/js/catalogos.js"></script><script src="/frontend/js/dependencias.js"></script><script src="/frontend/js/catalogos-ui.js"></script>
<script src="/frontend/js/detenidos.js"></script><script src="/frontend/js/intervenciones.js"></script><script src="/frontend/js/materiales-catalogo.js"></script><script src="/frontend/js/materiales.js"></script><script src="/frontend/js/vehiculos-catalogo.js"></script><script src="/frontend/js/vehiculos.js"></script><script src="/frontend/js/grupos.js"></script><script src="/frontend/js/requisitoriados-catalogo.js"></script><script src="/frontend/js/notas-catalogo.js"></script><script src="/frontend/js/notas.js"></script><script src="/frontend/js/requisitoriados.js"></script><script src="/frontend/js/menores-catalogo.js"></script><script src="/frontend/js/menores.js"></script><script src="/frontend/js/prostitucion-catalogo.js"></script><script src="/frontend/js/prostitucion.js"></script><script src="/frontend/js/victimas-catalogo.js"></script><script src="/frontend/js/victimas.js"></script><script src="/frontend/js/complementarios-catalogo.js"></script><script src="/frontend/js/complementarios.js"></script><script src="/frontend/js/resultados.js"></script><script>${checks}</script></body>`);
const allowed = new Set(['frontend/js/perfiles-estadisticos.js','frontend/css/dashboard.css','frontend/css/registros.css','frontend/js/complementarios-catalogo.js','frontend/js/complementarios.js','frontend/js/prostitucion.js','frontend/js/prostitucion-catalogo.js','frontend/js/victimas.js','frontend/js/victimas-catalogo.js','frontend/js/notas.js','frontend/js/notas-catalogo.js','frontend/js/requisitoriados-catalogo.js','frontend/js/menores.js','frontend/js/menores-catalogo.js','frontend/css/styles.css','frontend/js/catalogos.js','frontend/js/dependencias.js','frontend/js/catalogos-ui.js','frontend/js/intervenciones.js','frontend/js/detenidos.js','frontend/js/resultados.js','frontend/js/requisitoriados.js','frontend/js/grupos.js','frontend/js/materiales.js','frontend/js/materiales-catalogo.js','frontend/js/vehiculos.js','frontend/js/vehiculos-catalogo.js','frontend/assets/logo-diriptim.png']);
http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1);
  if(!name){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html);}
  if(name==='complementarios-migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,'backend/supabase/migrations/202609230017_produccion_complementarios.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(name==='prostitucion-migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,'backend/supabase/migrations/202609160015_prostitucion_operativo.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(name==='format-migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,'backend/supabase/migrations/202609230018_formato_produccion.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(name==='victims-migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,'backend/supabase/migrations/202609160014_victimas_operativo.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(name==='migration'||name==='notes-migration'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<pre>'+fs.readFileSync(path.join(root,name==='notes-migration'?'backend/supabase/migrations/202609160013_ampliaciones_ni.sql':'backend/supabase/migrations/202609160012_requisitoriados_independientes.sql'),'utf8').replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</pre>');}
  if(!allowed.has(name)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'image/png');
  res.end(fs.readFileSync(asset(name)));
}).listen(8789,'127.0.0.1',()=>console.log('Component harness: http://127.0.0.1:8789/ (only fictional data)'));

