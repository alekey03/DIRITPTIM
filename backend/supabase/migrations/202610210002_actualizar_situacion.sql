begin;
create table if not exists public.detencion_situaciones_historial(
 solicitud uuid primary key, detencion_id uuid not null references public.detenciones(id) on delete cascade,
 usuario_id uuid not null references public.perfiles(id), creado_en timestamptz not null default now(),
 motivo text not null, anterior jsonb not null, nueva jsonb not null, version_resultante timestamptz not null
);
alter table public.detencion_situaciones_historial enable row level security;
revoke all on public.detencion_situaciones_historial from anon,authenticated;
grant select on public.detencion_situaciones_historial to authenticated;
drop policy if exists lectura_situaciones on public.detencion_situaciones_historial;
create policy lectura_situaciones on public.detencion_situaciones_historial for select to authenticated using(
 exists(select 1 from public.detenciones d where d.id=detencion_id and public.puede_acceder_unidad(d.unidad))
);

-- Only the author's situation fields may pass the otherwise unchanged edit guard.
do $$ declare src text; anchor text:='if tg_op<>''INSERT'' and not public.puede_editar_unidad(u) then'; fields text:='array[''situacion_actual'',''documento_libertad'',''documento_disposicion'',''fiscal_nombre'',''fiscalia'',''disposicion_direccion'',''disposicion_region'',''disposicion_division'',''disposicion_departamento'',''disposicion_unidad'',''actualizado_en'']'; begin
 select pg_get_functiondef('public.proteger_permisos_estadisticos()'::regprocedure) into src;
 if position('situacion_autor_limitada' in src)=0 then
  if position(anchor in src)=0 then raise exception 'Revise el control de permisos antes de aplicar.'; end if;
  src:=replace(src,anchor,'-- situacion_autor_limitada: no habilita edición general'||chr(10)||
   'if tg_op=''UPDATE'' and tg_table_name=''detenciones'' and (to_jsonb(old)->>''creado_por'')=auth.uid()::text and public.usuario_activo() and (to_jsonb(new)-'||fields||')=(to_jsonb(old)-'||fields||') then return new; end if; '||anchor);
  execute src;
 end if;
 -- Updating a situation must not change the original operational facts.
 select pg_get_functiondef('public.heredar_ni_detenido()'::regprocedure) into src;
 if position('situacion_sin_cambiar_hecho' in src)=0 then
  src:=replace(src,'begin','begin '||chr(10)||'-- situacion_sin_cambiar_hecho'||chr(10)||
   'if tg_op=''UPDATE'' and (to_jsonb(new)-'||fields||')=(to_jsonb(old)-'||fields||') then return new; end if;');
  execute src;
 end if;
end $$;

create or replace function public.actualizar_situacion_detenido(p_id uuid,p_version timestamptz,p_solicitud uuid,p_cambios jsonb,p_motivo text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare d public.detenciones; nuevo public.detenciones; h public.detencion_situaciones_historial; k text; antes jsonb; despues jsonb;
 campos text[]:=array['situacion_actual','documento_libertad','documento_disposicion','fiscal_nombre','fiscalia','disposicion_direccion','disposicion_region','disposicion_division','disposicion_departamento','disposicion_unidad'];
begin
 if p_solicitud is null or not public.usuario_activo() or jsonb_typeof(p_cambios) is distinct from 'object' or nullif(btrim(p_motivo),'') is null or length(p_motivo)>2000 then raise exception 'Sesión, situación y motivo obligatorios.' using errcode='22023'; end if;
 select * into d from public.detenciones where id=p_id for update;
 if not found or exists(select 1 from public.perfiles where id=auth.uid() and rol::text='visualizador') or not public.puede_acceder_unidad(d.unidad) or not(d.creado_por=auth.uid() or exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text='administrador')) then raise exception 'Solo el registrador o el administrador pueden actualizar esta situación.' using errcode='42501'; end if;
 for k in select jsonb_object_keys(p_cambios) loop
  if k<>all(campos) or (p_cambios->k<>'null'::jsonb and jsonb_typeof(p_cambios->k)<>'string') or length(p_cambios->>k)>2000 then raise exception 'Campo no permitido para actualizar situación.' using errcode='22023'; end if;
 end loop;
 if coalesce(p_cambios->>'situacion_actual','')<>all(array['LIBERTAD SEDE POLICIAL','LIBERTAD SEDE FISCAL','LIBERTAD SEDE JUDICIAL','LIBERTAD CONDICIONAL','PRIVADO DE SU LIBERTAD_ ESTABLECIMIENTO PENITENCIARIO','PRIVADO DE SU LIBERTAD_ ESTABLECIMIENTO PENITENCIARIO (PRISION PREVENTIVA )','CONTINUA DETENIDO','PUESTO A DISPOSICION DE UNIDAD PNP','PUESTO A DISPOSICION DE FISCALIA','PUESTO A DISPOSICION DE JUZGADO']) then raise exception 'Seleccione una situación válida.' using errcode='22023'; end if;
 select * into h from public.detencion_situaciones_historial where solicitud=p_solicitud;
 if found then
  if h.detencion_id<>p_id or h.usuario_id<>auth.uid() or h.nueva<>p_cambios or h.motivo<>btrim(p_motivo) then raise exception 'El reintento contiene datos diferentes.' using errcode='22023'; end if;
  return jsonb_build_object('id',p_id,'actualizado_en',h.version_resultante);
 end if;
 if p_version is null or d.actualizado_en is distinct from p_version then raise exception 'La situación cambió. Cierre y vuelva a abrir el registro antes de guardar.' using errcode='40001'; end if;
 nuevo:=jsonb_populate_record(d,p_cambios);
 select jsonb_object_agg(key,value) into antes from jsonb_each(to_jsonb(d)) where key=any(campos);
 update public.detenciones set situacion_actual=nuevo.situacion_actual,documento_libertad=nuevo.documento_libertad,documento_disposicion=nuevo.documento_disposicion,fiscal_nombre=nuevo.fiscal_nombre,fiscalia=nuevo.fiscalia,disposicion_direccion=nuevo.disposicion_direccion,disposicion_region=nuevo.disposicion_region,disposicion_division=nuevo.disposicion_division,disposicion_departamento=nuevo.disposicion_departamento,disposicion_unidad=nuevo.disposicion_unidad,actualizado_en=clock_timestamp() where id=p_id returning * into nuevo;
 insert into public.detencion_situaciones_historial(solicitud,detencion_id,usuario_id,motivo,anterior,nueva,version_resultante) values(p_solicitud,p_id,auth.uid(),btrim(p_motivo),antes,p_cambios,nuevo.actualizado_en);
 return jsonb_build_object('id',p_id,'actualizado_en',nuevo.actualizado_en);
end $$;
revoke all on function public.actualizar_situacion_detenido(uuid,timestamptz,uuid,jsonb,text) from public;
grant execute on function public.actualizar_situacion_detenido(uuid,timestamptz,uuid,jsonb,text) to authenticated;
notify pgrst,'reload schema';
commit;
