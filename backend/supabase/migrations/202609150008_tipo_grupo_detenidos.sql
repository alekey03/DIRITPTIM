-- Distingue grupos sin clasificar automáticamente los registros anteriores.
begin;
alter table public.detenciones add column if not exists tipo_organizacion text;
alter table public.detenciones drop constraint if exists detenciones_tipo_organizacion_check;
alter table public.detenciones add constraint detenciones_tipo_organizacion_check check (
 tipo_organizacion is null or (integra_organizacion and tipo_organizacion in ('banda','organizacion'))
);
create or replace function public.guardar_detenido_atomico(
  p_solicitud uuid, p_persona jsonb, p_detencion jsonb,
  p_delitos jsonb, p_armas jsonb,
  p_editar boolean default false, p_motivo text default null,
  p_version timestamptz default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  perfil public.perfiles%rowtype;
  operativo public.intervenciones%rowtype;
  vinculo uuid;
  persona public.personas%rowtype;
  detencion public.detenciones%rowtype;
  anterior public.detenciones%rowtype;
  persona_id uuid;
  elemento jsonb;
  delito public.detencion_delitos%rowtype;
  arma public.detencion_armas%rowtype;
  eliminado record;
begin
  select * into perfil from public.perfiles where id = auth.uid() and activo = true;
  if not found or nullif(btrim(perfil.unidad), '') is null or nullif(btrim(perfil.departamento), '') is null then
    raise exception 'La cuenta no está activa o no tiene área y departamento asignados.' using errcode = '42501';
  end if;
  if p_solicitud is null or jsonb_typeof(p_persona) is distinct from 'object'
    or jsonb_typeof(p_detencion) is distinct from 'object'
    or jsonb_typeof(p_delitos) is distinct from 'array'
    or jsonb_typeof(p_armas) is distinct from 'array' then
    raise exception 'Solicitud de guardado inválida.' using errcode = '22023';
  end if;
  vinculo := nullif(p_detencion->>'intervencion_id','')::uuid;
  if vinculo is not null and not p_editar then
    select * into operativo from public.intervenciones where id=vinculo for update;
    if not found or not (public.es_administrador() or (operativo.creado_por=auth.uid() and operativo.unidad=public.unidad_actual())) then
      raise exception 'No puede añadir detenidos a este operativo.' using errcode='42501';
    end if;
    -- El ámbito registrador se hereda del operativo, nunca de un dato libre.
    perfil.unidad := operativo.unidad;
    perfil.departamento := operativo.departamento_registro;
  end if;
  -- Serializa los reintentos de una misma solicitud, incluso antes del INSERT.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_solicitud::text, 0));
  if p_editar then
    select * into anterior from public.detenciones where id = p_solicitud for update;
  else
    select * into anterior from public.detenciones where id = p_solicitud;
  end if;
  if not p_editar and anterior.id is not null then
    if anterior.creado_por is distinct from auth.uid() or anterior.intervencion_id is distinct from vinculo then
      raise exception 'Solicitud no disponible.' using errcode = '42501';
    end if;
    return jsonb_build_object('id', anterior.id, 'codigo', anterior.codigo, 'repetida', true);
  end if;
  if p_editar then
    if vinculo is not null and vinculo is distinct from anterior.intervencion_id then raise exception 'No se puede trasladar una detención a otro operativo.' using errcode='42501'; end if;
    if perfil.rol <> 'administrador' or anterior.id is null or nullif(btrim(p_motivo), '') is null then
      raise exception 'La edición requiere administrador, registro accesible y motivo.' using errcode = '42501';
    end if;
    if p_version is null or anterior.actualizado_en is distinct from p_version then
      raise exception 'El registro cambió. Vuelva a abrirlo antes de editar.' using errcode = '40001';
    end if;
  end if;
  persona := jsonb_populate_record(null::public.personas, p_persona);
  detencion := jsonb_populate_record(null::public.detenciones, p_detencion);
  if nullif(btrim(persona.apellido_paterno), '') is null or nullif(btrim(persona.nombres), '') is null or detencion.fecha is null then
    raise exception 'Complete apellidos, nombres y fecha de detención.' using errcode = '22023';
  end if;
  persona.tipo_documento := nullif(btrim(persona.tipo_documento), '');
  persona.numero_documento := nullif(btrim(persona.numero_documento), '');
  detencion.es_funcionario_publico := coalesce(detencion.es_funcionario_publico, false);
  detencion.integra_organizacion := coalesce(detencion.integra_organizacion, false);
  if detencion.integra_organizacion then
    if detencion.tipo_organizacion is null or detencion.tipo_organizacion not in ('banda','organizacion') then
      if p_editar and not (p_detencion ? 'tipo_organizacion') then
        detencion.tipo_organizacion := anterior.tipo_organizacion;
      elsif p_detencion ? 'tipo_organizacion' then
        raise exception 'Seleccione banda u organización criminal.' using errcode='22023';
      end if;
    end if;
  else detencion.tipo_organizacion := null; end if;
  if detencion.integra_organizacion then
    if detencion.rol_organizacion is null or detencion.rol_organizacion not in ('Integrante', 'Cabecilla') or nullif(btrim(detencion.nombre_organizacion), '') is null then
      raise exception 'Complete participación y nombre de la organización.' using errcode = '22023';
    end if;
  else
    detencion.rol_organizacion := null;
    detencion.nombre_organizacion := null;
  end if;
  if p_editar then
    persona_id := anterior.persona_id;
    update public.personas set apellido_paterno = persona.apellido_paterno,
      apellido_materno = persona.apellido_materno,
      nombres = persona.nombres,
      edad = persona.edad,
      genero = persona.genero,
      nacionalidad = persona.nacionalidad,
      tipo_documento = persona.tipo_documento,
      numero_documento = persona.numero_documento,
      departamento = persona.departamento,
      provincia = persona.provincia,
      distrito = persona.distrito, actualizado_en = clock_timestamp()
      where id = persona_id;
    if not found then raise exception 'No se pudo actualizar la persona.' using errcode = '42501'; end if;
    perform public.asignar_motivo_transaccion('personas', persona_id::text, p_motivo);
    update public.detenciones set fecha = detencion.fecha,
      hora = detencion.hora,
      es_funcionario_publico = detencion.es_funcionario_publico,
      entidad_publica = detencion.entidad_publica,
      detalle_entidad_publica = detencion.detalle_entidad_publica,
      motivo_detencion = detencion.motivo_detencion,
      direccion_policial = detencion.direccion_policial,
      direccion_especializada_region = detencion.direccion_especializada_region,
      division_policial = detencion.division_policial,
      departamento_policial = detencion.departamento_policial,
      unidad_area_equipo = detencion.unidad_area_equipo,
      integra_organizacion = detencion.integra_organizacion,
      tipo_organizacion = detencion.tipo_organizacion,
      rol_organizacion = detencion.rol_organizacion,
      nombre_organizacion = detencion.nombre_organizacion,
      situacion_actual = detencion.situacion_actual,
      documento_libertad = detencion.documento_libertad,
      documento_disposicion = detencion.documento_disposicion,
      fiscal_nombre = detencion.fiscal_nombre,
      fiscalia = detencion.fiscalia,
      disposicion_direccion = detencion.disposicion_direccion,
      disposicion_region = detencion.disposicion_region,
      disposicion_division = detencion.disposicion_division,
      disposicion_departamento = detencion.disposicion_departamento,
      disposicion_unidad = detencion.disposicion_unidad,
      nota_sicpip = detencion.nota_sicpip, actualizado_en = clock_timestamp()
      where id = anterior.id returning * into detencion;
    if not found then raise exception 'No se pudo actualizar la detención.' using errcode = '42501'; end if;
    perform public.asignar_motivo_transaccion('detenciones', detencion.id::text, p_motivo);
    for eliminado in delete from public.detencion_delitos where detencion_id = anterior.id returning id loop
      perform public.asignar_motivo_transaccion('detencion_delitos', eliminado.id::text, p_motivo);
    end loop;
    for eliminado in delete from public.detencion_armas where detencion_id = anterior.id returning id loop
      perform public.asignar_motivo_transaccion('detencion_armas', eliminado.id::text, p_motivo);
    end loop;
  else
    if persona.tipo_documento is not null and persona.numero_documento is not null then
      select p.id into persona_id from public.personas p
        where upper(p.tipo_documento) = upper(persona.tipo_documento)
          and upper(p.numero_documento) = upper(persona.numero_documento);
    end if;
    if persona_id is not null and vinculo is not null and not exists(select 1 from public.personas where id=persona_id and unidad=perfil.unidad) then
      raise exception 'La identidad existente pertenece a otro ámbito. Revise el registro antes de vincularlo.' using errcode='42501';
    end if;
    if persona_id is null then
      insert into public.personas (apellido_paterno, apellido_materno, nombres, edad, genero, nacionalidad, tipo_documento, numero_documento, departamento, provincia, distrito, unidad, creado_por)
      values (persona.apellido_paterno, persona.apellido_materno, persona.nombres, persona.edad, persona.genero, persona.nacionalidad, persona.tipo_documento, persona.numero_documento, persona.departamento, persona.provincia, persona.distrito, perfil.unidad, perfil.id) returning id into persona_id;
    end if;
    insert into public.detenciones (id, intervencion_id, persona_id, fecha, hora, es_funcionario_publico, entidad_publica, detalle_entidad_publica, motivo_detencion, direccion_policial, direccion_especializada_region, division_policial, departamento_policial, unidad_area_equipo, integra_organizacion, tipo_organizacion, rol_organizacion, nombre_organizacion, situacion_actual, documento_libertad, documento_disposicion, fiscal_nombre, fiscalia, disposicion_direccion, disposicion_region, disposicion_division, disposicion_departamento, disposicion_unidad, nota_sicpip, departamento_registro, unidad, creado_por)
      values (p_solicitud, vinculo, persona_id, detencion.fecha, detencion.hora, detencion.es_funcionario_publico, detencion.entidad_publica, detencion.detalle_entidad_publica, detencion.motivo_detencion, detencion.direccion_policial, detencion.direccion_especializada_region, detencion.division_policial, detencion.departamento_policial, detencion.unidad_area_equipo, detencion.integra_organizacion, detencion.tipo_organizacion, detencion.rol_organizacion, detencion.nombre_organizacion, detencion.situacion_actual, detencion.documento_libertad, detencion.documento_disposicion, detencion.fiscal_nombre, detencion.fiscalia, detencion.disposicion_direccion, detencion.disposicion_region, detencion.disposicion_division, detencion.disposicion_departamento, detencion.disposicion_unidad, detencion.nota_sicpip, perfil.departamento, perfil.unidad, perfil.id)
      returning * into detencion;
  end if;
  for elemento in select value from jsonb_array_elements(p_delitos) loop
    delito := jsonb_populate_record(null::public.detencion_delitos, elemento);
    insert into public.detencion_delitos (detencion_id, orden, es_tentativa, fuero_ley_especial, delito_general, delito_especifico, subtipo)
      values (detencion.id, delito.orden, coalesce(delito.es_tentativa, false), delito.fuero_ley_especial, delito.delito_general, delito.delito_especifico, delito.subtipo);
  end loop;
  for elemento in select value from jsonb_array_elements(p_armas) loop
    arma := jsonb_populate_record(null::public.detencion_armas, elemento);
    insert into public.detencion_armas (detencion_id, categoria, tipo, cantidad, observacion)
      values (detencion.id, arma.categoria, arma.tipo, arma.cantidad, arma.observacion);
  end loop;
  return jsonb_build_object('id', detencion.id, 'codigo', detencion.codigo, 'repetida', false);
end;
$$;
revoke all on function public.guardar_detenido_atomico(uuid,jsonb,jsonb,jsonb,jsonb,boolean,text,timestamptz) from public;
grant execute on function public.guardar_detenido_atomico(uuid,jsonb,jsonb,jsonb,jsonb,boolean,text,timestamptz) to authenticated;

commit;
