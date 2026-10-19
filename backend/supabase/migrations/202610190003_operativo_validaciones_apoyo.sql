begin;
alter table public.intervencion_operativos add column if not exists unidades_apoyo jsonb not null default '[]'::jsonb;

-- Patch only the persistence of the new field; keep the current authorization,
-- optimistic concurrency and idempotency logic of the installed RPC intact.
do $$
declare src text;
begin
 select pg_get_functiondef('public.guardar_operativo_borrador(uuid,uuid,integer,jsonb,jsonb)'::regprocedure) into src;
 if position('unidades_apoyo' in src)=0 then
  if position('delito_especifico=o.delito_especifico where' in src)=0
    or position('delito_general,delito_especifico) values' in src)=0
    or position('o.delito_general,o.delito_especifico);' in src)=0 then
   raise exception 'La función de guardado cambió. Revise la migración antes de continuar.';
  end if;
  src:=replace(src,'''delito_general'',''delito_especifico'']','''delito_general'',''delito_especifico'',''unidades_apoyo'']');
  src:=replace(src,'if length(p_operativo->>clave)>2000 then','if length(p_operativo->>clave)>(case when clave=''unidades_apoyo'' then 30000 else 2000 end) then');
  src:=replace(src,'delito_especifico=o.delito_especifico where','delito_especifico=o.delito_especifico,unidades_apoyo=coalesce(o.unidades_apoyo,''[]''::jsonb) where');
  src:=replace(src,'delito_general,delito_especifico) values','delito_general,delito_especifico,unidades_apoyo) values');
  src:=replace(src,'o.delito_general,o.delito_especifico);','o.delito_general,o.delito_especifico,coalesce(o.unidades_apoyo,''[]''::jsonb));');
  execute src;
 end if;
end $$;

create or replace function public.validar_datos_operativo() returns trigger
language plpgsql security invoker set search_path='' as $$
declare k text; doc jsonb;
begin
 if new.tipo not in ('operativo','megaoperativo') then return new; end if;
 doc:=to_jsonb(new);
 foreach k in array array['fecha','hora','nota_sicpip','departamento','provincia','distrito','direccion_policial','direccion_especializada_region','division_policial'] loop
  if nullif(btrim(doc->>k),'') is null then
   raise exception 'Complete los datos obligatorios del operativo: %.',replace(k,'_',' ') using errcode='22023';
  end if;
 end loop;
 if new.division_policial like 'JEFDDITP%' and nullif(btrim(new.departamento_policial),'') is null then
  raise exception 'Seleccione el departamento policial que realizó el operativo.' using errcode='22023';
 end if;
 return new;
end $$;
-- Existing records are not rewritten. Version-only updates from production do not
-- retroactively invalidate earlier incomplete entries.
create or replace trigger validar_datos_operativo
before insert or update of fecha,hora,tipo,nota_sicpip,departamento,provincia,distrito,direccion_policial,direccion_especializada_region,division_policial,departamento_policial,unidad_area_equipo
on public.intervenciones for each row execute function public.validar_datos_operativo();

create or replace function public.validar_unidades_apoyo() returns trigger
language plpgsql security invoker set search_path='' as $$
declare item jsonb; k text;
begin
 if jsonb_typeof(new.unidades_apoyo) is distinct from 'array' then raise exception 'Unidades de apoyo debe ser una lista.' using errcode='22023'; end if;
 if jsonb_array_length(new.unidades_apoyo)>10 then raise exception 'Máximo 10 unidades de apoyo.' using errcode='22023'; end if;
 for item in select value from jsonb_array_elements(new.unidades_apoyo) loop
  if jsonb_typeof(item) is distinct from 'object' then raise exception 'Unidad de apoyo inválida.' using errcode='22023'; end if;
  foreach k in array array['direccion_policial','direccion_especializada_region','division_policial'] loop
   if nullif(btrim(item->>k),'') is null then raise exception 'Complete la unidad de apoyo o retírela de la lista.' using errcode='22023'; end if;
  end loop;
  for k in select jsonb_object_keys(item) loop
   if k<>all(array['direccion_policial','direccion_especializada_region','division_policial','departamento_policial','unidad_area_equipo'])
      or (item->k<>'null'::jsonb and jsonb_typeof(item->k)<>'string') or length(item->>k)>500 then
    raise exception 'Campo inválido en la unidad de apoyo.' using errcode='22023';
   end if;
  end loop;
 end loop;
 return new;
end $$;
create or replace trigger validar_unidades_apoyo before insert or update of unidades_apoyo
on public.intervencion_operativos for each row execute function public.validar_unidades_apoyo();

create or replace function public.heredar_ni_detenido() returns trigger
language plpgsql security invoker set search_path='' as $$
declare parent public.intervenciones;
begin
 if new.intervencion_id is not null then
  select * into parent from public.intervenciones where id=new.intervencion_id;
  if not found then raise exception 'El operativo no está disponible.' using errcode='42501'; end if;
  new.nota_sicpip:=parent.nota_sicpip;
  new.fecha:=parent.fecha; new.hora:=parent.hora;
  new.direccion_policial:=parent.direccion_policial;
  new.direccion_especializada_region:=parent.direccion_especializada_region;
  new.division_policial:=parent.division_policial;
  new.departamento_policial:=parent.departamento_policial;
  new.unidad_area_equipo:=parent.unidad_area_equipo;
 end if;
 return new;
end $$;
revoke all on function public.validar_datos_operativo(),public.validar_unidades_apoyo(),public.heredar_ni_detenido() from public;
-- Dates shown in production are inherited, not independently editable.
create or replace function public.heredar_fecha_produccion() returns trigger
language plpgsql security invoker set search_path='' as $$
declare parent public.intervenciones;
begin
 select * into parent from public.intervenciones where id=new.intervencion_id;
 if not found then raise exception 'El operativo no está disponible.' using errcode='42501'; end if;
 if new.datos ? 'fecha' and nullif(new.datos->>'fecha','')::date is distinct from parent.fecha then raise exception 'La fecha se toma del operativo.' using errcode='22023'; end if;
 if new.datos ? 'hora' and nullif(new.datos->>'hora','')::time is distinct from parent.hora then raise exception 'La hora se toma del operativo.' using errcode='22023'; end if;
 return new;
end $$;
do $$ declare tab text; begin
 foreach tab in array array['intervencion_complementarios','intervencion_victimas','intervencion_prostitucion','intervencion_menores','intervencion_requisitoriados'] loop
  execute format('create or replace trigger zz_heredar_fecha_produccion before insert or update of datos on public.%I for each row execute function public.heredar_fecha_produccion()',tab);
 end loop;
end $$;
revoke all on function public.heredar_fecha_produccion() from public;
notify pgrst, 'reload schema';
commit;


