begin;
do $view$ declare d text;begin
 select pg_get_viewdef('public.seguimiento_ingresos'::regclass,true) into d;
 execute 'create or replace view public.seguimiento_ingresos as '||rtrim(d,E';\n ')||' union all select id,unidad,fecha,creado_en,creado_por,false from public.desapariciones';
end $view$;
revoke all on public.seguimiento_ingresos from public,anon,authenticated;
notify pgrst,'reload schema';
commit;
