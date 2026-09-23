-- Varias ampliaciones de NI para un mismo operativo. No reemplaza su nota principal.
begin;
create table if not exists public.intervencion_notas (
 id uuid primary key default gen_random_uuid(),
 intervencion_id uuid not null references public.intervenciones(id) on delete restrict,
 tipo text not null check(tipo in ('ampliacion')),
 datos jsonb not null check(jsonb_typeof(datos)='object'),
 version integer not null default 1 check(version>0),
 creado_por uuid not null default auth.uid() references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create index if not exists notas_operativo_idx on public.intervencion_notas(intervencion_id,creado_en,id);
alter table public.intervencion_notas enable row level security;
drop policy if exists notas_lectura on public.intervencion_notas;
create policy notas_lectura on public.intervencion_notas for select to authenticated using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists notas_alta on public.intervencion_notas;
create policy notas_alta on public.intervencion_notas for insert to authenticated with check(creado_por=auth.uid() and public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
drop policy if exists notas_edicion on public.intervencion_notas;
create policy notas_edicion on public.intervencion_notas for update to authenticated using(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())))) with check(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
revoke all on public.intervencion_notas from public,anon,authenticated;
grant select,insert,update on public.intervencion_notas to authenticated;

create or replace function public.proteger_nota_operativo() returns trigger language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; allowed text[]; k text; v jsonb; n numeric;
begin
 select * into i from public.intervenciones where id=new.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'No puede modificar notas de este operativo.' using errcode='42501'; end if;
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.intervencion_id is distinct from old.intervencion_id or new.tipo is distinct from old.tipo or new.creado_por is distinct from old.creado_por or new.creado_en is distinct from old.creado_en then raise exception 'No se puede trasladar ni cambiar la identidad o categoría del nota.' using errcode='42501'; end if;
  new.version:=old.version+1;
 else new.version:=1;new.creado_por:=auth.uid();new.creado_en:=now(); end if;
 if jsonb_typeof(new.datos) is distinct from 'object' or pg_column_size(new.datos)>60000 then raise exception 'Datos inválidos.' using errcode='22023';end if;
 allowed:=array['numero','fecha','hora','detalle'];

 for k,v in select * from jsonb_each(new.datos) loop
  if not(k=any(allowed)) or jsonb_typeof(v) not in ('string','number','null') or length(new.datos->>k)>2000 then raise exception 'Campo inválido: %',k using errcode='22023';end if;
  if v<>'null'::jsonb and jsonb_typeof(v)<>'string' then raise exception 'Se esperaba texto en %',k using errcode='22023';end if;
 end loop;

 if new.datos->>'fecha' is null or (new.datos->>'fecha') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida.' using errcode='22023';end if;
 perform (new.datos->>'fecha')::date;
 if new.datos->>'hora' is not null and (new.datos->>'hora') !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' then raise exception 'Hora inválida.' using errcode='22023';end if;

 if new.tipo<>'ampliacion' or nullif(btrim(new.datos->>'numero'),'') is null or nullif(btrim(new.datos->>'detalle'),'') is null then raise exception 'Complete número, fecha y detalle de la ampliación.' using errcode='22023';end if;
 if nullif(btrim(i.nota_sicpip),'') is null then raise exception 'Registre primero la nota informativa principal en Datos del operativo.' using errcode='22023';end if;
 if upper(btrim(i.nota_sicpip))=upper(btrim(new.datos->>'numero')) then raise exception 'La ampliación debe tener un número distinto de la NI principal.' using errcode='22023';end if;
 new.actualizado_en:=now();
 update public.intervenciones set actualizado_en=now() where id=i.id;
 return new;
end $$;
drop trigger if exists proteger_nota_operativo on public.intervencion_notas;
create trigger proteger_nota_operativo before insert or update on public.intervencion_notas for each row execute function public.proteger_nota_operativo();
create or replace function public.guardar_ampliacion_operativo(p_id uuid,p_intervencion uuid,p_version integer,p_tipo text,p_datos jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; m public.intervencion_notas%rowtype;
begin
 if p_id is null or p_intervencion is null or p_version is null or p_version<0 or not public.usuario_activo() then raise exception 'Solicitud inválida.' using errcode='22023';end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'Operativo no disponible para edición.' using errcode='42501';end if;
 select * into m from public.intervencion_notas where id=p_id for update;
 if found then
  if m.intervencion_id<>p_intervencion or m.tipo<>p_tipo then raise exception 'El registro pertenece a otro operativo o categoría.' using errcode='42501';end if;
  if m.version=p_version+1 and m.datos=p_datos then return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',i.version);end if;
  if m.version<>p_version then raise exception 'El registro cambió. Actualice antes de editar.' using errcode='40001';end if;
  update public.intervencion_notas set datos=p_datos where id=p_id returning * into m;
 else
  if p_version<>0 then raise exception 'Registro no disponible.' using errcode='40001';end if;
  insert into public.intervencion_notas(id,intervencion_id,tipo,datos) values(p_id,p_intervencion,p_tipo,p_datos) returning * into m;
 end if;
 return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',(select version from public.intervenciones where id=i.id));
end $$;
revoke all on function public.proteger_nota_operativo(),public.guardar_ampliacion_operativo(uuid,uuid,integer,text,jsonb) from public;
grant execute on function public.guardar_ampliacion_operativo(uuid,uuid,integer,text,jsonb) to authenticated;
create unique index if not exists notas_numero_operativo_idx on public.intervencion_notas(intervencion_id,upper(btrim(datos->>'numero')));
create or replace function public.conservar_numero_nota_principal() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_notas where intervencion_id=old.id) then
  if new.tipo='directa' or nullif(btrim(new.nota_sicpip),'') is null then raise exception 'El operativo contiene ampliaciones: conserve una NI principal.' using errcode='23514';end if;
  if exists(select 1 from public.intervencion_notas where intervencion_id=old.id and upper(btrim(datos->>'numero'))=upper(btrim(new.nota_sicpip))) then raise exception 'Ese número ya corresponde a una ampliación.' using errcode='23514';end if;
 end if;return new;
end $$;
drop trigger if exists conservar_numero_nota_principal on public.intervenciones;
create trigger conservar_numero_nota_principal before update of tipo,nota_sicpip on public.intervenciones for each row execute function public.conservar_numero_nota_principal();
revoke all on function public.conservar_numero_nota_principal() from public;
notify pgrst, 'reload schema';
commit;
