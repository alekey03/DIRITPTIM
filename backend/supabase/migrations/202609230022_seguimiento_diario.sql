-- Seguimiento de producción operativa. No contiene datos personales de intervenidos.
begin;
create table public.seguimiento_declaraciones (
 id bigint generated always as identity primary key,
 unidad text not null references public.dependencias_estadisticas(unidad),
 fecha date not null,
 sin_produccion boolean not null,
 creado_por uuid not null references public.perfiles(id),
 creado_en timestamptz not null default now()
);
create index seguimiento_declaraciones_dia on public.seguimiento_declaraciones(unidad,fecha,id desc);
alter table public.seguimiento_declaraciones enable row level security;
revoke all on public.seguimiento_declaraciones from public,anon,authenticated;
grant select on public.seguimiento_declaraciones to authenticated;
create policy seguimiento_lectura on public.seguimiento_declaraciones for select to authenticated
 using(public.puede_acceder_unidad(unidad));

-- Sólo las funciones de este módulo consultan esta vista de metadatos.
create view public.seguimiento_ingresos as
select i.id, i.unidad, i.fecha, i.creado_en, i.creado_por, true as es_operativo from public.intervenciones i
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.detenciones r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_drogas r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_materiales r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_vehiculos r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_grupos r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_requisitoriados r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_menores r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_victimas r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_prostitucion r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_notas r join public.intervenciones i on i.id=r.intervencion_id
union all
select r.id, i.unidad, i.fecha, r.creado_en, r.creado_por, false from public.intervencion_complementarios r join public.intervenciones i on i.id=r.intervencion_id;
revoke all on public.seguimiento_ingresos from public,anon,authenticated;

create function public.consultar_seguimiento(p_fecha date) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare respuesta jsonb;
begin
 if not public.usuario_activo() then raise exception 'Se requiere una cuenta activa.' using errcode='42501';end if;
 if p_fecha is null or p_fecha>(now() at time zone 'America/Lima')::date then raise exception 'Seleccione un día de hoy o anterior.' using errcode='22023';end if;
 with unidades as (
  select d.unidad,d.ambito,true as catalogada from public.dependencias_estadisticas d where public.puede_acceder_unidad(d.unidad)
  union all
  select distinct e.unidad,'OTROS',false from public.seguimiento_ingresos e
   where (e.fecha=p_fecha or (e.creado_en at time zone 'America/Lima')::date=p_fecha)
   and public.puede_acceder_unidad(e.unidad)
   and not exists(select 1 from public.dependencias_estadisticas d where d.unidad=e.unidad)
 ), resumen as (
 select u.*,coalesce(a.operativos,0) as operativos,coalesce(a.detalles,0) as detalles,
  coalesce(a.tardios,0) as tardios,a.ultimo_ingreso,a.ultimo_usuario,
  coalesce(b.ingresados,0) as ingresados_ese_dia,coalesce(b.rezagados,0) as de_fechas_anteriores,
  coalesce(d.sin_produccion,false) as sin_produccion,d.creado_en as declarado_en,
  p.nombres||' '||p.apellidos as declarado_por,
  d.creado_por=auth.uid() or public.puede_editar_unidad(u.unidad) as puede_anular
 from unidades u
 left join lateral (
  select count(*) filter(where e.es_operativo) as operativos,count(*) filter(where not e.es_operativo) as detalles,
   count(*) filter(where (e.creado_en at time zone 'America/Lima')::date>p_fecha) as tardios,
   max(e.creado_en) as ultimo_ingreso,
   (array_agg(p.nombres||' '||p.apellidos order by e.creado_en desc,e.id))[1] as ultimo_usuario
  from public.seguimiento_ingresos e left join public.perfiles p on p.id=e.creado_por
  where e.unidad=u.unidad and e.fecha=p_fecha
 ) a on true
 left join lateral (
  select count(*) as ingresados,count(*) filter(where e.fecha<p_fecha) as rezagados
  from public.seguimiento_ingresos e where e.unidad=u.unidad and
   e.creado_en>=p_fecha::timestamp at time zone 'America/Lima' and
   e.creado_en<(p_fecha+1)::timestamp at time zone 'America/Lima'
 ) b on true
 left join lateral(select * from public.seguimiento_declaraciones d where d.unidad=u.unidad and d.fecha=p_fecha order by id desc limit 1) d on true
 left join public.perfiles p on p.id=d.creado_por
 ) select coalesce(jsonb_agg(to_jsonb(r) order by r.catalogada desc,r.unidad),'[]'::jsonb) into respuesta from resumen r;
 return respuesta;
end;$$;
revoke all on function public.consultar_seguimiento(date) from public,anon;
grant execute on function public.consultar_seguimiento(date) to authenticated;

create function public.declarar_seguimiento(p_fecha date,p_unidad text,p_sin_produccion boolean) returns void
language plpgsql security definer set search_path='' as $$
declare anterior public.seguimiento_declaraciones%rowtype;
begin
 if not public.puede_acceder_unidad(p_unidad) then raise exception 'No tiene acceso a esta dependencia.' using errcode='42501';end if;
 if p_fecha is null or p_fecha>(now() at time zone 'America/Lima')::date or p_sin_produccion is null then raise exception 'Seleccione un día de hoy o anterior.' using errcode='22023';end if;
 if not exists(select 1 from public.dependencias_estadisticas where unidad=p_unidad) then raise exception 'La dependencia no pertenece al catálogo de seguimiento.';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_unidad||p_fecha::text,0));
 select * into anterior from public.seguimiento_declaraciones where unidad=p_unidad and fecha=p_fecha order by id desc limit 1;
 if p_sin_produccion and exists(select 1 from public.seguimiento_ingresos where unidad=p_unidad and fecha=p_fecha) then
  raise exception 'Esta dependencia ya tiene registros para ese día. No corresponde declarar sin producción.' using errcode='23514';
 end if;
 if not p_sin_produccion and anterior.creado_por is distinct from auth.uid() and not public.puede_editar_unidad(p_unidad) then
  raise exception 'Sólo el autor o un gestor autorizado puede retirar la declaración.' using errcode='42501';
 end if;
 if coalesce(anterior.sin_produccion,false)=p_sin_produccion then return;end if;
 insert into public.seguimiento_declaraciones(unidad,fecha,sin_produccion,creado_por) values(p_unidad,p_fecha,p_sin_produccion,auth.uid());
end;$$;
revoke all on function public.declarar_seguimiento(date,text,boolean) from public,anon;
grant execute on function public.declarar_seguimiento(date,text,boolean) to authenticated;
commit;
