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
let currentProfile={id:'fixture-user',activo:true,rol:'operador',unidad:'DEPITPTIM ABANCAY'};
let requests=[],records=new Map(),failOnce=true;
const supabaseClient={
 async rpc(name,p){
  requests.push(structuredClone(p));
  if(failOnce){failOnce=false;throw new Error('Interrupción simulada');}
  const saved={...p.p_intervencion,id:p.p_id,version:p.p_version+2,unidad:currentProfile.unidad,creado_por:currentProfile.id,intervencion_operativos:p.p_operativo};
  records.set(saved.id,saved);return {data:{id:saved.id,version:saved.version},error:null};
 },
 from(){let id=null;return {select(){return this},in(){return this},order(){return this},eq(k,v){id=v;return this},async single(){return {data:records.get(id),error:null}},async range(a,b){return {data:[...records.values()].slice(a,b+1),error:null}}};}
};
document.getElementById('loginScreen').style.display='none';
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('.view').forEach(view=>view.classList.toggle('active',view.id===button.dataset.view));
 document.querySelectorAll('.nav-item').forEach(item=>item.classList.toggle('active',item===button));
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
  report.textContent='PASS: 38 campos, reintento, conservación de datos, listado, reapertura, consulta de supervisor y limpieza de sesión.';
 }catch(error){report.textContent='FAIL: '+error.message;}
})();
`;
html = html.replace('</body>', `<script>${mock}</script>
<script src="/catalogos.js"></script><script src="/dependencias.js"></script><script src="/catalogos-ui.js"></script>
<script src="/intervenciones.js"></script><script>${checks}</script></body>`);
const allowed = new Set(['styles.css','catalogos.js','dependencias.js','catalogos-ui.js','intervenciones.js','assets/logo-diriptim.png']);
http.createServer((req,res)=>{
  const name=new URL(req.url,'http://localhost').pathname.slice(1);
  if(!name){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html);}
  if(!allowed.has(name)){res.writeHead(404);return res.end();}
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'image/png');
  res.end(fs.readFileSync(path.join(root,name)));
}).listen(8766,'127.0.0.1',()=>console.log('Component harness: http://127.0.0.1:8766/ (only fictional data)'));
