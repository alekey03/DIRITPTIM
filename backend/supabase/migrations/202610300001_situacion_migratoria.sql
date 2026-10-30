-- Preparada el 30/10/2026. Pendiente de aplicar en producción.
-- Intervenidos por Ley de Migraciones: ley_migraciones se rotula "Situación migratoria" y
-- "Infracción" (subtipo_infraccion) sólo es obligatoria cuando la situación no es REGULAR.
-- No se validan opciones en el servidor para conservar los valores anteriores de texto libre.
-- Extranjeros expulsados no cambia. Se puede volver a ejecutar sin efectos.
begin;

do $situacion$
declare
 d text:=pg_get_functiondef('public.proteger_complementarios_operativo()'::regprocedure);
 antes text:=$txt${"key":"ley_migraciones","label":"Ley de Migraciones","type":"text","group":"registro","required":true},{"key":"subtipo_infraccion","label":"Subtipo de infracción","type":"text","group":"registro","required":true}],"chips"$txt$;
 despues text:=$txt${"key":"ley_migraciones","label":"Situación migratoria","type":"text","group":"registro","required":true},{"key":"subtipo_infraccion","label":"Infracción","type":"text","group":"registro","required":false}],"chips"$txt$;
 ancla text:=$txt$raise exception 'Seleccione el tipo de documento.' using errcode='22023';end if;$txt$;
 regla text:=$txt$
 if new.tipo='migraciones' and coalesce(new.datos->>'ley_migraciones','')<>'REGULAR' and nullif(btrim(new.datos->>'subtipo_infraccion'),'') is null then raise exception 'Complete Infracción' using errcode='22023';end if;$txt$;
begin
 if position(despues in d)=0 then
  if position(antes in d)=0 then raise exception 'No se encontró el formulario de migraciones esperado.';end if;
  d:=replace(d,antes,despues);
 end if;
 if position(regla in d)=0 then
  if position(ancla in d)=0 then raise exception 'No se encontró la validación de documento esperada.';end if;
  d:=replace(d,ancla,ancla||regla);
 end if;
 execute d;
end $situacion$;

commit;
