// Local-only export harness. Never connects to Supabase; all records are fictional.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),fixture=require('./produccion-fixture.cjs');
const root=path.resolve(__dirname,'..');
const files=['frontend/js/catalogos.js','frontend/js/complementarios-catalogo.js','frontend/js/requisitoriados-catalogo.js','frontend/js/prostitucion-catalogo.js','frontend/js/victimas-catalogo.js','frontend/js/menores-catalogo.js','frontend/js/materiales-catalogo.js','frontend/js/vehiculos-catalogo.js','frontend/js/consulta-modelo.js','frontend/js/consulta.js','frontend/js/produccion-catalogo.js','frontend/js/produccion-modelo.js','frontend/js/produccion.js'];
const mock=`let currentProfile={id:'fixture-user',activo:true,rol:'administrador',unidad:'UNIDAD A'};
let fixtureData=${JSON.stringify(fixture())};
fixtureData.intervencion_grupo_integrantes=fixtureData.intervencion_grupos.flatMap(g=>g.intervencion_grupo_integrantes);
const supabaseClient={from(table){let cursor='',key='id',eqKey=null,eqValue=null;return {select(){return this},order(k){key=k;return this},limit(){return this},gt(k,v){cursor=v;return this},eq(k,v){eqKey=k;eqValue=v;return this},then(resolve){resolve({data:(fixtureData[table]||[]).filter(r=>r[key]>cursor&&(!eqKey||r[eqKey]===eqValue)).sort((a,b)=>a[key].localeCompare(b[key])).slice(0,500)})}}}};
function excelDate(v){return v;}function downloadWorkbook(){};
`;
const checks=`
const testStatus=document.getElementById('browserTest');
const assert=(v,m)=>{if(!v)throw new Error(m);};
async function wait(f){for(let i=0;i<100;i++){if(f())return;await new Promise(r=>setTimeout(r,30));}throw new Error('Timeout de prueba');}
async function run(){try{
 assert(window.XLSX,'SheetJS disponible');
 let exported=null;
 XLSX.writeFile=(book,name)=>{exported={book,name,bytes:XLSX.write(book,{type:'array',bookType:'xlsx',compression:true})};};
 const launch=Array.from(document.querySelectorAll('#consultaRecordsView button')).find(b=>b.textContent.includes('22 pestañas'));
 assert(launch,'Acceso a exportación en Registros');launch.click();await wait(()=>!document.querySelector('.produccion-filters').disabled);
 const dialog=document.querySelector('.produccion-modal'),form=dialog.querySelector('form');form.elements.from.value='2026-09-01';form.elements.to.value='2026-09-30';form.requestSubmit();
 await wait(()=>!dialog.querySelector('[data-download]').hidden);assert(dialog.querySelectorAll('dt').length===22,'Resumen de las 22 hojas');
 dialog.querySelector('[data-download]').click();await wait(()=>exported);const reopened=XLSX.read(exported.bytes,{type:'array'});
 assert(reopened.SheetNames.length===22,'22 hojas en archivo real');assert(reopened.Sheets['3_DETENIDOS'].L2.v==='00123456','DNI con ceros');assert(reopened.Sheets['30_CELULAR'].O2.v==='000123456789012','IMEI con ceros');assert(reopened.Sheets['30_CELULAR'].AA2.t==='s'&&!reopened.Sheets['30_CELULAR'].AA2.f,'Fórmula como texto');assert(reopened.Sheets['15_BANDAS'].AO2.v==='SI'&&!reopened.Sheets['15_BANDAS'].AO3.v,'Una marca por banda');
 assert(reopened.Sheets['28_DINERO'].H2.v===123.45&&reopened.Sheets['28_DINERO'].J2.v===0,'Monedas y cero');
 const response=await fetch('/fixture.xlsx',{method:'POST',body:exported.bytes});assert(response.ok,'Archivo de prueba guardado localmente');
 exported=null;fixtureData.intervenciones[0].version++;dialog.querySelector('[data-download]').click();await wait(()=>dialog.querySelector('[data-status]').textContent.includes('Prepare de nuevo'));assert(!exported,'Cambio concurrente impide descarga antigua');
 form.requestSubmit();await wait(()=>!dialog.querySelector('[data-download]').hidden);currentProfile={...currentProfile,id:'otra-cuenta'};dialog.querySelector('[data-download]').click();await wait(()=>dialog.querySelector('[data-status]').textContent.includes('cuenta cambió'));assert(!exported,'Cambio de cuenta invalida reporte');
 window.resetConsulta();assert(!dialog.open&&!dialog.querySelector('[data-preview]').textContent,'Logout limpia datos del reporte');
 currentProfile={id:'fixture-user',activo:true,rol:'administrador',unidad:'UNIDAD A'};launch.click();await wait(()=>!document.querySelector('.produccion-filters').disabled);form.requestSubmit();await wait(()=>!dialog.querySelector('[data-download]').hidden);
 testStatus.textContent='PASS: exportación real XLSX, 22 hojas, filtros, ceros, tipos, bandas, conflicto, cambio de cuenta y limpieza.';
}catch(e){testStatus.textContent='FAIL: '+e.message;console.error(e);}}
run();`;
const html=`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Prueba de exportación DIRITPTIM</title><link rel="stylesheet" href="/frontend/css/styles.css"></head><body style="display:block;padding:24px"><p id="browserTest" role="status">Probando…</p><section id="consultaRecordsView"></section><section id="generalDashboardView" hidden></section><script>${mock}</script><script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>${files.map(f=>`<script src="/${f}"></script>`).join('')}<script>${checks}</script></body></html>`;
http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.slice(1);
 if(!name){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html);}
 if(name==='fixture.xlsx'&&req.method==='POST'){
  let size=0;const chunks=[];req.on('data',b=>{size+=b.length;if(size>2000000){req.destroy();return;}chunks.push(b);});req.on('end',()=>{fs.writeFileSync(path.join(root,'tests/produccion-fixture.xlsx'),Buffer.concat(chunks));res.end('OK');});return;
 }
 if(![...files,'frontend/css/styles.css'].includes(name)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,name)));
}).listen(8774,'127.0.0.1',()=>console.log('Export harness: http://127.0.0.1:8774/ (fictional data only)'));
