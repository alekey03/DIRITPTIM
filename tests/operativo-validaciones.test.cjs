const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
(async()=>{
 const db=new PGlite();
 const base=read('tests/intervenciones-base.test.cjs');
 const setup=base.match(/await db\.exec\(`([\s\S]*?)`\);/)[1];await db.exec(setup);
 await db.exec(read('backend/supabase/migrations/202609150002_base_intervenciones.sql'));
 await db.exec(read('backend/supabase/migrations/202609150003_guardar_operativo_borrador.sql'));
 await db.exec(`insert into perfiles values('00000000-0000-0000-0000-000000000001','administrador',true,'NACIONAL','LIMA');
 select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000001',false);
 create table detenciones(id uuid,intervencion_id uuid,nota_sicpip text,fecha date,hora time,direccion_policial text,direccion_especializada_region text,division_policial text,departamento_policial text,unidad_area_equipo text);`);
 for(const table of ['intervencion_complementarios','intervencion_victimas','intervencion_prostitucion','intervencion_menores','intervencion_requisitoriados'])await db.exec(`create table ${table}(intervencion_id uuid,datos jsonb)`);
 const migration=read('backend/supabase/migrations/202610190003_operativo_validaciones_apoyo.sql');
 await db.exec(migration);await db.exec(migration);
 await db.exec('create trigger zz_heredar_ni_detenido before insert or update on detenciones for each row execute function heredar_ni_detenido()');
 const header={tipo:'operativo',fecha:'2026-10-19',hora:'08:30',nota_sicpip:'202600001234',departamento:'LIMA',provincia:'LIMA',distrito:'LINCE',direccion_policial:'DIRNIC',direccion_especializada_region:'DIRCTPTIM',division_policial:'DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS'};
 const support=[{direccion_policial:'DIRNIC',direccion_especializada_region:'DIRCTPTIM',division_policial:'DIVISIÓN DE INTELIGENCIA',departamento_policial:null,unidad_area_equipo:null}];
 const uuid=()=>require('node:crypto').randomUUID();
 const id=uuid(),request=uuid();
 const save=async(i,o={},v=0,req=uuid(),target=uuid())=>(await db.query('select guardar_operativo_borrador($1,$2,$3,$4,$5) result',[req,target,v,i,o])).rows[0].result;
 for(const key of ['fecha','hora','nota_sicpip','departamento','provincia','distrito','direccion_policial','direccion_especializada_region','division_policial'])await assert.rejects(save({...header,[key]:null}),undefined,key);
 await assert.rejects(save(header,{personal_cargo:-1}));
 await assert.rejects(save(header,{personal_cargo:'abc'}));
 await assert.rejects(save(header,{unidades_apoyo:[{}]}));
 const result=await save(header,{personal_cargo:0,unidades_apoyo:support},0,request,id);
 assert.deepEqual(await save(header,{personal_cargo:0,unidades_apoyo:support},0,request,id),result);
 assert.deepEqual((await db.query('select unidades_apoyo from intervencion_operativos where intervencion_id=$1',[id])).rows[0].unidades_apoyo,support);
 await assert.rejects(save(header,{unidades_apoyo:[]},result.version-1,uuid(),id));
 const updated=await save(header,{unidades_apoyo:[]},result.version,uuid(),id);
 assert(updated.version>result.version);
 assert.deepEqual((await db.query('select unidades_apoyo from intervencion_operativos where intervencion_id=$1',[id])).rows[0].unidades_apoyo,[]);
 await db.query('insert into detenciones(intervencion_id,nota_sicpip,fecha,direccion_policial) values($1,$2,$3,$4)',[id,'OTRA','2020-01-01','OTRA']);
 const child=(await db.query('select * from detenciones')).rows[0];assert.equal(child.nota_sicpip,header.nota_sicpip);assert.equal(child.direccion_policial,header.direccion_policial);assert.equal(child.fecha instanceof Date?child.fecha.toISOString().slice(0,10):child.fecha,header.fecha);
 for(const table of ['intervencion_complementarios','intervencion_victimas','intervencion_prostitucion','intervencion_menores','intervencion_requisitoriados']){
  await assert.rejects(db.query(`insert into ${table} values($1,$2)`,[id,{fecha:'2020-01-01',hora:'01:00',nombres:'PRUEBA'}]));
  await db.query(`insert into ${table} values($1,$2)`,[id,{fecha:header.fecha,hora:'08:30:00',nombres:'PRUEBA'}]);
  const child=(await db.query(`select datos from ${table}`)).rows[0].datos;assert.equal(child.fecha instanceof Date?child.fecha.toISOString().slice(0,10):child.fecha,header.fecha);assert.equal(child.hora,'08:30:00');assert.equal(child.nombres,'PRUEBA');
 }
 console.log('PASS: requeridos, numéricos, apoyos persistidos, reintentos, concurrencia, herencia de detenido y cinco categorías; migración reaplicable.');
 await db.close();
})().catch(e=>{console.error(e);process.exit(1);});


