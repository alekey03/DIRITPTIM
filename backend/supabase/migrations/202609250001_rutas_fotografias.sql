-- Same unit authorization, with ASCII-safe UTF-8 encoded folder names.
-- Existing files retain their paths and their existing read permissions.
begin;
alter policy "Usuarios activos suben archivos de su unidad" on storage.objects
with check (
 bucket_id = 'ficha-archivos' and public.usuario_activo()
 and ((storage.foldername(name))[1] = public.unidad_actual()
 or (storage.foldername(name))[1] = 'u-' || encode(convert_to(public.unidad_actual(), 'UTF8'), 'hex'))
);
commit;