-- Generado desde dependencias.json. No reasigna usuarios ni registros históricos.
begin;
create or replace function public.validar_dependencia_perfil()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    if new.unidad is not distinct from old.unidad and new.ambito is not distinct from old.ambito
      and new.departamento is not distinct from old.departamento and new.rol is not distinct from old.rol then
      return new;
    end if;
  end if;
  if new.rol = 'administrador' then
    if new.ambito = 'NACIONAL' and new.departamento = 'NACIONAL' and new.unidad = 'ADMINISTRACIÓN GENERAL DIRITPTIM' then return new; end if;
  elsif exists(select 1 from (values
('DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS','SEDE_CENTRAL','LIMA'),
('DIVISIÓN DE INVESTIGACIÓN DE TRÁFICO ILÍCITO DE MIGRANTES','SEDE_CENTRAL','LIMA'),
('DIVISIÓN DE INVESTIGACIÓN DE PERSONAS DESAPARECIDAS','SEDE_CENTRAL','LIMA'),
('DIVISIÓN DE INTELIGENCIA','SEDE_CENTRAL','LIMA'),
('DEPITPTIM ABANCAY','DESCONCENTRADO','APURIMAC'),
('DEPITPTIM ANDAHUAYLAS','DESCONCENTRADO','APURIMAC'),
('DEPITPTIM AREQUIPA','DESCONCENTRADO','AREQUIPA'),
('DEPITPTIM AYACUCHO','DESCONCENTRADO','AYACUCHO'),
('DEPITPTIM CAJAMARCA','DESCONCENTRADO','CAJAMARCA'),
('DEPITPTIM CHIMBOTE','DESCONCENTRADO','ANCASH'),
('DEPITPTIM CUSCO','DESCONCENTRADO','CUSCO'),
('DEPITPTIM HUANCAVELICA','DESCONCENTRADO','HUANCAVELICA'),
('DEPITPTIM HUARAZ','DESCONCENTRADO','ANCASH'),
('DEPITPTIM HUANUCO','DESCONCENTRADO','HUANUCO'),
('DEPITPTIM ICA','DESCONCENTRADO','ICA'),
('DEPITPTIM JULIACA','DESCONCENTRADO','PUNO'),
('DEPITPTIM JUNIN','DESCONCENTRADO','JUNIN'),
('DEPITPTIM LA LIBERTAD','DESCONCENTRADO','LA LIBERTAD'),
('DEPITPTIM LAMBAYEQUE','DESCONCENTRADO','LAMBAYEQUE'),
('DEPITPTIM LORETO','DESCONCENTRADO','LORETO'),
('DEPITPTIM MADRE DE DIOS','DESCONCENTRADO','MADRE DE DIOS'),
('DEPITPTIM PIURA','DESCONCENTRADO','PIURA'),
('DEPITPTIM PUNO','DESCONCENTRADO','PUNO'),
('DEPITPTIM SAN MARTIN','DESCONCENTRADO','SAN MARTIN'),
('DEPITPTIM TACNA','DESCONCENTRADO','TACNA'),
('DEPITPTIM TUMBES','DESCONCENTRADO','TUMBES'),
('DEPITPTIM UCAYALI','DESCONCENTRADO','UCAYALI')
  ) as catalogo(unidad,ambito,departamento) where catalogo.unidad=new.unidad and catalogo.ambito=new.ambito and catalogo.departamento=new.departamento) then
    return new;
  end if;
  raise exception 'Seleccione una dependencia válida para el ámbito y departamento.' using errcode='23514';
end;
$$;
drop trigger if exists validar_dependencia_perfil on public.perfiles;
create trigger validar_dependencia_perfil before insert or update on public.perfiles
for each row execute function public.validar_dependencia_perfil();
commit;
