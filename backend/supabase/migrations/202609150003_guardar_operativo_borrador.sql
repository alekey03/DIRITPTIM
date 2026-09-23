-- Guardado transaccional de borradores, con reintentos y control de versión.
begin;
create table if not exists public.intervencion_solicitudes (
  id uuid primary key,
  autor uuid not null default auth.uid() references public.perfiles(id),
  contenido jsonb not null,
  respuesta jsonb not null,
  creado_en timestamptz not null default now()
);
alter table public.intervencion_solicitudes enable row level security;
drop policy if exists solicitud_propia on public.intervencion_solicitudes;
create policy solicitud_propia on public.intervencion_solicitudes for select to authenticated
using (autor=auth.uid() and public.usuario_activo());
drop policy if exists solicitud_creacion on public.intervencion_solicitudes;
create policy solicitud_creacion on public.intervencion_solicitudes for insert to authenticated
with check (autor=auth.uid() and public.usuario_activo());
grant select,insert on public.intervencion_solicitudes to authenticated;

create or replace function public.guardar_operativo_borrador(
 p_solicitud uuid, p_id uuid, p_version integer, p_intervencion jsonb, p_operativo jsonb
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 existente public.intervenciones%rowtype;
 i public.intervenciones%rowtype;
 o public.intervencion_operativos%rowtype;
 anterior public.intervencion_solicitudes%rowtype;
 contenido jsonb;
 respuesta jsonb;
 clave text;
begin
 if not public.usuario_activo() then raise exception 'Se requiere una cuenta activa.' using errcode='42501'; end if;
 if p_solicitud is null or p_id is null or p_version is null or p_version<0 then
   raise exception 'Identificador o versión inválidos.' using errcode='22023'; end if;
 if jsonb_typeof(p_intervencion) is distinct from 'object' or jsonb_typeof(p_operativo) is distinct from 'object' then
   raise exception 'Los datos del operativo no son válidos.' using errcode='22023'; end if;
 contenido := jsonb_build_object('id',p_id,'version',p_version,'intervencion',p_intervencion,'operativo',p_operativo);
 perform pg_advisory_xact_lock(hashtextextended(p_solicitud::text,0));
 select * into anterior from public.intervencion_solicitudes where id=p_solicitud;
 if found then
   if anterior.contenido is distinct from contenido then raise exception 'El reintento contiene datos diferentes.' using errcode='22023'; end if;
   return anterior.respuesta;
 end if;
 for clave in select jsonb_object_keys(p_intervencion) loop
  if not (clave=any(array['fecha','hora','tipo','departamento','provincia','distrito','direccion_policial','direccion_especializada_region','division_policial','departamento_policial','unidad_area_equipo','nota_sicpip','latitud','longitud','detalle_ubicacion'])) then raise exception 'Campo no admitido: %',clave using errcode='22023'; end if;
  if length(p_intervencion->>clave)>2000 then raise exception 'El campo % supera 2000 caracteres.',clave using errcode='22023'; end if;
 end loop;
 for clave in select jsonb_object_keys(p_operativo) loop
  if not (clave=any(array['resultado','orden_operaciones','plan_operaciones','personal_cargo','vehiculos_mayores_cargo','vehiculos_menores_cargo','personal_apoyo_pnp','vehiculos_mayores_apoyo_pnp','vehiculos_menores_apoyo_pnp','personal_apoyo_ffaa','vehiculos_mayores_apoyo_ffaa','vehiculos_menores_apoyo_ffaa','otras_entidades','vehiculos_mayores_otras_entidades','vehiculos_menores_otras_entidades','personas_intervenidas','vehiculos_mayores_intervenidos','vehiculos_menores_intervenidos','control_identidad_extranjeros','intervencion_penales','operativo_especificar','delito_general','delito_especifico'])) then raise exception 'Campo no admitido: %',clave using errcode='22023'; end if;
  if length(p_operativo->>clave)>2000 then raise exception 'El campo % supera 2000 caracteres.',clave using errcode='22023'; end if;
 end loop;
 i := jsonb_populate_record(null::public.intervenciones,p_intervencion);
 o := jsonb_populate_record(null::public.intervencion_operativos,p_operativo);
 if i.tipo is null or i.tipo not in ('operativo','megaoperativo') or i.fecha is null then
   raise exception 'Indique el tipo y la fecha del operativo.' using errcode='22023'; end if;
 select * into existente from public.intervenciones where id=p_id for update;
 if found then
   if not (public.es_administrador() or (existente.creado_por=auth.uid() and existente.unidad=public.unidad_actual())) then
     raise exception 'No tiene permiso para editar este operativo.' using errcode='42501'; end if;
   if existente.version<>p_version then
     raise exception 'Otra persona modificó el operativo. Vuelva a abrirlo antes de guardar.' using errcode='40001'; end if;
   update public.intervenciones set fecha=i.fecha,hora=i.hora,tipo=i.tipo,departamento=i.departamento,provincia=i.provincia,distrito=i.distrito,direccion_policial=i.direccion_policial,direccion_especializada_region=i.direccion_especializada_region,division_policial=i.division_policial,departamento_policial=i.departamento_policial,unidad_area_equipo=i.unidad_area_equipo,nota_sicpip=i.nota_sicpip,latitud=i.latitud,longitud=i.longitud,detalle_ubicacion=i.detalle_ubicacion where id=p_id;
 else
   if p_version<>0 then raise exception 'El operativo no está disponible.' using errcode='42501'; end if;
   insert into public.intervenciones(id,fecha,hora,tipo,departamento,provincia,distrito,direccion_policial,direccion_especializada_region,division_policial,departamento_policial,unidad_area_equipo,nota_sicpip,latitud,longitud,detalle_ubicacion) values(p_id,i.fecha,i.hora,i.tipo,i.departamento,i.provincia,i.distrito,i.direccion_policial,i.direccion_especializada_region,i.division_policial,i.departamento_policial,i.unidad_area_equipo,i.nota_sicpip,i.latitud,i.longitud,i.detalle_ubicacion);
 end if;
 if exists (select 1 from public.intervencion_operativos where intervencion_id=p_id) then
  update public.intervencion_operativos set resultado=o.resultado,orden_operaciones=o.orden_operaciones,plan_operaciones=o.plan_operaciones,personal_cargo=o.personal_cargo,vehiculos_mayores_cargo=o.vehiculos_mayores_cargo,vehiculos_menores_cargo=o.vehiculos_menores_cargo,personal_apoyo_pnp=o.personal_apoyo_pnp,vehiculos_mayores_apoyo_pnp=o.vehiculos_mayores_apoyo_pnp,vehiculos_menores_apoyo_pnp=o.vehiculos_menores_apoyo_pnp,personal_apoyo_ffaa=o.personal_apoyo_ffaa,vehiculos_mayores_apoyo_ffaa=o.vehiculos_mayores_apoyo_ffaa,vehiculos_menores_apoyo_ffaa=o.vehiculos_menores_apoyo_ffaa,otras_entidades=o.otras_entidades,vehiculos_mayores_otras_entidades=o.vehiculos_mayores_otras_entidades,vehiculos_menores_otras_entidades=o.vehiculos_menores_otras_entidades,personas_intervenidas=o.personas_intervenidas,vehiculos_mayores_intervenidos=o.vehiculos_mayores_intervenidos,vehiculos_menores_intervenidos=o.vehiculos_menores_intervenidos,control_identidad_extranjeros=o.control_identidad_extranjeros,intervencion_penales=o.intervencion_penales,operativo_especificar=o.operativo_especificar,delito_general=o.delito_general,delito_especifico=o.delito_especifico where intervencion_id=p_id;
 else
  insert into public.intervencion_operativos(intervencion_id,resultado,orden_operaciones,plan_operaciones,personal_cargo,vehiculos_mayores_cargo,vehiculos_menores_cargo,personal_apoyo_pnp,vehiculos_mayores_apoyo_pnp,vehiculos_menores_apoyo_pnp,personal_apoyo_ffaa,vehiculos_mayores_apoyo_ffaa,vehiculos_menores_apoyo_ffaa,otras_entidades,vehiculos_mayores_otras_entidades,vehiculos_menores_otras_entidades,personas_intervenidas,vehiculos_mayores_intervenidos,vehiculos_menores_intervenidos,control_identidad_extranjeros,intervencion_penales,operativo_especificar,delito_general,delito_especifico) values(p_id,o.resultado,o.orden_operaciones,o.plan_operaciones,o.personal_cargo,o.vehiculos_mayores_cargo,o.vehiculos_menores_cargo,o.personal_apoyo_pnp,o.vehiculos_mayores_apoyo_pnp,o.vehiculos_menores_apoyo_pnp,o.personal_apoyo_ffaa,o.vehiculos_mayores_apoyo_ffaa,o.vehiculos_menores_apoyo_ffaa,o.otras_entidades,o.vehiculos_mayores_otras_entidades,o.vehiculos_menores_otras_entidades,o.personas_intervenidas,o.vehiculos_mayores_intervenidos,o.vehiculos_menores_intervenidos,o.control_identidad_extranjeros,o.intervencion_penales,o.operativo_especificar,o.delito_general,o.delito_especifico);
 end if;
 select jsonb_build_object('id',id,'version',version) into respuesta from public.intervenciones where id=p_id;
 insert into public.intervencion_solicitudes(id,contenido,respuesta) values(p_solicitud,contenido,respuesta);
 return respuesta;
end;
$$;
revoke all on function public.guardar_operativo_borrador(uuid,uuid,integer,jsonb,jsonb) from public;
grant execute on function public.guardar_operativo_borrador(uuid,uuid,integer,jsonb,jsonb) to authenticated;
commit;
