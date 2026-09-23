-- Auth cannot decode PostgreSQL infinity as banned_until. Keep existing bans
-- in place while replacing their representation with a finite timestamp.
begin;
update auth.users u set banned_until='2099-12-31 23:59:59+00'::timestamptz,updated_at=now()
where u.banned_until is not null and not isfinite(u.banned_until)
and exists(select 1 from public.perfiles p where p.id=u.id);

create or replace function public.sincronizar_estado_acceso_perfil()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  -- The existing profile validation and RLS decide who may change this state.
  -- AFTER triggers run only after those validations succeed, in one transaction.
  update auth.users set banned_until=case when new.activo then null
    else '2099-12-31 23:59:59+00'::timestamptz end,updated_at=now()
  where id=new.id;
  if not found then
    raise exception 'La cuenta de acceso no existe. No se modificó el perfil.' using errcode='23503';
  end if;
  return new;
end $$;
revoke all on function public.sincronizar_estado_acceso_perfil() from public,anon,authenticated;
drop trigger if exists sincronizar_estado_acceso_perfil on public.perfiles;
create trigger sincronizar_estado_acceso_perfil after insert or update of activo on public.perfiles
for each row execute function public.sincronizar_estado_acceso_perfil();
commit;
