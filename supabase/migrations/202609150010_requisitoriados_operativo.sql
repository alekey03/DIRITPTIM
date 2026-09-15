-- Hoja 2_RQ N: complemento de una detención, no crea otra persona.
begin;
alter table public.intervenciones drop constraint if exists resultados_previstos_validos;
alter table public.intervenciones add constraint resultados_previstos_validos check (
 resultados_previstos <@ array['detenidos','requisitoriados','menores','victimas','bandas','organizaciones','armas','drogas','vehiculos','personas_ubicadas','otros']::text[]
 and array_position(resultados_previstos,null) is null
);
create table if not exists public.intervencion_requisitoriados (
 id uuid primary key,
 intervencion_id uuid not null references public.intervenciones(id) on delete restrict,
 detencion_id uuid not null unique references public.detenciones(id) on delete restrict,
 tipo text not null check(tipo in ('ORDEN DE CAPTURA','RQ INTERNACIONAL')),
 mas_buscado boolean not null,
 version integer not null default 1 check(version>0),
 creado_por uuid not null default auth.uid() references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create index if not exists requisitoriados_operativo_idx on public.intervencion_requisitoriados(intervencion_id,id);
alter table public.intervencion_requisitoriados enable row level security;
drop policy if exists requisitoriados_lectura on public.intervencion_requisitoriados;
create policy requisitoriados_lectura on public.intervencion_requisitoriados for select to authenticated using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists requisitoriados_alta on public.intervencion_requisitoriados;
create policy requisitoriados_alta on public.intervencion_requisitoriados for insert to authenticated with check(creado_por=auth.uid() and public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
drop policy if exists requisitoriados_edicion on public.intervencion_requisitoriados;
create policy requisitoriados_edicion on public.intervencion_requisitoriados for update to authenticated using(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())))) with check(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
revoke all on public.intervencion_requisitoriados from public,anon,authenticated;
grant select,insert,update on public.intervencion_requisitoriados to authenticated;

create or replace function public.proteger_requisitoriado_operativo() returns trigger language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype;
begin
 select * into i from public.intervenciones where id=new.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then
  raise exception 'No puede modificar requisitoriados de este operativo.' using errcode='42501';
 end if;
 if not exists(select 1 from public.detenciones d where d.id=new.detencion_id and d.intervencion_id=new.intervencion_id) then
  raise exception 'Seleccione un detenido registrado en este mismo operativo.' using errcode='22023';
 end if;
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.intervencion_id is distinct from old.intervencion_id or new.detencion_id is distinct from old.detencion_id or new.creado_por is distinct from old.creado_por or new.creado_en is distinct from old.creado_en then
   raise exception 'No se puede trasladar el registro ni cambiar su detenido o autoría.' using errcode='42501';
  end if;
  new.version:=old.version+1;
 else new.version:=1;new.creado_por:=auth.uid();new.creado_en:=now();end if;
 new.actualizado_en:=clock_timestamp();
 update public.intervenciones set resultados_previstos=case when 'requisitoriados'=any(resultados_previstos) then resultados_previstos else array_append(resultados_previstos,'requisitoriados') end where id=i.id;
 return new;
end $$;
drop trigger if exists proteger_requisitoriado_operativo on public.intervencion_requisitoriados;
create trigger proteger_requisitoriado_operativo before insert or update on public.intervencion_requisitoriados for each row execute function public.proteger_requisitoriado_operativo();

create or replace function public.guardar_requisitoriado_operativo(p_id uuid,p_intervencion uuid,p_detencion uuid,p_version integer,p_tipo text,p_mas_buscado boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype;r public.intervencion_requisitoriados%rowtype;
begin
 if p_id is null or p_intervencion is null or p_detencion is null or p_version is null or p_version<0 or p_tipo is null or p_tipo not in ('ORDEN DE CAPTURA','RQ INTERNACIONAL') or p_mas_buscado is null or not public.usuario_activo() then
  raise exception 'Complete detenido, tipo de requisitoria y condición de más buscado.' using errcode='22023';
 end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'Operativo no disponible para edición.' using errcode='42501';end if;
 select * into r from public.intervencion_requisitoriados where id=p_id for update;
 if found then
  if r.intervencion_id<>p_intervencion or r.detencion_id<>p_detencion then raise exception 'El registro pertenece a otro detenido u operativo.' using errcode='42501';end if;
  if r.version=p_version+1 and r.tipo=p_tipo and r.mas_buscado=p_mas_buscado then return jsonb_build_object('id',r.id,'version',r.version,'operativo_version',i.version);end if;
  if r.version<>p_version then raise exception 'El registro cambió. Actualice antes de editar.' using errcode='40001';end if;
  update public.intervencion_requisitoriados set tipo=p_tipo,mas_buscado=p_mas_buscado where id=p_id returning * into r;
 else
  if p_version<>0 then raise exception 'Registro no disponible.' using errcode='40001';end if;
  insert into public.intervencion_requisitoriados(id,intervencion_id,detencion_id,tipo,mas_buscado) values(p_id,p_intervencion,p_detencion,p_tipo,p_mas_buscado) returning * into r;
 end if;
 return jsonb_build_object('id',r.id,'version',r.version,'operativo_version',(select version from public.intervenciones where id=i.id));
end $$;
create or replace function public.conservar_requisitoriados_registrados() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_requisitoriados where intervencion_id=old.id) and
 (new.tipo='directa' or not('requisitoriados'=any(new.resultados_previstos))) then
  raise exception 'El operativo ya contiene requisitoriados registrados.' using errcode='23514';
 end if;return new;
end $$;
drop trigger if exists conservar_requisitoriados_registrados on public.intervenciones;
create trigger conservar_requisitoriados_registrados before update of tipo,resultados_previstos on public.intervenciones for each row execute function public.conservar_requisitoriados_registrados();
revoke all on function public.proteger_requisitoriado_operativo(),public.conservar_requisitoriados_registrados(),public.guardar_requisitoriado_operativo(uuid,uuid,uuid,integer,text,boolean) from public;
grant execute on function public.guardar_requisitoriado_operativo(uuid,uuid,uuid,integer,text,boolean) to authenticated;
commit;
