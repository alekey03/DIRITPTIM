const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),db=new PGlite();
const read=n=>fs.readFileSync(path.join(root,'backend/supabase/migrations',n),'utf8');
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
(async()=>{
 const schema=JSON.parse(fs.readFileSync(path.join(root,'datos/estructura-detallado-v1.json'),'utf8'));
 const contract=JSON.parse(fs.readFileSync(path.join(root,'datos/mapeo-victimas-v1.json'),'utf8'));
 assert.deepEqual(Object.keys(contract.columnas),schema.hojas.find(h=>h.nombre==='21_VICTIMAS_DE_TRATA').campos.map(c=>c.columna));
 assert.equal(Object.keys(contract.columnas).length,23);
 await db.exec(`create role authenticated;create role anon;create schema auth;
 create table perfiles(id uuid primary key,rol text,activo boolean,unidad text,departamento text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function usuario_activo() returns boolean language sql stable security definer set search_path=public as $$select coalesce((select activo from perfiles where id=auth.uid()),false)$$;
 create function es_administrador() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from perfiles where id=auth.uid() and activo and rol='administrador')$$;
 create function unidad_actual() returns text language sql stable security definer set search_path=public as $$select unidad from perfiles where id=auth.uid()$$;
 create function puede_acceder_unidad(u text) returns boolean language sql stable security definer set search_path=public as $$select usuario_activo() and (es_administrador() or unidad_actual()=u)$$;
 grant usage on schema auth to authenticated;grant select on perfiles to authenticated;`);
 for(const [n,rol,active,u] of [[1,'operador',true,'A'],[2,'operador',true,'B'],[3,'administrador',true,'C'],[4,'operador',false,'A'],[5,'supervisor',true,'A']])await db.query('insert into perfiles values($1,$2,$3,$4,$5)',[id(n),rol,active,u,'LIMA']);
 await db.exec(read('202609150002_base_intervenciones.sql'));
 await db.exec("alter table intervenciones add column resultados_previstos text[] not null default '{}'");
 const migration=read('202609160014_victimas_operativo.sql');await db.exec(migration);
 async function actor(n){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n?id(n):'']);await db.exec('set role authenticated');}

 await db.exec(read('202609160015_prostitucion_operativo.sql'));
 await actor(1);await db.query("insert into intervenciones(id,tipo,fecha) values($1,'operativo','2026-09-23')",[id(100)]);
 const old={fecha:'2026-09-23',edad:25,condicion_edad:'MAYOR',apellido_paterno:'FICTICIO',nombres:'HISTORICO',situacion:'VICTIMA RESCATADA',entidad_disposicion:'UPE'};
 const save=async(fn,n,v,data)=>(await db.query('select '+fn+'($1,$2,$3,$4,$5) r',[id(n),id(100),v,fn.includes('victima')?'victima':'prostitucion',JSON.stringify(data)])).rows[0].r;
 await save('guardar_victima_operativo',200,0,old);
 await db.exec('reset role');const adjustment=read('202609230018_formato_produccion.sql');await db.exec(adjustment);await actor(1);
 assert.deepEqual((await db.query('select datos from intervencion_victimas where id=$1',[id(200)])).rows[0].datos,old,'Migration must not rewrite historical data');
 for(const [i,age] of [0,1,17,18,120].entries()){
  const data={fecha:'2026-09-23',edad:age,condicion_edad:age<18?'MENOR':'MAYOR'};
  const result=await save('guardar_victima_operativo',210+i,0,data);assert.deepEqual(await save('guardar_victima_operativo',210+i,0,data),result);
  await save('guardar_prostitucion_operativo',310+i,0,{fecha:data.fecha,edad:age});
 }
 for(const fn of ['guardar_victima_operativo','guardar_prostitucion_operativo']){
  const valid={fecha:'2026-09-23',edad:25,...(fn.includes('victima')?{condicion_edad:'MAYOR'}:{})};
  for(const age of [-1,121,25.5,null,'25'])await assert.rejects(save(fn,400,0,{...valid,edad:age}));
  for(const extra of [{fecha:'2026-02-30'},{hora:'25:00'},{foto:'x'},{unidad:'B'},{genero:'INVALIDO'}])await assert.rejects(save(fn,400,0,{...valid,...extra}));
  await actor(2);await assert.rejects(save(fn,400,0,valid));await actor(5);await assert.rejects(save(fn,400,0,valid));await actor(4);await assert.rejects(save(fn,400,0,valid));await actor(1);
 }
 await save('guardar_victima_operativo',200,1,{...old,edad:26});
 assert.equal((await db.query('select datos from intervencion_victimas where id=$1',[id(200)])).rows[0].datos.nombres,'HISTORICO');
 await assert.rejects(save('guardar_victima_operativo',200,1,old));
 await db.exec('reset role');await db.exec(adjustment);await db.exec('set role anon');await assert.rejects(db.exec('select * from intervencion_victimas'));await assert.rejects(db.exec('select * from intervencion_prostitucion'));
 console.log('OK: formato reducido, edades 0–120, históricos conservados, reintentos, conflictos, permisos y reaplicación.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.close());
