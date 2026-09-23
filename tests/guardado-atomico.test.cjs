const { PGlite } = require('@electric-sql/pglite');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const db = new PGlite();
const uid = n => `00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const read = name => fs.readFileSync(path.join(root, 'backend/supabase/migrations', name), 'utf8');
let passed = 0;
async function check(name, work) { await work(); passed++; console.log('OK ' + name); }
async function identity(n) { await db.exec(`reset role; set role authenticated; set request.jwt.claim.sub = '${uid(n)}';`); }
async function snapshot() {
  const result = {};
  for (const table of ['personas','detenciones','detencion_delitos','detencion_armas','auditoria_eventos']) result[table] = (await db.query(`select row_to_json(t) as r from public.${table} t order by id`)).rows;
  return result;
}
const person = { apellido_paterno: 'FICTICIO', nombres: 'PRUEBA', tipo_documento: 'DNI', numero_documento: 'PRUEBA-001' };
const detention = { fecha: '2026-09-14', es_funcionario_publico: false, integra_organizacion: false };
async function save(id, changes = {}) {
  const p = { p:person, d:detention, crimes:[{ orden:1, delito_general:'DELITO FICTICIO' }], weapons:[{ categoria:'FICTICIA', cantidad:1 }], edit:false, reason:null, version:null, ...changes };
  return (await db.query('select public.guardar_detenido_atomico($1::uuid,$2::jsonb,$3::jsonb,$4::jsonb,$5::jsonb,$6::boolean,$7::text,$8::timestamptz) as result', [uid(id),JSON.stringify(p.p),JSON.stringify(p.d),JSON.stringify(p.crimes),JSON.stringify(p.weapons),p.edit,p.reason,p.version])).rows[0].result;
}
(async () => {
  await db.exec(`create role authenticated; create schema auth;
    create table public.perfiles(id uuid primary key, rol text, activo boolean, unidad text, departamento text);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    create function public.es_administrador() returns boolean language sql stable security definer as $$ select exists(select 1 from public.perfiles where id=auth.uid() and activo and rol='administrador') $$;
    grant usage on schema auth to authenticated; grant select on public.perfiles to authenticated;
    insert into public.perfiles values ('${uid(1)}','operador',true,'AREA FICTICIA','LIMA'), ('${uid(2)}','administrador',true,'AREA FICTICIA','LIMA'), ('${uid(3)}','operador',false,'AREA FICTICIA','LIMA');
  `);
  const base = read('202609060001_modulo_detenidos.sql')
    .replace(/create extension if not exists pg_trgm;/i, '')
    .replace(/create index if not exists [^;]+using gin[^;]+;/gi, '');
  await db.exec(base);
  await db.exec(`drop policy detenciones_edicion on public.detenciones;
    create policy detenciones_edicion on public.detenciones for update to authenticated using(public.es_administrador()) with check(public.es_administrador());
    drop policy personas_edicion on public.personas;
    create policy personas_edicion on public.personas for update to authenticated using(public.es_administrador()) with check(public.es_administrador());`);
  await db.exec(`alter table public.detenciones add column departamento_registro text, add column rol_organizacion text;
    create table public.auditoria_eventos(id bigserial primary key, tabla text, registro_id text, usuario_id uuid, accion text, motivo text check (motivo is distinct from 'FALLO AUDITORIA'));
    grant select on public.auditoria_eventos to authenticated;
    create function public.test_audit_trigger() returns trigger language plpgsql security definer as $$ begin
      insert into public.auditoria_eventos(tabla,registro_id,usuario_id,accion) values(tg_table_name,coalesce(new.id,old.id)::text,auth.uid(),tg_op);
      if tg_op='DELETE' then return old; end if; return new;
    end $$;
  `);
  for (const table of ['personas','detenciones','detencion_delitos','detencion_armas']) await db.exec(`create trigger test_audit after insert or update or delete on public.${table} for each row execute function public.test_audit_trigger()`);
  await db.exec(read('202609140001_guardado_detenidos_atomico.sql'));
  await db.exec(`create function public.usuario_activo() returns boolean language sql stable security definer as $$ select coalesce((select activo from public.perfiles where id=auth.uid()),false) $$;
    create function public.unidad_actual() returns text language sql stable security definer as $$ select unidad from public.perfiles where id=auth.uid() and activo $$;`);
  await db.exec(read('202609150002_base_intervenciones.sql'));
  await db.exec(read('202609150004_resultados_y_detenidos.sql'));
  await db.exec(read('202609150008_tipo_grupo_detenidos.sql'));

  await identity(1);
  await check('banda, organización y ninguno conservan su tipo', async()=>{
    for(const [idx,tipo] of ['banda','organizacion',null].entries()){
      await save(901+idx,{d:{...detention,integra_organizacion:tipo!==null,tipo_organizacion:tipo,rol_organizacion:'Integrante',nombre_organizacion:'GRUPO FICTICIO'}});
      const r=(await db.query('select tipo_organizacion,nombre_organizacion from detenciones where id=$1',[uid(901+idx)])).rows[0];assert.equal(r.tipo_organizacion,tipo);if(!tipo)assert.equal(r.nombre_organizacion,null);
    }
    await assert.rejects(save(904,{d:{...detention,integra_organizacion:true,tipo_organizacion:'otro',rol_organizacion:'Integrante',nombre_organizacion:'FICTICIO'}}));
    await db.exec('reset role; truncate detencion_armas,detencion_delitos,detenciones,personas,auditoria_eventos cascade;');await identity(1);
  });
  await check('alta completa con cuatro tablas y área derivada del perfil', async () => {
    const r = await save(101, { d:{...detention, unidad:'AREA AJENA', creado_por:uid(999)} });
    assert.equal(r.id,uid(101));
    const s = await snapshot();
    for (const table of ['personas','detenciones','detencion_delitos','detencion_armas']) assert.equal(s[table].length,1);
    assert.equal(s.detenciones[0].r.unidad,'AREA FICTICIA'); assert.equal(s.detenciones[0].r.creado_por,uid(1));
  });
  await check('reintento de la misma solicitud no duplica registros', async () => {
    const before = await snapshot(); assert.equal((await save(101)).repetida,true); assert.deepEqual(await snapshot(),before);
  });
  await check('fallo de arma revierte persona nueva, detención y delitos', async () => {
    const before = await snapshot();
    await assert.rejects(save(102,{p:{...person,numero_documento:'PRUEBA-002'},weapons:[{categoria:'FICTICIA',cantidad:0}]}));
    assert.deepEqual(await snapshot(),before);
  });
  await check('delitos con orden duplicado revierten el alta', async () => {
    const before = await snapshot(); await assert.rejects(save(103,{crimes:[{orden:1},{orden:1}]})); assert.deepEqual(await snapshot(),before);
  });
  await check('documento con distinta capitalización reutiliza persona', async () => {
    await save(104,{p:{...person,tipo_documento:'dni',numero_documento:'prueba-001'}});
    assert.equal((await snapshot()).personas.length,1);
  });
  await check('cuenta inactiva no guarda', async () => { await identity(3); await assert.rejects(save(105)); await identity(1); });
  await check('operador no modifica aunque envíe editar=true', async () => {
    const version=(await db.query('select actualizado_en from public.detenciones where id=$1',[uid(101)])).rows[0].actualizado_en;
    await assert.rejects(save(101,{edit:true,reason:'PRUEBA',version}));
  });
  await identity(2);
  const version = async () => (await db.query('select actualizado_en from public.detenciones where id=$1',[uid(101)])).rows[0].actualizado_en;
  await check('fallo tardío de edición conserva persona, detención, hijos y auditoría', async () => {
    const before=await snapshot();
    await assert.rejects(save(101,{edit:true,reason:'PRUEBA',version:await version(),p:{...person,nombres:'CAMBIO FICTICIO'},weapons:[{categoria:'FICTICIA',cantidad:0}]}));
    assert.deepEqual(await snapshot(),before);
  });
  await check('fallo de auditoría revierte la edición', async () => {
    const before=await snapshot(); await assert.rejects(save(101,{edit:true,reason:'FALLO AUDITORIA',version:await version()})); assert.deepEqual(await snapshot(),before);
  });
  await check('administrador actualiza el conjunto y registra motivos', async () => {
    await save(101,{edit:true,reason:'PRUEBA FICTICIA',version:await version(),d:{...detention,situacion_actual:'SITUACION FICTICIA'},crimes:[{orden:1,delito_general:'ACTUALIZADO'}],weapons:[]});
    assert.equal((await db.query('select situacion_actual from public.detenciones where id=$1',[uid(101)])).rows[0].situacion_actual,'SITUACION FICTICIA');
    assert.ok((await snapshot()).auditoria_eventos.filter(a=>a.r.motivo==='PRUEBA FICTICIA').length >= 4);
  });
  await check('versión antigua y motivo vacío rechazan edición', async () => {
    await assert.rejects(save(101,{edit:true,reason:'PRUEBA',version:'2000-01-01T00:00:00Z'}));
    await assert.rejects(save(101,{edit:true,reason:' ',version:await version()}));
  });

  await identity(1);
  await db.query("insert into public.intervenciones(id,tipo,fecha) values($1,'operativo','2026-09-15')",[uid(501)]);
  await check('selección de resultados valida categorías y detecta versiones antiguas', async()=>{
    await db.query('select public.seleccionar_resultados_operativo($1,1,$2)',[uid(501),['detenidos','bandas']]);
    await assert.rejects(db.query('select public.seleccionar_resultados_operativo($1,1,$2)',[uid(501),['armas']]));
    await assert.rejects(db.query('select public.seleccionar_resultados_operativo($1,2,$2)',[uid(501),['INVENTADO']]));
  });
  await check('detenido vinculado conserva el operativo y no se duplica por reintento',async()=>{
    const d={...detention,intervencion_id:uid(501)};
    await save(301,{d});
    const before=await snapshot();
    await save(301,{d});assert.deepEqual(await snapshot(),before);
    assert.equal((await db.query('select intervencion_id from public.detenciones where id=$1',[uid(301)])).rows[0].intervencion_id,uid(501));
    await assert.rejects(save(301));
    await assert.rejects(db.query("update public.intervenciones set resultados_previstos='{}' where id=$1",[uid(501)]));
  });
  await check('un fallo de detalle revierte también el resultado y la versión del operativo',async()=>{
    const before=(await db.query('select version from public.intervenciones where id=$1',[uid(501)])).rows[0].version;
    await assert.rejects(save(302,{d:{...detention,intervencion_id:uid(501)},weapons:[{cantidad:0}]}));
    assert.equal((await db.query('select version from public.intervenciones where id=$1',[uid(501)])).rows[0].version,before);
    assert.equal((await db.query('select 1 from public.detenciones where id=$1',[uid(302)])).rows.length,0);
  });
  await db.exec('reset role');
  await db.query('insert into public.perfiles values($1,$2,true,$3,$4)',[uid(4),'operador','OTRA AREA','CUSCO']);
  await identity(4);
  await db.query("insert into public.intervenciones(id,tipo,fecha) values($1,'operativo','2026-09-15')",[uid(502)]);
  await identity(1);
  await check('operador de otra dependencia no puede vincular detenidos',async()=>{ await assert.rejects(save(303,{d:{...detention,intervencion_id:uid(502)}})); });
  await identity(2);
  await check('administrador registra en el ámbito del operativo sin cambiar perfiles',async()=>{
    await assert.rejects(save(305,{d:{...detention,intervencion_id:uid(502)}}));
    await save(304,{d:{...detention,intervencion_id:uid(502)},p:{...person,numero_documento:'PRUEBA-OTRA-AREA'}});
    const row=(await db.query('select unidad,departamento_registro,persona_id from public.detenciones where id=$1',[uid(304)])).rows[0];
    assert.equal(row.unidad,'OTRA AREA');assert.equal(row.departamento_registro,'CUSCO');
    assert.equal((await db.query('select unidad from public.personas where id=$1',[row.persona_id])).rows[0].unidad,'OTRA AREA');
    await assert.rejects(db.query('update public.detenciones set intervencion_id=$1 where id=$2',[uid(501),uid(304)]));
    await assert.rejects(db.query("update public.detenciones set unidad='CAMBIO' where id=$1",[uid(304)]));
  });
  await db.exec('reset role'); await db.exec(read('202609150004_resultados_y_detenidos.sql'));
  await db.exec(read('202609150008_tipo_grupo_detenidos.sql'));

  console.log(passed + ' escenarios de guardado transaccional aprobados; migración reaplicable.');
})().catch(error => { console.error(error); process.exitCode=1; }).finally(() => db.close());
