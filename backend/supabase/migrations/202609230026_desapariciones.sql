begin;
create table public.desapariciones (
 id uuid primary key default gen_random_uuid(),
 unidad text not null references public.dependencias_estadisticas(unidad),
 fecha date not null,
 datos jsonb not null check(jsonb_typeof(datos)='object'),
 version integer not null default 1,
 creado_por uuid not null default auth.uid() references public.perfiles(id),
 creado_en timestamptz not null default now(),
 actualizado_en timestamptz not null default now()
);
create index desapariciones_unidad_fecha on public.desapariciones(unidad,fecha);
alter table public.desapariciones enable row level security;
revoke all on public.desapariciones from public,anon,authenticated;
grant select,insert,update,delete on public.desapariciones to authenticated;
create policy desapariciones_lectura on public.desapariciones for select to authenticated using(public.puede_acceder_unidad(unidad));
create policy desapariciones_alta on public.desapariciones for insert to authenticated with check(public.puede_acceder_unidad(unidad) and creado_por=auth.uid());
create policy desapariciones_edicion on public.desapariciones for update to authenticated using(public.puede_editar_unidad(unidad)) with check(public.puede_editar_unidad(unidad));
create policy desapariciones_baja on public.desapariciones for delete to authenticated using(public.puede_editar_unidad(unidad));
create function public.validar_desaparicion() returns trigger language plpgsql security invoker set search_path='' as $$
declare spec jsonb:=$schema$[{"key": "fecha", "label": "Fecha de la denuncia", "type": "date", "required": true, "group": "registro"}, {"key": "tipo_denuncia", "label": "Tipo de denuncia", "type": "text", "required": false, "group": "registro"}, {"key": "numero_denuncia", "label": "N.º de denuncia o antecedente", "type": "text", "required": false, "group": "registro"}, {"key": "procedencia", "label": "Procedencia", "type": "text", "required": false, "group": "registro"}, {"key": "fecha_hecho", "label": "Fecha de ocurrido el hecho", "type": "date", "required": false, "group": "registro"}, {"key": "apellido_paterno", "label": "Apellido paterno", "type": "text", "required": true, "group": "registro"}, {"key": "apellido_materno", "label": "Apellido materno", "type": "text", "required": false, "group": "registro"}, {"key": "nombres", "label": "Nombres", "type": "text", "required": true, "group": "registro"}, {"key": "edad", "label": "Edad", "type": "number", "required": false, "group": "registro", "min": 0, "max": 120, "step": 1}, {"key": "genero", "label": "Sexo", "type": "text", "required": false, "group": "registro", "options": ["MASCULINO", "FEMENINO"]}, {"key": "nacionalidad", "label": "Nacionalidad", "type": "text", "required": false, "group": "registro", "options": ["AFGANISTAN", "ALBANIA", "ALEMANIA", "ANDORRA", "ANGOLA", "ANGUILLA", "ANTARTIDA", "ANTIGUA Y BARBUDA", "ANTILLAS HOLANDESAS", "ARABIA SAUDITA", "ARGELIA", "ARGENTINA", "ARMENIA", "ARUBA", "AUSTRALIA", "AUSTRIA", "AZERBAYAN", "BAHAMAS", "BAHREIN", "BANGLADESH", "BARBADOS", "BELGICA", "BELIZE", "BENIN", "BERMUDAS", "BHUTAN", "BIELORRUSIA", "BOLIVIA", "BOSNIA HERZEGOVINA", "BOTSWANA", "BOUVET, ISLA", "BRASIL", "BRUNEI", "BULGARIA", "BURKINA FASO", "BURUNDI", "CABO VERDE", "CAIMAN, ISLAS", "CAMBOYA", "CAMERUN", "CANADA", "CANTON Y ENDERBURY, ISLAS", "CHAD", "CHILE", "CHINA", "CHIPRE", "CHRISTMAS, ISLA", "CISJORDANIA", "COCOS, ISLAS", "COLOMBIA", "COMORES", "CONGO", "COOK, ISLAS", "COREA DEL NORTE", "COREA DEL SUR", "COSTA DE MARFIL", "COSTA RICA", "CROACIA", "CUBA", "DINAMARCA", "DJIBUTI", "DOMINICA", "ECUADOR", "EGIPTO", "EMIRATOS ARABES UNIDOS", "ERITREA", "ESLOVAQUIA (REPUBLICA DE ESLOVAQUIA)", "ESLOVENIA", "ESPAÑA", "ESTADOS FEDERADOS DE MICRONESIA", "ESTADOS UNIDOS DE AMERICA (USA)", "ESTONIA", "ETIOPIA", "EX-REPUBLICA YUGOSLAVA DE MACEDONIA", "FAEROES, ISLAS", "FEDERACION RUSA", "FIDJI, ISLAS", "FILIPINAS", "FINLANDIA", "FRANCE, METROPOLITAN", "FRANCIA", "FRANJA DE GAZA", "FRENCH SOUTHERN TERRITORIES", "GABON", "GAMBIA", "GEORGIA", "GHANA", "GIBRALTAR", "GRANADA", "GRECIA", "GROENLANDIA", "GUADALUPE", "GUAM", "GUATEMALA", "GUAYANA FRANCESA", "GUINEA", "GUINEA ECUATORIAL", "GUINEA-BISSAU", "GUYANA", "HAITI", "HEARD Y MCDONALD, ISLAS", "HONDURAS", "HONG KONG", "HUNGRIA", "INDIA", "INDICO, OCEANO (TERITORIO BRITANICO DEL)", "INDONESIA", "IRAN", "IRAQ", "IRLANDA", "ISLANDIA", "ISRAEL", "ITALIA", "JAMAICA", "JAPON", "JERUSALEM", "JOHNSTON, ISLA", "JORDANIA", "KAZAJSTAN", "KENIA", "KIRGUIZISTAN", "KIRIBATI", "KUWAIT", "LAOS", "LESOTO", "LETONIA", "LIBANO", "LIBERIA", "LIBIA", "LIECHTENSTEIN", "LITUANIA", "LUXEMBURGO", "MACAO", "MADAGASCAR", "MALASIA", "MALAWI", "MALDIVAS, ISLAS", "MALI", "MALTA", "MALVINAS, ISLAS", "MARRUECOS", "MARSHALL, ISLAS", "MARTINICA", "MAURICIO", "MAURITANIA", "MAYOTTE", "MEJICO", "MIDWAY, ISLAS", "MONACO", "MONGOLIA", "MONTENEGRO", "MONTSERRAT", "MOZAMBIQUE", "MYANMAR", "NAMIBIA", "NAURU", "NEPAL", "NICARAGUA", "NIGER, REPUBLICA DE", "NIGERIA", "NIUE", "NORFOLK, ISLA", "NORTHERN MARIANA ISLANDS", "NORUEGA", "NUEVA CALEDONIA", "NUEVA ZELANDA", "OMAN", "PACIFICO, ISLAS", "PACIFICO, ISLAS DEL (ESTADOS UNIDOS)", "PAISES BAJOS", "PAKISTAN", "PALAU", "PALESTINA", "PANAMA", "PAPUA NUEVA GUINEA", "PARAGUAY", "PERU", "PITCAIRN, ISLA", "POLINESIA FRANCESA", "POLONIA", "PORTUGAL", "PUERTO RICO", "QATAR", "REINA MAUD, TIERRA DE LA", "REINO UNIDO", "REPUBLICA CENTROAFRICANA", "REPUBLICA CHECA", "REPUBLICA DE MOLDAVIA", "REPUBLICA DEMOCRATICA DEL CONGO", "REPUBLICA DOMINICANA", "REPUBLICA SUDAFRICANA", "REUNION", "RUANDA", "RUMANIA", "SAHARA OCCIDENTAL", "SAINT-CHISTOPHER Y NIEVES", "SALOMON, ISLAS", "SALVADOR, EL", "SAMOA", "SAMOA NORTEAMERICANA", "SAN MARINO", "SAN PEDRO Y MIQUELON", "SAN VICENTE Y LAS GRANADINAS", "SANTA ELENA", "SANTA LUCIA", "SANTO TOME Y PRINCIPE", "SENEGAL", "SERBIA", "SEYCHELLES", "SIERRA LEONA", "SIKKIM", "SINGAPUR", "SIRIA", "SOMALIA", "SRILANKA", "SUDAN", "SUECIA", "SUIZA", "SURINAM", "SVALBARD Y JAN MAYEN, ISLA", "SWAZILANDIA", "TADJIKISTAN", "TAILANDIA", "TAIWAN", "TANZANIA", "TIMOR", "TOGO", "TOKELAU", "TONGA", "TRINIDAD Y TOBAGO", "TUNEZ", "TURKMENISTAN", "TURKS Y CAICOS, ISLAS", "TURQUIA", "TUVALU", "UCRANIA", "UGANDA", "UNITED STATES MINOR OUTLING ISLANDS", "URUGUAY", "UZBEKISTAN", "VANUATU", "VATICANO", "VENEZUELA", "VIETNAM", "VIRGENES, ISLAS (ESTADOS UNIDOS)", "VIRGENES, ISLAS (REINO UNIDO)", "WAKE, ISLA DE", "WALLIS Y FUTUNA, ISLAS", "YEMEN", "ZAMBIA", "ZIMBABWE"]}, {"key": "distrito", "label": "Distrito del hecho", "type": "text", "required": false, "group": "registro"}, {"key": "departamento", "label": "Departamento del hecho", "type": "text", "required": false, "group": "registro"}, {"key": "instructor", "label": "Instructor", "type": "text", "required": false, "group": "registro"}, {"key": "equipo", "label": "Equipo", "type": "text", "required": false, "group": "registro"}, {"key": "estado_denuncia", "label": "Estado de la denuncia", "type": "text", "required": false, "group": "registro"}, {"key": "numero_informe", "label": "N.º de informe formulado", "type": "text", "required": false, "group": "registro"}, {"key": "fecha_informe", "label": "Fecha del informe", "type": "date", "required": false, "group": "registro"}, {"key": "destino_documento", "label": "Destino del documento", "type": "text", "required": false, "group": "registro"}, {"key": "modalidad", "label": "Modalidad", "type": "text", "required": false, "group": "registro"}, {"key": "situacion", "label": "Situación de la persona", "type": "text", "required": false, "group": "registro"}, {"key": "fecha_ubicacion", "label": "Fecha de ubicación", "type": "date", "required": false, "group": "registro"}, {"key": "distrito_ubicacion", "label": "Distrito de ubicación", "type": "text", "required": false, "group": "registro"}]$schema$::jsonb; field jsonb;k text;v jsonb;n numeric;d date;
begin
 if not public.usuario_activo() or not public.puede_acceder_unidad(new.unidad) then raise exception 'Dependencia no autorizada.' using errcode='42501';end if;
 if tg_op='UPDATE' then
  if not public.puede_editar_unidad(old.unidad) or new.id<>old.id or new.unidad<>old.unidad or new.creado_por<>old.creado_por or new.creado_en<>old.creado_en then raise exception 'No puede editar o trasladar esta denuncia.' using errcode='42501';end if;
  new.version:=old.version+1;
 else new.version:=1;new.creado_por:=auth.uid();new.creado_en:=now();end if;
 if jsonb_typeof(new.datos) is distinct from 'object' or pg_column_size(new.datos)>60000 then raise exception 'Datos inválidos.' using errcode='22023';end if;
 for k,v in select * from jsonb_each(new.datos) loop
  select value into field from jsonb_array_elements(spec) where value->>'key'=k;
  if field is null or jsonb_typeof(v) not in ('string','number','null') or length(new.datos->>k)>2000 then raise exception 'Campo inválido: %',k using errcode='22023';end if;
  if v='null'::jsonb then continue;end if;
  if field->>'type'='number' then
   if jsonb_typeof(v)<>'number' then raise exception 'Número inválido.' using errcode='22023';end if;
   n:=(new.datos->>k)::numeric;
   if n<0 or n>120 or mod(n,1)<>0 then raise exception 'Edad inválida.' using errcode='22023';end if;
  else
   if jsonb_typeof(v)<>'string' then raise exception 'Texto inválido.' using errcode='22023';end if;
   if field->>'type'='date' then
    if new.datos->>k !~ '^\d{4}-\d{2}-\d{2}$' then raise exception 'Fecha inválida.' using errcode='22023';end if;
    d:=(new.datos->>k)::date;
    if d>(now() at time zone 'America/Lima')::date then raise exception 'No se admiten fechas futuras.' using errcode='22023';end if;
   end if;
  end if;
  if field ? 'options' and not(field->'options' @> jsonb_build_array(v)) then raise exception 'Opción inválida: %',k using errcode='22023';end if;
 end loop;
 for field in select * from jsonb_array_elements(spec) loop
  if (field->>'required')::boolean and nullif(btrim(new.datos->>(field->>'key')),'') is null then raise exception 'Complete %',field->>'label' using errcode='22023';end if;
 end loop;
 new.fecha:=(new.datos->>'fecha')::date;
 if (new.datos->>'fecha_hecho')::date>new.fecha then raise exception 'El hecho no puede ser posterior a la denuncia.' using errcode='22023';end if;
 if (new.datos->>'fecha_ubicacion')::date<(new.datos->>'fecha_hecho')::date then raise exception 'La ubicación no puede ser anterior al hecho.' using errcode='22023';end if;
 new.actualizado_en:=now();return new;
end $$;
create trigger validar_desaparicion before insert or update on public.desapariciones for each row execute function public.validar_desaparicion();
create table public.desapariciones_historial(
 id bigint generated always as identity primary key,registro_id uuid not null,unidad text not null,
 usuario_id uuid not null,accion text not null,fecha timestamptz not null default now(),anterior jsonb,nuevo jsonb
);
alter table public.desapariciones_historial enable row level security;
revoke all on public.desapariciones_historial from public,anon,authenticated;
grant select on public.desapariciones_historial to authenticated;
create policy desapariciones_historial_lectura on public.desapariciones_historial for select to authenticated using(public.puede_editar_unidad(unidad));
create function public.auditar_desaparicion() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.desapariciones_historial(registro_id,unidad,usuario_id,accion,anterior,nuevo)
 values(coalesce(new.id,old.id),coalesce(new.unidad,old.unidad),auth.uid(),tg_op,case when tg_op<>'INSERT' then to_jsonb(old) end,case when tg_op<>'DELETE' then to_jsonb(new) end);
 return null;
end $$;
create trigger auditar_desaparicion after insert or update or delete on public.desapariciones for each row execute function public.auditar_desaparicion();
create function public.guardar_desaparicion(p_id uuid,p_version integer,p_unidad text,p_datos jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.desapariciones%rowtype;
begin
 if p_id is null or p_version is null or p_version<0 or not public.usuario_activo() then raise exception 'Solicitud inválida.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into r from public.desapariciones where id=p_id;
 if found then
  if r.unidad<>p_unidad then raise exception 'No puede trasladar la denuncia.' using errcode='42501';end if;
  if r.version=p_version+1 and r.datos=p_datos then return jsonb_build_object('id',r.id,'version',r.version);end if;
  if r.version<>p_version then raise exception 'La denuncia cambió. Actualice antes de editar.' using errcode='40001';end if;
  if not public.puede_editar_unidad(r.unidad) then raise exception 'Este perfil solo registra y consulta.' using errcode='42501';end if;
  update public.desapariciones set datos=p_datos where id=p_id and version=p_version returning * into r;
  if not found then raise exception 'La denuncia cambió. Actualice antes de editar.' using errcode='40001';end if;
 else
  if p_version<>0 then raise exception 'Denuncia no disponible.' using errcode='40001';end if;
  insert into public.desapariciones(id,unidad,fecha,datos) values(p_id,p_unidad,(p_datos->>'fecha')::date,p_datos) returning * into r;
 end if;
 return jsonb_build_object('id',r.id,'version',r.version);
end $$;
revoke all on function public.validar_desaparicion(),public.auditar_desaparicion(),public.guardar_desaparicion(uuid,integer,text,jsonb) from public;
grant execute on function public.guardar_desaparicion(uuid,integer,text,jsonb) to authenticated;
notify pgrst,'reload schema';
commit;
