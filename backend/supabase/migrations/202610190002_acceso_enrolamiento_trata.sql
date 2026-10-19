begin;
create or replace function public.puede_acceder_enrolamiento() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.perfiles p where p.id=auth.uid() and p.activo
 and (p.rol::text='administrador' or (p.rol::text='estadistico_division'
 and p.unidad='DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS')))
$$;
revoke all on function public.puede_acceder_enrolamiento() from public;
grant execute on function public.puede_acceder_enrolamiento() to authenticated;
create policy acceso_exclusivo_enrolamiento on public.fichas as restrictive for all to authenticated
 using (public.puede_acceder_enrolamiento()) with check (public.puede_acceder_enrolamiento());
create policy acceso_exclusivo_enrolamiento on public.archivos as restrictive for all to authenticated
 using (public.puede_acceder_enrolamiento()) with check (public.puede_acceder_enrolamiento());
create policy acceso_exclusivo_enrolamiento on storage.objects as restrictive for all to authenticated
 using (bucket_id <> 'ficha-archivos' or public.puede_acceder_enrolamiento())
 with check (bucket_id <> 'ficha-archivos' or public.puede_acceder_enrolamiento());
commit;
