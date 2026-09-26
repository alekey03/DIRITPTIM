begin;
create or replace function public.es_visualizador() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.perfiles where id=auth.uid() and activo and rol::text='visualizador')
$$;
revoke all on function public.es_visualizador() from public,anon;
grant execute on function public.es_visualizador() to authenticated;
-- Conservar las reglas actuales y ampliar solamente la lectura nacional.
do $$declare d text;begin
 d:=pg_get_functiondef('public.puede_acceder_unidad(text)'::regprocedure);
 d:=replace(d,'''administrador'',''estadistico_direccion''','''administrador'',''estadistico_direccion'',''visualizador''');execute d;
 d:=pg_get_functiondef('public.validar_dependencia_perfil()'::regprocedure);
 d:=replace(d,'elsif new.rol::text=''estadistico_jefatura'' then','elsif new.rol::text=''visualizador'' then new.ambito:=''NACIONAL'';new.departamento:=''NACIONAL'';new.unidad:=''VISUALIZACIÓN NACIONAL DIRITPTIM'';new.plaza_direccion:=null; elsif new.rol::text=''estadistico_jefatura'' then');execute d;
 d:=pg_get_functiondef('public.consultar_seguimiento(date)'::regprocedure);
 d:=replace(d,'''administrador'',''estadistico_direccion'',''estadistico_jefatura''','''administrador'',''estadistico_direccion'',''estadistico_jefatura'',''visualizador''');
 d:=replace(d,'''administrador'',''estadistico_direccion''','''administrador'',''estadistico_direccion'',''visualizador''');execute d;
end $$;
create or replace function public.bloquear_escritura_visualizador() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if public.es_visualizador() then raise exception 'El perfil Visualizador es de solo lectura.' using errcode='42501';end if;
 if tg_op='DELETE' then return old;else return new;end if;
end $$;
revoke all on function public.bloquear_escritura_visualizador() from public,anon,authenticated;
do $$declare t text;begin
 foreach t in array array['perfiles','fichas','archivos','personas','operativos','detenciones','detencion_delitos','detencion_armas','detencion_archivos','intervenciones','intervencion_operativos','intervencion_drogas','intervencion_materiales','intervencion_vehiculos','intervencion_grupos','intervencion_grupo_integrantes','intervencion_menores','intervencion_requisitoriados','intervencion_notas','intervencion_victimas','intervencion_prostitucion','intervencion_bienes','intervencion_complementarios','produccion_historica','desapariciones','seguimiento_declaraciones'] loop
 if to_regclass('public.'||t) is null then continue;end if;
 execute format('create trigger aa_visualizador_solo_lectura before insert or update or delete on public.%I for each row execute function public.bloquear_escritura_visualizador()',t);
 end loop;
end $$;
create policy visualizador_no_subir on storage.objects as restrictive for insert to authenticated with check(not public.es_visualizador());
create policy visualizador_no_modificar on storage.objects as restrictive for update to authenticated using(not public.es_visualizador()) with check(not public.es_visualizador());
create policy visualizador_no_borrar on storage.objects as restrictive for delete to authenticated using(not public.es_visualizador());
notify pgrst,'reload schema';
commit;
