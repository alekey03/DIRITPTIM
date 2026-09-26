begin;
create table if not exists public.operativos_eliminados_auditoria (
 id bigint generated always as identity primary key, operativo_id uuid not null,
 origen text not null, unidad text not null, usuario_id uuid not null,
 eliminado_en timestamptz not null default now(), motivo text not null, contenido jsonb not null
);
alter table public.operativos_eliminados_auditoria enable row level security;
revoke all on public.operativos_eliminados_auditoria from public,anon,authenticated;
grant select on public.operativos_eliminados_auditoria to authenticated;
create policy eliminaciones_lectura on public.operativos_eliminados_auditoria for select to authenticated
 using(exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text in ('administrador','estadistico_direccion')));
-- Tampoco puede borrar un operativo mediante una petición directa otro perfil.
create policy operativos_baja_restringida on public.intervenciones as restrictive for delete to authenticated
 using(exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text in ('administrador','estadistico_direccion')));
create or replace function public.eliminar_operativo_controlado(
 p_id uuid,p_historico boolean default false,p_confirmar boolean default false,p_firma text default null,p_motivo text default null
) returns jsonb language plpgsql security definer set search_path='' as $$
declare padre jsonb; contenido jsonb:='{}'; conteos jsonb:='{}'; datos jsonb; t text; condicion text; firma text; u text;
 tablas text[]:=array['intervencion_grupo_integrantes','intervencion_requisitoriados','intervencion_grupos','intervencion_drogas','intervencion_materiales','intervencion_vehiculos','intervencion_menores','intervencion_notas','intervencion_victimas','intervencion_prostitucion','intervencion_bienes','intervencion_complementarios','detencion_delitos','detencion_armas','detenciones','intervencion_operativos'];
begin
 if not exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text in ('administrador','estadistico_direccion')) then raise exception 'Solo el administrador y el estadístico de Dirección pueden eliminar operativos.' using errcode='42501';end if;
 perform pg_catalog.pg_advisory_xact_lock(23092026,28);
 if p_historico then
  select to_jsonb(h) into padre from public.produccion_historica h where id=p_id and tabla='intervenciones' and tipo in ('operativo','megaoperativo') for update;
 else
  select to_jsonb(i) into padre from public.intervenciones i where id=p_id and tipo in ('operativo','megaoperativo') for update;
 end if;
 if padre is null then raise exception 'El operativo ya no existe. Actualice el listado.' using errcode='P0002';end if;
 u:=padre->>'unidad';if not public.puede_editar_unidad(u) then raise exception 'No tiene permiso sobre esta dependencia.' using errcode='42501';end if;
 contenido:=jsonb_build_object('operativo',padre);
 select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]') into datos from (select * from public.produccion_historica where operativo_id=p_id and id<>p_id for update) x;
 contenido:=contenido||jsonb_build_object('produccion_historica',datos);conteos:=conteos||jsonb_build_object('produccion_historica',jsonb_array_length(datos));
 if not p_historico then
  if exists(select 1 from public.detencion_archivos a join public.detenciones d on d.id=a.detencion_id where d.intervencion_id=p_id) then raise exception 'El operativo tiene fotografías de detenidos. Su eliminación requiere revisar esos archivos antes; no se borró ningún dato.';end if;
  foreach t in array tablas loop
   if to_regclass('public.'||t) is null then continue;end if;
   condicion:=case when t='intervencion_grupo_integrantes' then 'grupo_id in (select id from public.intervencion_grupos where intervencion_id=$1)' when t in ('detencion_delitos','detencion_armas') then 'detencion_id in (select id from public.detenciones where intervencion_id=$1)' else 'intervencion_id=$1' end;
   execute format('select coalesce(jsonb_agg(to_jsonb(x) order by to_jsonb(x)::text),''[]'') from (select * from public.%I where %s for update) x',t,condicion) into datos using p_id;
   contenido:=contenido||jsonb_build_object(t,datos);conteos:=conteos||jsonb_build_object(t,jsonb_array_length(datos));
  end loop;
 end if;
 firma:=md5(contenido::text);
 if not p_confirmar then return jsonb_build_object('id',p_id,'firma',firma,'conteos',conteos);end if;
 if p_firma is distinct from firma then raise exception 'El operativo o sus resultados cambiaron. Cierre y vuelva a revisar la eliminación.' using errcode='40001';end if;
 if length(trim(coalesce(p_motivo,'')))<5 then raise exception 'Indique el motivo de la eliminación (mínimo 5 caracteres).';end if;
 insert into public.operativos_eliminados_auditoria(operativo_id,origen,unidad,usuario_id,motivo,contenido) values(p_id,case when p_historico then 'historico' else 'sistema' end,u,auth.uid(),trim(p_motivo),contenido);
 delete from public.produccion_historica where operativo_id=p_id and id<>p_id;
 if p_historico then
  delete from public.produccion_historica where id=p_id;
 else
  foreach t in array tablas loop
   if to_regclass('public.'||t) is null then continue;end if;
   condicion:=case when t='intervencion_grupo_integrantes' then 'grupo_id in (select id from public.intervencion_grupos where intervencion_id=$1)' when t in ('detencion_delitos','detencion_armas') then 'detencion_id in (select id from public.detenciones where intervencion_id=$1)' else 'intervencion_id=$1' end;
   execute format('delete from public.%I where %s',t,condicion) using p_id;
  end loop;
  delete from public.intervenciones where id=p_id;
 end if;
 return jsonb_build_object('id',p_id,'eliminado',true);
end $$;
revoke all on function public.eliminar_operativo_controlado(uuid,boolean,boolean,text,text) from public,anon;
grant execute on function public.eliminar_operativo_controlado(uuid,boolean,boolean,text,text) to authenticated;
notify pgrst,'reload schema';
commit;
