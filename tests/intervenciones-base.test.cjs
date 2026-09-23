const { PGlite } = require('@electric-sql/pglite');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const schema = JSON.parse(read('datos/estructura-detallado-v1.json'));
const mapping = JSON.parse(read('datos/mapeo-operativo-v1.json'));
const migration = read('backend/supabase/migrations/202609150002_base_intervenciones.sql');
const db = new PGlite();
const uid = n => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;

(async () => {
  assert.equal(schema.hojas.length, 56);
  assert.equal(schema.hojas.filter(h => h.visibilidad !== 'visible').length, 3);
  assert.equal(schema.hojas.filter(h => h.tipo === 'registro').length, 55);
  assert.equal(schema.hojas.find(h => h.nombre === 'OTRO').tipo, 'catalogo');
  assert.deepEqual(Object.keys(mapping.columnas), schema.hojas[0].campos.map(c => c.columna));
  assert.equal(Object.keys(mapping.columnas).length, 40);
  console.log('OK 56 hojas y correspondencia completa de las 40 columnas de operativos');

  await db.exec(`create role authenticated;
    create schema auth;
    create table public.perfiles(id uuid primary key, rol text, activo boolean, unidad text, departamento text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    create function public.usuario_activo() returns boolean language sql stable security definer set search_path='' as $$ select coalesce((select activo from public.perfiles where id=auth.uid()),false) $$;
    create function public.es_administrador() returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.perfiles where id=auth.uid() and activo and rol='administrador') $$;
    create function public.unidad_actual() returns text language sql stable security definer set search_path='' as $$ select unidad from public.perfiles where id=auth.uid() $$;
    create function public.puede_acceder_unidad(u text) returns boolean language sql stable security definer set search_path='' as $$ select public.usuario_activo() and (public.es_administrador() or public.unidad_actual()=u) $$;
    grant usage on schema auth to authenticated;
    grant select on public.perfiles to authenticated;`);
  for (const [id,rol,activo,unidad] of [[1,'operador',true,'AREA A'],[2,'operador',true,'AREA B'],[3,'administrador',true,'NACIONAL'],[4,'operador',false,'AREA A']]) {
    await db.query('insert into public.perfiles values ($1,$2,$3,$4,$5)',[uid(id),rol,activo,unidad,'LIMA']);
  }
  await db.exec(migration);
  for(const source of Object.values(mapping.columnas)) {
    const [table,col] = source.split('.');
    if(table==='derivado') continue;
    const name=table==='intervencion'?'intervenciones':'intervencion_operativos';
    const exists = await db.query('select 1 from information_schema.columns where table_schema=$1 and table_name=$2 and column_name=$3',['public',name,col]);
    assert.equal(exists.rows.length,1,source);
  }
  async function actor(id) {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id?uid(id):'']);
    await db.exec('set role authenticated');
  }
  await actor(1);
  await db.query("insert into public.intervenciones(id,tipo,unidad,departamento_registro,creado_por) values($1,'operativo','AREA B','FALSO',$2)",[uid(101),uid(2)]);
  let row=(await db.query('select * from public.intervenciones')).rows[0];
  assert.equal(row.unidad,'AREA A');assert.equal(row.creado_por,uid(1));
  assert.equal(row.departamento_registro,'LIMA');
  await db.query('insert into public.intervencion_operativos(intervencion_id,personal_cargo) values ($1,0)',[uid(101)]);
  assert.equal((await db.query('select version from public.intervenciones')).rows[0].version,2);
  await assert.rejects(db.query('update public.intervencion_operativos set personal_cargo=-1'));
  await assert.rejects(db.query("update public.intervenciones set unidad='AREA B'"));
  await assert.rejects(db.query('update public.intervenciones set latitud=91'));
  await assert.rejects(db.query("update public.intervenciones set tipo='directa'"));
  console.log('OK autoría y dependencia derivadas; cantidades y coordenadas inválidas rechazadas');

  await actor(2);
  assert.equal((await db.query('select * from public.intervenciones')).rows.length,0);
  assert.equal((await db.query('select * from public.intervencion_operativos')).rows.length,0);
  await assert.rejects(db.query('insert into public.intervencion_operativos(intervencion_id) values($1)',[uid(101)]));
  await db.query("insert into public.intervenciones(id,tipo) values($1,'directa')",[uid(102)]);
  await assert.rejects(db.query('insert into public.intervencion_operativos(intervencion_id) values($1)',[uid(102)]));
  console.log('OK aislamiento entre dependencias y resultados directos sin operativo');

  await actor(4);
  assert.equal((await db.query('select * from public.intervenciones')).rows.length,0);
  await assert.rejects(db.query("insert into public.intervenciones(tipo) values('operativo')"));
  await actor(null);
  await assert.rejects(db.query("insert into public.intervenciones(tipo) values('operativo')"));
  await actor(3);
  assert.equal((await db.query('select * from public.intervenciones')).rows.length,2);
  await db.query('update public.intervencion_operativos set personal_cargo=2 where intervencion_id=$1',[uid(101)]);
  assert.equal((await db.query('select version from public.intervenciones where id=$1',[uid(101)])).rows[0].version,3);
  await assert.rejects(db.query('delete from public.intervenciones'));
  await db.exec('reset role');
  await db.exec(migration);
  assert.equal((await db.query('select count(*)::int as n from public.intervenciones')).rows[0].n,2);
  console.log('OK administrador, bloqueo de inactivos, conservación de borradores y reaplicación');

  const rpcMigration = read('backend/supabase/migrations/202609150003_guardar_operativo_borrador.sql');
  await db.exec(rpcMigration);
  const input = { tipo:'operativo', fecha:'2026-09-15', departamento:'LIMA' };
  async function save(request, id, version, i=input, o={personal_cargo:3}) {
    return (await db.query('select public.guardar_operativo_borrador($1,$2,$3,$4,$5) as result',
      [uid(request),uid(id),version,JSON.stringify(i),JSON.stringify(o)])).rows[0].result;
  }
  await actor(1);
  const created=await save(201,103,0);
  assert.equal(created.id,uid(103)); assert.equal(created.version,2);
  assert.deepEqual(await save(201,103,0),created);
  assert.equal((await db.query('select count(*)::int as n from public.intervenciones where id=$1',[uid(103)])).rows[0].n,1);
  await assert.rejects(save(201,103,0,input,{personal_cargo:4}));
  await assert.rejects(save(202,104,0,input,{personal_cargo:-1}));
  assert.equal((await db.query('select 1 from public.intervenciones where id=$1',[uid(104)])).rows.length,0);
  await assert.rejects(save(203,103,1));
  const updated=await save(204,103,created.version,input,{personal_cargo:8});
  assert.ok(updated.version>created.version);
  await assert.rejects(save(205,103,updated.version,input,{personal_cargo:-1}));
  assert.equal((await db.query('select version from public.intervenciones where id=$1',[uid(103)])).rows[0].version,updated.version);
  assert.equal((await db.query('select personal_cargo from public.intervencion_operativos where intervencion_id=$1',[uid(103)])).rows[0].personal_cargo,8);
  await assert.rejects(save(206,105,0,{...input,unidad:'AREA B'}));
  await assert.rejects(save(207,105,0,{...input,fecha:null}));
  await assert.rejects(save(208,105,0,input,{personal_cargo:1.5}));
  await actor(2);
  await assert.rejects(save(209,103,updated.version));
  assert.equal((await db.query('select * from public.intervencion_solicitudes')).rows.length,0);
  await actor(4); await assert.rejects(save(210,105,0));
  await actor(null); await assert.rejects(save(211,105,0));
  await actor(3);
  const adminUpdate=await save(212,103,updated.version,input,{personal_cargo:9});
  assert.ok(adminUpdate.version>updated.version);
  await actor(1); await assert.rejects(save(213,103,updated.version));
  await db.exec('reset role'); await db.exec(rpcMigration);
  console.log('OK guardado atomico, reintentos, permisos y conflictos de version');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>db.close());
