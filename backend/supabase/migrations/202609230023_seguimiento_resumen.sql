begin;
create or replace function public.consultar_seguimiento(p_fecha date) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare respuesta jsonb;
begin
 if not exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text in ('estadistico_direccion','estadistico_jefatura')) then raise exception 'Seguimiento está reservado para Dirección y Jefatura.' using errcode='42501';end if;
 if p_fecha is null or p_fecha>(now() at time zone 'America/Lima')::date then raise exception 'Seleccione un día de hoy o anterior.' using errcode='22023';end if;
 with unidades as (
  select d.unidad,d.ambito,d.departamento,true as catalogada from public.dependencias_estadisticas d where public.puede_acceder_unidad(d.unidad)
  union all
  select distinct e.unidad,'OTROS','OTROS',false from public.seguimiento_ingresos e
   where (e.fecha=p_fecha or (e.creado_en at time zone 'America/Lima')::date=p_fecha)
   and public.puede_acceder_unidad(e.unidad)
   and exists(select 1 from public.perfiles p where p.id=auth.uid() and p.activo and p.rol::text='estadistico_direccion')
   and not exists(select 1 from public.dependencias_estadisticas d where d.unidad=e.unidad)
 ), resumen as (
 select u.*,
  coalesce((select jsonb_agg(p.nombres||' '||p.apellidos order by p.nombres,p.apellidos) from public.perfiles p where p.activo and p.unidad=u.unidad),'[]'::jsonb) as responsables,
  h.ultimo_registro,
  case when h.ultimo_registro is null then null else p_fecha-(h.ultimo_registro at time zone 'America/Lima')::date end as dias_desde_ingreso,
  b.ultimo_ingreso_del_dia,b.ultimo_usuario_del_dia,
  coalesce(a.operativos,0) as operativos,coalesce(a.detalles,0) as detalles,
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
  select count(*) as ingresados,count(*) filter(where e.fecha<p_fecha) as rezagados,
   max(e.creado_en) as ultimo_ingreso_del_dia,
   (array_agg(p.nombres||' '||p.apellidos order by e.creado_en desc,e.id))[1] as ultimo_usuario_del_dia
  from public.seguimiento_ingresos e left join public.perfiles p on p.id=e.creado_por where e.unidad=u.unidad and
   e.creado_en>=p_fecha::timestamp at time zone 'America/Lima' and
   e.creado_en<(p_fecha+1)::timestamp at time zone 'America/Lima'
 ) b on true
 left join lateral (
  select max(e.creado_en) as ultimo_registro from public.seguimiento_ingresos e
  where e.unidad=u.unidad and e.creado_en<(p_fecha+1)::timestamp at time zone 'America/Lima'
 ) h on true
 left join lateral(select * from public.seguimiento_declaraciones d where d.unidad=u.unidad and d.fecha=p_fecha order by id desc limit 1) d on true
 left join public.perfiles p on p.id=d.creado_por
 ) select coalesce(jsonb_agg(to_jsonb(r) order by r.catalogada desc,r.unidad),'[]'::jsonb) into respuesta from resumen r;
 return respuesta;
end;$$;
revoke all on function public.consultar_seguimiento(date) from public,anon;
grant execute on function public.consultar_seguimiento(date) to authenticated;


commit;
