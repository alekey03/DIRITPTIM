-- Primera etapa: borradores de intervenciones. No migra ni elimina registros.
-- El detalle nacional es el sustento; no se exige un archivo adjunto.
begin;

create table if not exists public.intervenciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('operativo', 'megaoperativo', 'directa')),
  fecha date,
  hora time,
  departamento text,
  provincia text,
  distrito text,
  latitud numeric(10,7) check (latitud between -90 and 90),
  longitud numeric(10,7) check (longitud between -180 and 180),
  detalle_ubicacion text,
  direccion_policial text,
  direccion_especializada_region text,
  division_policial text,
  departamento_policial text,
  unidad_area_equipo text,
  nota_sicpip text,
  -- Ámbito de acceso separado del lugar del hecho y de la unidad interviniente.
  unidad text not null,
  departamento_registro text not null,
  creado_por uuid not null references public.perfiles(id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  version integer not null default 1 check (version > 0)
);

create index if not exists intervenciones_unidad_fecha_idx
  on public.intervenciones (unidad, fecha desc);

create table if not exists public.intervencion_operativos (
  intervencion_id uuid primary key references public.intervenciones(id) on delete restrict,
  resultado text check (resultado in ('positivo','negativo')),
  orden_operaciones text,
  plan_operaciones text,
  personal_cargo integer check (personal_cargo >= 0),
  vehiculos_mayores_cargo integer check (vehiculos_mayores_cargo >= 0),
  vehiculos_menores_cargo integer check (vehiculos_menores_cargo >= 0),
  personal_apoyo_pnp integer check (personal_apoyo_pnp >= 0),
  vehiculos_mayores_apoyo_pnp integer check (vehiculos_mayores_apoyo_pnp >= 0),
  vehiculos_menores_apoyo_pnp integer check (vehiculos_menores_apoyo_pnp >= 0),
  personal_apoyo_ffaa integer check (personal_apoyo_ffaa >= 0),
  vehiculos_mayores_apoyo_ffaa integer check (vehiculos_mayores_apoyo_ffaa >= 0),
  vehiculos_menores_apoyo_ffaa integer check (vehiculos_menores_apoyo_ffaa >= 0),
  otras_entidades text,
  vehiculos_mayores_otras_entidades integer check (vehiculos_mayores_otras_entidades >= 0),
  vehiculos_menores_otras_entidades integer check (vehiculos_menores_otras_entidades >= 0),
  personas_intervenidas integer check (personas_intervenidas >= 0),
  vehiculos_mayores_intervenidos integer check (vehiculos_mayores_intervenidos >= 0),
  vehiculos_menores_intervenidos integer check (vehiculos_menores_intervenidos >= 0),
  -- La plantilla no especifica aquí una unidad de medida: conservar el valor
  -- hasta definir con el usuario si solicita cantidad, condición o descripción.
  control_identidad_extranjeros text,
  intervencion_penales text,
  operativo_especificar text,
  delito_general text,
  delito_especifico text
);

create or replace function public.proteger_intervencion()
returns trigger language plpgsql set search_path = '' as $$
declare perfil public.perfiles%rowtype;
begin
  if tg_op = 'INSERT' then
    select * into perfil from public.perfiles where id = auth.uid() and activo;
    if not found then raise exception 'Se requiere una cuenta activa.' using errcode='42501'; end if;
    new.creado_por := perfil.id;
    new.unidad := perfil.unidad;
    new.departamento_registro := perfil.departamento;
    new.creado_en := now();
    new.version := 1;
  else
    if new.creado_por is distinct from old.creado_por
       or new.unidad is distinct from old.unidad
       or new.departamento_registro is distinct from old.departamento_registro
       or new.creado_en is distinct from old.creado_en then
      raise exception 'No se puede alterar la autoría ni la dependencia registradora.' using errcode='42501';
    end if;
    if new.tipo = 'directa' and exists (
      select 1 from public.intervencion_operativos where intervencion_id = old.id
    ) then
      raise exception 'La intervención ya contiene datos de un operativo.' using errcode='23514';
    end if;
    new.version := old.version + 1;
  end if;
  new.actualizado_en := now();
  return new;
end;
$$;

drop trigger if exists proteger_intervencion on public.intervenciones;
create trigger proteger_intervencion before insert or update on public.intervenciones
for each row execute function public.proteger_intervencion();

create or replace function public.validar_detalle_operativo()
returns trigger language plpgsql set search_path = '' as $$
declare clase text;
begin
  if tg_op = 'UPDATE' and new.intervencion_id is distinct from old.intervencion_id then
    raise exception 'No se puede trasladar el detalle a otra intervención.' using errcode='42501';
  end if;
  select tipo into clase from public.intervenciones where id = new.intervencion_id for update;
  if clase is null or clase not in ('operativo','megaoperativo') then
    raise exception 'El detalle debe pertenecer a un operativo.' using errcode='23514';
  end if;
  -- Versionar también modificaciones del detalle para detectar ediciones concurrentes.
  update public.intervenciones set actualizado_en = now() where id = new.intervencion_id;
  return new;
end;
$$;

drop trigger if exists validar_detalle_operativo on public.intervencion_operativos;
create trigger validar_detalle_operativo before insert or update on public.intervencion_operativos
for each row execute function public.validar_detalle_operativo();

alter table public.intervenciones enable row level security;
alter table public.intervencion_operativos enable row level security;

drop policy if exists intervenciones_lectura on public.intervenciones;
create policy intervenciones_lectura on public.intervenciones for select to authenticated
using (public.puede_acceder_unidad(unidad));
drop policy if exists intervenciones_creacion on public.intervenciones;
create policy intervenciones_creacion on public.intervenciones for insert to authenticated
with check (creado_por = auth.uid() and public.usuario_activo());
drop policy if exists intervenciones_edicion on public.intervenciones;
create policy intervenciones_edicion on public.intervenciones for update to authenticated
using (public.usuario_activo() and (public.es_administrador() or
  (creado_por = auth.uid() and unidad = public.unidad_actual())))
with check (public.usuario_activo() and (public.es_administrador() or
  (creado_por = auth.uid() and unidad = public.unidad_actual())));

drop policy if exists detalle_operativo_lectura on public.intervencion_operativos;
create policy detalle_operativo_lectura on public.intervencion_operativos for select to authenticated
using (exists (select 1 from public.intervenciones i where i.id = intervencion_id));
drop policy if exists detalle_operativo_creacion on public.intervencion_operativos;
create policy detalle_operativo_creacion on public.intervencion_operativos for insert to authenticated
with check (exists (select 1 from public.intervenciones i where i.id = intervencion_id
  and public.usuario_activo() and (public.es_administrador() or
    (i.creado_por = auth.uid() and i.unidad = public.unidad_actual()))));
drop policy if exists detalle_operativo_edicion on public.intervencion_operativos;
create policy detalle_operativo_edicion on public.intervencion_operativos for update to authenticated
using (exists (select 1 from public.intervenciones i where i.id = intervencion_id
  and public.usuario_activo() and (public.es_administrador() or
    (i.creado_por = auth.uid() and i.unidad = public.unidad_actual()))))
with check (exists (select 1 from public.intervenciones i where i.id = intervencion_id
  and public.usuario_activo() and (public.es_administrador() or
    (i.creado_por = auth.uid() and i.unidad = public.unidad_actual()))));

grant select, insert, update on public.intervenciones, public.intervencion_operativos to authenticated;
revoke all on function public.proteger_intervencion(), public.validar_detalle_operativo() from public;
commit;
