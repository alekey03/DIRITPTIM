-- Ocho hojas del detallado comparten contexto y difieren en sustancia/unidad.
begin;
create table if not exists public.intervencion_drogas (
 id uuid primary key default gen_random_uuid(),
 intervencion_id uuid not null references public.intervenciones(id) on delete restrict,
 tipo text not null check (tipo in ('env_pbc','env_cc','env_marihuana','kg_pbc','kg_cc','kg_marihuana','kg_opio','kg_sintetica')),
 cantidad numeric not null check (cantidad > 0 and cantidad < 1000000000000 and scale(cantidad) <= 6),
 nombre_sustancia text,
 version integer not null default 1,
 creado_por uuid not null default auth.uid() references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now(),
 check (tipo not like 'env_%' or cantidad=trunc(cantidad)),
 check ((tipo='kg_sintetica' and length(btrim(nombre_sustancia)) between 1 and 200 and nombre_sustancia is not null)
   or (tipo<>'kg_sintetica' and nombre_sustancia is null))
);
create index if not exists intervencion_drogas_parent_idx on public.intervencion_drogas(intervencion_id,creado_en,id);
alter table public.intervencion_drogas enable row level security;
drop policy if exists drogas_lectura on public.intervencion_drogas;
create policy drogas_lectura on public.intervencion_drogas for select to authenticated
 using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists drogas_alta on public.intervencion_drogas;
create policy drogas_alta on public.intervencion_drogas for insert to authenticated
 with check(public.usuario_activo() and creado_por=auth.uid() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
drop policy if exists drogas_edicion on public.intervencion_drogas;
create policy drogas_edicion on public.intervencion_drogas for update to authenticated
 using(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))))
 with check(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
grant select,insert,update on public.intervencion_drogas to authenticated;
create or replace function public.proteger_droga_operativo() returns trigger language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype;
begin
 select * into i from public.intervenciones where id=new.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then
  raise exception 'No puede modificar resultados de este operativo.' using errcode='42501'; end if;
 if tg_op='UPDATE' then
  if new.id<>old.id or new.intervencion_id<>old.intervencion_id or new.creado_por<>old.creado_por or new.creado_en<>old.creado_en then
   raise exception 'No se puede alterar la identidad, autoría ni el operativo.' using errcode='42501'; end if;
  new.version:=old.version+1;
 else new.version:=1; new.creado_por:=auth.uid(); new.creado_en:=now(); end if;
 new.actualizado_en:=now();
 update public.intervenciones set resultados_previstos=case when 'drogas'=any(resultados_previstos) then resultados_previstos else array_append(resultados_previstos,'drogas') end where id=i.id;
 return new;
end $$;
drop trigger if exists proteger_droga_operativo on public.intervencion_drogas;
create trigger proteger_droga_operativo before insert or update on public.intervencion_drogas for each row execute function public.proteger_droga_operativo();
create or replace function public.conservar_drogas_registradas() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if not('drogas'=any(new.resultados_previstos)) and exists(select 1 from public.intervencion_drogas where intervencion_id=old.id) then
  raise exception 'Este operativo ya tiene drogas registradas.' using errcode='23514'; end if;
 return new;
end $$;
drop trigger if exists conservar_drogas_registradas on public.intervenciones;
create trigger conservar_drogas_registradas before update of resultados_previstos on public.intervenciones for each row execute function public.conservar_drogas_registradas();
create or replace function public.guardar_droga_operativo(p_id uuid,p_intervencion uuid,p_version integer,p_tipo text,p_cantidad numeric,p_nombre text default null)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; d public.intervencion_drogas%rowtype; nombre text;
begin
 if p_id is null or p_intervencion is null or p_version is null or p_version<0 or not public.usuario_activo() then raise exception 'Solicitud inválida.' using errcode='22023'; end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'Operativo no disponible para edición.' using errcode='42501'; end if;
 nombre:=nullif(btrim(p_nombre),'');
 select * into d from public.intervencion_drogas where id=p_id for update;
 if found then
  if d.intervencion_id<>p_intervencion then raise exception 'No puede trasladar un resultado.' using errcode='42501'; end if;
  -- Un reintento idéntico no crea otro hallazgo ni incrementa su versión.
  if d.version=p_version+1 and d.tipo is not distinct from p_tipo and d.cantidad is not distinct from p_cantidad and d.nombre_sustancia is not distinct from nombre then
   return jsonb_build_object('id',d.id,'version',d.version,'operativo_version',i.version); end if;
  if d.version<>p_version then raise exception 'El registro cambió. Actualice antes de editar.' using errcode='40001'; end if;
  update public.intervencion_drogas set tipo=p_tipo,cantidad=p_cantidad,nombre_sustancia=nombre where id=p_id returning * into d;
 else
  if p_version<>0 then raise exception 'Registro no disponible.' using errcode='40001'; end if;
  insert into public.intervencion_drogas(id,intervencion_id,tipo,cantidad,nombre_sustancia) values(p_id,p_intervencion,p_tipo,p_cantidad,nombre) returning * into d;
 end if;
 return jsonb_build_object('id',d.id,'version',d.version,'operativo_version',(select version from public.intervenciones where id=i.id));
end $$;
revoke all on function public.proteger_droga_operativo(),public.conservar_drogas_registradas(),public.guardar_droga_operativo(uuid,uuid,integer,text,numeric,text) from public;
grant execute on function public.guardar_droga_operativo(uuid,uuid,integer,text,numeric,text) to authenticated;
commit;
