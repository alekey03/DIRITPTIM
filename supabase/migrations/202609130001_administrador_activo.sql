-- Preparada el 13/09/2026. No aplicada todavía a producción.
-- Conserva firma, permisos y políticas existentes; exige una cuenta activa.
begin;

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

commit;
