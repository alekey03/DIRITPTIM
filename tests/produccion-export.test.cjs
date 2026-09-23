const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const fixture=require('./produccion-fixture.cjs'),root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
for(const f of ['frontend/js/produccion-catalogo.js','frontend/js/produccion-modelo.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const m=ctx.window.ProduccionModelo,plain=x=>JSON.parse(JSON.stringify(x));
const sheet=(r,n)=>r.sheets.find(s=>s.nombre.startsWith(n+'_'));
const value=(r,n,col,row=0)=>sheet(r,n).rows[row][sheet(r,n).columnas.findIndex(c=>c.columna===col)];
test('22 nombres, orden y todas las columnas contra el Excel; recuperación explícita de tres hojas vacías',()=>{
 const source=JSON.parse(fs.readFileSync(path.join(root,'datos/estructura-produccion-v2.json'),'utf8')),old=JSON.parse(fs.readFileSync(path.join(root,'datos/estructura-detallado-v1.json'),'utf8'));
 const r=m.build(fixture());assert.equal(r.sheets.length,22);assert.deepEqual(plain(r.sheets.map(s=>s.nombre)),source.hojas.map(s=>s.nombre));
 for(const s of r.sheets){const sourceSheet=source.hojas.find(x=>x.nombre===s.nombre);const expected=sourceSheet.campos.length?sourceSheet:old.hojas.find(x=>x.nombre===s.encabezados_recuperados_de);assert.deepEqual(plain(s.columnas.map(c=>[c.columna,c.encabezado])),expected.campos.map(c=>[c.columna,c.encabezado]));assert.ok(s.columnas.every(c=>c.origen));assert.ok(s.rows.length>0, s.nombre);}
});
test('Tipos Excel: moneda independiente, ceros, fechas, horas, textos y fórmulas neutralizadas',()=>{
 const r=m.build(fixture());assert.deepEqual(plain(value(r,28,'H')),{t:'n',v:123.45,z:'0.######'});assert.equal(value(r,28,'I').v,67.89);assert.equal(value(r,28,'J').v,0);
 assert.equal(value(r,3,'L').v,'00123456');assert.equal(value(r,3,'L').t,'s');assert.equal(value(r,30,'O').v,'000123456789012');assert.equal(value(r,30,'AA').t,'s');assert.equal(value(r,30,'AA').f,undefined);
 assert.equal(value(r,1,'L',1).v,0);assert.equal(value(r,1,'AJ',1).v,'CONTROL FICTICIO');assert.equal(value(r,3,'C').v,46288);assert.equal(value(r,3,'D').z,'hh:mm:ss');assert.equal(value(r,21,'E').v,0);assert.equal(value(r,3,'T').v,'SI');assert.equal(value(r,3,'V').v,'DELITO UNO');assert.equal(value(r,3,'AA').v,'DELITO DOS');
});
test('Bandas: una fila por integrante, una sola marca SI, OOCC separadas',()=>{const r=m.build(fixture());assert.equal(sheet(r,15).rows.length,2);assert.equal(sheet(r,16).rows.length,1);assert.deepEqual(plain(sheet(r,15).rows.map(row=>row[40].v)),['SI','']);assert.equal(value(r,16,'F').v,'INTEGRANTE');});
test('Nombres de operativo y resultado conforme a la plantilla',()=>{const r=m.build(fixture());assert.equal(value(r,1,'E',0).v,'MEGA OPERATIVO');assert.equal(value(r,1,'E',1).v,'OPERATIVO');assert.equal(value(r,1,'F',1).v,'POSITIVO');});
test('RQ no suma detenidos; filtros inclusivos con fecha propia y unidad',()=>{
 const d=fixture(),r=m.build(d,{from:'2026-09-24',to:'2026-09-24',unit:'UNIDAD A'});assert.equal(sheet(r,2).rows.length,1);assert.equal(sheet(r,3).rows.length,0);assert.equal(sheet(r,1).rows.length,0);assert.equal(r.sheets.length,22);
 assert.equal(m.build(d,{unit:'UNIDAD B'}).total,1);assert.equal(m.build(d,{unit:'NO AUTORIZADA'}).total,0);assert.throws(()=>m.build(d,{from:'2026-10-01',to:'2026-09-01'}),/posterior/);
});
test('Datos históricos no salen en hojas simplificadas, vacíos no se convierten en cero',()=>{const r=m.build(fixture());assert.equal(sheet(r,20).columnas.length,18);assert.equal(sheet(r,21).columnas.length,18);assert.ok(!JSON.stringify(sheet(r,20).rows).includes('HISTÓRICO'));assert.equal(value(r,28,'M').v,'');assert.equal(value(r,53,'B').v,'SEPTIEMBRE');});
test('No truncar delitos, no atribuir grupo sin integrante autorizado; referencias de armas sin duplicación',()=>{
 const d=fixture();d.detenciones_reportables[0].detencion_delitos.push({orden:3});assert.throws(()=>m.build(d),/más de dos/);
 const absent=fixture();absent.detenciones=[];assert.throws(()=>m.build(absent),/integrantes/);
 const arms=fixture();arms.detenciones_reportables[0].detencion_armas=[{categoria:'ARMA BLANCA',tipo:'CUCHILLO'}];const r=m.build(arms);assert.equal(value(r,3,'AK').v,'ARMA BLANCA');assert.equal(sheet(r,14).rows.length,1);assert.ok(r.warnings.some(x=>x.includes('no se duplican')));
});
function client(data,{errorTable,repeat=false}={}){return {from(table){let cursor='',key='id',eqKey=null,eqValue=null;return {select(){return this},order(k){key=k;return this},limit(){return this},gt(k,v){cursor=v;return this},eq(k,v){eqKey=k;eqValue=v;return this},then(resolve){resolve(table===errorTable?{error:{message:'fallo de red'}}:{data:(data[table]||[]).filter(r=>(repeat||r[key]>cursor)&&(!eqKey||r[eqKey]===eqValue)).sort((a,b)=>a[key].localeCompare(b[key])).slice(0,500)})}}}};}
test('Paginación 1201 filas y cancelación/errores: sin archivo parcial',async()=>{const rows=Array.from({length:1201},(_,i)=>({id:String(i).padStart(5,'0')}));assert.equal((await m.readTable(client({t:rows}),'t')).length,1201);await assert.rejects(m.readTable(client({}, {errorTable:'t'}),'t'),/fallo/);await assert.rejects(m.readTable(client({t:rows},{repeat:true}),'t'),/completar/);await assert.rejects(m.readTable({},'t','*',()=>false),/cancelada/);});
test('Snapshot completa los integrantes paginados y propaga cualquier error de categoría',async()=>{const d=fixture();d.intervencion_grupo_integrantes=d.intervencion_grupos.flatMap(g=>g.intervencion_grupo_integrantes);const s=await m.snapshot(client(d));assert.equal(s.intervencion_grupos[0].intervencion_grupo_integrantes.length,2);await assert.rejects(m.snapshot(client(d,{errorTable:'intervencion_vehiculos'})),/fallo/);});
