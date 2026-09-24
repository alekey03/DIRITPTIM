window.PRODUCCION_CATALOGO = {
  "version": 2,
  "hojas": [
    {
      "nombre": "1_OPERATIVOS",
      "tabla": "intervenciones",
      "raiz": "intervencion",
      "tipo": "operativo",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero_fila",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes_fecha",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "OPERATIVO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_5"
        },
        {
          "encabezado": "EL RESULTADO:POSITIVO - NEGATIVO",
          "tipo": "text",
          "origen": "operativo.resultado",
          "historicoKey": "resultado"
        },
        {
          "encabezado": "ORDEN DE OPERACIONES",
          "tipo": "text",
          "origen": "operativo.orden_operaciones",
          "historicoKey": "orden_operaciones"
        },
        {
          "encabezado": "PLAN DE OPERACIONES",
          "tipo": "text",
          "origen": "operativo.plan_operaciones",
          "historicoKey": "plan_operaciones"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_12"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_13"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_14"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_15"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_16"
        },
        {
          "encabezado": "MOTIVO DEL OPERATIVO \n(FLAGRANCIA-MEDIDA LIMITATIVA)",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_17"
        },
        {
          "encabezado": "TIPO DE OPERATIVO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_18"
        },
        {
          "encabezado": "PERSONAL A CARGO CANTIDAD",
          "tipo": "number",
          "origen": "operativo.personal_cargo",
          "historicoKey": "personal_cargo"
        },
        {
          "encabezado": "VEHICULO MAYOR A CARGO",
          "tipo": "number",
          "origen": "operativo.vehiculos_mayores_cargo",
          "historicoKey": "vehiculos_mayores_cargo"
        },
        {
          "encabezado": "VEHICULO MENOR A CARGO",
          "tipo": "number",
          "origen": "operativo.vehiculos_menores_cargo",
          "historicoKey": "vehiculos_menores_cargo"
        },
        {
          "encabezado": "PERSONAL PNP DE APOYO",
          "tipo": "number",
          "origen": "operativo.personal_apoyo_pnp",
          "historicoKey": "personal_apoyo_pnp"
        },
        {
          "encabezado": "VEHICULO MAYOR DE APOYO",
          "tipo": "number",
          "origen": "operativo.vehiculos_mayores_apoyo_pnp",
          "historicoKey": "vehiculos_mayores_apoyo_pnp"
        },
        {
          "encabezado": "VEHICULO MENOR   DE APOYO",
          "tipo": "number",
          "origen": "operativo.vehiculos_menores_apoyo_pnp",
          "historicoKey": "vehiculos_menores_apoyo_pnp"
        },
        {
          "encabezado": "PERSONAL FF.AA DE APOYO",
          "tipo": "number",
          "origen": "operativo.personal_apoyo_ffaa",
          "historicoKey": "personal_apoyo_ffaa"
        },
        {
          "encabezado": "VEHICULO MAYOR FF.AA DE APOYO",
          "tipo": "number",
          "origen": "operativo.vehiculos_mayores_apoyo_ffaa",
          "historicoKey": "vehiculos_mayores_apoyo_ffaa"
        },
        {
          "encabezado": "VEHICULO MENOR FF.AA DE APOYO",
          "tipo": "number",
          "origen": "operativo.vehiculos_menores_apoyo_ffaa",
          "historicoKey": "vehiculos_menores_apoyo_ffaa"
        },
        {
          "encabezado": "OTRAS ENTIDADES",
          "tipo": "text",
          "origen": "operativo.otras_entidades",
          "historicoKey": "otras_entidades"
        },
        {
          "encabezado": "VEHICULO MAYOR OTRAS ENTIDADES",
          "tipo": "number",
          "origen": "operativo.vehiculos_mayores_otras_entidades",
          "historicoKey": "vehiculos_mayores_otras_entidades"
        },
        {
          "encabezado": "VEHICULO MENOR OTRAS ENTIDADES",
          "tipo": "number",
          "origen": "operativo.vehiculos_menores_otras_entidades",
          "historicoKey": "vehiculos_menores_otras_entidades"
        },
        {
          "encabezado": "DIRECCION -DIRNIC DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        },
        {
          "columna": "E",
          "encabezado": "SI ES \n OPERATIVO / MEGA OPERATIVO",
          "origen": "intervencion.tipo",
          "tipo": "text",
          "historicoKey": "tipo"
        },
        {
          "columna": "AC",
          "encabezado": "NOTA INFORMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text",
          "historicoKey": "nota_sicpip"
        },
        {
          "columna": "AF",
          "encabezado": "DETALLE DE LA UBICACIÓN",
          "origen": "intervencion.detalle_ubicacion",
          "tipo": "text",
          "historicoKey": "detalle_ubicacion"
        },
        {
          "columna": "AG",
          "encabezado": "CANTIDAD DE PERSONAS QUE SE INTERVIENEN",
          "origen": "operativo.personas_intervenidas",
          "tipo": "number",
          "historicoKey": "personas_intervenidas"
        },
        {
          "columna": "AH",
          "encabezado": "CANTIDAD DE VEHICULOS MAYORES INTERVENIDOS",
          "origen": "operativo.vehiculos_mayores_intervenidos",
          "tipo": "number",
          "historicoKey": "vehiculos_mayores_intervenidos"
        },
        {
          "columna": "AI",
          "encabezado": "CANTIDAD DE VEHICULOS MENORES INTERVENIDOS",
          "origen": "operativo.vehiculos_menores_intervenidos",
          "tipo": "number",
          "historicoKey": "vehiculos_menores_intervenidos"
        },
        {
          "columna": "AJ",
          "encabezado": "CONTROL DE IDENTIDAD DE PERSONAS EXTRANJERAS",
          "origen": "operativo.control_identidad_extranjeros",
          "tipo": "text",
          "historicoKey": "control_identidad_extranjeros"
        },
        {
          "columna": "AK",
          "encabezado": "INTERVENCION A PENALES",
          "origen": "operativo.intervencion_penales",
          "tipo": "text",
          "historicoKey": "intervencion_penales"
        },
        {
          "columna": "AL",
          "encabezado": "OPERATIVO A ESPECIFICAR",
          "origen": "operativo.operativo_especificar",
          "tipo": "text",
          "historicoKey": "operativo_especificar"
        }
      ]
    },
    {
      "nombre": "2_RQ",
      "tabla": "intervencion_requisitoriados",
      "raiz": "requisitoria",
      "tipo": null,
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes_intervencion",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "requisitoria.datos.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA DETENCION",
          "tipo": "time",
          "origen": "requisitoria.datos.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "requisitoria.datos.apellido_paterno",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "requisitoria.datos.apellido_materno",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "requisitoria.datos.nombres",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "requisitoria.datos.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "requisitoria.datos.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "requisitoria.datos.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "requisitoria.datos.tipo_documento",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "requisitoria.datos.numero_documento",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "TIPO DE REQUISITORIA",
          "tipo": "text",
          "origen": "requisitoria.datos.tipo",
          "historicoKey": "tipo"
        },
        {
          "encabezado": "EL REQUISITORIADO  PERTENECE A LOS MAS BUSCADOS",
          "tipo": "text",
          "origen": "requisitoria.datos.mas_buscado",
          "historicoKey": "mas_buscado"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "EL RQ ES FUNCIONARIO PUBLICO",
          "tipo": "text",
          "origen": "requisitoria.datos.es_funcionario",
          "historicoKey": "es_funcionario"
        },
        {
          "encabezado": "ENTIDAD PUBLICA QUE PERTENECE",
          "tipo": "text",
          "origen": "requisitoria.datos.entidad_publica",
          "historicoKey": "entidad_publica"
        },
        {
          "encabezado": "DETALLAR LA ENTIDAD PUBLICA",
          "tipo": "text",
          "origen": "requisitoria.datos.detalle_entidad",
          "historicoKey": "detalle_entidad"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "requisitoria.datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "DELITO FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "requisitoria.datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "requisitoria.datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "requisitoria.datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "requisitoria.datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "requisitoria.datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "SI DET + DELITO FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "requisitoria.datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "requisitoria.datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "requisitoria.datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "requisitoria.datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "DIRECCION -DIRNIC DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "AUTORIDAD QUE SOLICITA LA REQUISITORIA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "autoridad_solicitante"
        },
        {
          "encabezado": "DOCUMENTO QUE SOLICITA LA REQUISITORIA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "documento_solicitante"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "3_DETENIDOS",
      "tabla": "detenciones_reportables",
      "raiz": "detencion",
      "tipo": null,
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "detencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA DETENCION",
          "tipo": "time",
          "origen": "detencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "persona.apellido_paterno",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "persona.apellido_materno",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "persona.nombres",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "persona.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "persona.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "persona.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "persona.tipo_documento",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "persona.numero_documento",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "EL DETENIDO  ES FUNCIONARIO PUBLICO",
          "tipo": "text",
          "origen": "detencion.es_funcionario_publico",
          "historicoKey": "es_funcionario_publico"
        },
        {
          "encabezado": "ENTIDAD PUBLICA QUE PERTENECE",
          "tipo": "text",
          "origen": "detencion.entidad_publica",
          "historicoKey": "entidad_publica"
        },
        {
          "encabezado": "DETALLAR LA ENTIDAD PUBLICA",
          "tipo": "text",
          "origen": "detencion.detalle_entidad_publica",
          "historicoKey": "detalle_entidad_publica"
        },
        {
          "encabezado": "MOTIVO DE LA DETENCION",
          "tipo": "text",
          "origen": "detencion.motivo_detencion",
          "historicoKey": "motivo_detencion"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "delitos.0.es_tentativa",
          "historicoKey": "es_tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "delitos.0.fuero_ley_especial",
          "historicoKey": "fuero_ley_especial"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "delitos.0.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "delitos.0.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "delitos.0.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "delitos.1.es_tentativa",
          "historicoKey": "fuente_25"
        },
        {
          "encabezado": "SI DET + DELITO FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "delitos.1.fuero_ley_especial",
          "historicoKey": "fuente_26"
        },
        {
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "delitos.1.delito_general",
          "historicoKey": "fuente_27"
        },
        {
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "delitos.1.delito_especifico",
          "historicoKey": "fuente_28"
        },
        {
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "delitos.1.subtipo",
          "historicoKey": "fuente_29"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "INDICAR SI ES INTEGRANTE DE  UNA BBCC /OOCC",
          "tipo": "text",
          "origen": "derivado.grupo",
          "historicoKey": "fuente_35"
        },
        {
          "encabezado": "REGISTRAR EL NOMBRE DE LA BBCC /OOCC/NO ES INTEGRANTE",
          "tipo": "text",
          "origen": "detencion.nombre_organizacion",
          "historicoKey": "nombre_organizacion"
        },
        {
          "encabezado": "ARMAS DE FUEGO - ARMA BLANCA -OTROS- NINGUNA",
          "tipo": "text",
          "origen": "derivado.armas",
          "historicoKey": "fuente_37"
        },
        {
          "encabezado": "TIPO ARMA",
          "tipo": "text",
          "origen": "derivado.tipos_armas",
          "historicoKey": "fuente_38"
        },
        {
          "encabezado": "SITUACION ACTUAL DEL DETENIDO",
          "tipo": "text",
          "origen": "detencion.situacion_actual",
          "historicoKey": "situacion_actual"
        },
        {
          "encabezado": "REGISTRAR EL DOCUMENTO CON EL QUE LE DIERON LIBERTAD AL DETENIDO",
          "tipo": "text",
          "origen": "detencion.documento_libertad",
          "historicoKey": "documento_libertad"
        },
        {
          "encabezado": "REGISTRAR EL DOCUMENTO CON EL QUE SE PONE A DISPOSICION AL DETENIDO",
          "tipo": "text",
          "origen": "detencion.documento_disposicion",
          "historicoKey": "documento_disposicion"
        },
        {
          "encabezado": "NOMBRE DEL FISCAL A CARGO",
          "tipo": "text",
          "origen": "detencion.fiscal_nombre",
          "historicoKey": "fiscal_nombre"
        },
        {
          "encabezado": "FISCALIA A LA QUE PERTENECE EL FISCAL A CARGO",
          "tipo": "text",
          "origen": "detencion.fiscalia",
          "historicoKey": "fiscalia"
        },
        {
          "encabezado": "PTO A DISP_DIRNIC /DIRNOS2",
          "tipo": "text",
          "origen": "detencion.disposicion_direccion",
          "historicoKey": "disposicion_direccion"
        },
        {
          "encabezado": "PTO A DISP_DIRECCIONES /REGIONES /FRENTES2",
          "tipo": "text",
          "origen": "detencion.disposicion_region",
          "historicoKey": "disposicion_region"
        },
        {
          "encabezado": "PTO A DISP_ DIVISION POLICIAL 2",
          "tipo": "text",
          "origen": "detencion.disposicion_division",
          "historicoKey": "disposicion_division"
        },
        {
          "encabezado": "PTO A DISP_ DEPARTAMENTO POLICAL 2",
          "tipo": "text",
          "origen": "detencion.disposicion_departamento",
          "historicoKey": "disposicion_departamento"
        },
        {
          "encabezado": "PTO A DISP_EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO 2",
          "tipo": "text",
          "origen": "detencion.disposicion_unidad",
          "historicoKey": "disposicion_unidad"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "4_MENORES",
      "tabla": "intervencion_menores",
      "raiz": "menor",
      "tipo": null,
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "generado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "generado.mes_fecha",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "menor.datos.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA DETENCION",
          "tipo": "time",
          "origen": "menor.datos.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "menor.datos.apellido_paterno",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "menor.datos.apellido_materno",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "menor.datos.nombres",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "menor.datos.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "menor.datos.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "menor.datos.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DE DOC. DE IDENTIDAD",
          "tipo": "text",
          "origen": "menor.datos.tipo_documento",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DOC.DE IDENTIDAD",
          "tipo": "text",
          "origen": "menor.datos.numero_documento",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "MOTIVO DE LA DETENCION",
          "tipo": "text",
          "origen": "menor.datos.motivo",
          "historicoKey": "motivo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "menor.datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "menor.datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "menor.datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "menor.datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO DE DELITO",
          "tipo": "text",
          "origen": "menor.datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "menor.datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES2",
          "tipo": "text",
          "origen": "menor.datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "menor.datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "menor.datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "menor.datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "DIRECCION PNP",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "REGPOL/FP/ DD.EE",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO /UNIDADES POLICIAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "AREAS/SECCION",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "INDICAR SI ES INTEGRANTE DE  UNA BBCC /OOCC",
          "tipo": "text",
          "origen": "menor.datos.grupo",
          "historicoKey": "grupo"
        },
        {
          "encabezado": "REGISTRAR EL NOMBRE DE LA BBCC /OOCC/NO ES INTEGRANTE",
          "tipo": "text",
          "origen": "menor.datos.nombre_grupo",
          "historicoKey": "nombre_grupo"
        },
        {
          "encabezado": "ARMAS DE FUEGO - ARMA BLANCA -OTROS- NINGUNA",
          "tipo": "text",
          "origen": "menor.datos.arma_categoria",
          "historicoKey": "arma_categoria"
        },
        {
          "encabezado": "TIPO ARMA",
          "tipo": "text",
          "origen": "menor.datos.arma_tipo",
          "historicoKey": "arma_tipo"
        },
        {
          "encabezado": "SITUACION ACTUAL DEL DETENIDO",
          "tipo": "text",
          "origen": "menor.datos.situacion",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "REGISTRAR EL DOCUMENTO CON EL QUE LE DIERON LIBERTAD AL DETENIDO",
          "tipo": "text",
          "origen": "menor.datos.documento_libertad",
          "historicoKey": "documento_libertad"
        },
        {
          "encabezado": "REGISTRAR EL DOCUMENTO CON EL QUE SE PONE A DISPOSICION AL DETENIDO",
          "tipo": "text",
          "origen": "menor.datos.documento_disposicion",
          "historicoKey": "documento_disposicion"
        },
        {
          "encabezado": "NOMBRE DEL FISCAL A CARGO",
          "tipo": "text",
          "origen": "menor.datos.fiscal",
          "historicoKey": "fiscal"
        },
        {
          "encabezado": "FISCALIA A LA QUE PERTENECE EL FISCAL A CARGO",
          "tipo": "text",
          "origen": "menor.datos.fiscalia",
          "historicoKey": "fiscalia"
        },
        {
          "encabezado": "PTO A DISP_DIRNIC /DIRNOS2",
          "tipo": "text",
          "origen": "menor.datos.disposicion_direccion",
          "historicoKey": "disposicion_direccion"
        },
        {
          "encabezado": "PTO A DISP_DIRECCIONES /REGIONES /FRENTES2",
          "tipo": "text",
          "origen": "menor.datos.disposicion_region",
          "historicoKey": "disposicion_region"
        },
        {
          "encabezado": "PTO A DISP_ DIVISION POLICIAL 2",
          "tipo": "text",
          "origen": "menor.datos.disposicion_division",
          "historicoKey": "disposicion_division"
        },
        {
          "encabezado": "PTO A DISP_ DEPARTAMENTO POLICAL 2",
          "tipo": "text",
          "origen": "menor.datos.disposicion_departamento",
          "historicoKey": "disposicion_departamento"
        },
        {
          "encabezado": "PTO A DISP_EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO 2",
          "tipo": "text",
          "origen": "menor.datos.disposicion_unidad",
          "historicoKey": "disposicion_unidad"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "5_DROGAS",
      "tabla": "intervencion_drogas",
      "raiz": "droga",
      "tipo": null,
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "CANTIDAD",
          "tipo": "number",
          "origen": "droga.cantidad",
          "historicoKey": "cantidad"
        },
        {
          "encabezado": "KILOGRAMOS / ENVOLTORIOS",
          "tipo": "text",
          "origen": "derivado.medida",
          "historicoKey": "medida"
        },
        {
          "encabezado": "TIPO DE DROGA",
          "tipo": "text",
          "origen": "derivado.sustancia",
          "historicoKey": "sustancia"
        },
        {
          "encabezado": "DIRECCION PNP",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        },
        {
          "columna": "N",
          "encabezado": "NOTA INFORMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text",
          "historicoKey": "nota_sicpip"
        }
      ]
    },
    {
      "nombre": "13_ARMAS_FUEGO",
      "tabla": "intervencion_materiales",
      "raiz": "material",
      "tipo": "fuego",
      "encabezados_recuperados_de": "13_ARMAS AF",
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "material.datos.apellido_paterno",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "material.datos.apellido_materno",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "material.datos.nombres",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "material.datos.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "material.datos.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "material.datos.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "material.datos.tipo_documento",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "material.datos.numero_documento",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "material.datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "material.datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "material.datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "material.datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO DE DELITO",
          "tipo": "text",
          "origen": "material.datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "material.datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "SI DET + DELITO FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "material.datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "material.datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "material.datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "material.datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "SITUACION DEL  ARMA DEL  FUEGO",
          "tipo": "text",
          "origen": "material.datos.situacion",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "TIPO DE ARMA",
          "tipo": "text",
          "origen": "material.datos.tipo",
          "historicoKey": "tipo"
        },
        {
          "encabezado": "MARCA",
          "tipo": "text",
          "origen": "material.datos.marca",
          "historicoKey": "marca"
        },
        {
          "encabezado": "MODELO",
          "tipo": "text",
          "origen": "material.datos.modelo",
          "historicoKey": "modelo"
        },
        {
          "encabezado": "CALIBRE",
          "tipo": "text",
          "origen": "material.datos.calibre",
          "historicoKey": "calibre"
        },
        {
          "encabezado": "SERIE",
          "tipo": "text",
          "origen": "material.datos.serie",
          "historicoKey": "serie"
        },
        {
          "encabezado": "OTRAS CARACTERISTICAS",
          "tipo": "text",
          "origen": "material.datos.caracteristicas",
          "historicoKey": "caracteristicas"
        },
        {
          "encabezado": "EL NOMBRE DEL FISCAL Y FISCALIA A CARGO",
          "tipo": "text",
          "origen": "material.datos.fiscal_fiscalia",
          "historicoKey": "fiscal_fiscalia"
        },
        {
          "encabezado": "DIRECCION PNP",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "PROCEDENCIA DEL ARMA DE FUEGO",
          "tipo": "text",
          "origen": "material.datos.procedencia",
          "historicoKey": "procedencia"
        },
        {
          "encabezado": "NRO DE REGISTRO SUCAMEC O CERTIFICADO DE PROPIEDAD",
          "tipo": "text",
          "origen": "material.datos.registro_sucamec",
          "historicoKey": "registro_sucamec"
        },
        {
          "encabezado": "N° DE DENUNCIAS O PERDIDA, ROBO U OTROS",
          "tipo": "text",
          "origen": "material.datos.denuncia",
          "historicoKey": "denuncia"
        },
        {
          "encabezado": "PROPIETARIO",
          "tipo": "text",
          "origen": "material.datos.propietario",
          "historicoKey": "propietario"
        },
        {
          "encabezado": "CANTIDAD DE MUNICIONES",
          "tipo": "number",
          "origen": "material.datos.cantidad_municiones",
          "historicoKey": "cantidad_municiones"
        },
        {
          "encabezado": "TIPO DE MUNICIONES",
          "tipo": "text",
          "origen": "material.datos.tipo_municiones",
          "historicoKey": "tipo_municiones"
        },
        {
          "encabezado": "N° NOTA INFORMATIVA",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "14_ARMAS_BLANCAS",
      "tabla": "intervencion_materiales",
      "raiz": "material",
      "tipo": "blanca",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "material.datos.apellido_paterno",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "material.datos.apellido_materno",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "material.datos.nombres",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "material.datos.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "material.datos.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "material.datos.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "material.datos.tipo_documento",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "material.datos.numero_documento",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "material.datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "material.datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "material.datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "material.datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO DE DELITO",
          "tipo": "text",
          "origen": "material.datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "material.datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "SI DET + DELITO FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "material.datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "material.datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "material.datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "material.datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "SITUACION DEL ARMA BLANCA",
          "tipo": "text",
          "origen": "material.datos.situacion",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "TIPO ARMA BLANCA",
          "tipo": "text",
          "origen": "material.datos.tipo",
          "historicoKey": "tipo"
        },
        {
          "encabezado": "SI SELECCIONO \"OTRO\"\n ESPECIFICAR",
          "tipo": "text",
          "origen": "material.datos.otro_tipo",
          "historicoKey": "otro_tipo"
        },
        {
          "encabezado": "DIRECCION PNP",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "15_BANDAS",
      "tabla": "intervencion_grupos",
      "raiz": "grupo",
      "tipo": "banda",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "EL NOMBRE DE LA BANDA CRIMINAL  ( NO DEBE  COMBINAR CELDA)",
          "tipo": "text",
          "origen": "grupo.nombre",
          "historicoKey": "nombre"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "persona.apellido_paterno",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "persona.apellido_materno",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "persona.nombres",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "persona.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "persona.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "persona.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "persona.tipo_documento",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N°  DE DOCUEMNTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "persona.numero_documento",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "REFERENCIA DEL LUGAR",
          "tipo": "text",
          "origen": "grupo.referencia_lugar",
          "historicoKey": "referencia_lugar"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "delitos.0.es_tentativa",
          "historicoKey": "es_tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "delitos.0.fuero_ley_especial",
          "historicoKey": "fuero_ley_especial"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "delitos.0.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "delitos.0.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "delitos.0.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "delitos.1.es_tentativa",
          "historicoKey": "fuente_23"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES2",
          "tipo": "text",
          "origen": "delitos.1.fuero_ley_especial",
          "historicoKey": "fuente_24"
        },
        {
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "delitos.1.delito_general",
          "historicoKey": "fuente_25"
        },
        {
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "delitos.1.delito_especifico",
          "historicoKey": "fuente_26"
        },
        {
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "delitos.1.subtipo",
          "historicoKey": "fuente_27"
        },
        {
          "encabezado": "LA MODALIDAD  DE LA BANDA CRIMINAL",
          "tipo": "text",
          "origen": "grupo.modalidad",
          "historicoKey": "modalidad"
        },
        {
          "encabezado": "EL MOTIVO DE LA DETENCION (FLAGRANCIA - DETENCION PRELIMINAR)",
          "tipo": "text",
          "origen": "detencion.motivo_detencion",
          "historicoKey": "motivo_detencion"
        },
        {
          "encabezado": "NOMBRE DEL FISCAL",
          "tipo": "text",
          "origen": "detencion.fiscal_nombre",
          "historicoKey": "fiscal_nombre"
        },
        {
          "encabezado": "FISCALIA A LA QUE PERTENECE2",
          "tipo": "text",
          "origen": "detencion.fiscalia",
          "historicoKey": "fiscalia"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "SITUACION ACTUAL DEL DETENIDO",
          "tipo": "text",
          "origen": "detencion.situacion_actual",
          "historicoKey": "situacion_actual"
        },
        {
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        },
        {
          "encabezado": "PARA CONTAR LA CANTIDAD DE BANDAS ,\nPONGA SI SÓLO A UNO DE LOS MIEMBROS DE LA BANDA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_41"
        },
        {
          "columna": "AO",
          "encabezado": "(PONER SI, SÓLO A UNO DE LOS MIEMBROS DE LAS BANDAS)\n\n",
          "origen": "derivado.contar_banda",
          "tipo": "text",
          "historicoKey": "contar_banda"
        }
      ]
    },
    {
      "nombre": "16_OO.CC.",
      "tabla": "intervencion_grupos",
      "raiz": "grupo",
      "tipo": "organizacion",
      "encabezados_recuperados_de": "16_ORGANIZACION CRIMINAL",
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "EL NOMBRE DE LA ORGANIZACION CRIMINAL  ( NO DEBE  COMBINAR CELDA)",
          "tipo": "text",
          "origen": "grupo.nombre",
          "historicoKey": "nombre"
        },
        {
          "encabezado": "ROL QUE DESEMPEÑA  EN LA OO.CC",
          "tipo": "text",
          "origen": "integrante.rol",
          "historicoKey": "rol"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "persona.apellido_paterno",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "persona.apellido_materno",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "persona.nombres",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "persona.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "persona.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "persona.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "persona.tipo_documento",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N°  DE DOCUEMNTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "persona.numero_documento",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "REFERENCIA DEL LUGAR",
          "tipo": "text",
          "origen": "grupo.referencia_lugar",
          "historicoKey": "referencia_lugar"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "delitos.0.es_tentativa",
          "historicoKey": "es_tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "delitos.0.fuero_ley_especial",
          "historicoKey": "fuero_ley_especial"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "delitos.0.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "delitos.0.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "delitos.0.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "delitos.1.es_tentativa",
          "historicoKey": "fuente_24"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES2",
          "tipo": "text",
          "origen": "delitos.1.fuero_ley_especial",
          "historicoKey": "fuente_25"
        },
        {
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "delitos.1.delito_general",
          "historicoKey": "fuente_26"
        },
        {
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "delitos.1.delito_especifico",
          "historicoKey": "fuente_27"
        },
        {
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "delitos.1.subtipo",
          "historicoKey": "fuente_28"
        },
        {
          "encabezado": "LA MODALIDAD  DE LA BANDA CRIMINAL",
          "tipo": "text",
          "origen": "grupo.modalidad",
          "historicoKey": "modalidad"
        },
        {
          "encabezado": "EL MOTIVO DE LA DETENCION (FLAGRANCIA - DETENCION PRELIMINAR)",
          "tipo": "text",
          "origen": "detencion.motivo_detencion",
          "historicoKey": "motivo_detencion"
        },
        {
          "encabezado": "NOMBRE DEL FISCAL",
          "tipo": "text",
          "origen": "detencion.fiscal_nombre",
          "historicoKey": "fiscal_nombre"
        },
        {
          "encabezado": "FISCALIA A LA QUE PERTENECE EL  FISCAL",
          "tipo": "text",
          "origen": "detencion.fiscalia",
          "historicoKey": "fiscalia"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "SITUACION ACTUAL DEL DETENIDO",
          "tipo": "text",
          "origen": "detencion.situacion_actual",
          "historicoKey": "situacion_actual"
        },
        {
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        },
        {
          "encabezado": "PARA CONTAR LA CANTIDAD DE BANDAS ,\nPONGA SI SÓLO A UNO DE LOS MIEMBROS DE LA ORGANIZACIÓN CRIMINAL",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_42"
        }
      ]
    },
    {
      "nombre": "17_VEH. MAYOR",
      "tabla": "intervencion_vehiculos",
      "raiz": "vehiculo",
      "tipo": "mayor",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "PLACA",
          "tipo": "text",
          "origen": "vehiculo.datos.placa",
          "historicoKey": "placa"
        },
        {
          "encabezado": "MARCA",
          "tipo": "text",
          "origen": "vehiculo.datos.marca",
          "historicoKey": "marca"
        },
        {
          "encabezado": "SITUACION DEL VEHICULO",
          "tipo": "text",
          "origen": "vehiculo.datos.situacion",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "VALORIZACION DE LOS VEHICULOS INCAUTADOS",
          "tipo": "number",
          "origen": "vehiculo.datos.valorizacion",
          "historicoKey": "valorizacion"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "vehiculo.datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "vehiculo.datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "vehiculo.datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "vehiculo.datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO DE DELITO",
          "tipo": "text",
          "origen": "vehiculo.datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "vehiculo.datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "SI  EL VEH + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "vehiculo.datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI  EL VEH + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "vehiculo.datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI  EL VEH + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "vehiculo.datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI  EL VEH + DE UN DELITO /DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "vehiculo.datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "DIRECCION PNP",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "18_VEH. MENOR",
      "tabla": "intervencion_vehiculos",
      "raiz": "vehiculo",
      "tipo": "menor",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "PLACA",
          "tipo": "text",
          "origen": "vehiculo.datos.placa",
          "historicoKey": "placa"
        },
        {
          "encabezado": "MARCA",
          "tipo": "text",
          "origen": "vehiculo.datos.marca",
          "historicoKey": "marca"
        },
        {
          "encabezado": "SITUACION DEL VEHICULO",
          "tipo": "text",
          "origen": "vehiculo.datos.situacion",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "VALORIZACION DE LOS VEHICULOS INCAUTADOS",
          "tipo": "number",
          "origen": "vehiculo.datos.valorizacion",
          "historicoKey": "valorizacion"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "vehiculo.datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "vehiculo.datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "vehiculo.datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "vehiculo.datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO DE DELITO",
          "tipo": "text",
          "origen": "vehiculo.datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "vehiculo.datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "SI  EL VEH + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "vehiculo.datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI  EL VEH + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "vehiculo.datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI  EL VEH + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "vehiculo.datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI  EL VEH + DE UN DELITO /DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "vehiculo.datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "DIRECCION PNP",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "20_PROXENETISMO",
      "tabla": "intervencion_prostitucion",
      "raiz": "prostitucion",
      "tipo": null,
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "prostitucion.datos.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA INTERVENCION",
          "tipo": "time",
          "origen": "prostitucion.datos.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "prostitucion.datos.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "CONDICION",
          "tipo": "text",
          "origen": "",
          "historicoKey": "condicion"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "prostitucion.datos.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "prostitucion.datos.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DE DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DOCUMENTO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_17"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_18"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_19"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_20"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_21"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "21_ VICTIMAS DE TRATA DE PERSON",
      "tabla": "intervencion_victimas",
      "raiz": "victima",
      "tipo": null,
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "victima.datos.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA INTERVENCION",
          "tipo": "time",
          "origen": "victima.datos.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "victima.datos.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "CONDICION",
          "tipo": "text",
          "origen": "",
          "historicoKey": "condicion"
        },
        {
          "encabezado": "SITUACION",
          "tipo": "text",
          "origen": "",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "victima.datos.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "victima.datos.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DE DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DOCUMENTO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "PUESTA A DISPOSICION DE UPE/UDAVIT",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_15"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_19"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_20"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_21"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_22"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_23"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "28_DINERO",
      "tabla": "intervencion_complementarios",
      "raiz": "complementario",
      "tipo": "dinero",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "datos.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "datos.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "SOLES",
          "tipo": "number",
          "origen": "datos.soles",
          "historicoKey": "soles"
        },
        {
          "encabezado": "DOLARES",
          "tipo": "number",
          "origen": "datos.dolares",
          "historicoKey": "dolares"
        },
        {
          "encabezado": "EUROS",
          "tipo": "number",
          "origen": "datos.euros",
          "historicoKey": "euros"
        },
        {
          "encabezado": "DINERO OTRO",
          "tipo": "text",
          "origen": "datos.dinero_otro",
          "historicoKey": "dinero_otro"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "SI  EL DINERO + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI  EL DINERO + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI  EL DINERO + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI  EL DINERO + DE UN DELITO /DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "30_CELULAR",
      "tabla": "intervencion_complementarios",
      "raiz": "complementario",
      "tipo": "celulares",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_7"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "datos.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "CANTIDAD",
          "tipo": "number",
          "origen": "datos.cantidad",
          "historicoKey": "cantidad"
        },
        {
          "encabezado": "MARCA",
          "tipo": "text",
          "origen": "datos.marca",
          "historicoKey": "marca"
        },
        {
          "encabezado": "MODELO",
          "tipo": "text",
          "origen": "datos.modelo",
          "historicoKey": "modelo"
        },
        {
          "encabezado": "IMEI FÍSICO",
          "tipo": "text",
          "origen": "datos.imei_fisico",
          "historicoKey": "imei_fisico"
        },
        {
          "encabezado": "IMEI LÓGICO",
          "tipo": "text",
          "origen": "datos.imei_logico",
          "historicoKey": "imei_logico"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "SI  EL CELULAR + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI  EL CELULAR + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI  EL CELULAR + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI  EL CELULAR + DE UN DELITO /DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "OBSERVACIONES",
          "tipo": "text",
          "origen": "datos.observaciones",
          "historicoKey": "observaciones"
        },
        {
          "encabezado": "SITUACION DEL EQUIPO MOVIL",
          "tipo": "text",
          "origen": "datos.situacion",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "N° NOTA INFORMATIVA (SICPIP)",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "32_MUNICIONES",
      "tabla": "intervencion_materiales",
      "raiz": "material",
      "tipo": "municion",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "columna": "A",
          "encabezado": "N°",
          "origen": "derivado.numero",
          "tipo": "number"
        },
        {
          "columna": "B",
          "encabezado": "MES",
          "origen": "derivado.mes",
          "tipo": "text"
        },
        {
          "columna": "C",
          "encabezado": "FECHA",
          "origen": "intervencion.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "HORA",
          "origen": "intervencion.hora",
          "tipo": "time"
        },
        {
          "columna": "E",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "CANTIDAD",
          "origen": "material.datos.cantidad",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "P",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
        }
      ]
    },
    {
      "nombre": "38_INTERVENIDOS_ LEY_MIGRACIONE",
      "tabla": "intervencion_complementarios",
      "raiz": "complementario",
      "tipo": "migraciones",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "datos.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA INTERVENCION",
          "tipo": "text",
          "origen": "",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "datos.apellido_paterno",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "datos.apellido_materno",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "datos.nombres",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "datos.edad",
          "historicoKey": "edad"
        },
        {
          "encabezado": "CONDICION",
          "tipo": "text",
          "origen": "",
          "historicoKey": "condicion"
        },
        {
          "encabezado": "SITUACION",
          "tipo": "text",
          "origen": "",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "datos.genero",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "datos.nacionalidad",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "datos.tipo_documento",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "datos.numero_documento",
          "historicoKey": "numero_documento"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "INFRACCION A LA LEY DE MIGRACIONES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_18"
        },
        {
          "encabezado": "SUB TIPO DE INFRACCION",
          "tipo": "text",
          "origen": "datos.subtipo_infraccion",
          "historicoKey": "subtipo_infraccion"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        },
        {
          "columna": "D",
          "encabezado": "HORA DETENCION",
          "origen": "datos.hora",
          "tipo": "time",
          "historicoKey": "hora"
        },
        {
          "columna": "P",
          "encabezado": "LEY DE MIGRACIONES SELECCIONAR",
          "origen": "datos.ley_migraciones",
          "tipo": "text",
          "historicoKey": "ley_migraciones"
        }
      ]
    },
    {
      "nombre": "52_CHIP",
      "tabla": "intervencion_complementarios",
      "raiz": "complementario",
      "tipo": "chips",
      "encabezados_recuperados_de": "52 CHIP",
      "columnas": [
        {
          "columna": "A",
          "encabezado": "N°",
          "origen": "derivado.numero",
          "tipo": "number"
        },
        {
          "columna": "B",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "C",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "D",
          "encabezado": " DIVISION POLICIAL ",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "E",
          "encabezado": " DEPARTAMENTO POLICAL ",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO ",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "MES",
          "origen": "derivado.mes",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "FECHA",
          "origen": "datos.fecha",
          "tipo": "date"
        },
        {
          "columna": "I",
          "encabezado": "HORA",
          "origen": "datos.hora",
          "tipo": "time"
        },
        {
          "columna": "J",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "TIPO DE CHIP",
          "origen": "datos.tipo_chip",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "SITUACION DEL CHIP",
          "origen": "datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "CANTIDAD",
          "origen": "datos.cantidad",
          "tipo": "number"
        },
        {
          "columna": "P",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA ",
          "origen": "datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "FUERO/LEYES ESPECIALES ",
          "origen": "datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": " DELITO GENERAL",
          "origen": "datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "SUB TIPO",
          "origen": "datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": " SI  EL CELULAR + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "origen": "datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": " SI  EL CELULAR + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "origen": "datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": " SI  EL CELULAR + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "origen": "datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": " SI  EL CELULAR + DE UN DELITO /DELITO/SUB TIPO2",
          "origen": "datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "OBSERVACIONES",
          "origen": "datos.observaciones",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "N° NOTA INFORMATIVA (SICPIP)",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "LATITUD ",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AC",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
        }
      ]
    },
    {
      "nombre": "53_PERSONAS UBICADAS",
      "tabla": "intervencion_complementarios",
      "raiz": "complementario",
      "tipo": "personas_ubicadas",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "columna": "A",
          "encabezado": "N°",
          "origen": "derivado.numero",
          "tipo": "number"
        },
        {
          "columna": "B",
          "encabezado": "ENERO",
          "origen": "derivado.mes",
          "tipo": "text"
        },
        {
          "columna": "C",
          "encabezado": "FECHA",
          "origen": "datos.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "HORA",
          "origen": "datos.hora",
          "tipo": "time"
        },
        {
          "columna": "E",
          "encabezado": "APELLIDO PATERNO",
          "origen": "datos.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "APELLIDO MATERNO",
          "origen": "datos.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NOMBRES",
          "origen": "datos.nombres",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "EDAD",
          "origen": "datos.edad",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "CONDICION DE EDAD",
          "origen": "datos.condicion_edad",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "GENERO",
          "origen": "datos.genero",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "origen": "datos.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "origen": "datos.numero_documento",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "SITUACION",
          "origen": "datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "ESPECIFICAR EL LUGAR DE LA UBICACIÓN",
          "origen": "datos.lugar_ubicacion",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DIRECCION ESPECIALIZADA",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "X",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
        }
      ]
    },
    {
      "nombre": "54_EXTR. EXPULSADOS",
      "tabla": "intervencion_complementarios",
      "raiz": "complementario",
      "tipo": "expulsados",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "columna": "A",
          "encabezado": "N°",
          "origen": "derivado.numero",
          "tipo": "number"
        },
        {
          "columna": "B",
          "encabezado": "MES",
          "origen": "derivado.mes",
          "tipo": "text"
        },
        {
          "columna": "C",
          "encabezado": "FECHA",
          "origen": "datos.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "HORA EXPULSIÓN",
          "origen": "datos.hora",
          "tipo": "time"
        },
        {
          "columna": "E",
          "encabezado": "APELLIDO PATERNO",
          "origen": "datos.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "APELLIDO MATERNO",
          "origen": "datos.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NOMBRES",
          "origen": "datos.nombres",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "EDAD",
          "origen": "datos.edad",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "GENERO",
          "origen": "datos.genero",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "origen": "datos.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "origen": "datos.numero_documento",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "CONDICIÓN",
          "origen": "datos.condicion",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "LEY DE MIGRACIONES SELECCIONAR",
          "origen": "datos.ley_migraciones",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "SUB TIPO DE INFRACCION",
          "origen": "datos.subtipo_infraccion",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DIRECCION ESPECIALIZADA",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "X",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
        }
      ]
    },
    {
      "nombre": "33_LOCALES INTERVENIDOS",
      "tabla": "intervencion_complementarios",
      "raiz": "complementario",
      "tipo": "locales",
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero_fila",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes_fecha",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "datos.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "datos.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "SITUACION DE INMUEBLE",
          "tipo": "text",
          "origen": "datos.situacion",
          "historicoKey": "situacion"
        },
        {
          "encabezado": "TIPO DE  INMUEBLE",
          "tipo": "text",
          "origen": "datos.tipo_inmueble",
          "historicoKey": "tipo_inmueble"
        },
        {
          "encabezado": "DETALLAR EL INMUEBLE",
          "tipo": "text",
          "origen": "datos.detalle_inmueble",
          "historicoKey": "detalle_inmueble"
        },
        {
          "encabezado": "VALORIZACION DEL INMUEBLE  INCAUTADO",
          "tipo": "number",
          "origen": "datos.valorizacion",
          "historicoKey": "valorizacion"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "datos.tentativa",
          "historicoKey": "tentativa"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "datos.fuero",
          "historicoKey": "fuero"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "datos.delito_general",
          "historicoKey": "delito_general"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "datos.delito_especifico",
          "historicoKey": "delito_especifico"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "datos.subtipo",
          "historicoKey": "subtipo"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "datos.tentativa_2",
          "historicoKey": "tentativa_2"
        },
        {
          "encabezado": "SI  EL DINERO + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "datos.fuero_2",
          "historicoKey": "fuero_2"
        },
        {
          "encabezado": "SI  EL DINERO + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "datos.delito_general_2",
          "historicoKey": "delito_general_2"
        },
        {
          "encabezado": "SI  EL DINERO + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "datos.delito_especifico_2",
          "historicoKey": "delito_especifico_2"
        },
        {
          "encabezado": "SI  EL DINERO + DE UN DELITO /DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "datos.subtipo_2",
          "historicoKey": "subtipo_2"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "tipo": "text",
          "origen": "intervencion.nota_sicpip",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "DESAPARECIDOS",
      "tabla": "desapariciones",
      "raiz": "desaparecido",
      "tipo": null,
      "encabezados_recuperados_de": null,
      "columnas": [
        {
          "columna": "A",
          "encabezado": "N°",
          "origen": "derivado.numero_fila",
          "tipo": "number"
        },
        {
          "columna": "B",
          "encabezado": "MES",
          "origen": "derivado.mes_fecha",
          "tipo": "text"
        },
        {
          "columna": "C",
          "encabezado": "FECHA DE LA DENUNCIA",
          "origen": "datos.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "TIPO DE DENUNCIA",
          "origen": "datos.tipo_denuncia",
          "tipo": "text"
        },
        {
          "columna": "E",
          "encabezado": "Nº DENUNCIA U ANTECEDENTE",
          "origen": "datos.numero_denuncia",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "PROCEDENCIA",
          "origen": "datos.procedencia",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "FECHA DE OCURRIDO EL HECHO",
          "origen": "datos.fecha_hecho",
          "tipo": "date"
        },
        {
          "columna": "H",
          "encabezado": "APELLIDO PATERNO",
          "origen": "datos.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": "APELLIDO MATERNO",
          "origen": "datos.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "NOMBRES",
          "origen": "datos.nombres",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "EDAD",
          "origen": "datos.edad",
          "tipo": "number"
        },
        {
          "columna": "L",
          "encabezado": "SEXO",
          "origen": "datos.genero",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "NACIONALIDAD",
          "origen": "datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "DISTRITO",
          "origen": "datos.distrito",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "DEPARTAMENTO",
          "origen": "datos.departamento",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "INSTRUCTOR",
          "origen": "datos.instructor",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "EQUIPO",
          "origen": "datos.equipo",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "ESTADO DE LA DENUNCIA",
          "origen": "datos.estado_denuncia",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "Nº DE INFORME FORMULADO",
          "origen": "datos.numero_informe",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "FECHA DEL INFORME",
          "origen": "datos.fecha_informe",
          "tipo": "date"
        },
        {
          "columna": "U",
          "encabezado": "DESTINO DEL DOCUMENTO",
          "origen": "datos.destino_documento",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "MODALIDAD",
          "origen": "datos.modalidad",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "SITUACION DE LA PERSONA",
          "origen": "datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "FECHA DE UBICACIÓN",
          "origen": "datos.fecha_ubicacion",
          "tipo": "date"
        },
        {
          "columna": "Y",
          "encabezado": "MES DE UBICACIÓN",
          "origen": "desaparecido.mes_ubicacion",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "DISTRITO DE UBICACIÓN",
          "origen": "datos.distrito_ubicacion",
          "tipo": "text"
        }
      ]
    },
    {
      "nombre": "MEGAOPERATIVOS",
      "tabla": "intervenciones",
      "tipo": "megaoperativo",
      "raiz": "operativo",
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "number",
          "origen": "derivado.numero_fila",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "derivado.mes_fecha",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "date",
          "origen": "intervencion.fecha",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "time",
          "origen": "intervencion.hora",
          "historicoKey": "hora"
        },
        {
          "encabezado": "MEGA OPERATIVO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_5"
        },
        {
          "encabezado": "EL RESULTADO:POSITIVO - NEGATIVO",
          "tipo": "text",
          "origen": "operativo.resultado",
          "historicoKey": "resultado"
        },
        {
          "encabezado": "ORDEN DE OPERACIONES",
          "tipo": "text",
          "origen": "operativo.orden_operaciones",
          "historicoKey": "orden_operaciones"
        },
        {
          "encabezado": "PLAN DE OPERACIONES",
          "tipo": "text",
          "origen": "operativo.plan_operaciones",
          "historicoKey": "plan_operaciones"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "intervencion.departamento",
          "historicoKey": "departamento"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "intervencion.provincia",
          "historicoKey": "provincia"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "intervencion.distrito",
          "historicoKey": "distrito"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_12"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_13"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_14"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_15"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_16"
        },
        {
          "encabezado": "MOTIVO DEL OPERATIVO \n(FLAGRANCIA-MEDIDA LIMITATIVA)",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_17"
        },
        {
          "encabezado": "TIPO DE OPERATIVO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_18"
        },
        {
          "encabezado": "PERSONAL A CARGO CANTIDAD",
          "tipo": "number",
          "origen": "operativo.personal_cargo",
          "historicoKey": "personal_cargo"
        },
        {
          "encabezado": "VEHICULO MAYOR A CARGO",
          "tipo": "number",
          "origen": "operativo.vehiculos_mayores_cargo",
          "historicoKey": "vehiculos_mayores_cargo"
        },
        {
          "encabezado": "VEHICULO MENOR A CARGO",
          "tipo": "number",
          "origen": "operativo.vehiculos_menores_cargo",
          "historicoKey": "vehiculos_menores_cargo"
        },
        {
          "encabezado": "PERSONAL PNP DE APOYO",
          "tipo": "number",
          "origen": "operativo.personal_apoyo_pnp",
          "historicoKey": "personal_apoyo_pnp"
        },
        {
          "encabezado": "VEHICULO MAYOR DE APOYO",
          "tipo": "number",
          "origen": "operativo.vehiculos_mayores_apoyo_pnp",
          "historicoKey": "vehiculos_mayores_apoyo_pnp"
        },
        {
          "encabezado": "VEHICULO MENOR   DE APOYO",
          "tipo": "number",
          "origen": "operativo.vehiculos_menores_apoyo_pnp",
          "historicoKey": "vehiculos_menores_apoyo_pnp"
        },
        {
          "encabezado": "PERSONAL FF.AA DE APOYO",
          "tipo": "number",
          "origen": "operativo.personal_apoyo_ffaa",
          "historicoKey": "personal_apoyo_ffaa"
        },
        {
          "encabezado": "VEHICULO MAYOR FF.AA DE APOYO",
          "tipo": "number",
          "origen": "operativo.vehiculos_mayores_apoyo_ffaa",
          "historicoKey": "vehiculos_mayores_apoyo_ffaa"
        },
        {
          "encabezado": "VEHICULO MENOR FF.AA DE APOYO",
          "tipo": "number",
          "origen": "operativo.vehiculos_menores_apoyo_ffaa",
          "historicoKey": "vehiculos_menores_apoyo_ffaa"
        },
        {
          "encabezado": "OTRAS ENTIDADES",
          "tipo": "text",
          "origen": "operativo.otras_entidades",
          "historicoKey": "otras_entidades"
        },
        {
          "encabezado": "VEHICULO MAYOR OTRAS ENTIDADES",
          "tipo": "number",
          "origen": "operativo.vehiculos_mayores_otras_entidades",
          "historicoKey": "vehiculos_mayores_otras_entidades"
        },
        {
          "encabezado": "VEHICULO MENOR OTRAS ENTIDADES",
          "tipo": "number",
          "origen": "operativo.vehiculos_menores_otras_entidades",
          "historicoKey": "vehiculos_menores_otras_entidades"
        },
        {
          "encabezado": "DIRECCION -DIRNIC DIRNOS",
          "tipo": "text",
          "origen": "intervencion.direccion_policial",
          "historicoKey": "direccion_policial"
        },
        {
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "tipo": "text",
          "origen": "intervencion.direccion_especializada_region",
          "historicoKey": "direccion_especializada_region"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "intervencion.division_policial",
          "historicoKey": "division_policial"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "intervencion.departamento_policial",
          "historicoKey": "departamento_policial"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "intervencion.unidad_area_equipo",
          "historicoKey": "unidad_area_equipo"
        },
        {
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "tipo": "text",
          "origen": "",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "number",
          "origen": "intervencion.latitud",
          "historicoKey": "latitud"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "number",
          "origen": "intervencion.longitud",
          "historicoKey": "longitud"
        }
      ]
    },
    {
      "nombre": "31_EXPLOSIVOS",
      "tabla": "intervencion_materiales",
      "tipo": "explosivo",
      "raiz": "material",
      "columnas": [
        {
          "encabezado": "N°",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_1"
        },
        {
          "encabezado": "MES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_2"
        },
        {
          "encabezado": "FECHA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fecha"
        },
        {
          "encabezado": "HORA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "hora"
        },
        {
          "encabezado": "APELLIDO PATERNO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "apellido_paterno"
        },
        {
          "encabezado": "APELLIDO MATERNO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "apellido_materno"
        },
        {
          "encabezado": "NOMBRES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "nombres"
        },
        {
          "encabezado": "EDAD",
          "tipo": "number",
          "origen": "",
          "historicoKey": "edad"
        },
        {
          "encabezado": "GENERO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "genero"
        },
        {
          "encabezado": "NACIONALIDAD (PAIS)",
          "tipo": "text",
          "origen": "",
          "historicoKey": "nacionalidad"
        },
        {
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "tipo": "text",
          "origen": "",
          "historicoKey": "tipo_documento"
        },
        {
          "encabezado": "N° DE DOCUMENTO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_12"
        },
        {
          "encabezado": "DEPARTAMENTO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_13"
        },
        {
          "encabezado": "PROVINCIA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_14"
        },
        {
          "encabezado": "DISTRITO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_15"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_16"
        },
        {
          "encabezado": "FUERO/LEYES ESPECIALES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_17"
        },
        {
          "encabezado": "DELITO GENERAL",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_18"
        },
        {
          "encabezado": "DELITO ESPECIFICO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_19"
        },
        {
          "encabezado": "SUB TIPO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_20"
        },
        {
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_21"
        },
        {
          "encabezado": "SI EXPLOSIVO + DELITO FUERO/LEYES ESPECIALES 2",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_22"
        },
        {
          "encabezado": "SI EXPLOSIVO + DELITO/ DELITO GENERAL2",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_23"
        },
        {
          "encabezado": "SI EXPLOSIVO + DELITO/DELITO ESPECIFICO2",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_24"
        },
        {
          "encabezado": "SI EXPLOSIVO + DELITO/SUB TIPO2",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_25"
        },
        {
          "encabezado": "EL MOTIVO (Hallazgo/Incautacion)",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_26"
        },
        {
          "encabezado": "SITUACION DEL MATERIAL EXPLOSIVO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_27"
        },
        {
          "encabezado": "TIPO DE MATERIAL EXPLOSIVO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_28"
        },
        {
          "encabezado": "DETALLE TIPO DE MATERIAL EXPLOSIVO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_29"
        },
        {
          "encabezado": "DETALLE TIPO DE MATERIAL EXPLOSIVO2",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_30"
        },
        {
          "encabezado": "CANTIDAD",
          "tipo": "number",
          "origen": "",
          "historicoKey": "cantidad"
        },
        {
          "encabezado": "DIRNIC /DIRNOS",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_32"
        },
        {
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_33"
        },
        {
          "encabezado": "DIVISION POLICIAL",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_34"
        },
        {
          "encabezado": "DEPARTAMENTO POLICAL",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_35"
        },
        {
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_36"
        },
        {
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "tipo": "text",
          "origen": "",
          "historicoKey": "nota_sicpip"
        },
        {
          "encabezado": "LATITUD",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_38"
        },
        {
          "encabezado": "LONGITUD",
          "tipo": "text",
          "origen": "",
          "historicoKey": "fuente_39"
        }
      ]
    }
  ]
};
