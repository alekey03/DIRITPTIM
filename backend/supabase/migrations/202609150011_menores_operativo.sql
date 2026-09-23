-- Hoja 4_MENORES: registros independientes, con datos comunes del operativo.
begin;
create table if not exists public.intervencion_menores (
 id uuid primary key default gen_random_uuid(),
 intervencion_id uuid not null references public.intervenciones(id) on delete restrict,
 tipo text not null check(tipo in ('menor')),
 datos jsonb not null check(jsonb_typeof(datos)='object'),
 version integer not null default 1 check(version>0),
 creado_por uuid not null default auth.uid() references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create index if not exists menores_operativo_idx on public.intervencion_menores(intervencion_id,creado_en,id);
alter table public.intervencion_menores enable row level security;
drop policy if exists menores_lectura on public.intervencion_menores;
create policy menores_lectura on public.intervencion_menores for select to authenticated using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists menores_alta on public.intervencion_menores;
create policy menores_alta on public.intervencion_menores for insert to authenticated with check(creado_por=auth.uid() and public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
drop policy if exists menores_edicion on public.intervencion_menores;
create policy menores_edicion on public.intervencion_menores for update to authenticated using(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())))) with check(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
revoke all on public.intervencion_menores from public,anon,authenticated;
grant select,insert,update on public.intervencion_menores to authenticated;

create or replace function public.proteger_menor_operativo() returns trigger language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; allowed text[]; k text; v jsonb; n numeric;
begin
 select * into i from public.intervenciones where id=new.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'No puede modificar menores de este operativo.' using errcode='42501'; end if;
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.intervencion_id is distinct from old.intervencion_id or new.tipo is distinct from old.tipo or new.creado_por is distinct from old.creado_por or new.creado_en is distinct from old.creado_en then raise exception 'No se puede trasladar ni cambiar la identidad o categoría del menor.' using errcode='42501'; end if;
  new.version:=old.version+1;
 else new.version:=1;new.creado_por:=auth.uid();new.creado_en:=now(); end if;
 if jsonb_typeof(new.datos) is distinct from 'object' or pg_column_size(new.datos)>60000 then raise exception 'Datos inválidos.' using errcode='22023';end if;
 allowed:=array['fecha','hora','apellido_paterno','apellido_materno','nombres','edad','genero','nacionalidad','tipo_documento','numero_documento','motivo','tentativa','fuero','delito_general','delito_especifico','subtipo','tentativa_2','fuero_2','delito_general_2','delito_especifico_2','subtipo_2','grupo','nombre_grupo','arma_categoria','arma_tipo','situacion','documento_libertad','documento_disposicion','fiscal','fiscalia','disposicion_direccion','disposicion_region','disposicion_division','disposicion_departamento','disposicion_unidad'];
 if new.tipo<>'menor' then raise exception 'Categoría inválida.' using errcode='22023';end if;
 for k,v in select * from jsonb_each(new.datos) loop
  if not(k=any(allowed)) or jsonb_typeof(v) not in ('string','number','null') or length(new.datos->>k)>2000 then raise exception 'Campo inválido: %',k using errcode='22023';end if;
  if k='edad' then
   if jsonb_typeof(v)<>'number' then raise exception 'Edad inválida.' using errcode='22023';end if;
   n:=(new.datos->>k)::numeric;
   if n<2 or n>17 or trunc(n)<>n then raise exception 'La plantilla de Menores admite edades enteras de 2 a 17 años.' using errcode='22023';end if;
  elsif v<>'null'::jsonb and jsonb_typeof(v)<>'string' then raise exception 'Se esperaba texto en %',k using errcode='22023';end if;
  if k in ('tentativa','tentativa_2') and v<>'null'::jsonb and (new.datos->>k) not in ('Sí','No') then raise exception 'Tentativa inválida.' using errcode='22023';end if;
 end loop;
 if nullif(btrim(new.datos->>'apellido_paterno'),'') is null or nullif(btrim(new.datos->>'nombres'),'') is null or new.datos->>'edad' is null or new.datos->>'fecha' is null or new.datos->>'grupo' is null then raise exception 'Complete apellidos, nombres, edad, fecha y pertenencia a grupo.' using errcode='22023';end if;
 if (new.datos->>'fecha') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida.' using errcode='22023';end if;
 perform (new.datos->>'fecha')::date;
 if new.datos->>'hora' is not null then
  if (new.datos->>'hora') !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' then raise exception 'Hora inválida.' using errcode='22023';end if;
 end if;
 if new.datos->>'motivo' is not null and new.datos->>'motivo' not in ('FLAGRANCIA','DETENCION PRELIMINAR') then raise exception 'Motivo inválido.' using errcode='22023';end if;
 if new.datos->>'grupo' not in ('Ninguno','Banda criminal','Organización criminal') then raise exception 'Grupo inválido.' using errcode='22023';end if;
 if new.datos->>'grupo'='Ninguno' and nullif(btrim(new.datos->>'nombre_grupo'),'') is not null then raise exception 'No corresponde nombre de grupo.' using errcode='22023';end if;
 if new.datos->>'grupo'<>'Ninguno' and nullif(btrim(new.datos->>'nombre_grupo'),'') is null then raise exception 'Indique el nombre del grupo.' using errcode='22023';end if;
 if new.datos->>'situacion' is not null and not((new.datos->>'situacion')=any(array['LIBERTAD SEDE POLICIAL','LIBERTAD SEDE FISCAL','LIBERTAD SEDE JUDICIAL','LIBERTAD CONDICIONAL','PRIVADO DE SU LIBERTAD_ ESTABLECIMIENTO PENITENCIARIO','PRIVADO DE SU LIBERTAD_ ESTABLECIMIENTO PENITENCIARIO (PRISION PREVENTIVA )','CONTINUA DETENIDO','PUESTO A DISPOSICION DE UNIDAD PNP','PUESTO A DISPOSICION DE FISCALIA','PUESTO A DISPOSICION DE JUZGADO'])) then raise exception 'Situación inválida.' using errcode='22023';end if;
 new.actualizado_en:=now();
 update public.intervenciones set resultados_previstos=case when 'menores'=any(resultados_previstos) then resultados_previstos else array_append(resultados_previstos,'menores') end where id=i.id;
 return new;
end $$;
drop trigger if exists proteger_menor_operativo on public.intervencion_menores;
create trigger proteger_menor_operativo before insert or update on public.intervencion_menores for each row execute function public.proteger_menor_operativo();
create or replace function public.conservar_menores_registrados() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_menores where intervencion_id=old.id) and (new.tipo='directa' or not('menores'=any(new.resultados_previstos))) then raise exception 'El operativo ya tiene menores registrados.' using errcode='23514';end if;
 return new;
end $$;
drop trigger if exists conservar_menores_registrados on public.intervenciones;
create trigger conservar_menores_registrados before update of tipo,resultados_previstos on public.intervenciones for each row execute function public.conservar_menores_registrados();
create or replace function public.guardar_menor_operativo(p_id uuid,p_intervencion uuid,p_version integer,p_tipo text,p_datos jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; m public.intervencion_menores%rowtype;
begin
 if p_id is null or p_intervencion is null or p_version is null or p_version<0 or not public.usuario_activo() then raise exception 'Solicitud inválida.' using errcode='22023';end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'Operativo no disponible para edición.' using errcode='42501';end if;
 select * into m from public.intervencion_menores where id=p_id for update;
 if found then
  if m.intervencion_id<>p_intervencion or m.tipo<>p_tipo then raise exception 'El registro pertenece a otro operativo o categoría.' using errcode='42501';end if;
  if m.version=p_version+1 and m.datos=p_datos then return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',i.version);end if;
  if m.version<>p_version then raise exception 'El registro cambió. Actualice antes de editar.' using errcode='40001';end if;
  update public.intervencion_menores set datos=p_datos where id=p_id returning * into m;
 else
  if p_version<>0 then raise exception 'Registro no disponible.' using errcode='40001';end if;
  insert into public.intervencion_menores(id,intervencion_id,tipo,datos) values(p_id,p_intervencion,p_tipo,p_datos) returning * into m;
 end if;
 return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',(select version from public.intervenciones where id=i.id));
end $$;
revoke all on function public.proteger_menor_operativo(),public.conservar_menores_registrados(),public.guardar_menor_operativo(uuid,uuid,integer,text,jsonb) from public;
grant execute on function public.guardar_menor_operativo(uuid,uuid,integer,text,jsonb) to authenticated;
-- Impide duplicar un documento conocido dentro del mismo operativo.
create unique index if not exists menores_documento_operativo_idx on public.intervencion_menores(intervencion_id,upper(btrim(datos->>'tipo_documento')),upper(btrim(datos->>'numero_documento'))) where nullif(btrim(datos->>'numero_documento'),'') is not null and nullif(btrim(datos->>'tipo_documento'),'') is not null and datos->>'tipo_documento'<>'Sin documento';
commit;
