-- Preparada el 13/09/2026. Requiere revisar/aprobar el alcance de lectura.
-- La lectura de fotografías sigue los permisos de la ficha relacionada.
-- No hace público el bucket ni permite leer archivos sin una ficha autorizada.
begin;

drop policy if exists "Consultar archivos registrados de la unidad" on public.archivos;
create policy "Consultar archivos registrados de la unidad"
on public.archivos for select to authenticated
using (
  public.usuario_activo()
  and exists (
    select 1 from public.fichas f
    where f.id = archivos.ficha_id
      and public.puede_acceder_unidad(f.unidad)
  )
);

drop policy if exists "Usuarios activos consultan archivos de su unidad" on storage.objects;
create policy "Usuarios activos consultan archivos de su unidad"
on storage.objects for select to authenticated
using (
  bucket_id = 'ficha-archivos'
  and public.usuario_activo()
  and exists (
    select 1
    from public.archivos a
    join public.fichas f on f.id = a.ficha_id
    where a.ruta_privada = objects.name
      and public.puede_acceder_unidad(f.unidad)
  )
);

commit;
