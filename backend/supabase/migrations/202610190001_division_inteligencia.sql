-- Añade la división sin reasignar usuarios ni registros.
insert into public.dependencias_estadisticas(unidad,ambito,departamento)
values ('DIVISIÓN DE INTELIGENCIA','SEDE_CENTRAL','LIMA')
on conflict (unidad) do nothing;
