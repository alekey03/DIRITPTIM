const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),db=new PGlite();
const read=n=>fs.readFileSync(path.join(root,'backend/supabase/migrations',n),'utf8');
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
(async()=>{
 const schema=JSON.parse(fs.readFileSync(path.join(root,'datos/estructura-detallado-v1.json'),'utf8'));
 const contract=JSON.parse(fs.readFileSync(path.join(root,'datos/mapeo-materiales-v1.json'),'utf8'));
 assert.equal(contract.tipos.length,5);
 for(const t of contract.tipos){
  assert.deepEqual(Object.keys(t.columnas),schema.hojas.find(h=>h.nombre===t.hoja).campos.map(c=>c.columna));
  for(const value of Object.values(t.columnas).filter(x=>x.startsWith('material.'))) assert(t.campos.some(f=>'material.datos.'+f.key===value));
 }
 await db.exec(`create role authenticated;create schema auth;
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
 const migration=read('202609150006_materiales_operativo.sql');await db.exec(migration);
 async function actor(n){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n?id(n):'']);await db.exec('set role authenticated');}
 const save=async(n,v=0,t='municion',data={cantidad:12},parent=100)=>(await db.query('select guardar_material_operativo($1,$2,$3,$4,$5) r',[id(n),id(parent),v,t,JSON.stringify(data)])).rows[0].r;
 await actor(1);await db.query("insert into intervenciones(id,tipo,fecha) values($1,'operativo','2026-09-15')",[id(100)]);
 const a=await save(200);assert.deepEqual(await save(200),a);
 await assert.rejects(save(200,0,'municion',{cantidad:13}));
 for(const q of [0,-1,1.5,1e12,null,'3'])await assert.rejects(save(201,0,'municion',{cantidad:q}));
 await assert.rejects(save(201,0,'fuego',{tipo:'FICTICIO'}));
 await assert.rejects(save(201,0,'municion',{cantidad:2,nombres:'No corresponde'}));
 await assert.rejects(save(201,0,'replica',{tipo:'FICTICIO',situacion:'FICTICIA',serie:'No corresponde'}));
 for(const [n,t]of contract.tipos.entries()){
  const data={};for(const f of t.campos)data[f.key]=f.type==='number'?(f.key==='edad'?30:2):f.key.startsWith('tentativa')?'No':'FICTICIO';
  await save(300+n,0,t.tipo,data);
 }
 await assert.rejects(db.exec("update intervenciones set resultados_previstos='{}'"));
 await assert.rejects(db.exec("update intervenciones set tipo='directa'"));
 const b=await save(200,1,'municion',{cantidad:20});assert.equal(b.version,2);assert.deepEqual(await save(200,1,'municion',{cantidad:20}),b);
 await assert.rejects(save(200,1,'municion',{cantidad:21}));
 await actor(2);assert.equal((await db.query('select * from intervencion_materiales')).rows.length,0);await assert.rejects(save(201));
 await actor(5);assert.equal((await db.query('select * from intervencion_materiales')).rows.length,6);await assert.rejects(save(201));await assert.rejects(save(200,2));
 await actor(4);assert.equal((await db.query('select * from intervencion_materiales')).rows.length,0);await assert.rejects(save(201));
 await actor(null);await assert.rejects(save(201));
 await actor(3);await save(200,2,'municion',{cantidad:22});await assert.rejects(db.exec('delete from intervencion_materiales'));
 await db.query("insert into intervenciones(id,tipo) values($1,'operativo')",[id(101)]);
 await assert.rejects(db.query('update intervencion_materiales set intervencion_id=$1 where id=$2',[id(101),id(200)]));
 await assert.rejects(db.query("update intervencion_materiales set tipo='explosivo' where id=$1",[id(200)]));
 await assert.rejects(db.query('update intervencion_materiales set creado_por=$1 where id=$2',[id(3),id(200)]));
 await db.exec('reset role');await db.exec(migration);
 assert.equal((await db.query('select count(*)::int n from intervencion_materiales')).rows[0].n,6);
 console.log('OK: cinco hojas completas; campos por categoría; cantidades; reintentos; conflictos; permisos; aislamiento; identidad inmutable; sin borrados; reaplicación.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.close());
