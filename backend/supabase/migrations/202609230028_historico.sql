begin;
-- El histórico mantiene una fila por fila del Excel, incluidos los registros incompletos.
create table public.produccion_historica (
 id uuid primary key, lote text not null, categoria text not null, tabla text not null,
 tipo text, hoja text not null, fila integer not null,
 unidad text references public.dependencias_estadisticas(unidad), fecha date, nota_sicpip text,
 operativo_id uuid, datos jsonb not null, original jsonb not null, pendientes jsonb not null,
 version integer not null default 1, importado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now(), actualizado_por uuid references public.perfiles(id),
 unique(lote,hoja,fila), check(jsonb_typeof(datos)='object'), check(jsonb_typeof(pendientes)='array')
);
create index on public.produccion_historica(tabla,tipo,id);
create index on public.produccion_historica(unidad,nota_sicpip,fecha);
create index on public.produccion_historica(operativo_id);
alter table public.produccion_historica enable row level security;
revoke all on public.produccion_historica from public,anon,authenticated;
grant select on public.produccion_historica to authenticated;
create policy historico_lectura on public.produccion_historica for select to authenticated
 using(public.puede_acceder_unidad(unidad));
create table public.produccion_historica_auditoria (
 id bigint generated always as identity primary key, registro_id uuid not null,
 unidad text, usuario_id uuid not null references public.perfiles(id), fecha timestamptz not null default now(),
 motivo text not null, anterior jsonb not null, posterior jsonb
);
alter table public.produccion_historica_auditoria enable row level security;
revoke all on public.produccion_historica_auditoria from public,anon,authenticated;
grant select on public.produccion_historica_auditoria to authenticated;
create policy historico_auditoria_lectura on public.produccion_historica_auditoria for select to authenticated
 using(public.puede_editar_unidad(unidad));

-- Sólo enlaza una coincidencia inequívoca de NI, dependencia y fecha compatible.
create function public.resolver_operativo_historico(p_id uuid,p_unidad text,p_ni text,p_fecha date,p_datos jsonb)
returns uuid language sql stable security definer set search_path='' as $$
 select case when count(*)=1 then (array_agg(x.id))[1] else null end
 from (
  select h.id,h.fecha,h.datos->>'departamento' departamento,h.datos->>'provincia' provincia,h.datos->>'distrito' distrito
  from public.produccion_historica h where h.tabla='intervenciones' and h.id<>p_id and h.unidad=p_unidad and h.nota_sicpip=p_ni
  union all
  select i.id,i.fecha,i.departamento,i.provincia,i.distrito from public.intervenciones i
  where i.tipo in ('operativo','megaoperativo') and i.unidad=p_unidad and i.nota_sicpip=p_ni
 ) x where p_ni is not null and p_fecha is not null and x.fecha=p_fecha
 and (nullif(p_datos->>'departamento','') is null or nullif(x.departamento,'') is null or upper(p_datos->>'departamento')=upper(x.departamento))
 and (nullif(p_datos->>'provincia','') is null or nullif(x.provincia,'') is null or upper(p_datos->>'provincia')=upper(x.provincia))
 and (nullif(p_datos->>'distrito','') is null or nullif(x.distrito,'') is null or upper(p_datos->>'distrito')=upper(x.distrito))
$$;
revoke all on function public.resolver_operativo_historico(uuid,text,text,date,jsonb) from public,anon,authenticated;

create function public.guardar_produccion_historica(p_id uuid,p_version integer,p_datos jsonb,p_unidad text,p_motivo text)
returns public.produccion_historica language plpgsql security definer set search_path='' as $$
declare oldrow public.produccion_historica; result public.produccion_historica; ni text; dt date; u text; d public.dependencias_estadisticas; flags jsonb;
begin
 if auth.uid() is null then raise exception 'Inicie sesión.' using errcode='42501';end if;
 perform pg_catalog.pg_advisory_xact_lock(23092026,28);
 select * into oldrow from public.produccion_historica where id=p_id for update;
 if not found or not public.puede_editar_unidad(oldrow.unidad) then raise exception 'No puede editar este registro.' using errcode='42501';end if;
 if oldrow.version<>p_version then raise exception 'Otra persona modificó el registro. Actualice antes de guardar.' using errcode='40001';end if;
 if length(trim(coalesce(p_motivo,'')))<5 then raise exception 'Indique el motivo de la corrección.';end if;
 if p_datos is null or jsonb_typeof(p_datos)<>'object' or octet_length(p_datos::text)>100000 then raise exception 'Datos inválidos.';end if;
 if exists(select 1 from jsonb_each(p_datos) where jsonb_typeof(value) not in ('string','number','boolean','null')) then raise exception 'Los campos deben ser valores simples.';end if;
 u:=nullif(trim(p_unidad),'');
 if not public.puede_editar_unidad(u) then raise exception 'No puede asignar esa dependencia.' using errcode='42501';end if;
 if u is not null then select * into d from public.dependencias_estadisticas where unidad=u;if not found then raise exception 'Dependencia no válida.';end if;end if;
 ni:=nullif(trim(p_datos->>'nota_sicpip'),'');
 if ni is not null and ni!~'^[0-9]+$' then raise exception 'Ingrese solamente el número de NI.';end if;
 dt:=nullif(p_datos->>'fecha','')::date;
 if u is not null then p_datos:=p_datos||jsonb_build_object('direccion_policial','DIRNIC','direccion_especializada_region','DIRCTPTIM','division_policial',case when d.ambito='DESCONCENTRADO' then 'JEFDDITP' else u end,'departamento_policial',case when d.ambito='DESCONCENTRADO' then u else null end);end if;
 flags:=coalesce((select jsonb_agg(v) from jsonb_array_elements_text(oldrow.pendientes) v where v not in ('sin_ni','ni_ambigua_o_no_numerica','fecha_pendiente','dependencia_pendiente','dependencia_contradictoria','operativo_pendiente')),'[]'::jsonb);
 if u is null then flags:=flags||'"dependencia_pendiente"'::jsonb;end if;
 if dt is null then flags:=flags||'"fecha_pendiente"'::jsonb;end if;
 if ni is null then flags:=flags||'"sin_ni"'::jsonb;end if;
 update public.produccion_historica set datos=p_datos,unidad=u,fecha=dt,nota_sicpip=ni,
 operativo_id=case when tabla='intervenciones' then null else public.resolver_operativo_historico(id,u,ni,dt,p_datos) end,
 pendientes=flags,version=version+1,actualizado_en=now(),actualizado_por=auth.uid() where id=p_id returning * into result;
 if result.tabla<>'intervenciones' and result.operativo_id is null then update public.produccion_historica set pendientes=pendientes||'"operativo_pendiente"'::jsonb where id=p_id returning * into result;end if;
 insert into public.produccion_historica_auditoria(registro_id,unidad,usuario_id,motivo,anterior,posterior)
 values(p_id,oldrow.unidad,auth.uid(),trim(p_motivo),to_jsonb(oldrow),to_jsonb(result));
 -- Si cambia la NI del operativo, recalcular únicamente sus candidatos afectados.
 if result.tabla='intervenciones' then
  update public.produccion_historica h set operativo_id=public.resolver_operativo_historico(h.id,h.unidad,h.nota_sicpip,h.fecha,h.datos),version=h.version+1,actualizado_en=now()
  where h.tabla<>'intervenciones' and ((h.unidad=oldrow.unidad and h.nota_sicpip=oldrow.nota_sicpip) or (h.unidad=result.unidad and h.nota_sicpip=result.nota_sicpip) or h.operativo_id=p_id);
 end if;
 return result;
end $$;
revoke all on function public.guardar_produccion_historica(uuid,integer,jsonb,text,text) from public,anon,authenticated;
grant execute on function public.guardar_produccion_historica(uuid,integer,jsonb,text,text) to authenticated;
commit;
