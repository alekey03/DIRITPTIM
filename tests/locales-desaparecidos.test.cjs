const {PGlite}=require('@electric-sql/pglite');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const source=path.resolve(__dirname,'..'),stage=source;
const read=n=>fs.readFileSync(path.join(source,'backend/supabase/migrations',n),'utf8');
const db=new PGlite(),id=n=>`00000000-0000-0000-0000-${String(n).padStart(12,'0')}`;
const actor=async n=>{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[n?id(n):'']);if(n)await db.exec('set role authenticated');};
(async()=>{
 await db.exec(`create role authenticated;create role anon;create schema auth;
 create type rol_usuario as enum ('administrador','supervisor','operador');
 create table perfiles(id uuid primary key,usuario text,rol rol_usuario,activo boolean,unidad text,departamento text,ambito text,nombres text,apellidos text);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create function es_administrador() returns boolean language sql stable security definer as $$select exists(select 1 from public.perfiles where id=auth.uid() and activo and rol='administrador')$$;
 create function usuario_activo() returns boolean language sql stable security definer as $$select coalesce((select activo from public.perfiles where id=auth.uid()),false)$$;
 create function unidad_actual() returns text language sql stable security definer as $$select unidad from public.perfiles where id=auth.uid() and activo$$;
 grant usage on schema auth to authenticated;grant select on perfiles to authenticated;
 create table fichas(id uuid primary key,unidad text,creado_por uuid);create table archivos(id uuid primary key,ficha_id uuid,creado_por uuid);
 alter table perfiles enable row level security;
 create policy perfiles_lectura on perfiles for select to authenticated using(id=auth.uid() or es_administrador());
 `);
 await db.exec(read('202609060001_modulo_detenidos.sql').replace(/create extension if not exists pg_trgm;/i,'').replace(/create index if not exists [^;]+using gin[^;]+;/gi,''));
 await db.exec(`alter table detenciones add column departamento_registro text,add column rol_organizacion text;
 create table auditoria_eventos(id bigserial primary key,tabla text,registro_id text,usuario_id uuid,accion text,motivo text);
 create function validar_dependencia_perfil() returns trigger language plpgsql as $$begin return new;end$$;
 create trigger validar_dependencia_perfil before insert or update on perfiles for each row execute function validar_dependencia_perfil();`);
 for(const file of fs.readdirSync(path.join(source,'backend/supabase/migrations')).filter(n=>n.endsWith('.sql') && n>='202609140001' && n<'202609230019' && !n.includes('dependencias_institucionales') && !n.includes('016_bienes')).sort()){console.log('apply',file);await db.exec(read(file));}
 await db.exec(fs.readFileSync(path.join(stage,'backend/supabase/migrations/202609230019_roles_estadisticos.sql'),'utf8'));
 await db.exec(fs.readFileSync(path.join(stage,'backend/supabase/migrations/202609230020_permisos_estadisticos.sql'),'utf8'));
 const central='DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS';
 const profiles=[[1,'administrador','administrador',true,'x'],[2,'direccion1','estadistico_direccion',true,'x'],[3,'direccion2','estadistico_direccion',true,'x'],[4,'jefatura','estadistico_jefatura',true,'x'],[5,'cusco','estadistico_depitptim',true,'DEPITPTIM CUSCO'],[6,'lima','estadistico_division',true,central],[7,'piura','estadistico_depitptim',true,'DEPITPTIM PIURA']];
 for(const [n,u,r,a,unit] of profiles)await db.query('insert into perfiles(id,usuario,rol,activo,unidad) values($1,$2,$3,$4,$5)',[id(n),u,r,a,unit]);
 await assert.rejects(db.query('insert into perfiles(id,usuario,rol,activo,unidad) values($1,$2,$3,true,$4)',[id(9),'tercero','estadistico_direccion','x']));
 await assert.rejects(db.query('insert into perfiles(id,usuario,rol,activo,unidad) values($1,$2,$3,true,$4)',[id(9),'otroadmin','administrador','x']));
 await assert.rejects(db.exec("update perfiles set activo=false where usuario='administrador'"));
 await assert.rejects(db.query('insert into perfiles(id,usuario,rol,activo,unidad) values($1,$2,$3,true,$4)',[id(9),'mal','estadistico_depitptim',central]));
 for(const n of [5,6,7]){await actor(n);await db.query("insert into intervenciones(id,tipo,fecha) values($1,'operativo','2026-09-23')",[id(100+n)]);await db.query('insert into intervencion_operativos(intervencion_id) values($1)',[id(100+n)]);}
 for(const [n,total] of [[1,3],[2,3],[4,2],[5,1],[6,1],[7,1]]){await actor(n);assert.equal((await db.query('select count(*)::int n from intervenciones')).rows[0].n,total);}
 await actor(5);
 let drug=(await db.query("select guardar_droga_operativo($1,$2,0,'kg_marihuana',2,null) r",[id(200),id(105)])).rows[0].r;
 await assert.rejects(db.query('update intervenciones set fecha=$1 where id=$2',['2026-09-22',id(105)]));
 await assert.rejects(db.query("select guardar_droga_operativo($1,$2,1,'kg_marihuana',3,null)",[id(200),id(105)]));
 assert.equal((await db.query('delete from intervencion_drogas where id=$1 returning id',[id(200)])).rows.length,0);
 await actor(4);await db.query("select guardar_droga_operativo($1,$2,1,'kg_marihuana',3,null)",[id(200),id(105)]);
 assert.equal((await db.query('select cantidad from intervencion_drogas where id=$1',[id(200)])).rows[0].cantidad,'3');
 await assert.rejects(db.query("select guardar_droga_operativo($1,$2,0,'kg_marihuana',3,null)",[id(201),id(106)]));
 await db.query('update intervenciones set fecha=$1 where id=$2',['2026-09-22',id(105)]);
 await actor(2);await db.query('update intervenciones set fecha=$1 where id=$2',['2026-09-21',id(106)]);
 await actor(6);assert.equal((await db.query('select puede_crear_usuarios() ok')).rows[0].ok,false);await assert.rejects(db.exec("update perfiles set rol='administrador' where id=auth.uid()"));
 await actor(2);assert.equal((await db.query('select puede_crear_usuarios() ok')).rows[0].ok,true);await assert.rejects(db.exec("update perfiles set rol='administrador' where id=auth.uid()"));
 await actor(4);assert.equal((await db.query('select puede_crear_usuarios() ok')).rows[0].ok,false);
 await db.exec('reset role');
 await db.exec(read('202609230022_seguimiento_diario.sql'));await db.exec(read('202609230023_seguimiento_resumen.sql'));await db.exec(read('202609230024_seguimiento_administrador.sql'));
 for(const [n,expected] of [[1,28],[2,28],[4,23]]){await actor(n);const rows=(await db.query("select consultar_seguimiento('2026-09-23') datos")).rows[0].datos;assert.equal(rows.length,expected);if(n===4)assert(rows.every(r=>r.ambito==='DESCONCENTRADO'));}
 for(const n of [5,6,7]){await actor(n);await assert.rejects(db.query("select consultar_seguimiento('2026-09-23')"),/reservado/);}
 await actor(5);await db.query("select declarar_seguimiento('2026-09-20','DEPITPTIM CUSCO',true)");await assert.rejects(db.query("select declarar_seguimiento('2026-09-20','DEPITPTIM PIURA',true)"),/acceso/);
 console.log('PASS: real role policies: Administrador 28, Dirección 28, Jefatura exactly 23 and no central divisions, no access for other roles; own-unit zero declarations only.');
 console.log('PASS: four profiles, two direction seats, protected root, national/division/23 department scope, new result registration, denied local editing/deletion, manager edits, denied cross-scope writes and direct profile escalation.');

 await actor(null);await db.exec(read('202609230025_locales_intervenidos.sql'));await db.exec(read('202609230026_desapariciones.sql'));await db.exec(read('202609230027_seguimiento_desapariciones.sql'));
 await actor(5);
 const local={fecha:'2026-08-01',situacion:'INTERVENIDO',tipo_inmueble:'LOCAL',detalle_inmueble:'Prueba sintética',valorizacion:0};
 await db.query("select guardar_complementarios_operativo($1,$2,0,'locales',$3)",[id(800),id(105),local]);
 await assert.rejects(db.query("select guardar_complementarios_operativo($1,$2,0,'locales',$3)",[id(801),id(106),local]));
 await assert.rejects(db.query("select guardar_complementarios_operativo($1,$2,0,'locales',$3)",[id(802),id(105),{...local,valorizacion:-1}]));
 await assert.rejects(db.query("select guardar_complementarios_operativo($1,$2,1,'locales',$3)",[id(800),id(105),{...local,valorizacion:5}]));
 const data={fecha:'2026-08-02',fecha_hecho:'2026-08-01',apellido_paterno:'PRUEBA',nombres:'SINTETICA',edad:0};
 const save=()=>db.query('select guardar_desaparicion($1,0,$2,$3)',[id(900),'DEPITPTIM CUSCO',data]);
 await save();await save();assert.equal((await db.query('select count(*)::int n from desapariciones')).rows[0].n,1);
 await assert.rejects(db.query('select guardar_desaparicion($1,0,$2,$3)',[id(901),'DEPITPTIM PIURA',data]));
 await assert.rejects(db.query('select guardar_desaparicion($1,1,$2,$3)',[id(900),'DEPITPTIM CUSCO',{...data,edad:3}]));
 assert.equal((await db.query('delete from desapariciones where id=$1 returning id',[id(900)])).rows.length,0);
 await actor(7);assert.equal((await db.query('select count(*)::int n from desapariciones')).rows[0].n,0);
 await actor(6);await db.query('select guardar_desaparicion($1,0,$2,$3)',[id(902),central,data]);
 await actor(4);assert.equal((await db.query('select count(*)::int n from desapariciones')).rows[0].n,1);
 const tracked=(await db.query("select consultar_seguimiento('2026-08-02') r")).rows[0].r;assert.equal(Number(tracked.find(r=>r.unidad==='DEPITPTIM CUSCO').detalles),1);
 await db.query('select guardar_desaparicion($1,1,$2,$3)',[id(900),'DEPITPTIM CUSCO',{...data,fecha_ubicacion:'2026-08-05'}]);
 await assert.rejects(db.query('select guardar_desaparicion($1,1,$2,$3)',[id(900),'DEPITPTIM CUSCO',{...data,edad:4}]),/cambió/);
 await assert.rejects(db.query('select guardar_desaparicion($1,0,$2,$3)',[id(903),'DEPITPTIM CUSCO',{...data,fecha_hecho:'2026-08-03'}]));
 await assert.rejects(db.query('select guardar_desaparicion($1,0,$2,$3)',[id(904),'DEPITPTIM CUSCO',{...data,fecha_ubicacion:'2026-07-31'}]));
 for(const n of [1,2]){await actor(n);assert.equal((await db.query('select count(*)::int n from desapariciones')).rows[0].n,2);}
 await actor(1);await db.query('delete from desapariciones where id=$1',[id(900)]);assert.equal((await db.query('select count(*)::int n from desapariciones_historial where registro_id=$1',[id(900)])).rows[0].n,3);
 await assert.rejects(db.exec("insert into desapariciones_historial(registro_id,unidad,usuario_id,accion) values(gen_random_uuid(),'DEPITPTIM CUSCO',auth.uid(),'FAKE')"));
 await actor(null);await db.exec('set role anon');await assert.rejects(db.query('select * from desapariciones'));
 console.log('PASS: locales validated, own-unit registration, no cross-unit read/write, manager edit, optimistic conflicts, date checks, retry idempotency, protected audit history and anon denied.');

})().catch(e=>{console.error(e.message,e.code,e.where,e.internalQuery);process.exitCode=1}).finally(()=>db.close());



