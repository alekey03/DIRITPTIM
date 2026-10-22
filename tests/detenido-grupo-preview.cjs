// Local-only UI fixture; no real accounts or network database requests.
const fs=require('fs'),path=require('path'),http=require('http');
const root=path.resolve(__dirname,'..');
const base=fs.readFileSync(path.join(__dirname,'operativos-preview.cjs'),'utf8');
const mock=base.split('const mock = `')[1].split('`;')[0];
const checks=`
(async()=>{
 const report=document.createElement('p');report.id='groupReport';document.body.prepend(report);
 const assert=(v,m)=>{if(!v)throw Error(m)};
 try{
 window.getDetaineeOperativo=()=>({id:'op-ficticio'});
 groups.push({id:'grupo-ficticio',intervencion_id:'op-ficticio',tipo:'banda',nombre:'BANDA FICTICIA',modalidad:'MODALIDAD DE PRUEBA',referencia_lugar:'LUGAR FICTICIO',intervencion_grupo_integrantes:[{detencion_id:'det-ficticio'}]});
 document.querySelector('[data-view="detaineeFormView"]').click();
 await window.loadDetaineeGroup();
 const f=document.getElementById('detaineeForm'),set=(n,v)=>{f.elements[n].value=v;f.elements[n].dispatchEvent(new Event('change',{bubbles:true}))};
 set('integraOrganizacion','banda');assert(!f.elements.grupoModalidad.disabled,'Modalidad habilitada');
 set('grupoExistente','grupo-ficticio');assert(f.elements.nombreOrganizacion.readOnly,'Nombre protegido');assert(window.readDetaineeGroup().id==='grupo-ficticio','Grupo existente');
 set('grupoExistente','');assert(!f.elements.nombreOrganizacion.readOnly,'Nuevo grupo editable');assert(!f.elements.grupoModalidad.value,'Nueva modalidad vacía');
 set('integraOrganizacion','organizacion');assert(f.elements.grupoExistente.options.length===1,'Tipos separados');
 set('integraOrganizacion','false');assert(f.elements.grupoModalidad.disabled,'Ninguno no exige modalidad');
 f.reset();await window.loadDetaineeGroup();set('integraOrganizacion','banda');set('grupoExistente','grupo-ficticio');
 document.querySelectorAll('#detaineeForm .detainee-step').forEach(s=>{s.hidden=false;s.style.display='block'});
 document.querySelector('.detainee-group-section').scrollIntoView({block:'center'});
 report.textContent='PASS: grupo existente, nuevo grupo, campos protegidos, tipos separados, Ninguno y reapertura.';
 }catch(e){report.textContent='FAIL: '+e.message;console.error(e)}
})();`;
let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const scripts=['catalogos','dependencias','dependencias-flujo','catalogos-ui','detenidos','detenido-grupo'];
html=html.replace('</body>',`<script>${mock}</script>${scripts.map(s=>`<script src="/frontend/js/${s}.js"></script>`).join('')}<script>${checks}</script></body>`);
http.createServer((req,res)=>{
 const n=new URL(req.url,'http://localhost').pathname.slice(1);
 if(n==='mobile'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<iframe title="Prueba móvil" src="/" style="width:390px;height:844px;border:0"></iframe>')}
 if(!n){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html)}
 const p=path.resolve(root,n);if(!p.startsWith(root+path.sep)||!fs.existsSync(p)){res.writeHead(404);return res.end()}
 res.setHeader('Content-Type',n.endsWith('.js')?'text/javascript; charset=utf-8':n.endsWith('.css')?'text/css; charset=utf-8':'application/octet-stream');res.end(fs.readFileSync(p));
}).listen(8791,'127.0.0.1',()=>console.log('Fixture: http://127.0.0.1:8791'));
