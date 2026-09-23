const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const catalog = JSON.parse(fs.readFileSync(path.join(root,'datos/dependencias.json'),'utf8'));
const declaration = `const DEPENDENCIAS_INSTITUCIONALES = ${JSON.stringify(catalog,null,2)};`;
fs.writeFileSync(path.join(root,'frontend/js/dependencias.js'), `// Generado desde dependencias.json por scripts/generar-dependencias.cjs\n${declaration}\n`);
const edgePath = path.join(root,'backend/supabase/functions/administrar-usuarios/index.ts');
const edge = fs.readFileSync(edgePath,'utf8');
const block = `// INICIO CATALOGO GENERADO\n${declaration}\n// FIN CATALOGO GENERADO`;
fs.writeFileSync(edgePath, edge.includes('// INICIO CATALOGO GENERADO') ? edge.replace(/\/\/ INICIO CATALOGO GENERADO[\s\S]*?\/\/ FIN CATALOGO GENERADO/,block) : edge.replace('export default {',`${block}\n\nexport default {`));
const tuples = catalog.map(d=>`('${d.unidad.replaceAll("'","''")}','${d.ambito}','${d.departamento}')`).join(',\n');
fs.writeFileSync(path.join(root,'backend/supabase/migrations/202609150001_dependencias_institucionales.sql'),`-- Generado desde dependencias.json. No reasigna usuarios ni registros históricos.
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
${tuples}
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
`);
