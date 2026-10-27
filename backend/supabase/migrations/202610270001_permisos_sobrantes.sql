-- Aplicada en producción el 27/10/2026.
-- Quita permisos que Supabase concede por defecto y la web no usa:
-- anon (sin sesión) no lee, escribe ni ejecuta nada del esquema public: el ingreso usa Supabase Auth.
-- authenticated pierde TRUNCATE, REFERENCES, TRIGGER y MAINTAIN; TRUNCATE no pasa por RLS.
-- authenticated conserva SELECT/INSERT/UPDATE/DELETE donde ya los tenía: RLS sigue decidiendo el acceso.
-- service_role no cambia. Se puede volver a ejecutar sin efectos.
begin;

do $limpieza$
declare
 r record;
 sobrantes text:='truncate, references, trigger'||case when current_setting('server_version_num')::int>=170000 then ', maintain' else '' end;
begin
 for r in select c.oid::regclass obj,c.relkind from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','p','v','m','f','S')
   and not exists(select 1 from pg_depend d where d.objid=c.oid and d.deptype='e') loop
  if r.relkind='S' then
   execute format('revoke all on sequence %s from anon',r.obj);
  else
   execute format('revoke all on %s from anon',r.obj);
   execute format('revoke %s on %s from authenticated',sobrantes,r.obj);
  end if;
 end loop;

 -- Las funciones abiertas a PUBLIC (que incluye anon) pasan a authenticated y service_role.
 -- rls_auto_enable es del trigger de evento de Supabase y no se toca.
 for r in select p.oid::regprocedure fn,p.proacl from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prokind in ('f','p') and p.proname<>'rls_auto_enable'
   and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e') loop
  if r.proacl is null or exists(select 1 from aclexplode(r.proacl) a where a.grantee=0 and a.privilege_type='EXECUTE') then
   execute format('revoke execute on routine %s from public',r.fn);
   execute format('grant execute on routine %s to authenticated, service_role',r.fn);
  end if;
  execute format('revoke execute on routine %s from anon',r.fn);
 end loop;

 -- Objetos nuevos creados por postgres: sin permisos para anon ni privilegios sobrantes para authenticated.
 -- Las funciones nuevas siguen abiertas a PUBLIC por defecto: cada migración debe revocarlas (from public, anon).
 alter default privileges for role postgres in schema public revoke all on tables from anon;
 alter default privileges for role postgres in schema public revoke all on sequences from anon;
 alter default privileges for role postgres in schema public revoke execute on functions from anon;
 execute format('alter default privileges for role postgres in schema public revoke %s on tables from authenticated',sobrantes);
end $limpieza$;

commit;
