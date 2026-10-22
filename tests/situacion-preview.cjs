// Isolated browser fixture. No production data or network writes.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),old=fs.readFileSync(path.join(__dirname,'operativos-preview.cjs'),'utf8');
let mock=old.split('const mock = `')[1].split('`;')[0];
mock+=`
function puedeRegistrarUnidad(){return true} function puedeEditarUnidad(){return true} function esGestorProduccion(){return true}
const actualRpc=supabaseClient.rpc.bind(supabaseClient);let situationCalls=[];
supabaseClient.rpc=async(name,p)=>{if(name==='categorias_con_registros')return {data:['detenidos','celulares']};if(name==='actualizar_situacion_detenido'){situationCalls.push(p);return {data:{actualizado_en:'2026-10-21T12:00:00Z'}};}return actualRpc(name,p);};
const actualFrom=supabaseClient.from.bind(supabaseClient);
supabaseClient.from=name=>name==='detencion_situaciones_historial'?{select(){return this},eq(){return this},order(){return this},limit:async()=>({data:[]})}:actualFrom(name);
`;
const scripts=[...old.matchAll(/src="\/(frontend\/js\/[^"?]+)"/g)].map(m=>m[1]);
scripts.splice(scripts.indexOf('frontend/js/catalogos-ui.js'),0,'frontend/js/dependencias-flujo.js');
scripts.push('frontend/js/produccion-plazo.js','frontend/js/detenidos-situacion.js');
const checks=`
(async()=>{const report=document.createElement('p');report.id='validationReport';report.style='padding:12px;background:white';document.body.prepend(report);
const assert=(x,m)=>{if(!x)throw Error(m)},tick=()=>new Promise(r=>setTimeout(r,50));
try{
setProtectedCatalogs({dependencias_policiales:[],delitos:[]});
assert(ProductionDeadline.limits(new Date('2026-11-01T04:59:59Z')).max==='2026-10-31','Hora peruana');
assert(ProductionDeadline.limits(new Date('2026-11-01T05:00:00Z')).min==='2026-10-29','Cambio de mes');
assert(ProductionDeadline.error('2000-01-01').includes('fuera de plazo'),'Fecha antigua');
const d={id:'fixture',creado_por:'fixture-user',actualizado_en:'2026-10-21T10:00:00Z',situacion_actual:'CONTINUA DETENIDO'};
renderDetaineeSituation(d);const button=document.getElementById('editDetaineeButton').previousElementSibling;
assert(!button.hidden,'Autor puede actualizar');button.click();await tick();
const form=document.getElementById('detaineeSituationForm'),dialog=document.getElementById('detaineeSituationDialog');
assert(dialog.open,'Abre diálogo');assert(form.elements.situacion_actual.options.length===11,'Diez situaciones disponibles');
assert(!form.elements.fecha&&!form.elements.notaSicpip,'No edita fecha ni NI');
assert(!form.checkValidity(),'Exige motivo');
form.elements.situacion_actual.value='PUESTO A DISPOSICION DE FISCALIA';form.elements.motivo.value='Prueba ficticia';
openDetaineeRecord=async()=>{};form.requestSubmit();await tick();assert(situationCalls.length===1,'Guarda una vez');assert(!dialog.open,'Cierra después de confirmar');
currentProfile={...currentProfile,id:'otro'};renderDetaineeSituation(d);assert(button.hidden,'No permite registro ajeno');
currentProfile.rol='administrador';renderDetaineeSituation(d);assert(!button.hidden,'Administrador');button.click();await tick();
assert([...form.querySelectorAll('input,select,textarea')].every(x=>x.getBoundingClientRect().right<=document.documentElement.clientWidth+1),'Sin desbordamiento');
resetDetaineeSituation();assert(!dialog.open&&button.hidden,'Limpia sesión');
currentProfile={...currentProfile,id:'fixture-user',rol:'visualizador'};renderDetaineeSituation(d);assert(button.hidden,'Visualizador bloqueado');
currentProfile.rol='operador';renderDetaineeSituation(d);button.click();await tick();
report.textContent='PASS: plazo Perú, autoría, administrador, visualizador, campos limitados, motivo, guardado y cierre de sesión.';
}catch(e){report.textContent='FAIL: '+e.message;console.error(e);}})();`;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</body>',`<script>${mock}</script>${scripts.map(s=>`<script src="/${s}"></script>`).join('')}<script>${checks}</script></body>`);
http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1);if(name==='mobile'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<iframe title="Prueba móvil" src="/" style="width:390px;height:844px"></iframe>')}if(!name){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html)}const file=path.resolve(root,name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'application/octet-stream');res.end(fs.readFileSync(file));}).listen(8789,'127.0.0.1',()=>console.log('Local fixture http://127.0.0.1:8789'));
