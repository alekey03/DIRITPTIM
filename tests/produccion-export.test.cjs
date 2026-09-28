const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const fixture=require('./produccion-fixture.cjs'),root=path.resolve(__dirname,'..'),ctx={window:{HistoricoProduccion:{read:async()=>[]}}};vm.createContext(ctx);
for(const f of ['frontend/js/produccion-catalogo.js','frontend/js/produccion-modelo.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const m=ctx.window.ProduccionModelo,plain=x=>JSON.parse(JSON.stringify(x));
const sheet=(r,n)=>r.sheets.find(s=>s.nombre.startsWith(n+'_'));
const value=(r,n,col,row=0)=>sheet(r,n).rows[row][sheet(r,n).columnas.some(c=>c.columna===col)?sheet(r,n).columnas.findIndex(c=>c.columna===col):[...col].reduce((v,c)=>v*26+c.charCodeAt(0)-64,0)-1];
test('Formato vigente: 24 hojas, drogas consolidadas y megaoperativos separados',()=>{
 const r=m.build(fixture());
 assert.deepEqual(plain(r.sheets.map(s=>s.nombre)),['1_OPERATIVOS','2_RQ','3_DETENIDOS','4_MENORES','5_DROGAS','13_ARMAS_FUEGO','14_ARMAS_BLANCAS','15_BANDAS','16_OO.CC.','17_VEH. MAYOR','18_VEH. MENOR','20_PROXENETISMO','21_ VICTIMAS DE TRATA DE PERSON','28_DINERO','30_CELULAR','32_MUNICIONES','38_INTERVENIDOS_ LEY_MIGRACIONE','52_CHIP','53_PERSONAS UBICADAS','54_EXTR. EXPULSADOS','33_LOCALES INTERVENIDOS','DESAPARECIDOS','MEGAOPERATIVOS','31_EXPLOSIVOS']);
 for(const s of r.sheets){assert(s.columnas.length>0);for(const row of s.rows)assert.equal(row.length,s.columnas.length);}
 assert.equal(sheet(r,5).rows.length,4);assert.equal(sheet(r,1).rows.length,1);assert.equal(r.sheets.find(s=>s.nombre==='MEGAOPERATIVOS').rows.length,1);
});
test('Tipos Excel: moneda independiente, ceros, fechas, horas, textos y fórmulas neutralizadas',()=>{
 const r=m.build(fixture());assert.deepEqual(plain(value(r,28,'H')),{t:'n',v:123.45,z:'0.######'});assert.equal(value(r,28,'I').v,67.89);assert.equal(value(r,28,'J').v,0);
 assert.equal(value(r,3,'L').v,'00123456');assert.equal(value(r,3,'L').t,'s');assert.equal(value(r,30,'O').v,'000123456789012');assert.equal(value(r,30,'AA').t,'s');assert.equal(value(r,30,'AA').f,undefined);
 assert.equal(value(r,1,'S',0).v,0);assert.equal(value(r,1,'AJ',0).v,'CONTROL FICTICIO');assert.equal(value(r,3,'C').v,46288);assert.equal(value(r,3,'D').z,'hh:mm:ss');assert.equal(value(r,21,'H').v,0);assert.equal(value(r,3,'T').v,'SI');assert.equal(value(r,3,'V').v,'DELITO UNO');assert.equal(value(r,3,'AA').v,'DELITO DOS');
});
test('Bandas: una fila por integrante, una sola marca SI, OOCC separadas',()=>{const r=m.build(fixture());assert.equal(sheet(r,15).rows.length,2);assert.equal(sheet(r,16).rows.length,1);assert.deepEqual(plain(sheet(r,15).rows.map(row=>row[41].v)),['SI','']);assert.equal(value(r,16,'F').v,'INTEGRANTE');});
test('Nombres de operativo y resultado conforme a la plantilla',()=>{const r=m.build(fixture());assert.equal(r.sheets.find(s=>s.nombre==='MEGAOPERATIVOS').rows.length,1);assert.equal(value(r,1,'E',0).v,'OPERATIVO');assert.equal(value(r,1,'F',0).v,'POSITIVO');});
test('RQ no suma detenidos; filtros inclusivos con fecha propia y unidad',()=>{
 const d=fixture(),r=m.build(d,{from:'2026-09-24',to:'2026-09-24',unit:'UNIDAD A'});assert.equal(sheet(r,2).rows.length,1);assert.equal(sheet(r,3).rows.length,0);assert.equal(sheet(r,1).rows.length,0);assert.equal(r.sheets.length,24);
 assert.equal(m.build(d,{unit:'UNIDAD B'}).total,1);assert.equal(m.build(d,{unit:'NO AUTORIZADA'}).total,0);assert.throws(()=>m.build(d,{from:'2026-10-01',to:'2026-09-01'}),/posterior/);
});
test('Datos históricos no salen en hojas simplificadas, vacíos no se convierten en cero',()=>{const r=m.build(fixture());assert.equal(sheet(r,20).columnas.length,29);assert.equal(sheet(r,21).columnas.length,31);assert.ok(!JSON.stringify(sheet(r,20).rows).includes('HISTÓRICO'));assert.equal(value(r,28,'M').v,'');assert.equal(value(r,53,'B').v,'SEPTIEMBRE');});
test('No truncar delitos, no atribuir grupo sin integrante autorizado; referencias de armas sin duplicación',()=>{
 const d=fixture();d.detenciones_reportables[0].detencion_delitos.push({orden:3});assert.throws(()=>m.build(d),/más de dos/);
 const absent=fixture();absent.detenciones=[];assert.throws(()=>m.build(absent),/integrantes/);
 const arms=fixture();arms.detenciones_reportables[0].detencion_armas=[{categoria:'ARMA BLANCA',tipo:'CUCHILLO'}];const r=m.build(arms);assert.equal(value(r,3,'AK').v,'ARMA BLANCA');assert.equal(sheet(r,14).rows.length,1);assert.ok(r.warnings.some(x=>x.includes('no se duplican')));
});
function client(data,{errorTable,repeat=false}={}){return {from(table){let cursor='',key='id',eqKey=null,eqValue=null;return {select(){return this},order(k){key=k;return this},limit(){return this},gt(k,v){cursor=v;return this},eq(k,v){eqKey=k;eqValue=v;return this},then(resolve){resolve(table===errorTable?{error:{message:'fallo de red'}}:{data:(data[table]||[]).filter(r=>(repeat||r[key]>cursor)&&(!eqKey||r[eqKey]===eqValue)).sort((a,b)=>a[key].localeCompare(b[key])).slice(0,500)})}}}};}
test('Paginación 1201 filas y cancelación/errores: sin archivo parcial',async()=>{const rows=Array.from({length:1201},(_,i)=>({id:String(i).padStart(5,'0')}));assert.equal((await m.readTable(client({t:rows}),'t')).length,1201);await assert.rejects(m.readTable(client({}, {errorTable:'t'}),'t'),/fallo/);await assert.rejects(m.readTable(client({t:rows},{repeat:true}),'t'),/completar/);await assert.rejects(m.readTable({},'t','*',()=>false),/cancelada/);});
test('Snapshot completa los integrantes paginados y propaga cualquier error de categoría',async()=>{const d=fixture();d.intervencion_grupo_integrantes=d.intervencion_grupos.flatMap(g=>g.intervencion_grupo_integrantes);const s=await m.snapshot(client(d));assert.equal(s.intervencion_grupos[0].intervencion_grupo_integrantes.length,2);await assert.rejects(m.snapshot(client(d,{errorTable:'intervencion_vehiculos'})),/fallo/);});

test('Locales y denuncias independientes: columnas del formato, fechas, valorización cero y filtros de unidad',()=>{
 const d=fixture();const parent=d.intervenciones.find(x=>x.tipo==='operativo');
 d.intervencion_complementarios.push({id:'local-test',intervencion_id:parent.id,tipo:'locales',datos:{fecha:'2026-08-02',situacion:'INTERVENIDO',tipo_inmueble:'LOCAL',detalle_inmueble:'FICTICIO',valorizacion:0}});
 d.desapariciones=[{id:'denuncia-test',unidad:'UNIDAD A',fecha:'2026-08-01',datos:{fecha:'2026-08-01',apellido_paterno:'PRUEBA',nombres:'SINTETICA',edad:0,fecha_ubicacion:'2026-08-03',distrito_ubicacion:'DISTRITO FICTICIO'}}];
 const report=m.build(d),local=report.sheets.find(s=>s.nombre==='33_LOCALES INTERVENIDOS'),missing=report.sheets.find(s=>s.nombre==='DESAPARECIDOS');
 assert.equal(local.columnas.length,29);assert.equal(local.rows.length,1);assert.equal(local.rows[0][10].v,0);
 assert.equal(missing.columnas.length,26);assert.equal(missing.rows.length,1);assert.equal(missing.rows[0][9].v,'SINTETICA');assert.equal(missing.rows[0][10].v,0);assert.equal(missing.rows[0][24].v,'AGOSTO');assert.equal(missing.rows[0][25].v,'DISTRITO FICTICIO');
 assert.equal(m.build(d,{unit:'UNIDAD B'}).sheets.find(s=>s.nombre==='DESAPARECIDOS').rows.length,0);
 assert.equal(m.build(d,{from:'2026-08-02'}).sheets.find(s=>s.nombre==='DESAPARECIDOS').rows.length,0);
});
