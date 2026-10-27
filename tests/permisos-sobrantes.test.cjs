const {PGlite}=require('@electric-sql/pglite');const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{const db=new PGlite();await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
create table public.fichas(id serial primary key,unidad text);grant all on public.fichas to anon,authenticated,service_role;grant all on sequence public.fichas_id_seq to anon,authenticated;
create table public.oculta(id integer);revoke all on public.oculta from public;grant select on public.oculta to service_role;
create view public.resumen as select id from public.fichas;grant all on public.resumen to anon,authenticated;
create function public.usuario_activo() returns boolean language sql as 'select true';
create function public.solo_sesion() returns boolean language sql as 'select true';revoke all on function public.solo_sesion() from public;grant execute on function public.solo_sesion() to anon,authenticated;
create function public.interna() returns boolean language sql as 'select true';revoke all on function public.interna() from public;`);
const file=process.argv[2]||path.join(__dirname,'../backend/supabase/migrations/202610270001_permisos_sobrantes.sql');const sql=fs.readFileSync(file,'utf8');await db.exec(sql);await db.exec(sql);
const tp=async(rol,obj,p)=>(await db.query(`select has_table_privilege('${rol}','${obj}','${p}') v`)).rows[0].v;
const fp=async(rol,fn)=>(await db.query(`select has_function_privilege('${rol}','${fn}','execute') v`)).rows[0].v;
for(const p of ['select','insert','update','delete','truncate','references','trigger']){assert.equal(await tp('anon','public.fichas',p),false,'anon '+p);assert.equal(await tp('anon','public.resumen',p),false,'anon view '+p);}
for(const p of ['truncate','references','trigger'])assert.equal(await tp('authenticated','public.fichas',p),false,'authenticated '+p);
for(const p of ['select','insert','update','delete']){assert.equal(await tp('authenticated','public.fichas',p),true,'authenticated keeps '+p);assert.equal(await tp('service_role','public.fichas',p),true,'service_role keeps '+p);}
assert.equal(await tp('authenticated','public.resumen','select'),true);assert.equal(await tp('authenticated','public.oculta','select'),false,'no new grants');assert.equal(await tp('service_role','public.oculta','select'),true);
let r=await db.query(`select has_sequence_privilege('anon','public.fichas_id_seq','usage') a,has_sequence_privilege('authenticated','public.fichas_id_seq','usage') b`);assert.deepEqual([r.rows[0].a,r.rows[0].b],[false,true]);
assert.equal(await fp('anon','public.usuario_activo()'),false);assert.equal(await fp('authenticated','public.usuario_activo()'),true);assert.equal(await fp('service_role','public.usuario_activo()'),true);
assert.equal(await fp('anon','public.solo_sesion()'),false,'explicit anon grant removed');assert.equal(await fp('authenticated','public.solo_sesion()'),true);
assert.equal(await fp('authenticated','public.interna()'),false,'closed functions stay closed');assert.equal(await fp('anon','public.interna()'),false);
await db.exec('create table public.nueva(id integer);create function public.nueva_fn() returns int language sql as $$select 1$$;');
assert.equal(await tp('anon','public.nueva','select'),false);assert.equal(await tp('authenticated','public.nueva','truncate'),false);
console.log('PASS: anon sin tablas, vistas, secuencias ni funciones; authenticated sin TRUNCATE/REFERENCES/TRIGGER y conserva CRUD y ejecución; funciones cerradas siguen cerradas; service_role intacto; idempotente.');await db.close();})().catch(e=>{console.error(e);process.exitCode=1});
