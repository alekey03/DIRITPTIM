// Local-only fixture: no requests to Supabase and no real records.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const old=fs.readFileSync(path.join(__dirname,'operativos-preview.cjs'),'utf8');
const mock=old.split('const mock = `')[1].split('`;')[0]+`
function esGestorProduccion(){return true} function puedeEditarUnidad(){return true} function puedeRegistrarUnidad(){return true}
window.ConsultaModelo={readAll:async()=>[...records.values()]};
failOnce=false;
`;
const scripts=[...old.matchAll(/src="\/(frontend\/js\/[^"?]+)"/g)].map(m=>m[1]);
scripts.splice(scripts.indexOf('frontend/js/catalogos-ui.js'),0,'frontend/js/dependencias-flujo.js');
const checks=`
(async()=>{const result=document.createElement('p');result.id='validationReport';result.style='position:fixed;top:0;left:0;background:#fff;z-index:99999;padding:12px;color:#123';document.body.append(result);
const assert=(x,m)=>{if(!x)throw Error(m)},tick=()=>new Promise(r=>setTimeout(r,30));
try{
window.setProtectedCatalogs({dependencias_policiales:[],delitos:[]});
document.querySelector('[data-view="operativoView"]').click();
const form=document.getElementById('operativoForm');
assert(!form.checkValidity(),'Debe bloquear vacío');form.requestSubmit();assert(!requests.length,'No envía vacío');
const set=(name,value)=>{const c=form.elements.namedItem(name);c.value=value;c.dispatchEvent(new Event('change',{bubbles:true}));};
set('intervencion.tipo','operativo');set('intervencion.fecha','2026-10-19');set('intervencion.hora','08:30');set('intervencion.nota_sicpip','202600001234');
for(const c of form.querySelectorAll('[data-op-catalog="geo"]')){c.selectedIndex=1;c.dispatchEvent(new Event('change',{bubbles:true}));}
set('intervencion.direccion_policial','DIRNIC');set('intervencion.direccion_especializada_region','DIRCTPTIM');set('intervencion.division_policial','DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS');
assert(form.checkValidity(),'Nivel sin catálogo no bloquea');
document.getElementById('addOperativoSupport').click();assert(!form.checkValidity(),'Apoyo empezado debe completarse');
const selects=[...document.querySelectorAll('[data-support-key]')];
['DIRNIC','DIRCTPTIM','DIVISIÓN DE INTELIGENCIA'].forEach((v,i)=>{selects[i].value=v;selects[i].dispatchEvent(new Event('change',{bubbles:true}));});
assert(form.checkValidity(),'Apoyo válido');
const counter=form.elements.namedItem('operativo.personal_cargo');counter.value='-1';assert(!form.checkValidity(),'Negativo');counter.value='1.2';assert(!form.checkValidity(),'Decimal');counter.value='0';
const e=new KeyboardEvent('keydown',{key:'e',cancelable:true});counter.dispatchEvent(e);assert(e.defaultPrevented,'No exponente');
form.requestSubmit();await tick();assert(requests.length===1,'Una solicitud');assert(requests[0].p_operativo.unidades_apoyo.length===1,'Incluye apoyo');
const parent=[...records.values()][0];await window.openOperativoById(parent.id);assert(document.querySelector('[data-support-key="division_policial"]').value==='DIVISIÓN DE INTELIGENCIA','Reabre apoyo');
window.startDetaineeFromOperativo(parent);
for(const name of ['notaSicpip','fecha','hora','direccionPolicial','direccionRegion','divisionPolicial','departamentoPolicial','unidadArea']){const c=document.getElementById('detaineeForm').elements.namedItem(name);assert(c.readOnly||c.disabled,'Heredado bloqueado '+name);}
window.clearDetaineeOperativo();
await window.openOperativoResults(parent.id);
const box=document.querySelector('#resultsSelection input[value="personas_ubicadas"]');box.click();
const visible=[...document.querySelectorAll('#complementCards button')].filter(b=>getComputedStyle(b).display!=='none');assert(visible.length===1,'Solo tarjeta Ubicados visible');visible[0].click();
assert(document.querySelector('#complementForm [name="fecha"]').readOnly,'Fecha heredada');
assert([...document.querySelectorAll('#complementInputs input,#complementInputs select')].every(c=>c.getBoundingClientRect().right<=document.documentElement.clientWidth+1),'Sin desbordamiento');
result.textContent='PASS: obligatorios, apoyo opcional y reapertura, números, herencia, tarjetas y formulario Ubicados.';
}catch(e){result.textContent='FAIL: '+e.message;console.error(e);}})();`;
let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
html=html.replace('</body>',`<script>${mock}</script>${scripts.map(s=>`<script src="/${s}"></script>`).join('')}<script>${checks}</script></body>`);
http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1);if(name==='mobile'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<h3>Prueba móvil: 390 px</h3><iframe title="Formulario móvil" src="/" style="width:390px;height:844px;border:1px solid #ccc"></iframe>')}if(!name){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html)}
const file=path.resolve(root,name);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end()}
res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript; charset=utf-8':name.endsWith('.css')?'text/css; charset=utf-8':'application/octet-stream');res.end(fs.readFileSync(file));
}).listen(8788,'127.0.0.1',()=>console.log('Local fixture http://127.0.0.1:8788'));
