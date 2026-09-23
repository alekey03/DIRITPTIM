-- Hoja 20_BIENES FEM Y MASC: registros independientes, con datos comunes del operativo.
begin;
alter table public.intervenciones drop constraint if exists resultados_previstos_validos;
alter table public.intervenciones add constraint resultados_previstos_validos check (
 resultados_previstos <@ array['detenidos','requisitoriados','menores','victimas','prostitucion','bienes','bandas','organizaciones','armas','drogas','vehiculos','personas_ubicadas','otros']::text[]
 and array_position(resultados_previstos,null) is null
);
create table if not exists public.intervencion_bienes (
 id uuid primary key default gen_random_uuid(),
 intervencion_id uuid not null references public.intervenciones(id) on delete restrict,
 tipo text not null check(tipo in ('contrabando','economicos','salud','intelectual','cultural')),
 datos jsonb not null check(jsonb_typeof(datos)='object'),
 version integer not null default 1 check(version>0),
 creado_por uuid not null default auth.uid() references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create index if not exists bienes_operativo_idx on public.intervencion_bienes(intervencion_id,creado_en,id);
alter table public.intervencion_bienes enable row level security;
drop policy if exists bienes_lectura on public.intervencion_bienes;
create policy bienes_lectura on public.intervencion_bienes for select to authenticated using(exists(select 1 from public.intervenciones i where i.id=intervencion_id));
drop policy if exists bienes_alta on public.intervencion_bienes;
create policy bienes_alta on public.intervencion_bienes for insert to authenticated with check(creado_por=auth.uid() and public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
drop policy if exists bienes_edicion on public.intervencion_bienes;
create policy bienes_edicion on public.intervencion_bienes for update to authenticated using(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())))) with check(public.usuario_activo() and exists(select 1 from public.intervenciones i where i.id=intervencion_id and (public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual()))));
revoke all on public.intervencion_bienes from public,anon,authenticated;
grant select,insert,update on public.intervencion_bienes to authenticated;

create or replace function public.proteger_bienes_operativo() returns trigger language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; allowed text[]; k text; v jsonb; n numeric;
begin
 select * into i from public.intervenciones where id=new.intervencion_id for update;
 if not found or i.tipo not in ('operativo','megaoperativo') or not public.usuario_activo() or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'No puede modificar registros de bienes de este operativo.' using errcode='42501'; end if;
 if tg_op='UPDATE' then
  if new.id is distinct from old.id or new.intervencion_id is distinct from old.intervencion_id or new.tipo is distinct from old.tipo or new.creado_por is distinct from old.creado_por or new.creado_en is distinct from old.creado_en then raise exception 'No se puede trasladar ni cambiar la identidad o categoría de este registro.' using errcode='42501'; end if;
  new.version:=old.version+1;
 else new.version:=1;new.creado_por:=auth.uid();new.creado_en:=now(); end if;
 if jsonb_typeof(new.datos) is distinct from 'object' or pg_column_size(new.datos)>60000 then raise exception 'Datos inválidos.' using errcode='22023';end if;
 allowed:=array['fecha','hora','apellido_paterno','apellido_materno','nombres','edad','genero','nacionalidad','tipo_documento','numero_documento','situacion','especies','valor_soles'];
 if new.tipo not in ('contrabando','economicos','salud','intelectual','cultural') then raise exception 'Categoría inválida.' using errcode='22023';end if;
 for k,v in select * from jsonb_each(new.datos) loop
  if not(k=any(allowed)) or jsonb_typeof(v) not in ('string','number','null') or length(new.datos->>k)>2000 then raise exception 'Campo inválido: %',k using errcode='22023';end if;
  if k='edad' then
   if jsonb_typeof(v)<>'number' then raise exception 'Edad inválida.' using errcode='22023';end if;
   n:=(new.datos->>k)::numeric;
   if n<2 or n>100 or trunc(n)<>n then raise exception 'El catálogo de la plantilla admite edades enteras de 2 a 100 años.' using errcode='22023';end if;
  elsif k='valor_soles' and v<>'null'::jsonb then
   if jsonb_typeof(v)<>'number' then raise exception 'La valorización debe ser numérica.' using errcode='22023';end if;
   n:=(new.datos->>k)::numeric;
   if n<0 or n>999999999999.99 or n<>round(n,2) then raise exception 'Valorización fuera de rango: use soles y hasta dos decimales.' using errcode='22023';end if;
  elsif v<>'null'::jsonb and jsonb_typeof(v)<>'string' then raise exception 'Se esperaba texto en %',k using errcode='22023';end if;
 end loop;
 if nullif(btrim(new.datos->>'apellido_paterno'),'') is null or nullif(btrim(new.datos->>'nombres'),'') is null or new.datos->>'edad' is null or new.datos->>'fecha' is null then raise exception 'Complete apellidos, nombres, edad y fecha.' using errcode='22023';end if;
 if (new.datos->>'fecha') !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida.' using errcode='22023';end if;
 perform (new.datos->>'fecha')::date;
 if new.datos->>'hora' is not null and (new.datos->>'hora') !~ '^([01][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$' then raise exception 'Hora inválida.' using errcode='22023';end if;
 if new.datos->>'genero' is not null and not((new.datos->>'genero')=any(array['MASCULINO','FEMENINO'])) then raise exception 'Valor de genero inválido.' using errcode='22023';end if;
 if new.datos->>'tipo_documento' is not null and not((new.datos->>'tipo_documento')=any(array['DNI','CARNET DE EXTRANJERIA','CEDULA DE IDENTIDAD','SDPV','SALVO CONDUCTO','LAISER PASSER','PTP(PERMISO TEMPORAL PERMANENCIA)','PASAPORTE'])) then raise exception 'Valor de tipo_documento inválido.' using errcode='22023';end if;
 if new.datos->>'nacionalidad' is not null and not((new.datos->>'nacionalidad')=any(array['AFGANISTAN','ALBANIA','ALEMANIA','ANDORRA','ANGOLA','ANGUILLA','ANTARTIDA','ANTIGUA Y BARBUDA','ANTILLAS HOLANDESAS','ARABIA SAUDITA','ARGELIA','ARGENTINA','ARMENIA','ARUBA','AUSTRALIA','AUSTRIA','AZERBAYAN','BAHAMAS','BAHREIN','BANGLADESH','BARBADOS','BELGICA','BELIZE','BENIN','BERMUDAS','BHUTAN','BIELORRUSIA','BOLIVIA','BOSNIA HERZEGOVINA','BOTSWANA','BOUVET, ISLA','BRASIL','BRUNEI','BULGARIA','BURKINA FASO','BURUNDI','CABO VERDE','CAIMAN, ISLAS','CAMBOYA','CAMERUN','CANADA','CANTON Y ENDERBURY, ISLAS','CHAD','CHILE','CHINA','CHIPRE','CHRISTMAS, ISLA','CISJORDANIA','COCOS, ISLAS','COLOMBIA','COMORES','CONGO','COOK, ISLAS','COREA DEL NORTE','COREA DEL SUR','COSTA DE MARFIL','COSTA RICA','CROACIA','CUBA','DINAMARCA','DJIBUTI','DOMINICA','ECUADOR','EGIPTO','EMIRATOS ARABES UNIDOS','ERITREA','ESLOVAQUIA (REPUBLICA DE ESLOVAQUIA)','ESLOVENIA','ESPAÑA','ESTADOS FEDERADOS DE MICRONESIA','ESTADOS UNIDOS DE AMERICA (USA)','ESTONIA','ETIOPIA','EX-REPUBLICA YUGOSLAVA DE MACEDONIA','FAEROES, ISLAS','FEDERACION RUSA','FIDJI, ISLAS','FILIPINAS','FINLANDIA','FRANCE, METROPOLITAN','FRANCIA','FRANJA DE GAZA','FRENCH SOUTHERN TERRITORIES','GABON','GAMBIA','GEORGIA','GHANA','GIBRALTAR','GRANADA','GRECIA','GROENLANDIA','GUADALUPE','GUAM','GUATEMALA','GUAYANA FRANCESA','GUINEA','GUINEA ECUATORIAL','GUINEA-BISSAU','GUYANA','HAITI','HEARD Y MCDONALD, ISLAS','HONDURAS','HONG KONG','HUNGRIA','INDIA','INDICO, OCEANO (TERITORIO BRITANICO DEL)','INDONESIA','IRAN','IRAQ','IRLANDA','ISLANDIA','ISRAEL','ITALIA','JAMAICA','JAPON','JERUSALEM','JOHNSTON, ISLA','JORDANIA','KAZAJSTAN','KENIA','KIRGUIZISTAN','KIRIBATI','KUWAIT','LAOS','LESOTO','LETONIA','LIBANO','LIBERIA','LIBIA','LIECHTENSTEIN','LITUANIA','LUXEMBURGO','MACAO','MADAGASCAR','MALASIA','MALAWI','MALDIVAS, ISLAS','MALI','MALTA','MALVINAS, ISLAS','MARRUECOS','MARSHALL, ISLAS','MARTINICA','MAURICIO','MAURITANIA','MAYOTTE','MEJICO','MIDWAY, ISLAS','MONACO','MONGOLIA','MONTENEGRO','MONTSERRAT','MOZAMBIQUE','MYANMAR','NAMIBIA','NAURU','NEPAL','NICARAGUA','NIGER, REPUBLICA DE','NIGERIA','NIUE','NORFOLK, ISLA','NORTHERN MARIANA ISLANDS','NORUEGA','NUEVA CALEDONIA','NUEVA ZELANDA','OMAN','PACIFICO, ISLAS','PACIFICO, ISLAS DEL (ESTADOS UNIDOS)','PAISES BAJOS','PAKISTAN','PALAU','PALESTINA','PANAMA','PAPUA NUEVA GUINEA','PARAGUAY','PERU','PITCAIRN, ISLA','POLINESIA FRANCESA','POLONIA','PORTUGAL','PUERTO RICO','QATAR','REINA MAUD, TIERRA DE LA','REINO UNIDO','REPUBLICA CENTROAFRICANA','REPUBLICA CHECA','REPUBLICA DE MOLDAVIA','REPUBLICA DEMOCRATICA DEL CONGO','REPUBLICA DOMINICANA','REPUBLICA SUDAFRICANA','REUNION','RUANDA','RUMANIA','SAHARA OCCIDENTAL','SAINT-CHISTOPHER Y NIEVES','SALOMON, ISLAS','SALVADOR, EL','SAMOA','SAMOA NORTEAMERICANA','SAN MARINO','SAN PEDRO Y MIQUELON','SAN VICENTE Y LAS GRANADINAS','SANTA ELENA','SANTA LUCIA','SANTO TOME Y PRINCIPE','SENEGAL','SERBIA','SEYCHELLES','SIERRA LEONA','SIKKIM','SINGAPUR','SIRIA','SOMALIA','SRILANKA','SUDAN','SUECIA','SUIZA','SURINAM','SVALBARD Y JAN MAYEN, ISLA','SWAZILANDIA','TADJIKISTAN','TAILANDIA','TAIWAN','TANZANIA','TIMOR','TOGO','TOKELAU','TONGA','TRINIDAD Y TOBAGO','TUNEZ','TURKMENISTAN','TURKS Y CAICOS, ISLAS','TURQUIA','TUVALU','UCRANIA','UGANDA','UNITED STATES MINOR OUTLING ISLANDS','URUGUAY','UZBEKISTAN','VANUATU','VATICANO','VENEZUELA','VIETNAM','VIRGENES, ISLAS (ESTADOS UNIDOS)','VIRGENES, ISLAS (REINO UNIDO)','WAKE, ISLA DE','WALLIS Y FUTUNA, ISLAS','YEMEN','ZAMBIA','ZIMBABWE'])) then raise exception 'Valor de nacionalidad inválido.' using errcode='22023';end if;
 if nullif(btrim(new.datos->>'numero_documento'),'') is not null and nullif(btrim(new.datos->>'tipo_documento'),'') is null then raise exception 'Seleccione el tipo del documento registrado.' using errcode='22023';end if;
 if nullif(btrim(new.datos->>'especies'),'') is null or new.datos->>'situacion' is null or new.datos->>'situacion' not in ('DETENIDO','INTERVENIDO') then raise exception 'Complete las especies y la situación de la persona.' using errcode='22023';end if;
 new.actualizado_en:=now();
 update public.intervenciones set resultados_previstos=case when 'bienes'=any(resultados_previstos) then resultados_previstos else array_append(resultados_previstos,'bienes') end where id=i.id;
 return new;
end $$;
drop trigger if exists proteger_bienes_operativo on public.intervencion_bienes;
create trigger proteger_bienes_operativo before insert or update on public.intervencion_bienes for each row execute function public.proteger_bienes_operativo();
create or replace function public.conservar_bienes_registrados() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if exists(select 1 from public.intervencion_bienes where intervencion_id=old.id) and (new.tipo='directa' or not('bienes'=any(new.resultados_previstos))) then raise exception 'El operativo ya tiene registros de bienes.' using errcode='23514';end if;
 return new;
end $$;
drop trigger if exists conservar_bienes_registrados on public.intervenciones;
create trigger conservar_bienes_registrados before update of tipo,resultados_previstos on public.intervenciones for each row execute function public.conservar_bienes_registrados();
create or replace function public.guardar_bienes_operativo(p_id uuid,p_intervencion uuid,p_version integer,p_tipo text,p_datos jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare i public.intervenciones%rowtype; m public.intervencion_bienes%rowtype;
begin
 if p_id is null or p_intervencion is null or p_version is null or p_version<0 or not public.usuario_activo() then raise exception 'Solicitud inválida.' using errcode='22023';end if;
 select * into i from public.intervenciones where id=p_intervencion for update;
 if not found or not(public.es_administrador() or (i.creado_por=auth.uid() and i.unidad=public.unidad_actual())) then raise exception 'Operativo no disponible para edición.' using errcode='42501';end if;
 select * into m from public.intervencion_bienes where id=p_id for update;
 if found then
  if m.intervencion_id<>p_intervencion or m.tipo<>p_tipo then raise exception 'El registro pertenece a otro operativo o categoría.' using errcode='42501';end if;
  if m.version=p_version+1 and m.datos=p_datos then return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',i.version);end if;
  if m.version<>p_version then raise exception 'El registro cambió. Actualice antes de editar.' using errcode='40001';end if;
  update public.intervencion_bienes set datos=p_datos where id=p_id returning * into m;
 else
  if p_version<>0 then raise exception 'Registro no disponible.' using errcode='40001';end if;
  insert into public.intervencion_bienes(id,intervencion_id,tipo,datos) values(p_id,p_intervencion,p_tipo,p_datos) returning * into m;
 end if;
 return jsonb_build_object('id',m.id,'version',m.version,'operativo_version',(select version from public.intervenciones where id=i.id));
end $$;
revoke all on function public.proteger_bienes_operativo(),public.conservar_bienes_registrados(),public.guardar_bienes_operativo(uuid,uuid,integer,text,jsonb) from public;
grant execute on function public.guardar_bienes_operativo(uuid,uuid,integer,text,jsonb) to authenticated;
notify pgrst, 'reload schema';
commit;
