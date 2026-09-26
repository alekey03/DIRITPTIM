const {PGlite}=require('@electric-sql/pglite'),fs=require('fs'),assert=require('assert');
(async()=>{const db=new PGlite();try{
await db.exec(`create role authenticated;create schema storage;create table storage.objects(bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema storage to authenticated;grant insert on storage.objects to authenticated;create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;create function usuario_activo() returns boolean language sql stable as $$select current_setting('test.active')='true'$$;create function unidad_actual() returns text language sql stable as $$select current_setting('test.unit')$$;create policy "Usuarios activos suben archivos de su unidad" on storage.objects for insert to authenticated with check(false);`);
await db.exec(fs.readFileSync(__dirname+'/../backend/supabase/migrations/202609250001_rutas_fotografias.sql','utf8'));
await db.exec(`set role authenticated;set test.active='true';set test.unit='ADMINISTRACIÓN GENERAL DIRITPTIM';`);
const path='u-'+Buffer.from('ADMINISTRACIÓN GENERAL DIRITPTIM').toString('hex')+'/f/photo.jpg';
await db.query('insert into storage.objects values ($1,$2)',['ficha-archivos',path]);
await assert.rejects(db.query('insert into storage.objects values ($1,$2)',['otro-bucket',path]));
await assert.rejects(db.query('insert into storage.objects values ($1,$2)',['ficha-archivos','u-'+Buffer.from('OTRA UNIDAD').toString('hex')+'/f/photo.jpg']));
await db.exec(`set test.active='false'`);await assert.rejects(db.query('insert into storage.objects values ($1,$2)',['ficha-archivos',path]));
console.log('PASS: encoded unit allowed, other unit/bucket/inactive denied by real PostgreSQL policy.');
}finally{await db.close()}})().catch(e=>{console.error(e);process.exitCode=1});
