-- Estructura base creada directamente en Supabase antes de 202609060001.
-- Reconstruida el 26/10/2026 desde producción (dbneehfdhnzldzpxrmas).
-- YA EXISTE EN PRODUCCIÓN: no aplicar allí. Sirve para levantar un proyecto nuevo
-- desde cero, seguida de todas las migraciones en orden.
-- Columnas, roles y políticas posteriores las añaden las migraciones siguientes:
-- perfiles.departamento (202609120001), perfiles.ambito (202609120003),
-- perfiles.plaza_direccion (202609230020), fichas.departamento_registro (202609120002).
-- Las políticas con es_administrador() las convierte 202609230020 a es_gestor_produccion().
begin;

create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists pg_trgm with schema public;

-- Los perfiles estadísticos y visualizador se añaden en 202609230019 y 202609260002.
create type public.rol_usuario as enum ('administrador', 'supervisor', 'operador');

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete restrict,
  usuario text not null unique,
  nombres text not null,
  apellidos text not null,
  grado text,
  unidad text not null,
  rol public.rol_usuario not null default 'operador',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

create table if not exists public.fichas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  apellido_paterno text not null,
  apellido_materno text not null,
  nombres text not null,
  fecha_nacimiento date,
  edad_registro smallint check (edad_registro >= 0 and edad_registro <= 120),
  nombre_madre text,
  nombre_padre text,
  estado_civil text,
  ocupacion text,
  grado_instruccion text,
  nacionalidad text,
  redes_sociales text,
  domicilio text,
  telefono text,
  correo text,
  estatura numeric(3,2),
  cabello text,
  color_cabello text,
  caracteristicas_fisicas text,
  cicatrices_tatuajes text,
  tipo_documento text,
  numero_documento text,
  motivo_intervencion text,
  lugar_intervencion text,
  fecha_intervencion date,
  unidad text not null,
  responsable_grado text,
  responsable_apellidos text,
  responsable_nombres text,
  creado_por uuid not null references public.perfiles(id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create table if not exists public.archivos (
  id uuid primary key default gen_random_uuid(),
  ficha_id uuid not null references public.fichas(id) on delete cascade,
  tipo text not null check (tipo in ('foto_principal', 'tatuaje', 'cicatriz', 'documento')),
  ruta_privada text not null,
  creado_por uuid not null references public.perfiles(id),
  creado_en timestamptz not null default now()
);

create table if not exists public.auditoria (
  id bigint generated always as identity primary key,
  usuario_id uuid references public.perfiles(id),
  accion text not null,
  tabla text not null,
  registro_id uuid,
  fecha timestamptz not null default now()
);

create table if not exists public.auditoria_eventos (
  id bigint generated always as identity primary key,
  fecha_evento timestamptz not null default now(),
  usuario_id uuid,
  usuario text,
  usuario_nombre text,
  unidad text,
  accion text not null check (accion in ('INSERT', 'UPDATE', 'DELETE')),
  tabla text not null,
  registro_id text,
  codigo text,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  motivo text
);
create index if not exists auditoria_eventos_fecha_idx on public.auditoria_eventos (fecha_evento desc);
create index if not exists auditoria_eventos_usuario_idx on public.auditoria_eventos (usuario_id, fecha_evento desc);
create index if not exists auditoria_eventos_tabla_idx on public.auditoria_eventos (tabla, accion, fecha_evento desc);

create or replace function public.usuario_activo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select activo from public.perfiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.unidad_actual()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select unidad from public.perfiles where id = auth.uid();
$$;

-- Versión vigente de 202609130001 (la original no exigía cuenta activa).
create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid()
      and rol = 'administrador'::public.rol_usuario
      and activo = true
  );
$$;

create or replace function public.registrar_auditoria_automatica()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_anterior jsonb;
  v_nuevo jsonb;
  v_usuario_id uuid;
  v_usuario text;
  v_usuario_nombre text;
  v_unidad text;
begin
  if tg_op = 'INSERT' then v_nuevo := to_jsonb(new);
  elsif tg_op = 'UPDATE' then v_anterior := to_jsonb(old); v_nuevo := to_jsonb(new);
  else v_anterior := to_jsonb(old);
  end if;

  v_usuario_id := auth.uid();
  if v_usuario_id is not null then
    select p.usuario, concat_ws(' ', p.nombres, p.apellidos), p.unidad
      into v_usuario, v_usuario_nombre, v_unidad
    from public.perfiles p where p.id = v_usuario_id;
  end if;

  insert into public.auditoria_eventos
    (usuario_id, usuario, usuario_nombre, unidad, accion, tabla, registro_id, codigo, datos_anteriores, datos_nuevos)
  values
    (v_usuario_id, v_usuario, v_usuario_nombre,
     coalesce(v_unidad, v_nuevo->>'unidad', v_anterior->>'unidad'),
     tg_op, tg_table_name,
     coalesce(v_nuevo->>'id', v_anterior->>'id'),
     coalesce(v_nuevo->>'codigo', v_anterior->>'codigo'),
     v_anterior, v_nuevo);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$function$;

-- 202609230020 reescribe este texto: es_gestor_produccion() y filtro por usuario_id.
create or replace function public.asignar_motivo_auditoria(p_tabla text, p_registro_id text, p_motivo text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $function$
declare
  v_id bigint;
begin
  if not public.es_administrador() then
    raise exception 'Acceso reservado al administrador';
  end if;
  if nullif(btrim(p_motivo), '') is null then
    raise exception 'El motivo es obligatorio';
  end if;

  select a.id into v_id
  from public.auditoria_eventos a
  where a.tabla = p_tabla
    and a.registro_id = p_registro_id
    and a.accion in ('UPDATE', 'DELETE')
    and a.motivo is null
    and a.fecha_evento >= now() - interval '5 minutes'
  order by a.fecha_evento desc
  limit 1;

  if v_id is null then return false; end if;
  update public.auditoria_eventos set motivo = btrim(p_motivo) where id = v_id;
  return true;
end;
$function$;

revoke all on function public.registrar_auditoria_automatica() from public;
revoke all on function public.asignar_motivo_auditoria(text, text, text) from public;
grant execute on function public.asignar_motivo_auditoria(text, text, text) to authenticated;

create trigger auditoria_automatica after insert or update or delete on public.perfiles
for each row execute function public.registrar_auditoria_automatica();
create trigger auditoria_automatica after insert or update or delete on public.fichas
for each row execute function public.registrar_auditoria_automatica();
create trigger auditoria_automatica after insert or update or delete on public.archivos
for each row execute function public.registrar_auditoria_automatica();

alter table public.perfiles enable row level security;
alter table public.fichas enable row level security;
alter table public.archivos enable row level security;
alter table public.auditoria enable row level security;
alter table public.auditoria_eventos enable row level security;

revoke all on public.perfiles, public.fichas, public.archivos, public.auditoria, public.auditoria_eventos from anon, authenticated;
grant select on public.perfiles, public.auditoria, public.auditoria_eventos to authenticated;
grant select, insert, update, delete on public.fichas, public.archivos to authenticated;

-- Perfiles: se crean y modifican mediante la función administrar-usuarios.
create policy "Consultar perfil propio o administrar usuarios" on public.perfiles for select to authenticated
  using (id = auth.uid() or public.es_administrador());
create policy "Administrador crea perfiles" on public.perfiles for insert to authenticated
  with check (public.es_administrador());
create policy "Administrador actualiza perfiles" on public.perfiles for update to authenticated
  using (public.es_administrador()) with check (public.es_administrador());

-- Consulta y alta de fichas: 202609120002. Consulta de archivos: 202609130002.
create policy "Solo administrador actualiza fichas" on public.fichas for update to authenticated
  using (public.es_administrador()) with check (public.es_administrador());
create policy "Solo administrador elimina fichas" on public.fichas for delete to authenticated
  using (public.es_administrador());

create policy "Registrar archivos propios" on public.archivos for insert to authenticated
  with check (public.usuario_activo() and creado_por = auth.uid());
create policy "Solo administrador actualiza archivos" on public.archivos for update to authenticated
  using (public.es_administrador()) with check (public.es_administrador());
create policy "Solo administrador elimina archivos" on public.archivos for delete to authenticated
  using (public.es_administrador());

create policy "Administrador consulta auditoria" on public.auditoria for select to authenticated
  using (public.es_administrador());
create policy auditoria_eventos_solo_admin on public.auditoria_eventos for select to authenticated
  using (public.es_administrador());

-- Fotografías: bucket privado, 5 MB, sólo imágenes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ficha-archivos', 'ficha-archivos', false, 5242880, '{image/jpeg,image/png,image/webp}')
on conflict (id) do nothing;

-- Lectura: 202609130002. Carpetas codificadas: 202609250001. Edición/eliminación: 202609230020.
create policy "Usuarios activos suben archivos de su unidad" on storage.objects for insert to authenticated
  with check (bucket_id = 'ficha-archivos' and public.usuario_activo()
    and (storage.foldername(name))[1] = public.unidad_actual());
create policy "Autor o administrador actualiza archivos" on storage.objects for update to authenticated
  using (bucket_id = 'ficha-archivos' and public.es_administrador())
  with check (bucket_id = 'ficha-archivos' and public.es_administrador());
create policy "Autor o administrador elimina archivos" on storage.objects for delete to authenticated
  using (bucket_id = 'ficha-archivos' and public.es_administrador());

commit;
