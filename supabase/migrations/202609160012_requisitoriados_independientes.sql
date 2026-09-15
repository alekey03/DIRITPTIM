-- Requisitoriados independientes. Preserva referencias históricas sin contar sus orígenes en Detenidos.
begin;
alter table public.intervencion_requisitoriados add column if not exists datos jsonb;
alter table public.intervencion_requisitoriados alter column detencion_id drop not null;
drop trigger if exists proteger_requisitoriado_operativo on public.intervencion_requisitoriados;
update public.intervencion_requisitoriados q set datos=jsonb_build_object(
 'fecha',d.fecha,'hora',d.hora,'apellido_paterno',p.apellido_paterno,'apellido_materno',p.apellido_materno,'nombres',p.nombres,'edad',p.edad,'genero',p.genero,'nacionalidad',p.nacionalidad,'tipo_documento',p.tipo_documento,'numero_documento',p.numero_documento,
 'tipo',q.tipo,'mas_buscado',case when q.mas_buscado then 'Sí' else 'No' end,'es_funcionario',case when d.es_funcionario_publico then 'Sí' else 'No' end,'entidad_publica',case when d.es_funcionario_publico then d.entidad_publica end,'detalle_entidad',case when d.es_funcionario_publico then d.detalle_entidad_publica end,
 'tentativa',case when c1.id is null then null when c1.es_tentativa then 'Sí' else 'No' end,'fuero',c1.fuero_ley_especial,'delito_general',c1.delito_general,'delito_especifico',c1.delito_especifico,'subtipo',c1.subtipo,
 'tentativa_2',case when c2.id is null then null when c2.es_tentativa then 'Sí' else 'No' end,'fuero_2',c2.fuero_ley_especial,'delito_general_2',c2.delito_general,'delito_especifico_2',c2.delito_especifico,'subtipo_2',c2.subtipo)
from public.detenciones d join public.personas p on p.id=d.persona_id
left join lateral(select * from public.detencion_delitos where detencion_id=d.id order by orden,id limit 1) c1 on true
left join lateral(select * from public.detencion_delitos where detencion_id=d.id order by orden,id offset 1 limit 1) c2 on true
where q.detencion_id=d.id and q.datos is null;
-- Stop atomically rather than losing information if a previous RQ has more than two crimes.
do $$begin if exists(select 1 from public.intervencion_requisitoriados q where q.detencion_id is not null and (select count(*) from public.detencion_delitos c where c.detencion_id=q.detencion_id)>2) then raise exception 'Hay requisitoriados anteriores con más de dos delitos. Revise antes de migrar.';end if;end $$;
alter table public.intervencion_requisitoriados alter column datos set not null;
create index if not exists requisitoriados_operativo_idx on public.intervencion_requisitoriados(intervencion_id,creado_en,id);
alter table public.intervencion_requisitoriados enable row level security;
drop policy if exists requisitoriados_lectura on public.intervencion_requisitoriados;
create policy requisitoriados_lectura on public.intervencion_requisitoriados for select to authenticated using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists requisitoriados_alta on public.intervencion_requisitoriados;
create policy requisitoriados_alta on public.intervencion_requisitoriados for insert to authenticated with check(creado_por=auth.uid() and public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
drop policy if exists requisitoriados_edicion on public.intervencion_requisitoriados;
create policy requisitoriados_edicion on public.intervencion_requisitoriados for update to authenticated using(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())))) with check(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
revoke all on public.intervencion_requisitoriados from public,anon,authenticated;
grant select,insert,update on public.intervencion_requisitoriados to authenticated;

create or replace function public.proteger_requisitoriado_operativo() returns trigger language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; allowed text[]; k text; v jsonb; n numeric;
begin
 select * into i from public.intervenciones where id=new.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'No puede modificar requisitoriados de este operativo.' using errcode='42501'; end if;
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.intervencion_id is distinct from old.intervencion_id or new.detencion_id is distinct from old.detencion_id or new.creado_por is distinct from old.creado_por or new.creado_en is distinct from old.creado_en then raise exception 'No se puede trasladar ni cambiar la identidad o categoría del requisitoriado.' using errcode='42501'; end if;
  new.version:=old.version+1;
 else if new.detencion_id is not null then raise exception 'Registre RQ directamente, sin detención.' using errcode='22023';end if;new.version:=1;new.creado_por:=auth.uid();new.creado_en:=now(); end if;
 if jsonb_typeof(new.datos) is distinct from 'object' or pg_column_size(new.datos)>60000 then raise exception 'Datos inválidos.' using errcode='22023';end if;
 allowed:=array['fecha','hora','apellido_paterno','apellido_materno','nombres','edad','genero','nacionalidad','tipo_documento','numero_documento','tipo','mas_buscado','es_funcionario','entidad_publica','detalle_entidad','tentativa','fuero','delito_general','delito_especifico','subtipo','tentativa_2','fuero_2','delito_general_2','delito_especifico_2','subtipo_2'];

 for k,v in select * from jsonb_each(new.datos) loop
  if not(k=any(allowed)) or jsonb_typeof(v) not in ('string','number','null') or length(new.datos->>k)>2000 then raise exception 'Campo inválido: %',k using errcode='22023';end if;
  if k='edad' and v<>'null'::jsonb then
   if jsonb_typeof(v)<>'number' then raise exception 'Edad inválida.' using errcode='22023';end if;
   n:=(new.datos->>k)::numeric;if n<0 or n>120 or trunc(n)<>n then raise exception 'Edad inválida.' using errcode='22023';end if;
  elsif v<>'null'::jsonb and jsonb_typeof(v)<>'string' then raise exception 'Se esperaba texto en %',k using errcode='22023';end if;
 end loop;

 if new.datos->>'fecha' is null or (new.datos->>'fecha') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida.' using errcode='22023';end if;
 perform (new.datos->>'fecha')::date;
 if new.datos->>'hora' is not null and (new.datos->>'hora') !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' then raise exception 'Hora inválida.' using errcode='22023';end if;

 if nullif(btrim(new.datos->>'apellido_paterno'),'') is null or nullif(btrim(new.datos->>'nombres'),'') is null then raise exception 'Complete apellidos y nombres.' using errcode='22023';end if;
 if new.datos->>'tipo' is null or new.datos->>'tipo' not in ('ORDEN DE CAPTURA','RQ INTERNACIONAL') then raise exception 'Seleccione el tipo de requisitoria.' using errcode='22023';end if;
 if new.datos->>'mas_buscado' is null or new.datos->>'mas_buscado' not in ('Sí','No') or new.datos->>'es_funcionario' is null or new.datos->>'es_funcionario' not in ('Sí','No') then raise exception 'Complete más buscado y funcionario.' using errcode='22023';end if;
 if new.datos->>'es_funcionario'='No' and (nullif(btrim(new.datos->>'entidad_publica'),'') is not null or nullif(btrim(new.datos->>'detalle_entidad'),'') is not null) then raise exception 'No corresponde entidad pública.' using errcode='22023';end if;
 for k in select unnest(array['tentativa','tentativa_2']) loop
  if new.datos->>k is not null and new.datos->>k not in ('Sí','No') then raise exception 'Tentativa inválida.' using errcode='22023';end if;
 end loop;
 new.tipo:=new.datos->>'tipo';new.mas_buscado:=(new.datos->>'mas_buscado')='Sí';
 new.actualizado_en:=now();
 update public.intervenciones set resultados_previstos=case when 'requisitoriados'=any(resultados_previstos) then resultados_previstos else array_append(resultados_previstos,'requisitoriados') end where id=i.id;
 return new;
end $$;
drop trigger if exists proteger_requisitoriado_operativo on public.intervencion_requisitoriados;
create trigger proteger_requisitoriado_operativo before insert or update on public.intervencion_requisitoriados for each row execute function public.proteger_requisitoriado_operativo();
create or replace function public.conservar_requisitoriados_registrados() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_requisitoriados where intervencion_id=old.id) and (new.tipo='directa' or not('requisitoriados'=any(new.resultados_previstos))) then raise exception 'El operativo ya tiene requisitoriados registrados.' using errcode='23514';end if;
 return new;
end $$;
drop trigger if exists conservar_requisitoriados_registrados on public.intervenciones;
create trigger conservar_requisitoriados_registrados before update of tipo,resultados_previstos on public.intervenciones for each row execute function public.conservar_requisitoriados_registrados();
create or replace function public.guardar_requisitoriado_independiente(p_id uuid,p_intervencion uuid,p_version integer,p_tipo text,p_datos jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; m public.intervencion_requisitoriados%rowtype;
begin
 if p_tipo is null or p_tipo is distinct from (p_datos->>'tipo') then raise exception 'Tipo inválido.' using errcode='22023';end if;
 if p_id is null or p_intervencion is null or p_version is null or p_version<0 or not public.usuario_activo() then raise exception 'Solicitud inválida.' using errcode='22023';end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'Operativo no disponible para edición.' using errcode='42501';end if;
 select * into m from public.intervencion_requisitoriados where id=p_id for update;
 if found then
  if m.intervencion_id<>p_intervencion then raise exception 'El registro pertenece a otro operativo o categoría.' using errcode='42501';end if;
  if m.version=p_version+1 and m.datos=p_datos then return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',i.version);end if;
  if m.version<>p_version then raise exception 'El registro cambió. Actualice antes de editar.' using errcode='40001';end if;
  update public.intervencion_requisitoriados set datos=p_datos where id=p_id returning * into m;
 else
  if p_version<>0 then raise exception 'Registro no disponible.' using errcode='40001';end if;
  insert into public.intervencion_requisitoriados(id,intervencion_id,tipo,datos) values(p_id,p_intervencion,p_tipo,p_datos) returning * into m;
 end if;
 return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',(select version from public.intervenciones where id=i.id));
end $$;
revoke all on function public.proteger_requisitoriado_operativo(),public.conservar_requisitoriados_registrados(),public.guardar_requisitoriado_independiente(uuid,uuid,integer,text,jsonb) from public;
grant execute on function public.guardar_requisitoriado_independiente(uuid,uuid,integer,text,jsonb) to authenticated;

create unique index if not exists requisitoriados_documento_operativo_idx on public.intervencion_requisitoriados(intervencion_id,upper(btrim(datos->>'tipo_documento')),upper(btrim(datos->>'numero_documento'))) where nullif(btrim(datos->>'numero_documento'),'') is not null and nullif(btrim(datos->>'tipo_documento'),'') is not null and datos->>'tipo_documento'<>'Sin documento';
create or replace view public.detenciones_reportables with (security_invoker=true) as
 select d.* from public.detenciones d where not exists(select 1 from public.intervencion_requisitoriados q where q.detencion_id=d.id);
revoke all on public.detenciones_reportables from public,anon,authenticated;
grant select on public.detenciones_reportables to authenticated;
-- Cached older clients must refresh instead of reintroducing the dependency.
create or replace function public.guardar_requisitoriado_operativo(p_id uuid,p_intervencion uuid,p_detencion uuid,p_version integer,p_tipo text,p_mas_buscado boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$begin raise exception 'Requisitoriados ahora tiene registro independiente. Actualice la página.' using errcode='22023';end $$;
create or replace function public.conservar_resultados_registrados()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if not('detenidos'=any(new.resultados_previstos)) and exists(select 1 from public.detenciones_reportables where intervencion_id=old.id) then
  raise exception 'Este operativo ya tiene detenidos registrados.' using errcode='23514'; end if;
 return new;
end; $$;
create or replace function public.seleccionar_resultados_operativo(p_id uuid,p_version integer,p_categorias text[])
returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; categorias text[];
begin
 select * into i from public.intervenciones where id=p_id for update;
 if not found or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then
  raise exception 'No puede modificar los resultados de este operativo.' using errcode='42501'; end if;
 if p_version is null or i.version<>p_version then raise exception 'El operativo cambió. Actualice antes de guardar.' using errcode='40001'; end if;
 if p_categorias is null or array_position(p_categorias,null) is not null then raise exception 'Selección inválida.' using errcode='22023'; end if;
 select coalesce(array_agg(distinct c order by c),'{}'::text[]) into categorias from unnest(p_categorias) c;
 if not('detenidos'=any(categorias)) and exists(select 1 from public.detenciones_reportables where intervencion_id=p_id) then
  raise exception 'Este operativo ya tiene detenidos registrados.' using errcode='23514'; end if;
 update public.intervenciones set resultados_previstos=categorias where id=p_id returning * into i;
 return jsonb_build_object('id',i.id,'version',i.version,'categorias',i.resultados_previstos);
end; $$;
revoke all on function public.seleccionar_resultados_operativo(uuid,integer,text[]) from public;
grant execute on function public.seleccionar_resultados_operativo(uuid,integer,text[]) to authenticated;

update public.intervenciones i set resultados_previstos=array_remove(resultados_previstos,'detenidos')
 where 'detenidos'=any(resultados_previstos) and exists(select 1 from public.intervencion_requisitoriados q where q.intervencion_id=i.id and q.detencion_id is not null)
 and not exists(select 1 from public.detenciones_reportables d where d.intervencion_id=i.id);
notify pgrst, 'reload schema';
commit;

