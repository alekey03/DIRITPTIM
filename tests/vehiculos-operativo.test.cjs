const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),db=new PGlite();
const read=n=>fs.readFileSync(path.join(root,'supabase/migrations',n),'utf8');
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
(async()=>{
 const schema=JSON.parse(fs.readFileSync(path.join(root,'datos/estructura-detallado-v1.json'),'utf8'));
 const contract=JSON.parse(fs.readFileSync(path.join(root,'datos/mapeo-vehiculos-v1.json'),'utf8'));
 assert.equal(contract.tipos.length,3);
 for(const t of contract.tipos){
  assert.deepEqual(Object.keys(t.columnas),schema.hojas.find(h=>h.nombre===t.hoja).campos.map(c=>c.columna));
  for(const value of Object.values(t.columnas).filter(x=>x.startsWith('vehiculo.'))) assert(t.campos.some(f=>'vehiculo.datos.'+f.key===value));
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
 const migration=read('202609150007_vehiculos_operativo.sql');await db.exec(migration);
 async function actor(n){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n?id(n):'']);await db.exec('set role authenticated');}
 const save=async(n,v=0,t='mayor',data={marca:'FICTICIA',situacion:'FICTICIA',placa:'TEST-001',valorizacion:12.50},parent=100)=>(await db.query('select guardar_vehiculo_operativo($1,$2,$3,$4,$5) r',[id(n),id(parent),v,t,JSON.stringify(data)])).rows[0].r;
 const valid={marca:'FICTICIA',situacion:'FICTICIA',placa:'TEST-001',valorizacion:12.50};
 await actor(1);await db.query("insert into intervenciones(id,tipo,fecha) values($1,'operativo','2026-09-15')",[id(100)]);
 const a=await save(200);assert.deepEqual(await save(200),a);
 await assert.rejects(save(200,0,'mayor',{...valid,marca:'DIFERENTE'}));
 for(const value of [-1,1.234,1e12,'3'])await assert.rejects(save(201,0,'mayor',{...valid,valorizacion:value}));
 await assert.rejects(save(201,0,'mayor',{situacion:'FICTICIA'}));
 await assert.rejects(save(201,0,'mayor',{...valid,unidad:'OTRA'}));
 await assert.rejects(save(201,0,'invalido',valid));
 for(const [n,t]of contract.tipos.entries()){
  const data={};for(const f of t.campos)data[f.key]=f.type==='number'?2.50:f.key.startsWith('tentativa')?'No':'FICTICIO';
  await save(300+n,0,t.tipo,data);
 }
 await save(310,0,'maquinaria',{marca:'FICTICIA',situacion:'FICTICIA',placa:null,valorizacion:null});
 await save(311,0,'menor',{...valid,valorizacion:0});
 await assert.rejects(db.exec("update intervenciones set resultados_previstos='{}'"));
 await assert.rejects(db.exec("update intervenciones set tipo='directa'"));
 const updated={...valid,marca:'ACTUALIZADA'};const b=await save(200,1,'mayor',updated);assert.equal(b.version,2);assert.deepEqual(await save(200,1,'mayor',updated),b);
 await assert.rejects(save(200,1,'mayor',valid));
 await actor(2);assert.equal((await db.query('select * from intervencion_vehiculos')).rows.length,0);await assert.rejects(save(201));
 await actor(5);assert.equal((await db.query('select * from intervencion_vehiculos')).rows.length,6);await assert.rejects(save(201));await assert.rejects(save(200,2));
 await actor(4);assert.equal((await db.query('select * from intervencion_vehiculos')).rows.length,0);await assert.rejects(save(201));
 await actor(null);await assert.rejects(save(201));
 await actor(3);await save(200,2);await assert.rejects(db.exec('delete from intervencion_vehiculos'));
 await db.query("insert into intervenciones(id,tipo) values($1,'operativo')",[id(101)]);
 await assert.rejects(db.query('update intervencion_vehiculos set intervencion_id=$1 where id=$2',[id(101),id(200)]));
 await assert.rejects(db.query("update intervencion_vehiculos set tipo='menor' where id=$1",[id(200)]));
 await assert.rejects(db.query('update intervencion_vehiculos set creado_por=$1 where id=$2',[id(3),id(200)]));
 await db.exec('reset role');await db.exec(migration);
 assert.equal((await db.query('select count(*)::int n from intervencion_vehiculos')).rows[0].n,6);
 console.log('OK: tres hojas de 29 columnas; valorizaciones; datos opcionales; reintentos; conflictos; RLS; inmutabilidad; reaplicacion.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.close());
