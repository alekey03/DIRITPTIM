const { PGlite } = require('@electric-sql/pglite');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const db = new PGlite();
const root = process.env.PROJECT_ROOT || path.resolve(__dirname,'..');
const migration = name => fs.readFileSync(path.join(root,'supabase/migrations',name),'utf8');
const uid=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
(async()=>{
 await db.exec(`
 create role authenticated;
 create schema auth; create schema storage;
 create type public.rol_usuario as enum ('administrador','supervisor','operador');
 create table public.perfiles(id uuid primary key,rol public.rol_usuario,activo boolean,unidad text,ambito text);
 create table public.fichas(id uuid primary key,unidad text);
 create table public.archivos(id uuid primary key,ficha_id uuid,ruta_privada text);
 create table storage.objects(name text,bucket_id text);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 create function public.usuario_activo() returns boolean language sql stable security definer set search_path='' as $$ select coalesce((select activo from public.perfiles where id=auth.uid()),false) $$;
 create function public.unidad_actual() returns text language sql stable security definer set search_path='' as $$ select unidad from public.perfiles where id=auth.uid() $$;
 create function public.es_administrador() returns boolean language sql stable security definer set search_path='' as $$ select coalesce((select rol='administrador'::public.rol_usuario from public.perfiles where id=auth.uid()),false) $$;
 create function public.puede_acceder_unidad(unidad_registro text) returns boolean language sql stable security definer set search_path=pg_catalog,public as $$
 select exists(select 1 from public.perfiles actual where actual.id=auth.uid() and actual.activo=true and (actual.rol='administrador' or actual.unidad=unidad_registro or (actual.rol='supervisor' and actual.ambito='SEDE_CENTRAL' and exists(select 1 from public.perfiles dependencia where dependencia.ambito='SEDE_CENTRAL' and dependencia.unidad=unidad_registro)))) $$;
 alter table public.fichas enable row level security;
 alter table public.archivos enable row level security;
 alter table storage.objects enable row level security;
 create policy fichas_lectura on public.fichas for select to authenticated using(public.usuario_activo() and public.puede_acceder_unidad(unidad));
 create policy "Consultar archivos registrados de la unidad" on public.archivos for select to authenticated using(public.usuario_activo() and exists(select 1 from public.fichas f where f.id=archivos.ficha_id and f.unidad=public.unidad_actual()));
 grant usage on schema public,auth,storage to authenticated;
 grant select on public.fichas,public.archivos,storage.objects to authenticated;
 `);
 const profiles=[
  [1,'administrador',true,'NACIONAL','NACIONAL'],
  [2,'administrador',false,'NACIONAL','NACIONAL'],
  [3,'supervisor',true,'CENTRAL','SEDE_CENTRAL'],
  [4,'operador',true,'DIVISION A','SEDE_CENTRAL'],
  [5,'operador',true,'DIVISION B','SEDE_CENTRAL'],
  [6,'operador',true,'AREA REGIONAL','DESCONCENTRADO'],
  [7,'operador',false,'DIVISION A','SEDE_CENTRAL']
 ];
 for(const [id,rol,activo,unidad,ambito] of profiles) await db.query('insert into public.perfiles values($1,$2,$3,$4,$5)',[uid(id),rol,activo,unidad,ambito]);
 for(const [id,unidad] of [[101,'DIVISION A'],[102,'DIVISION B'],[103,'AREA REGIONAL']]) {
  await db.query('insert into public.fichas values($1,$2)',[uid(id),unidad]);
  await db.query('insert into public.archivos values($1,$1,$2)',[uid(id),`historico/${id}/foto.jpg`]);
  await db.query('insert into storage.objects values($1,$2)',[`historico/${id}/foto.jpg`,'ficha-archivos']);
 }
 await db.exec("insert into storage.objects values('huerfano.jpg','ficha-archivos'),('historico/101/foto.jpg','otro-bucket');");
 async function snapshot(id){
  await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id?uid(id):'']);
  await db.exec('set role authenticated;');
  try{return (await db.query('select public.es_administrador() as admin,(select count(*)::int from public.archivos) as archivos,(select count(*)::int from storage.objects) as objetos')).rows[0];}
  finally{await db.exec('reset role;');}
 }
 assert.equal((await snapshot(2)).admin,true,'Reproduce el defecto de administrador inactivo');
 assert.equal((await snapshot(1)).archivos,0,'Reproduce la falta de acceso del administrador a fotografías de otras unidades');
 await db.exec(migration('202609130001_administrador_activo.sql'));
 await db.exec(migration('202609130002_fotografias_por_ficha.sql'));
 const cases=[['administrador activo',1,true,3],['administrador inactivo',2,false,0],['supervisor central',3,false,2],['operador división A',4,false,1],['operador división B',5,false,1],['operador desconcentrado',6,false,1],['operador inactivo',7,false,0],['sin sesión',null,false,0]];
 for(const [name,id,admin,count] of cases){
  const result=await snapshot(id);
  assert.deepEqual(result,{admin,archivos:count,objetos:count},name);
  console.log(`OK ${name}: ${count} fotografías autorizadas`);
 }
 // Segunda aplicación: sin errores y sin ampliación adicional del acceso.
 await db.exec(migration('202609130001_administrador_activo.sql'));
 await db.exec(migration('202609130002_fotografias_por_ficha.sql'));
 assert.equal((await snapshot(6)).objetos,1);
 console.log('OK reaplicación idempotente; archivos huérfanos y otros buckets excluidos');
 await db.close();
})().catch(async error=>{console.error(error);await db.close();process.exitCode=1;});
