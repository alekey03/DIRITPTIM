-- Bandas y organizaciones: una cabecera y vínculos, sin copiar identidades.
begin;
create table if not exists public.intervencion_grupos (
 id uuid primary key,
 intervencion_id uuid not null references public.intervenciones(id) on delete restrict,
 tipo text not null check(tipo in ('banda','organizacion')),
 nombre text not null check(length(btrim(nombre)) between 1 and 200),
 modalidad text not null check(length(btrim(modalidad)) between 1 and 2000),
 referencia_lugar text check(length(referencia_lugar)<=2000),
 version integer not null default 1 check(version>0),
 creado_por uuid not null references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create unique index if not exists grupos_nombre_operativo on public.intervencion_grupos(intervencion_id,tipo,lower(btrim(nombre)));
create table if not exists public.intervencion_grupo_integrantes (
 grupo_id uuid not null references public.intervencion_grupos(id) on delete restrict,
 detencion_id uuid not null references public.detenciones(id) on delete restrict,
 rol text not null check(length(btrim(rol)) between 1 and 200),
 primary key(grupo_id,detencion_id), unique(detencion_id)
);
alter table public.intervencion_grupos enable row level security;
alter table public.intervencion_grupo_integrantes enable row level security;
drop policy if exists grupos_lectura on public.intervencion_grupos;
create policy grupos_lectura on public.intervencion_grupos for select to authenticated
using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists integrantes_lectura on public.intervencion_grupo_integrantes;
create policy integrantes_lectura on public.intervencion_grupo_integrantes for select to authenticated
using(exists(select 1 from public.intervencion_grupos g where g.id=grupo_id));
revoke all on public.intervencion_grupos,public.intervencion_grupo_integrantes from public,anon,authenticated;
grant select on public.intervencion_grupos,public.intervencion_grupo_integrantes to authenticated;

create or replace function public.guardar_grupo_operativo(p_id uuid,p_intervencion uuid,p_version integer,p_tipo text,p_nombre text,p_modalidad text,p_referencia text,p_integrantes jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare i public.intervenciones%rowtype; g public.intervencion_grupos%rowtype; d public.detenciones%rowtype;
 m jsonb; ids uuid[]:='{}'; wanted jsonb; actual jsonb; category text;
begin
 if p_id is null or p_intervencion is null or p_version is null or p_version<0 or p_tipo is null or p_tipo not in ('banda','organizacion') or not public.usuario_activo() then
  raise exception 'Solicitud de grupo inválida.' using errcode='22023';
 end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then
  raise exception 'No puede editar grupos de este operativo.' using errcode='42501';
 end if;
 p_nombre:=btrim(p_nombre);p_modalidad:=btrim(p_modalidad);p_referencia:=nullif(btrim(p_referencia),'');
 if coalesce(length(p_nombre),0) not between 1 and 200 or coalesce(length(p_modalidad),0) not between 1 and 2000 or length(p_referencia)>2000 then
  raise exception 'Complete nombre y modalidad dentro del límite permitido.' using errcode='22023';
 end if;
 if jsonb_typeof(p_integrantes) is distinct from 'array' then raise exception 'Integrantes inválidos.' using errcode='22023';end if;
 if jsonb_array_length(p_integrantes) not between 1 and 500 then raise exception 'Seleccione entre 1 y 500 detenidos.' using errcode='22023';end if;
 select * into g from public.intervencion_grupos where id=p_id for update;
 if found and (g.intervencion_id<>p_intervencion or g.tipo<>p_tipo) then raise exception 'No se puede trasladar el grupo ni cambiar su tipo.' using errcode='42501';end if;
 for m in select value from jsonb_array_elements(p_integrantes) loop
  if jsonb_typeof(m) is distinct from 'object' or (m-'detencion_id'-'rol')<>'{}'::jsonb or jsonb_typeof(m->'rol') is distinct from 'string' or coalesce(length(btrim(m->>'rol')),0) not between 1 and 200 then
   raise exception 'Indique el rol de cada integrante.' using errcode='22023';
  end if;
  select * into d from public.detenciones where id=(m->>'detencion_id')::uuid for update;
  if not found or d.intervencion_id is distinct from p_intervencion or not d.integra_organizacion or d.tipo_organizacion is distinct from p_tipo then
   raise exception 'Cada detenido debe pertenecer al operativo y estar clasificado en el tipo seleccionado.' using errcode='22023';
  end if;
  if d.id=any(ids) then raise exception 'No repita integrantes.' using errcode='22023';end if;
  if exists(select 1 from public.intervencion_grupo_integrantes where detencion_id=d.id and grupo_id<>p_id) then
   raise exception 'Un detenido ya está vinculado a otro grupo. Revise sus vínculos.' using errcode='23505';
  end if;
  ids:=array_append(ids,d.id);
 end loop;
 select jsonb_agg(jsonb_build_object('detencion_id',(value->>'detencion_id')::uuid,'rol',btrim(value->>'rol')) order by value->>'detencion_id') into wanted from jsonb_array_elements(p_integrantes);
 select jsonb_agg(jsonb_build_object('detencion_id',detencion_id,'rol',rol) order by detencion_id::text) into actual from public.intervencion_grupo_integrantes where grupo_id=p_id;
 if g.id is not null then
  if g.version=p_version+1 and g.nombre=p_nombre and g.modalidad=p_modalidad and g.referencia_lugar is not distinct from p_referencia and actual=wanted then
   return jsonb_build_object('id',g.id,'version',g.version,'operativo_version',i.version);
  end if;
  if g.version<>p_version then raise exception 'El grupo cambió. Actualice antes de editar.' using errcode='40001';end if;
  update public.intervencion_grupos set nombre=p_nombre,modalidad=p_modalidad,referencia_lugar=p_referencia,version=version+1,actualizado_en=clock_timestamp() where id=p_id returning * into g;
 else
  if p_version<>0 then raise exception 'Grupo no disponible.' using errcode='40001';end if;
  insert into public.intervencion_grupos(id,intervencion_id,tipo,nombre,modalidad,referencia_lugar,creado_por) values(p_id,p_intervencion,p_tipo,p_nombre,p_modalidad,p_referencia,auth.uid()) returning * into g;
 end if;
 -- Sustitución atómica de vínculos del grupo, nunca se borran personas o detenciones.
 delete from public.intervencion_grupo_integrantes where grupo_id=p_id;
 insert into public.intervencion_grupo_integrantes(grupo_id,detencion_id,rol)
 select p_id,(value->>'detencion_id')::uuid,btrim(value->>'rol') from jsonb_array_elements(wanted);
 category:=case p_tipo when 'banda' then 'bandas' else 'organizaciones' end;
 update public.intervenciones set resultados_previstos=case when category=any(resultados_previstos) then resultados_previstos else array_append(resultados_previstos,category) end where id=p_intervencion returning * into i;
 return jsonb_build_object('id',g.id,'version',g.version,'operativo_version',i.version);
end $$;
revoke all on function public.guardar_grupo_operativo(uuid,uuid,integer,text,text,text,text,jsonb) from public;
grant execute on function public.guardar_grupo_operativo(uuid,uuid,integer,text,text,text,text,jsonb) to authenticated;

create or replace function public.proteger_clasificacion_vinculada() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_grupo_integrantes where detencion_id=old.id) and
 (new.intervencion_id is distinct from old.intervencion_id or new.tipo_organizacion is distinct from old.tipo_organizacion or new.integra_organizacion is distinct from old.integra_organizacion) then
  raise exception 'El detenido está vinculado a un grupo. Revise el vínculo antes de cambiar su clasificación.' using errcode='23514';
 end if;
 return new;
end $$;
drop trigger if exists proteger_clasificacion_vinculada on public.detenciones;
create trigger proteger_clasificacion_vinculada before update on public.detenciones for each row execute function public.proteger_clasificacion_vinculada();
create or replace function public.conservar_grupos_registrados() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_grupos where intervencion_id=old.id and
 (new.tipo='directa' or not((case tipo when 'banda' then 'bandas' else 'organizaciones' end)=any(new.resultados_previstos)))) then
  raise exception 'El operativo ya contiene grupos registrados.' using errcode='23514';
 end if;return new;
end $$;
drop trigger if exists conservar_grupos_registrados on public.intervenciones;
create trigger conservar_grupos_registrados before update of tipo,resultados_previstos on public.intervenciones for each row execute function public.conservar_grupos_registrados();
revoke all on function public.proteger_clasificacion_vinculada(),public.conservar_grupos_registrados() from public;
commit;
