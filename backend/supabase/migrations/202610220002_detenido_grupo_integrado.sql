begin;
-- Excepción acotada: únicamente versión/fecha al anexar un detenido nuevo propio.
do $patch$
declare def text; marker text := 'raise exception ''Este perfil registra y consulta. La edición o eliminación corresponde a Dirección o Jefatura.''';
begin
 def:=pg_get_functiondef('public.proteger_permisos_estadisticos()'::regprocedure);
 if position('grupo_integrante_nuevo' in def)=0 then
  if position(marker in def)=0 then raise exception 'Revise la función de permisos antes de aplicar esta migración.';end if;
  def:=replace(def,marker,$code$
  -- grupo_integrante_nuevo: no habilita cambiar datos ni integrantes existentes.
  if tg_table_name='intervencion_grupos' and tg_op='UPDATE' and
   (to_jsonb(new)-array['version','actualizado_en'])=(to_jsonb(old)-array['version','actualizado_en']) and
   exists(select 1 from public.intervencion_grupo_integrantes m join public.detenciones d on d.id=m.detencion_id
    where m.grupo_id=(fila->>'id')::uuid and d.creado_por=auth.uid()
     and m.xmin=pg_catalog.pg_current_xact_id()::text::xid and d.xmin=pg_catalog.pg_current_xact_id()::text::xid and d.creado_en=transaction_timestamp())
  then return new;end if;
  $code$||marker);
  execute def;
 end if;
end $patch$;

create or replace function public.anexar_detenido_grupo(p_grupo uuid,p_detencion uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare g public.intervencion_grupos; i public.intervenciones; d public.detenciones;
begin
 if not public.usuario_activo() then raise exception 'Sesión activa requerida.' using errcode='42501';end if;
 select * into g from public.intervencion_grupos where id=p_grupo;
 if not found then raise exception 'Grupo no disponible.' using errcode='42501';end if;
 select * into i from public.intervenciones where id=g.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not(public.es_administrador() or(i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then
  raise exception 'No puede registrar grupos en este operativo.' using errcode='42501';end if;
 select * into d from public.detenciones where id=p_detencion and creado_por=auth.uid() and xmin=pg_catalog.pg_current_xact_id()::text::xid and creado_en=transaction_timestamp();
 if not found or d.intervencion_id is distinct from i.id or d.tipo_organizacion is distinct from g.tipo or d.integra_organizacion is distinct from true or d.nombre_organizacion is distinct from g.nombre then
  raise exception 'Solo puede anexar el detenido recién registrado en este operativo.' using errcode='42501';end if;
 insert into public.intervencion_grupo_integrantes(grupo_id,detencion_id,rol) values(g.id,d.id,d.rol_organizacion);
 update public.intervencion_grupos set version=version+1,actualizado_en=now() where id=g.id;
 update public.intervenciones set actualizado_en=now() where id=i.id returning * into i;
 return jsonb_build_object('operativo_version',i.version);
end $$;
revoke all on function public.anexar_detenido_grupo(uuid,uuid) from public,anon;
grant execute on function public.anexar_detenido_grupo(uuid,uuid) to authenticated;

-- Reutiliza las dos RPC y sus permisos: detenido + grupo se confirman juntos.
create or replace function public.guardar_detenido_con_grupo(
 p_solicitud uuid,p_persona jsonb,p_detencion jsonb,p_delitos jsonb,p_armas jsonb,
 p_grupo jsonb,p_editar boolean default false,p_motivo text default null,p_version timestamptz default null
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare op uuid; i public.intervenciones; g public.intervencion_grupos; linked uuid;
 result jsonb; saved jsonb; members jsonb; kind text; group_name text; d public.detenciones;
begin
 if not public.usuario_activo() or p_solicitud is null then raise exception 'Inicie sesión con una cuenta activa.' using errcode='42501';end if;
 if jsonb_typeof(p_grupo) is distinct from 'object' then raise exception 'Complete la banda u organización.' using errcode='22023';end if;
 kind:=p_detencion->>'tipo_organizacion';
 if kind is null or kind not in ('banda','organizacion') or (p_detencion->>'integra_organizacion')::boolean is distinct from true then raise exception 'Seleccione banda u organización.' using errcode='22023';end if;
 op:=nullif(p_detencion->>'intervencion_id','')::uuid;
 if p_editar then select intervencion_id into op from public.detenciones where id=p_solicitud;end if;
 if op is null then raise exception 'Registre el detenido dentro de un operativo para vincular su grupo.' using errcode='22023';end if;
 -- El mismo bloqueo del operativo serializa altas simultáneas y evita perder integrantes.
 select * into i from public.intervenciones where id=op for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not(public.es_administrador() or(i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'No puede registrar grupos en este operativo.' using errcode='42501';end if;
 if nullif(p_grupo->>'id','') is not null then
  select * into g from public.intervencion_grupos where id=(p_grupo->>'id')::uuid;
  if not found or g.intervencion_id<>op or g.tipo<>kind then raise exception 'El grupo no pertenece a este operativo y tipo.' using errcode='22023';end if;
 else
  group_name:=btrim(p_detencion->>'nombre_organizacion');
  select * into g from public.intervencion_grupos where intervencion_id=op and tipo=kind and lower(btrim(nombre))=lower(group_name);
 end if;
 select grupo_id into linked from public.intervencion_grupo_integrantes where detencion_id=p_solicitud;
 if linked is not null and linked is distinct from g.id then raise exception 'El detenido ya pertenece a otro grupo. Revise el vínculo desde Bandas y organizaciones.' using errcode='23514';end if;
 if g.id is null then
  g.id:=gen_random_uuid();g.intervencion_id:=op;g.tipo:=kind;g.nombre:=group_name;
  g.modalidad:=btrim(p_grupo->>'modalidad');g.referencia_lugar:=nullif(btrim(p_grupo->>'referencia'),'');g.version:=0;
 end if;
 if coalesce(length(g.nombre),0) not between 1 and 200 or coalesce(length(g.modalidad),0) not between 1 and 2000 or length(g.referencia_lugar)>2000 then raise exception 'Complete nombre y modalidad del grupo; respete los límites de los campos.' using errcode='22023';end if;
 p_detencion:=p_detencion||jsonb_build_object('intervencion_id',op,'nombre_organizacion',g.nombre);
 result:=public.guardar_detenido_atomico(p_solicitud,p_persona,p_detencion,p_delitos,p_armas,p_editar,p_motivo,p_version);
 select * into d from public.detenciones where id=p_solicitud;
 if d.intervencion_id is distinct from op or d.tipo_organizacion is distinct from kind or not d.integra_organizacion then raise exception 'La solicitud existente tiene otra clasificación.' using errcode='22023';end if;
 if coalesce((result->>'repetida')::boolean,false) then
  if linked is distinct from g.id then raise exception 'La solicitud ya existe sin este vínculo. Consulte el detenido antes de modificarlo.' using errcode='40001';end if;
  return result||jsonb_build_object('grupo_id',g.id,'grupo_nombre',g.nombre);
 end if;
 select coalesce(jsonb_agg(jsonb_build_object('detencion_id',detencion_id,'rol',rol) order by detencion_id),'[]'::jsonb) into members
 from public.intervencion_grupo_integrantes where grupo_id=g.id and detencion_id<>p_solicitud;
 members:=members||jsonb_build_array(jsonb_build_object('detencion_id',p_solicitud,'rol',d.rol_organizacion));
 if g.version>0 and not p_editar then
  saved:=public.anexar_detenido_grupo(g.id,p_solicitud);
 else
  saved:=public.guardar_grupo_operativo(g.id,op,g.version,kind,g.nombre,g.modalidad,g.referencia_lugar,members);
 end if;
 return result||jsonb_build_object('grupo_id',g.id,'grupo_nombre',g.nombre,'operativo_version',saved->'operativo_version');
end $$;
revoke all on function public.guardar_detenido_con_grupo(uuid,jsonb,jsonb,jsonb,jsonb,jsonb,boolean,text,timestamptz) from public,anon;
grant execute on function public.guardar_detenido_con_grupo(uuid,jsonb,jsonb,jsonb,jsonb,jsonb,boolean,text,timestamptz) to authenticated;
commit;
