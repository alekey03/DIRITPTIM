begin;
-- Preserve every category that already contains records, across all modules.
create or replace function public.categorias_con_registros(p_id uuid) returns text[]
language sql stable security invoker set search_path='' as $$
 select coalesce(array_agg(distinct categoria),'{}'::text[]) from (
 select 'detenidos' categoria from public.detenciones_reportables where intervencion_id=p_id
 union all select 'drogas' from public.intervencion_drogas where intervencion_id=p_id
 union all select 'armas' from public.intervencion_materiales where intervencion_id=p_id
 union all select 'vehiculos' from public.intervencion_vehiculos where intervencion_id=p_id
 union all select case when tipo='banda' then 'bandas' else 'organizaciones' end from public.intervencion_grupos where intervencion_id=p_id
 union all select 'menores' from public.intervencion_menores where intervencion_id=p_id
 union all select 'requisitoriados' from public.intervencion_requisitoriados where intervencion_id=p_id
 union all select 'victimas' from public.intervencion_victimas where intervencion_id=p_id
 union all select 'prostitucion' from public.intervencion_prostitucion where intervencion_id=p_id
 union all select tipo from public.intervencion_complementarios where intervencion_id=p_id
 ) t;
$$;
revoke all on function public.categorias_con_registros(uuid) from public;
grant execute on function public.categorias_con_registros(uuid) to authenticated;
do $$ declare src text; anchor text:='if not(''detenidos''=any(categorias))'; begin
 select pg_get_functiondef('public.seleccionar_resultados_operativo(uuid,integer,text[])'::regprocedure) into src;
 if position('categorias_con_registros' in src)=0 then
  if position(anchor in src)=0 then raise exception 'Revisar función de selección: estructura desconocida.'; end if;
  src:=replace(src,anchor,'select coalesce(array_agg(distinct c order by c),array[]::text[]) into categorias from unnest(categorias || public.categorias_con_registros(p_id)) c; '||anchor);
  execute src;
 end if;
end $$;

create or replace function public.validar_plazo_produccion() returns trigger
language plpgsql security invoker set search_path='' as $$
declare doc jsonb:=to_jsonb(new); anterior jsonb; fecha date; hoy date:=(current_timestamp at time zone 'America/Lima')::date; parent_id uuid;
begin
 if auth.uid() is null then
  if current_setting('role',true) in ('authenticated','anon') then raise exception 'Inicie sesión.' using errcode='42501'; end if;
  return new; -- maintenance without a user session
 end if;
 if exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text='administrador') then return new; end if;
 if tg_op='UPDATE' then
  anterior:=to_jsonb(old);
  if (doc->>'fecha') is not distinct from (anterior->>'fecha') and (doc->'datos'->>'fecha') is not distinct from (anterior->'datos'->>'fecha') then return new; end if;
 end if;
 parent_id:=nullif(doc->>'intervencion_id','')::uuid;
 if parent_id is not null then select i.fecha into fecha from public.intervenciones i where i.id=parent_id;
 else fecha:=coalesce(nullif(doc->>'fecha',''),nullif(doc->'datos'->>'fecha',''))::date; end if;
 if fecha is null then raise exception 'Indique la fecha de la producción.' using errcode='22023'; end if;
 if fecha<hoy-3 then raise exception 'Registro fuera de plazo: solo se admite producción de hoy y de los tres días anteriores (desde %). Contacte al administrador para regularizarla.',to_char(hoy-3,'DD/MM/YYYY') using errcode='22023'; end if;
 if fecha>hoy then raise exception 'No se permite registrar producción con fecha futura.' using errcode='22023'; end if;
 return new;
end $$;
do $$ declare tab text; begin
 foreach tab in array array['intervenciones','detenciones','intervencion_operativos','intervencion_drogas','intervencion_materiales','intervencion_vehiculos','intervencion_grupos','intervencion_menores','intervencion_requisitoriados','intervencion_victimas','intervencion_prostitucion','intervencion_complementarios'] loop
  execute format('create or replace trigger zzz_validar_plazo_produccion before insert or update on public.%I for each row execute function public.validar_plazo_produccion()',tab);
 end loop;
end $$;
revoke all on function public.validar_plazo_produccion() from public;
notify pgrst,'reload schema';
commit;
