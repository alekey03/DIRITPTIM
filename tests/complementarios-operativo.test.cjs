const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),db=new PGlite();
const read=n=>fs.readFileSync(path.join(root,'backend/supabase/migrations',n),'utf8');
const id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
(async()=>{
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

 const migration=read('202609230017_produccion_complementarios.sql');await db.exec(migration);
 const types=JSON.parse(fs.readFileSync(path.join(root,'datos/mapeo-complementarios-v2.json'),'utf8'));
 const schema=JSON.parse(fs.readFileSync(path.join(root,'datos/estructura-produccion-v2.json'),'utf8'));
 for(const t of types){const sheet=schema.hojas.find(s=>s.nombre===t.hoja);if(t.tipo!=='chips')assert.deepEqual(Object.keys(t.columnas),sheet.campos.map(c=>c.columna));for(const p of Object.values(t.columnas).filter(p=>p.startsWith('datos.')))assert(t.campos.some(f=>f.key===p.slice(6)),p);}
 async function actor(n){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n?id(n):'']);await db.exec('set role authenticated');}
 const person={fecha:'2026-09-23',apellido_paterno:'FICTICIO',nombres:'PRUEBA',edad:17,genero:'FEMENINO',nacionalidad:'PERU',tipo_documento:'DNI',numero_documento:'00123456'};
 const samples={dinero:{fecha:'2026-09-23',soles:25.50,dolares:10},celulares:{fecha:'2026-09-23',cantidad:1,situacion:'INCAUTADO',imei_fisico:'000123456789012'},chips:{fecha:'2026-09-23',tipo_chip:'SIM',situacion:'INCAUTADO',cantidad:3},migraciones:{...person,ley_migraciones:'PRUEBA',subtipo_infraccion:'PRUEBA'},personas_ubicadas:{...person,condicion_edad:'MENOR',situacion:'UBICADO',lugar_ubicacion:'LUGAR FICTICIO'},expulsados:{...person,condicion:'PRUEBA',ley_migraciones:'PRUEBA',subtipo_infraccion:'PRUEBA'}};
 const save=async(n,type,data=samples[type],v=0,parent=100)=>(await db.query('select guardar_complementarios_operativo($1,$2,$3,$4,$5) r',[id(n),id(parent),v,type,JSON.stringify(data)])).rows[0].r;
 await actor(1);await db.query("insert into intervenciones(id,tipo,fecha) values($1,'operativo','2026-09-23')",[id(100)]);
 let n=200;
 for(const t of types){const first=await save(n,t.tipo);assert.equal(first.version,1);assert.equal((await save(n,t.tipo)).version,1);await assert.rejects(save(n+50,t.tipo,{...samples[t.tipo],foto:'no permitida'}));n++;}
 for(const bad of [{soles:-1},{soles:0,dolares:0},{soles:'10'},{soles:1.001},{fecha:'2026-02-30'},{hora:'24:60'},{unidad:'B'}])await assert.rejects(save(400,'dinero',{...samples.dinero,...bad}));
 for(const bad of [{cantidad:0},{cantidad:1.5},{cantidad:2},{imei_fisico:12345}])await assert.rejects(save(400,'celulares',{...samples.celulares,...bad}));
 for(const bad of [{edad:-1},{edad:121},{edad:17.5},{edad:'17'},{genero:'XYZ'},{tipo_documento:null},{condicion_edad:'MAYOR'},{nombres:''}])await assert.rejects(save(400,'personas_ubicadas',{...samples.personas_ubicadas,...bad}));
 const d={...samples.dinero,soles:35};assert.equal((await save(200,'dinero',d,1)).version,2);assert.equal((await save(200,'dinero',d,1)).version,2);await assert.rejects(save(200,'dinero',samples.dinero,1));
 await assert.rejects(save(200,'chips',samples.chips,2));await assert.rejects(save(400,'noexiste',{}));
 await assert.rejects(db.exec("update intervenciones set resultados_previstos='{}'"));await assert.rejects(db.exec("update intervenciones set tipo='directa'"));
 await actor(2);assert.equal((await db.query('select * from intervencion_complementarios')).rows.length,0);await assert.rejects(save(400,'dinero'));
 await actor(5);assert.equal((await db.query('select * from intervencion_complementarios')).rows.length,6);await assert.rejects(save(400,'dinero'));await assert.rejects(save(200,'dinero',d,2));
 await actor(4);assert.equal((await db.query('select * from intervencion_complementarios')).rows.length,0);await assert.rejects(save(400,'dinero'));
 await actor(null);await assert.rejects(save(400,'dinero'));
 await actor(3);assert.equal((await db.query('select * from intervencion_complementarios')).rows.length,6);await save(200,'dinero',d,2);await assert.rejects(db.exec('delete from intervencion_complementarios'));
 await db.query("insert into intervenciones(id,tipo) values($1,'operativo')",[id(101)]);
 await assert.rejects(db.query('update intervencion_complementarios set intervencion_id=$1 where id=$2',[id(101),id(200)]));
 await assert.rejects(db.query('update intervencion_complementarios set creado_por=$1 where id=$2',[id(3),id(200)]));
 await db.exec('reset role');await db.exec(migration);await db.exec('set role anon');await assert.rejects(db.exec('select * from intervencion_complementarios'));
 await db.exec('reset role');assert.equal((await db.query('select count(*)::int n from intervencion_complementarios')).rows[0].n,6);
 console.log('OK: seis categorías, correspondencia de columnas, validaciones, identidad inmutable, RLS, reintentos, conflictos y reaplicación.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>db.close());
