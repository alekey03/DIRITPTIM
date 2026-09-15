-- Captura de borradores de las hojas 13, 14, 31, 32 y 51.
begin;
create table if not exists public.intervencion_materiales (
 id uuid primary key default gen_random_uuid(),
 intervencion_id uuid not null references public.intervenciones(id) on delete restrict,
 tipo text not null check(tipo in ('fuego','blanca','explosivo','municion','replica')),
 datos jsonb not null check(jsonb_typeof(datos)='object'),
 version integer not null default 1 check(version>0),
 creado_por uuid not null default auth.uid() references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create index if not exists materiales_operativo_idx on public.intervencion_materiales(intervencion_id,creado_en,id);
alter table public.intervencion_materiales enable row level security;
drop policy if exists materiales_lectura on public.intervencion_materiales;
create policy materiales_lectura on public.intervencion_materiales for select to authenticated using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists materiales_alta on public.intervencion_materiales;
create policy materiales_alta on public.intervencion_materiales for insert to authenticated with check(creado_por=auth.uid() and public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
drop policy if exists materiales_edicion on public.intervencion_materiales;
create policy materiales_edicion on public.intervencion_materiales for update to authenticated using(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())))) with check(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
grant select,insert,update on public.intervencion_materiales to authenticated;

create or replace function public.proteger_material_operativo() returns trigger language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; allowed text[]; k text; v jsonb; n numeric;
begin
 select * into i from public.intervenciones where id=new.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'No puede modificar materiales de este operativo.' using errcode='42501'; end if;
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.intervencion_id is distinct from old.intervencion_id or new.tipo is distinct from old.tipo or new.creado_por is distinct from old.creado_por or new.creado_en is distinct from old.creado_en then raise exception 'No se puede trasladar ni cambiar la identidad o categoría del material.' using errcode='42501'; end if;
  new.version:=old.version+1;
 else new.version:=1;new.creado_por:=auth.uid();new.creado_en:=now(); end if;
 if jsonb_typeof(new.datos) is distinct from 'object' or pg_column_size(new.datos)>60000 then raise exception 'Datos inválidos.' using errcode='22023';end if;
 allowed:=case new.tipo
 when 'fuego' then array['situacion','tipo','marca','modelo','calibre','serie','caracteristicas','fiscal_fiscalia','procedencia','registro_sucamec','denuncia','propietario','cantidad_municiones','tipo_municiones']
 when 'blanca' then array['situacion','tipo','otro_tipo']
 when 'explosivo' then array['motivo','situacion','tipo','detalle','detalle_2','cantidad']
 when 'municion' then array['cantidad']
 when 'replica' then array['situacion','tipo','fiscal_fiscalia']
 else null end;
 if allowed is null then raise exception 'Categoría inválida.' using errcode='22023'; end if;
 if new.tipo<>'municion' then allowed:=allowed || array['apellido_paterno','apellido_materno','nombres','edad','genero','nacionalidad','tipo_documento','numero_documento','tentativa','fuero','delito_general','delito_especifico','subtipo','tentativa_2','fuero_2','delito_general_2','delito_especifico_2','subtipo_2']; end if;
 for k,v in select * from jsonb_each(new.datos) loop
  if not(k=any(allowed)) or jsonb_typeof(v) not in ('string','number','null') or length(new.datos->>k)>2000 then raise exception 'Campo inválido: %',k using errcode='22023'; end if;
  if k in ('edad','cantidad','cantidad_municiones') and v<>'null'::jsonb then
   if jsonb_typeof(v)<>'number' then raise exception 'Cantidad o edad inválida.' using errcode='22023';end if;
   n:=(new.datos->>k)::numeric;
   if n<0 or n>=1000000000000 or scale(n)>6 or (k='edad' and (n>120 or n<>trunc(n))) or (k='cantidad_municiones' and n<>trunc(n)) or (k='cantidad' and (n<=0 or (new.tipo='municion' and n<>trunc(n)))) then raise exception 'Cantidad o edad fuera de rango.' using errcode='22023';end if;
  elsif v<>'null'::jsonb and jsonb_typeof(v)<>'string' then raise exception 'Se esperaba texto en %',k using errcode='22023';end if;
  if k in ('tentativa','tentativa_2') and v<>'null'::jsonb and (new.datos->>k) not in ('Sí','No') then raise exception 'Tentativa inválida.' using errcode='22023';end if;
 end loop;
 if new.tipo<>'municion' and (nullif(btrim(new.datos->>'tipo'),'') is null or nullif(btrim(new.datos->>'situacion'),'') is null) then raise exception 'Complete tipo y situación.' using errcode='22023';end if;
 if new.tipo in ('municion','explosivo') and (new.datos->>'cantidad') is null then raise exception 'Indique la cantidad.' using errcode='22023';end if;
 new.actualizado_en:=now();
 update public.intervenciones set resultados_previstos=case when 'armas'=any(resultados_previstos) then resultados_previstos else array_append(resultados_previstos,'armas') end where id=i.id;
 return new;
end $$;
drop trigger if exists proteger_material_operativo on public.intervencion_materiales;
create trigger proteger_material_operativo before insert or update on public.intervencion_materiales for each row execute function public.proteger_material_operativo();
create or replace function public.conservar_materiales_registrados() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_materiales where intervencion_id=old.id) and (new.tipo='directa' or not('armas'=any(new.resultados_previstos))) then raise exception 'El operativo ya tiene materiales registrados.' using errcode='23514';end if;
 return new;
end $$;
drop trigger if exists conservar_materiales_registrados on public.intervenciones;
create trigger conservar_materiales_registrados before update of tipo,resultados_previstos on public.intervenciones for each row execute function public.conservar_materiales_registrados();
create or replace function public.guardar_material_operativo(p_id uuid,p_intervencion uuid,p_version integer,p_tipo text,p_datos jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; m public.intervencion_materiales%rowtype;
begin
 if p_id is null or p_intervencion is null or p_version is null or p_version<0 or not public.usuario_activo() then raise exception 'Solicitud inválida.' using errcode='22023';end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'Operativo no disponible para edición.' using errcode='42501';end if;
 select * into m from public.intervencion_materiales where id=p_id for update;
 if found then
  if m.intervencion_id<>p_intervencion or m.tipo<>p_tipo then raise exception 'El registro pertenece a otro operativo o categoría.' using errcode='42501';end if;
  if m.version=p_version+1 and m.datos=p_datos then return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',i.version);end if;
  if m.version<>p_version then raise exception 'El registro cambió. Actualice antes de editar.' using errcode='40001';end if;
  update public.intervencion_materiales set datos=p_datos where id=p_id returning * into m;
 else
  if p_version<>0 then raise exception 'Registro no disponible.' using errcode='40001';end if;
  insert into public.intervencion_materiales(id,intervencion_id,tipo,datos) values(p_id,p_intervencion,p_tipo,p_datos) returning * into m;
 end if;
 return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',(select version from public.intervenciones where id=i.id));
end $$;
revoke all on function public.proteger_material_operativo(),public.conservar_materiales_registrados(),public.guardar_material_operativo(uuid,uuid,integer,text,jsonb) from public;
grant execute on function public.guardar_material_operativo(uuid,uuid,integer,text,jsonb) to authenticated;
commit;
