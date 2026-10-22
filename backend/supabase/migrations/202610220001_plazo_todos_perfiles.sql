begin;
-- The registration deadline applies to every application account.
create or replace function public.validar_plazo_produccion() returns trigger
language plpgsql security invoker set search_path='' as $$
declare doc jsonb:=to_jsonb(new); anterior jsonb; fecha date; hoy date:=(current_timestamp at time zone 'America/Lima')::date; parent_id uuid;
begin
 if auth.uid() is null then
  if current_setting('role',true) in ('authenticated','anon') then raise exception 'Inicie sesión.' using errcode='42501'; end if;
  return new; -- maintenance without a user session
 end if;
 if tg_op='UPDATE' then
  anterior:=to_jsonb(old);
  if (doc->>'fecha') is not distinct from (anterior->>'fecha') and (doc->'datos'->>'fecha') is not distinct from (anterior->'datos'->>'fecha') then return new; end if;
 end if;
 parent_id:=nullif(doc->>'intervencion_id','')::uuid;
 if parent_id is not null then select i.fecha into fecha from public.intervenciones i where i.id=parent_id;
 else fecha:=coalesce(nullif(doc->>'fecha',''),nullif(doc->'datos'->>'fecha',''))::date; end if;
 if fecha is null then raise exception 'Indique la fecha de la producción.' using errcode='22023'; end if;
 if fecha<hoy-3 then raise exception 'Registro fuera de plazo: solo se admite producción de hoy y de los tres días anteriores (desde %).',to_char(hoy-3,'DD/MM/YYYY') using errcode='22023'; end if;
 if fecha>hoy then raise exception 'No se permite registrar producción con fecha futura.' using errcode='22023'; end if;
 return new;
end $$;
notify pgrst,'reload schema';
commit;
