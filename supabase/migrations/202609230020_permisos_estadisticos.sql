begin;
create table if not exists public.dependencias_estadisticas (
 unidad text primary key, ambito text not null, departamento text not null
);
alter table public.dependencias_estadisticas enable row level security;
revoke all on public.dependencias_estadisticas from public,anon,authenticated;
grant select on public.dependencias_estadisticas to authenticated;
create policy dependencias_estadisticas_lectura on public.dependencias_estadisticas for select to authenticated using (public.usuario_activo());
insert into public.dependencias_estadisticas(unidad,ambito,departamento) values
('DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS','SEDE_CENTRAL','LIMA'),
('DIVISIÓN DE INVESTIGACIÓN DE TRÁFICO ILÍCITO DE MIGRANTES','SEDE_CENTRAL','LIMA'),
('DIVISIÓN DE INVESTIGACIÓN Y BÚSQUEDA DE PERSONAS DESAPARECIDAS','SEDE_CENTRAL','LIMA'),
('DIVISIÓN DE EXTRANJERIA','SEDE_CENTRAL','LIMA'),
('DIVISIÓN DE INVESTIGACIÓN DE CRIMEN ORGANIZADO CONTRA LA TRATA DE PERSONAS','SEDE_CENTRAL','LIMA'),
('DEPITPTIM ABANCAY','DESCONCENTRADO','APURIMAC'),
('DEPITPTIM ANDAHUAYLAS','DESCONCENTRADO','APURIMAC'),
('DEPITPTIM AREQUIPA','DESCONCENTRADO','AREQUIPA'),
('DEPITPTIM AYACUCHO','DESCONCENTRADO','AYACUCHO'),
('DEPITPTIM CAJAMARCA','DESCONCENTRADO','CAJAMARCA'),
('DEPITPTIM CHIMBOTE','DESCONCENTRADO','ANCASH'),
('DEPITPTIM CUSCO','DESCONCENTRADO','CUSCO'),
('DEPITPTIM HUANCAVELICA','DESCONCENTRADO','HUANCAVELICA'),
('DEPITPTIM HUARAZ','DESCONCENTRADO','ANCASH'),
('DEPITPTIM HUANUCO','DESCONCENTRADO','HUANUCO'),
('DEPITPTIM ICA','DESCONCENTRADO','ICA'),
('DEPITPTIM JULIACA','DESCONCENTRADO','PUNO'),
('DEPITPTIM JUNIN','DESCONCENTRADO','JUNIN'),
('DEPITPTIM LA LIBERTAD','DESCONCENTRADO','LA LIBERTAD'),
('DEPITPTIM LAMBAYEQUE','DESCONCENTRADO','LAMBAYEQUE'),
('DEPITPTIM LORETO','DESCONCENTRADO','LORETO'),
('DEPITPTIM MADRE DE DIOS','DESCONCENTRADO','MADRE DE DIOS'),
('DEPITPTIM PIURA','DESCONCENTRADO','PIURA'),
('DEPITPTIM PUNO','DESCONCENTRADO','PUNO'),
('DEPITPTIM SAN MARTIN','DESCONCENTRADO','SAN MARTIN'),
('DEPITPTIM TACNA','DESCONCENTRADO','TACNA'),
('DEPITPTIM TUMBES','DESCONCENTRADO','TUMBES'),
('DEPITPTIM UCAYALI','DESCONCENTRADO','UCAYALI')
on conflict(unidad) do update set ambito=excluded.ambito,departamento=excluded.departamento;

create or replace function public.es_gestor_produccion() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text in ('administrador','estadistico_direccion','estadistico_jefatura'))
$$;
create or replace function public.puede_crear_usuarios() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text in ('administrador','estadistico_direccion'))
$$;
create or replace function public.puede_acceder_unidad(unidad_registro text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.perfiles p where p.id=auth.uid() and p.activo and (
 p.rol::text in ('administrador','estadistico_direccion') or
 (p.rol::text='estadistico_jefatura' and (unidad_registro='JEFDDITP' or exists(select 1 from public.dependencias_estadisticas d where d.unidad=unidad_registro and d.ambito='DESCONCENTRADO'))) or
 (p.rol::text in ('estadistico_division','estadistico_depitptim') and (p.unidad=unidad_registro or (p.unidad='DIVISIÓN DE INVESTIGACIÓN Y BÚSQUEDA DE PERSONAS DESAPARECIDAS' and unidad_registro='DIVISIÓN DE INVESTIGACIÓN DE PERSONAS DESAPARECIDAS')))
 ))
$$;
create or replace function public.puede_editar_unidad(unidad_registro text) returns boolean
language sql stable security definer set search_path='' as $$
 select public.es_gestor_produccion() and public.puede_acceder_unidad(unidad_registro)
$$;

alter table public.perfiles add column if not exists plaza_direccion smallint;
alter table public.perfiles add constraint plaza_direccion_rango check(plaza_direccion is null or plaza_direccion in (1,2));
create unique index if not exists dos_estadisticos_direccion on public.perfiles(plaza_direccion) where activo and rol='estadistico_direccion';
create unique index if not exists administrador_general_unico on public.perfiles((true)) where activo and rol='administrador';
create or replace function public.validar_dependencia_perfil() returns trigger
language plpgsql security definer set search_path='' as $$
declare d public.dependencias_estadisticas%rowtype;
begin
 if tg_op='UPDATE' and old.usuario='administrador' and (new.usuario<>old.usuario or new.rol::text<>'administrador' or not new.activo) then
  raise exception 'La cuenta de administración general es única y debe permanecer activa.' using errcode='42501';
 end if;
 if new.rol::text='administrador' then
  if new.usuario<>'administrador' then
   if tg_op='UPDATE' and not new.activo and not old.activo and new.rol=old.rol then return new; end if;
   raise exception 'No se puede crear otro administrador general.' using errcode='42501';
  end if;
  new.ambito:='NACIONAL';new.departamento:='NACIONAL';new.unidad:='ADMINISTRACIÓN GENERAL DIRITPTIM';new.plaza_direccion:=null;
 elsif new.rol::text='estadistico_direccion' then
  perform pg_catalog.pg_advisory_xact_lock(23092026,20);
  if new.activo then
   if new.plaza_direccion is null then
    select v into new.plaza_direccion from generate_series(1,2) v where not exists(select 1 from public.perfiles p where p.activo and p.rol::text='estadistico_direccion' and p.plaza_direccion=v and p.id<>new.id) order by v limit 1;
   end if;
   if new.plaza_direccion is null then raise exception 'Solo puede haber dos estadísticos de dirección activos.' using errcode='23514';end if;
  else new.plaza_direccion:=null;end if;
  new.ambito:='NACIONAL';new.departamento:='NACIONAL';new.unidad:='ESTADÍSTICA DE DIRECCIÓN DIRITPTIM';
 elsif new.rol::text='estadistico_jefatura' then
  new.ambito:='DESCONCENTRADO';new.departamento:='NACIONAL';new.unidad:='JEFDDITP';new.plaza_direccion:=null;
 elsif new.rol::text in ('estadistico_division','estadistico_depitptim') then
  select * into d from public.dependencias_estadisticas where unidad=new.unidad and ambito=case new.rol::text when 'estadistico_division' then 'SEDE_CENTRAL' else 'DESCONCENTRADO' end;
  if not found then raise exception 'Seleccione una dependencia válida para el perfil estadístico.' using errcode='23514';end if;
  new.ambito:=d.ambito;new.departamento:=d.departamento;new.plaza_direccion:=null;
 else
  if tg_op='UPDATE' and not new.activo and not old.activo and new.rol=old.rol then return new;end if;
  raise exception 'Seleccione un perfil estadístico. Operador y Supervisor ya no están disponibles.' using errcode='23514';
 end if;
 return new;
end $$;
-- Los perfiles se modifican exclusivamente mediante la función autenticada de usuarios.
revoke insert,update,delete on public.perfiles from authenticated;
drop policy if exists perfiles_lectura on public.perfiles;
create policy perfiles_estadisticos_lectura on public.perfiles for select to authenticated using (id=auth.uid() or public.puede_crear_usuarios());

-- Resolución de la unidad registradora, no de campos policiales editables del formulario.
create or replace function public.unidad_fila_estadistica(tabla text,fila jsonb) returns text
language plpgsql stable security definer set search_path='' as $$
declare u text;
begin
 if tabla in ('fichas','personas','operativos','detenciones','intervenciones') then return fila->>'unidad';end if;
 if tabla='archivos' then select unidad into u from public.fichas where id=(fila->>'ficha_id')::uuid;
 elsif tabla in ('detencion_delitos','detencion_armas','detencion_archivos') then select unidad into u from public.detenciones where id=(fila->>'detencion_id')::uuid;
 elsif tabla='intervencion_grupo_integrantes' then select i.unidad into u from public.intervencion_grupos g join public.intervenciones i on i.id=g.intervencion_id where g.id=(fila->>'grupo_id')::uuid;
 else select unidad into u from public.intervenciones where id=(fila->>'intervencion_id')::uuid;
 end if;
 return u;
end $$;
create or replace function public.proteger_permisos_estadisticos() returns trigger
language plpgsql security definer set search_path='' as $$
declare fila jsonb; u text; u_old text;
begin
 -- Las tareas administrativas sin sesión se ejecutan con el rol de base de datos.
 if auth.uid() is null then
  if current_setting('role',true) in ('authenticated','anon') then raise exception 'Sesión requerida.' using errcode='42501';end if;
  if tg_op='DELETE' then return old;else return new;end if;
 end if;
 fila:=case when tg_op='DELETE' then to_jsonb(old) else to_jsonb(new) end;
 u:=public.unidad_fila_estadistica(tg_table_name,fila);
 if not public.puede_acceder_unidad(u) then raise exception 'La producción pertenece a otra dependencia.' using errcode='42501';end if;
 if tg_op='UPDATE' then
  if (to_jsonb(new)->>'intervencion_id') is distinct from (to_jsonb(old)->>'intervencion_id') or (to_jsonb(new)->>'detencion_id') is distinct from (to_jsonb(old)->>'detencion_id') or (to_jsonb(new)->>'grupo_id') is distinct from (to_jsonb(old)->>'grupo_id') then
   raise exception 'No se puede trasladar un registro a otro operativo o persona.' using errcode='42501';
  end if;
  u_old:=public.unidad_fila_estadistica(tg_table_name,to_jsonb(old));
  if not public.puede_acceder_unidad(u_old) then raise exception 'No puede trasladar producción de otra dependencia.' using errcode='42501';end if;
 end if;
 if tg_op='INSERT' and tg_table_name in ('detencion_delitos','detencion_armas') and not public.puede_editar_unidad(u) then
  if not exists(select 1 from public.detenciones d where d.id=(fila->>'detencion_id')::uuid and d.creado_por=auth.uid() and d.xmin=pg_catalog.pg_current_xact_id()::text::xid) then
   raise exception 'No puede añadir detalles a una detención ya guardada.' using errcode='42501';
  end if;
 end if;
 if tg_op<>'INSERT' and not public.puede_editar_unidad(u) then
  -- Añadir resultados actualiza versión/fecha del padre; nunca permite editar sus datos.
  if tg_table_name='intervenciones' and tg_op='UPDATE' and
   (to_jsonb(new)-array['version','actualizado_en','resultados_previstos'])=(to_jsonb(old)-array['version','actualizado_en','resultados_previstos']) then return new;end if;
  raise exception 'Este perfil registra y consulta. La edición o eliminación corresponde a Dirección o Jefatura.' using errcode='42501';
 end if;
 if tg_op='DELETE' then return old;else return new;end if;
end $$;

-- Adaptar permisos de producción existentes, manteniendo las validaciones del módulo.
do $adaptar$
declare r record; definition text; q text; c text; t text; scope text;
begin
 for r in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and
  (p.proname like 'guardar_%' or p.proname like 'proteger_%operativo' or p.proname in ('seleccionar_resultados_operativo','proteger_vinculo_detencion','asignar_motivo_transaccion','asignar_motivo_auditoria')) loop
  definition:=pg_get_functiondef(r.oid);
  definition:=replace(definition,'public.es_administrador()','public.es_gestor_produccion()');
  definition:=replace(definition,$txt$perfil.rol <> 'administrador'$txt$,'not public.es_gestor_produccion()');
  if r.proname='asignar_motivo_transaccion' then definition:=replace(definition,$txt$rol = 'administrador'$txt$,$txt$rol::text in ('administrador','estadistico_direccion','estadistico_jefatura')$txt$);end if;
  if r.proname='asignar_motivo_auditoria' then definition:=replace(definition,'where a.tabla = p_tabla','where a.usuario_id = auth.uid() and a.tabla = p_tabla');end if;
  -- Los RPC definer deben comprobar el alcance antes de leer o devolver datos.
  definition:=regexp_replace(definition,'public.es_gestor_produccion\(\) or \((i|operativo|existente)\.creado_por\s*=\s*auth.uid\(\) and \1\.unidad\s*=\s*public.unidad_actual\(\)\)','public.puede_acceder_unidad(\1.unidad)','g');
  execute definition;
 end loop;
 foreach t in array array['fichas','archivos','personas','operativos','detenciones','detencion_delitos','detencion_armas','detencion_archivos','intervenciones','intervencion_operativos','intervencion_drogas','intervencion_materiales','intervencion_vehiculos','intervencion_grupos','intervencion_grupo_integrantes','intervencion_menores','intervencion_requisitoriados','intervencion_notas','intervencion_victimas','intervencion_prostitucion','intervencion_complementarios'] loop
  if to_regclass('public.'||t) is null then continue;end if;
  for r in select * from pg_policies where schemaname='public' and tablename=t loop
   q:=replace(r.qual,'es_administrador()','es_gestor_produccion()');c:=replace(r.with_check,'es_administrador()','es_gestor_produccion()');
   execute format('alter policy %I on public.%I %s %s',r.policyname,t,case when q is null then '' else 'using ('||q||')' end,case when c is null then '' else 'with check ('||c||')' end);
  end loop;
  scope:=format('public.puede_acceder_unidad(public.unidad_fila_estadistica(%L,to_jsonb(%I)))',t,t);
  execute format('create policy alcance_estadistico on public.%I as restrictive for all to authenticated using (%s) with check (%s)',t,scope,scope);
  execute format('create policy gestores_edicion on public.%I for update to authenticated using (public.es_gestor_produccion() and %s) with check (public.es_gestor_produccion() and %s)',t,scope,scope);
  execute format('create policy gestores_eliminacion on public.%I for delete to authenticated using (public.es_gestor_produccion() and %s)',t,scope);
  execute format('grant update,delete on public.%I to authenticated',t);
  execute format('create trigger zz_permisos_estadisticos before insert or update or delete on public.%I for each row execute function public.proteger_permisos_estadisticos()',t);
 end loop;
end $adaptar$;

-- Las fotografías siguen el alcance de la ficha y sus permisos de edición.
do $fotos$
declare p record; regla text;
begin
 if to_regclass('storage.objects') is null then return;end if;
 regla:=$policy$bucket_id='ficha-archivos' and exists(select 1 from public.archivos a join public.fichas f on f.id=a.ficha_id where a.ruta_privada=storage.objects.name and public.puede_editar_unidad(f.unidad))$policy$;
 for p in select * from pg_policies where schemaname='storage' and tablename='objects' and cmd in ('UPDATE','DELETE') and qual like '%ficha-archivos%' loop
  execute format('alter policy %I on storage.objects using (%s) %s',p.policyname,regla,case when p.cmd='UPDATE' then 'with check ('||regla||')' else '' end);
 end loop;
end $fotos$;

revoke all on function public.es_gestor_produccion(),public.puede_crear_usuarios(),public.puede_editar_unidad(text),public.unidad_fila_estadistica(text,jsonb),public.proteger_permisos_estadisticos() from public;
grant execute on function public.es_gestor_produccion(),public.puede_crear_usuarios(),public.puede_editar_unidad(text),public.unidad_fila_estadistica(text,jsonb) to authenticated;
commit;
