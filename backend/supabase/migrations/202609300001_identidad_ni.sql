begin;
-- Extend the existing validator without replacing its authorization rules.
do $$
declare definition text;
begin
 select pg_get_functiondef('public.proteger_victima_operativo()'::regprocedure) into definition;
 if position('''numero_documento''' in definition)=0 then
  if position('''tipo_documento''];' in definition)=0 then
   raise exception 'No se reconoce el validador de víctimas; revisar antes de aplicar';
  end if;
  definition:=replace(definition,'''tipo_documento''];','''tipo_documento'',''numero_documento''];');
  execute definition;
 end if;
end $$;

create or replace function public.heredar_ni_detenido() returns trigger
language plpgsql security invoker set search_path='' as $$
declare ni text;
begin
 if new.intervencion_id is not null then
  select i.nota_sicpip into ni from public.intervenciones i where i.id=new.intervencion_id;
  if not found then raise exception 'El operativo no está disponible.' using errcode='42501'; end if;
  new.nota_sicpip:=ni;
 end if;
 return new;
end $$;
create or replace trigger zz_heredar_ni_detenido
before insert or update on public.detenciones
for each row execute function public.heredar_ni_detenido();
revoke all on function public.heredar_ni_detenido() from public;
notify pgrst, 'reload schema';
commit;
