-- Captura de borradores de las hojas 17, 18 y 19.
begin;
create table if not exists public.intervencion_vehiculos (
 id uuid primary key default gen_random_uuid(),
 intervencion_id uuid not null references public.intervenciones(id) on delete restrict,
 tipo text not null check(tipo in ('mayor','menor','maquinaria')),
 datos jsonb not null check(jsonb_typeof(datos)='object'),
 version integer not null default 1 check(version>0),
 creado_por uuid not null default auth.uid() references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create index if not exists vehiculos_operativo_idx on public.intervencion_vehiculos(intervencion_id,creado_en,id);
alter table public.intervencion_vehiculos enable row level security;
drop policy if exists vehiculos_lectura on public.intervencion_vehiculos;
create policy vehiculos_lectura on public.intervencion_vehiculos for select to authenticated using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists vehiculos_alta on public.intervencion_vehiculos;
create policy vehiculos_alta on public.intervencion_vehiculos for insert to authenticated with check(creado_por=auth.uid() and public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
drop policy if exists vehiculos_edicion on public.intervencion_vehiculos;
create policy vehiculos_edicion on public.intervencion_vehiculos for update to authenticated using(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())))) with check(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
grant select,insert,update on public.intervencion_vehiculos to authenticated;

create or replace function public.proteger_vehiculo_operativo() returns trigger language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; allowed text[]; k text; v jsonb; n numeric;
begin
 select * into i from public.intervenciones where id=new.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'No puede modificar vehiculos de este operativo.' using errcode='42501'; end if;
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.intervencion_id is distinct from old.intervencion_id or new.tipo is distinct from old.tipo or new.creado_por is distinct from old.creado_por or new.creado_en is distinct from old.creado_en then raise exception 'No se puede trasladar ni cambiar la identidad o categoría del vehiculo.' using errcode='42501'; end if;
  new.version:=old.version+1;
 else new.version:=1;new.creado_por:=auth.uid();new.creado_en:=now(); end if;
 if jsonb_typeof(new.datos) is distinct from 'object' or pg_column_size(new.datos)>60000 then raise exception 'Datos inválidos.' using errcode='22023';end if;
 allowed:=array['placa','marca','situacion','valorizacion','tentativa','fuero','delito_general','delito_especifico','subtipo','tentativa_2','fuero_2','delito_general_2','delito_especifico_2','subtipo_2'];
 if new.tipo not in ('mayor','menor','maquinaria') then raise exception 'Categoría inválida.' using errcode='22023';end if;
 for k,v in select * from jsonb_each(new.datos) loop
  if not(k=any(allowed)) or jsonb_typeof(v) not in ('string','number','null') or length(new.datos->>k)>2000 then raise exception 'Campo inválido: %',k using errcode='22023'; end if;
  if k='valorizacion' and v<>'null'::jsonb then
   if jsonb_typeof(v)<>'number' then raise exception 'Valorización inválida.' using errcode='22023';end if;
   n:=(new.datos->>k)::numeric;
   if n<0 or n>=1000000000000 or scale(n)>2 then raise exception 'La valorización debe ser positiva o cero, con hasta dos decimales.' using errcode='22023';end if;
  elsif v<>'null'::jsonb and jsonb_typeof(v)<>'string' then raise exception 'Se esperaba texto en %',k using errcode='22023';end if;
  if k in ('tentativa','tentativa_2') and v<>'null'::jsonb and (new.datos->>k) not in ('Sí','No') then raise exception 'Tentativa inválida.' using errcode='22023';end if;
 end loop;
 if nullif(btrim(new.datos->>'marca'),'') is null or nullif(btrim(new.datos->>'situacion'),'') is null then raise exception 'Complete marca y situación.' using errcode='22023';end if;
 new.actualizado_en:=now();
 update public.intervenciones set resultados_previstos=case when 'vehiculos'=any(resultados_previstos) then resultados_previstos else array_append(resultados_previstos,'vehiculos') end where id=i.id;
 return new;
end $$;
drop trigger if exists proteger_vehiculo_operativo on public.intervencion_vehiculos;
create trigger proteger_vehiculo_operativo before insert or update on public.intervencion_vehiculos for each row execute function public.proteger_vehiculo_operativo();
create or replace function public.conservar_vehiculos_registrados() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_vehiculos where intervencion_id=old.id) and (new.tipo='directa' or not('vehiculos'=any(new.resultados_previstos))) then raise exception 'El operativo ya tiene vehiculos registrados.' using errcode='23514';end if;
 return new;
end $$;
drop trigger if exists conservar_vehiculos_registrados on public.intervenciones;
create trigger conservar_vehiculos_registrados before update of tipo,resultados_previstos on public.intervenciones for each row execute function public.conservar_vehiculos_registrados();
create or replace function public.guardar_vehiculo_operativo(p_id uuid,p_intervencion uuid,p_version integer,p_tipo text,p_datos jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; m public.intervencion_vehiculos%rowtype;
begin
 if p_id is null or p_intervencion is null or p_version is null or p_version<0 or not public.usuario_activo() then raise exception 'Solicitud inválida.' using errcode='22023';end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'Operativo no disponible para edición.' using errcode='42501';end if;
 select * into m from public.intervencion_vehiculos where id=p_id for update;
 if found then
  if m.intervencion_id<>p_intervencion or m.tipo<>p_tipo then raise exception 'El registro pertenece a otro operativo o categoría.' using errcode='42501';end if;
  if m.version=p_version+1 and m.datos=p_datos then return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',i.version);end if;
  if m.version<>p_version then raise exception 'El registro cambió. Actualice antes de editar.' using errcode='40001';end if;
  update public.intervencion_vehiculos set datos=p_datos where id=p_id returning * into m;
 else
  if p_version<>0 then raise exception 'Registro no disponible.' using errcode='40001';end if;
  insert into public.intervencion_vehiculos(id,intervencion_id,tipo,datos) values(p_id,p_intervencion,p_tipo,p_datos) returning * into m;
 end if;
 return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',(select version from public.intervenciones where id=i.id));
end $$;
revoke all on function public.proteger_vehiculo_operativo(),public.conservar_vehiculos_registrados(),public.guardar_vehiculo_operativo(uuid,uuid,integer,text,jsonb) from public;
grant execute on function public.guardar_vehiculo_operativo(uuid,uuid,integer,text,jsonb) to authenticated;
commit;
