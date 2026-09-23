// Solo encabezados y mapeos; no contiene registros personales.
window.PRODUCCION_CATALOGO = {
  "version": 2,
  "hojas": [
    {
      "nombre": "1_OPERATIVOS",
      "tabla": "intervenciones",
      "raiz": "intervencion",
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
          "encabezado": "SI ES \n OPERATIVO / MEGA OPERATIVO",
          "origen": "intervencion.tipo",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "EL RESULTADO: POSITIVO - NEGATIVO",
          "origen": "operativo.resultado",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "ORDEN DE OPERACIONES",
          "origen": "operativo.orden_operaciones",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "PLAN DE OPERACIONES",
          "origen": "operativo.plan_operaciones",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "PERSONAL A CARGO CANTIDAD",
          "origen": "operativo.personal_cargo",
          "tipo": "number"
        },
        {
          "columna": "M",
          "encabezado": "VEHICULO MAYOR A CARGO",
          "origen": "operativo.vehiculos_mayores_cargo",
          "tipo": "number"
        },
        {
          "columna": "N",
          "encabezado": "VEHICULO MENOR A CARGO",
          "origen": "operativo.vehiculos_menores_cargo",
          "tipo": "number"
        },
        {
          "columna": "O",
          "encabezado": "PERSONAL PNP DE APOYO",
          "origen": "operativo.personal_apoyo_pnp",
          "tipo": "number"
        },
        {
          "columna": "P",
          "encabezado": "VEHICULO MAYOR DE APOYO",
          "origen": "operativo.vehiculos_mayores_apoyo_pnp",
          "tipo": "number"
        },
        {
          "columna": "Q",
          "encabezado": "VEHICULO MENOR DE APOYO",
          "origen": "operativo.vehiculos_menores_apoyo_pnp",
          "tipo": "number"
        },
        {
          "columna": "R",
          "encabezado": "PERSONAL FF.AA DE APOYO",
          "origen": "operativo.personal_apoyo_ffaa",
          "tipo": "number"
        },
        {
          "columna": "S",
          "encabezado": "VEHICULO MAYOR FF.AA DE APOYO",
          "origen": "operativo.vehiculos_mayores_apoyo_ffaa",
          "tipo": "number"
        },
        {
          "columna": "T",
          "encabezado": "VEHICULO MENOR FF.AA DE APOYO",
          "origen": "operativo.vehiculos_menores_apoyo_ffaa",
          "tipo": "number"
        },
        {
          "columna": "U",
          "encabezado": "OTRAS ENTIDADES",
          "origen": "operativo.otras_entidades",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "VEHICULO MAYOR OTRAS ENTIDADES",
          "origen": "operativo.vehiculos_mayores_otras_entidades",
          "tipo": "number"
        },
        {
          "columna": "W",
          "encabezado": "VEHICULO MENOR OTRAS ENTIDADES",
          "origen": "operativo.vehiculos_menores_otras_entidades",
          "tipo": "number"
        },
        {
          "columna": "X",
          "encabezado": "DIRECCION -DIRNIC DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": "NOTA INFORMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AE",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
        },
        {
          "columna": "AF",
          "encabezado": "DETALLE DE LA UBICACIÓN",
          "origen": "intervencion.detalle_ubicacion",
          "tipo": "text"
        },
        {
          "columna": "AG",
          "encabezado": "CANTIDAD DE PERSONAS QUE SE INTERVIENEN",
          "origen": "operativo.personas_intervenidas",
          "tipo": "number"
        },
        {
          "columna": "AH",
          "encabezado": "CANTIDAD DE VEHICULOS MAYORES INTERVENIDOS",
          "origen": "operativo.vehiculos_mayores_intervenidos",
          "tipo": "number"
        },
        {
          "columna": "AI",
          "encabezado": "CANTIDAD DE VEHICULOS MENORES INTERVENIDOS",
          "origen": "operativo.vehiculos_menores_intervenidos",
          "tipo": "number"
        },
        {
          "columna": "AJ",
          "encabezado": "CONTROL DE IDENTIDAD DE PERSONAS EXTRANJERAS",
          "origen": "operativo.control_identidad_extranjeros",
          "tipo": "text"
        },
        {
          "columna": "AK",
          "encabezado": "INTERVENCION A PENALES",
          "origen": "operativo.intervencion_penales",
          "tipo": "text"
        },
        {
          "columna": "AL",
          "encabezado": "OPERATIVO A ESPECIFICAR",
          "origen": "operativo.operativo_especificar",
          "tipo": "text"
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
          "columna": "A",
          "encabezado": "N°",
          "origen": "derivado.numero",
          "tipo": "number"
        },
        {
          "columna": "B",
          "encabezado": "MES",
          "origen": "derivado.mes_intervencion",
          "tipo": "text"
        },
        {
          "columna": "C",
          "encabezado": "FECHA",
          "origen": "requisitoria.datos.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "HORA DETENCION",
          "origen": "requisitoria.datos.hora",
          "tipo": "time"
        },
        {
          "columna": "E",
          "encabezado": "APELLIDO PATERNO",
          "origen": "requisitoria.datos.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "APELLIDO MATERNO",
          "origen": "requisitoria.datos.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NOMBRES",
          "origen": "requisitoria.datos.nombres",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "EDAD",
          "origen": "requisitoria.datos.edad",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "GENERO",
          "origen": "requisitoria.datos.genero",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "requisitoria.datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "origen": "requisitoria.datos.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "origen": "requisitoria.datos.numero_documento",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "TIPO DE REQUISITORIA",
          "origen": "requisitoria.datos.tipo",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "EL REQUISITORIADO PERTENECE A LOS MAS BUSCADOS",
          "origen": "requisitoria.datos.mas_buscado",
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
          "encabezado": "EL RQ ES FUNCIONARIO PUBLICO",
          "origen": "requisitoria.datos.es_funcionario",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "ENTIDAD PUBLICA QUE PERTENECE",
          "origen": "requisitoria.datos.entidad_publica",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DETALLAR LA ENTIDAD PUBLICA",
          "origen": "requisitoria.datos.detalle_entidad",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "requisitoria.datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "DELITO FUERO/LEYES ESPECIALES",
          "origen": "requisitoria.datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "DELITO GENERAL",
          "origen": "requisitoria.datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "requisitoria.datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "SUB TIPO",
          "origen": "requisitoria.datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "requisitoria.datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "SI DET + DELITO FUERO/LEYES ESPECIALES 2",
          "origen": "requisitoria.datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "origen": "requisitoria.datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "origen": "requisitoria.datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "origen": "requisitoria.datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "AE",
          "encabezado": "DIRECCION -DIRNIC DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "AF",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "AG",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "AH",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "AI",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AJ",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AK",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AL",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
          "origen": "detencion.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "HORA DETENCION",
          "origen": "detencion.hora",
          "tipo": "time"
        },
        {
          "columna": "E",
          "encabezado": "APELLIDO PATERNO",
          "origen": "persona.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "APELLIDO MATERNO",
          "origen": "persona.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NOMBRES",
          "origen": "persona.nombres",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "EDAD",
          "origen": "persona.edad",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "GENERO",
          "origen": "persona.genero",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "persona.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "origen": "persona.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "origen": "persona.numero_documento",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "EL DETENIDO ES FUNCIONARIO PUBLICO",
          "origen": "detencion.es_funcionario_publico",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "ENTIDAD PUBLICA QUE PERTENECE",
          "origen": "detencion.entidad_publica",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "DETALLAR LA ENTIDAD PUBLICA",
          "origen": "detencion.detalle_entidad_publica",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "MOTIVO DE LA DETENCION",
          "origen": "detencion.motivo_detencion",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "delitos.0.es_tentativa",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "delitos.0.fuero_ley_especial",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "DELITO GENERAL",
          "origen": "delitos.0.delito_general",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "delitos.0.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "SUB TIPO",
          "origen": "delitos.0.subtipo",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "delitos.1.es_tentativa",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "SI DET + DELITO FUERO/LEYES ESPECIALES 2",
          "origen": "delitos.1.fuero_ley_especial",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "origen": "delitos.1.delito_general",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "origen": "delitos.1.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "origen": "delitos.1.subtipo",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "AE",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "AF",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "AG",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "AH",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AI",
          "encabezado": "INDICAR SI ES INTEGRANTE DE UNA BBCC /OOCC",
          "origen": "derivado.grupo",
          "tipo": "text"
        },
        {
          "columna": "AJ",
          "encabezado": "REGISTRAR EL NOMBRE DE LA BBCC /OOCC/NO ES INTEGRANTE",
          "origen": "detencion.nombre_organizacion",
          "tipo": "text"
        },
        {
          "columna": "AK",
          "encabezado": "ARMAS DE FUEGO - ARMA BLANCA -OTROS- NINGUNA",
          "origen": "derivado.armas",
          "tipo": "text"
        },
        {
          "columna": "AL",
          "encabezado": "TIPO ARMA",
          "origen": "derivado.tipos_armas",
          "tipo": "text"
        },
        {
          "columna": "AM",
          "encabezado": "SITUACION ACTUAL DEL DETENIDO",
          "origen": "detencion.situacion_actual",
          "tipo": "text"
        },
        {
          "columna": "AN",
          "encabezado": "REGISTRAR EL DOCUMENTO CON EL QUE LE DIERON LIBERTAD AL DETENIDO",
          "origen": "detencion.documento_libertad",
          "tipo": "text"
        },
        {
          "columna": "AO",
          "encabezado": "REGISTRAR EL DOCUMENTO CON EL QUE SE PONE A DISPOSICION AL DETENIDO",
          "origen": "detencion.documento_disposicion",
          "tipo": "text"
        },
        {
          "columna": "AP",
          "encabezado": "NOMBRE DEL FISCAL A CARGO",
          "origen": "detencion.fiscal_nombre",
          "tipo": "text"
        },
        {
          "columna": "AQ",
          "encabezado": "FISCALIA A LA QUE PERTENECE EL FISCAL A CARGO",
          "origen": "detencion.fiscalia",
          "tipo": "text"
        },
        {
          "columna": "AR",
          "encabezado": "PTO A DISP_DIRNIC /DIRNOS2",
          "origen": "detencion.disposicion_direccion",
          "tipo": "text"
        },
        {
          "columna": "AS",
          "encabezado": "PTO A DISP_DIRECCIONES /REGIONES /FRENTES2",
          "origen": "detencion.disposicion_region",
          "tipo": "text"
        },
        {
          "columna": "AT",
          "encabezado": "PTO A DISP_ DIVISION POLICIAL 2",
          "origen": "detencion.disposicion_division",
          "tipo": "text"
        },
        {
          "columna": "AU",
          "encabezado": "PTO A DISP_ DEPARTAMENTO POLICAL 2",
          "origen": "detencion.disposicion_departamento",
          "tipo": "text"
        },
        {
          "columna": "AV",
          "encabezado": "PTO A DISP_EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO 2",
          "origen": "detencion.disposicion_unidad",
          "tipo": "text"
        },
        {
          "columna": "AW",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AX",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AY",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
          "columna": "A",
          "encabezado": "N°",
          "origen": "generado.numero",
          "tipo": "number"
        },
        {
          "columna": "B",
          "encabezado": "MES",
          "origen": "generado.mes_fecha",
          "tipo": "text"
        },
        {
          "columna": "C",
          "encabezado": "FECHA",
          "origen": "menor.datos.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "HORA DETENCION",
          "origen": "menor.datos.hora",
          "tipo": "time"
        },
        {
          "columna": "E",
          "encabezado": "APELLIDO PATERNO",
          "origen": "menor.datos.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "APELLIDO MATERNO",
          "origen": "menor.datos.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NOMBRES",
          "origen": "menor.datos.nombres",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "EDAD",
          "origen": "menor.datos.edad",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "GENERO",
          "origen": "menor.datos.genero",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "menor.datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "TIPO DE DOC. DE IDENTIDAD",
          "origen": "menor.datos.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "N° DOC.DE IDENTIDAD",
          "origen": "menor.datos.numero_documento",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "MOTIVO DE LA DETENCION",
          "origen": "menor.datos.motivo",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "menor.datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "menor.datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DELITO GENERAL",
          "origen": "menor.datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "menor.datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "SUB TIPO DE DELITO",
          "origen": "menor.datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "menor.datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "FUERO/LEYES ESPECIALES2",
          "origen": "menor.datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "origen": "menor.datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "origen": "menor.datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "origen": "menor.datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "DIRECCION PNP",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "REGPOL/FP/ DD.EE",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": "DEPARTAMENTO /UNIDADES POLICIAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "AE",
          "encabezado": "AREAS/SECCION",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AF",
          "encabezado": "INDICAR SI ES INTEGRANTE DE UNA BBCC /OOCC",
          "origen": "menor.datos.grupo",
          "tipo": "text"
        },
        {
          "columna": "AG",
          "encabezado": "REGISTRAR EL NOMBRE DE LA BBCC /OOCC/NO ES INTEGRANTE",
          "origen": "menor.datos.nombre_grupo",
          "tipo": "text"
        },
        {
          "columna": "AH",
          "encabezado": "ARMAS DE FUEGO - ARMA BLANCA -OTROS- NINGUNA",
          "origen": "menor.datos.arma_categoria",
          "tipo": "text"
        },
        {
          "columna": "AI",
          "encabezado": "TIPO ARMA",
          "origen": "menor.datos.arma_tipo",
          "tipo": "text"
        },
        {
          "columna": "AJ",
          "encabezado": "SITUACION ACTUAL DEL DETENIDO",
          "origen": "menor.datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "AK",
          "encabezado": "REGISTRAR EL DOCUMENTO CON EL QUE LE DIERON LIBERTAD AL DETENIDO",
          "origen": "menor.datos.documento_libertad",
          "tipo": "text"
        },
        {
          "columna": "AL",
          "encabezado": "REGISTRAR EL DOCUMENTO CON EL QUE SE PONE A DISPOSICION AL DETENIDO",
          "origen": "menor.datos.documento_disposicion",
          "tipo": "text"
        },
        {
          "columna": "AM",
          "encabezado": "NOMBRE DEL FISCAL A CARGO",
          "origen": "menor.datos.fiscal",
          "tipo": "text"
        },
        {
          "columna": "AN",
          "encabezado": "FISCALIA A LA QUE PERTENECE EL FISCAL A CARGO",
          "origen": "menor.datos.fiscalia",
          "tipo": "text"
        },
        {
          "columna": "AO",
          "encabezado": "PTO A DISP_DIRNIC /DIRNOS2",
          "origen": "menor.datos.disposicion_direccion",
          "tipo": "text"
        },
        {
          "columna": "AP",
          "encabezado": "PTO A DISP_DIRECCIONES /REGIONES /FRENTES2",
          "origen": "menor.datos.disposicion_region",
          "tipo": "text"
        },
        {
          "columna": "AQ",
          "encabezado": "PTO A DISP_ DIVISION POLICIAL 2",
          "origen": "menor.datos.disposicion_division",
          "tipo": "text"
        },
        {
          "columna": "AR",
          "encabezado": "PTO A DISP_ DEPARTAMENTO POLICAL 2",
          "origen": "menor.datos.disposicion_departamento",
          "tipo": "text"
        },
        {
          "columna": "AS",
          "encabezado": "PTO A DISP_EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO 2",
          "origen": "menor.datos.disposicion_unidad",
          "tipo": "text"
        },
        {
          "columna": "AT",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AU",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AV",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
        }
      ]
    },
    {
      "nombre": "5_ENV_PBC",
      "tabla": "intervencion_drogas",
      "raiz": "droga",
      "tipo": "env_pbc",
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
          "encabezado": "CANTIDAD UNIDADES",
          "origen": "droga.cantidad",
          "tipo": "number"
        },
        {
          "columna": "F",
          "encabezado": "DIRECCION PNP",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "NOTA INFORMATIVA SICPIP",
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
      "nombre": "6_ENV_CC",
      "tabla": "intervencion_drogas",
      "raiz": "droga",
      "tipo": "env_cc",
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
          "encabezado": "CANTIDAD UNIDADES",
          "origen": "droga.cantidad",
          "tipo": "number"
        },
        {
          "columna": "F",
          "encabezado": "DIRECCION PNP",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "NOTA INFORMATIVA SICPIP",
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
      "nombre": "7_ENV_MARIHUANA",
      "tabla": "intervencion_drogas",
      "raiz": "droga",
      "tipo": "env_marihuana",
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
          "encabezado": "CANTIDAD UNIDADES",
          "origen": "droga.cantidad",
          "tipo": "number"
        },
        {
          "columna": "F",
          "encabezado": "DIRECCION PNP",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "NOTA INFORMATIVA SICPIP",
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
      "nombre": "13_ARMAS_FUEGO",
      "tabla": "intervencion_materiales",
      "raiz": "material",
      "tipo": "fuego",
      "encabezados_recuperados_de": "13_ARMAS AF",
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
          "encabezado": "APELLIDO PATERNO",
          "origen": "material.datos.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "APELLIDO MATERNO ",
          "origen": "material.datos.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NOMBRES ",
          "origen": "material.datos.nombres",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "EDAD",
          "origen": "material.datos.edad",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": " GENERO",
          "origen": "material.datos.genero",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "material.datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "origen": "material.datos.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "origen": "material.datos.numero_documento",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA ",
          "origen": "material.datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "material.datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "DELITO GENERAL ",
          "origen": "material.datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "material.datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "SUB TIPO DE DELITO ",
          "origen": "material.datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "material.datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": " SI DET + DELITO FUERO/LEYES ESPECIALES 2",
          "origen": "material.datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": " SI DET + DELITO/ DELITO GENERAL2",
          "origen": "material.datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": " SI DET + DELITO/DELITO ESPECIFICO2",
          "origen": "material.datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": " SI DET + DELITO/SUB TIPO2",
          "origen": "material.datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "SITUACION DEL  ARMA DEL  FUEGO",
          "origen": "material.datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": " TIPO DE ARMA ",
          "origen": "material.datos.tipo",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": " MARCA",
          "origen": "material.datos.marca",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": " MODELO",
          "origen": "material.datos.modelo",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": " CALIBRE",
          "origen": "material.datos.calibre",
          "tipo": "text"
        },
        {
          "columna": "AE",
          "encabezado": " SERIE",
          "origen": "material.datos.serie",
          "tipo": "text"
        },
        {
          "columna": "AF",
          "encabezado": " OTRAS CARACTERISTICAS",
          "origen": "material.datos.caracteristicas",
          "tipo": "text"
        },
        {
          "columna": "AG",
          "encabezado": " EL NOMBRE DEL FISCAL Y FISCALIA A CARGO",
          "origen": "material.datos.fiscal_fiscalia",
          "tipo": "text"
        },
        {
          "columna": "AH",
          "encabezado": "DIRECCION PNP",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "AI",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL ",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "AJ",
          "encabezado": " DIVISION POLICIAL ",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "AK",
          "encabezado": " DEPARTAMENTO POLICAL ",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "AL",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO ",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AM",
          "encabezado": "PROCEDENCIA DEL ARMA DE FUEGO",
          "origen": "material.datos.procedencia",
          "tipo": "text"
        },
        {
          "columna": "AN",
          "encabezado": "NRO DE REGISTRO SUCAMEC O CERTIFICADO DE PROPIEDAD",
          "origen": "material.datos.registro_sucamec",
          "tipo": "text"
        },
        {
          "columna": "AO",
          "encabezado": "N° DE DENUNCIAS O PERDIDA, ROBO U OTROS",
          "origen": "material.datos.denuncia",
          "tipo": "text"
        },
        {
          "columna": "AP",
          "encabezado": "PROPIETARIO",
          "origen": "material.datos.propietario",
          "tipo": "text"
        },
        {
          "columna": "AQ",
          "encabezado": "CANTIDAD DE MUNICIONES",
          "origen": "material.datos.cantidad_municiones",
          "tipo": "number"
        },
        {
          "columna": "AR",
          "encabezado": "TIPO DE MUNICIONES",
          "origen": "material.datos.tipo_municiones",
          "tipo": "text"
        },
        {
          "columna": "AS",
          "encabezado": "N° NOTA INFORMATIVA",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AT",
          "encabezado": "LATITUD ",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AU",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
          "encabezado": "APELLIDO PATERNO",
          "origen": "material.datos.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "APELLIDO MATERNO",
          "origen": "material.datos.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NOMBRES",
          "origen": "material.datos.nombres",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "EDAD",
          "origen": "material.datos.edad",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "GENERO",
          "origen": "material.datos.genero",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "material.datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "origen": "material.datos.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "N° DOCUMENTO DE IDENTIDAD",
          "origen": "material.datos.numero_documento",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "material.datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "material.datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "DELITO GENERAL",
          "origen": "material.datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "material.datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "SUB TIPO DE DELITO",
          "origen": "material.datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "material.datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "SI DET + DELITO FUERO/LEYES ESPECIALES 2",
          "origen": "material.datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "origen": "material.datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "origen": "material.datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "origen": "material.datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "SITUACION DEL ARMA BLANCA",
          "origen": "material.datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "TIPO ARMA BLANCA",
          "origen": "material.datos.tipo",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "SI SELECCIONO \"OTRO\"\n  ESPECIFICAR",
          "origen": "material.datos.otro_tipo",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "DIRECCION PNP",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AE",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "AF",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "AG",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "AH",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AI",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AJ",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
          "encabezado": "EL NOMBRE DE LA BANDA CRIMINAL  ( NO DEBE COMBINAR CELDA)",
          "origen": "grupo.nombre",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "APELLIDO PATERNO",
          "origen": "persona.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "APELLIDO MATERNO",
          "origen": "persona.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "NOMBRES",
          "origen": "persona.nombres",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": "EDAD",
          "origen": "persona.edad",
          "tipo": "number"
        },
        {
          "columna": "J",
          "encabezado": "GENERO",
          "origen": "persona.genero",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "persona.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "origen": "persona.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "N° DE DOCUEMNTO DE IDENTIDAD",
          "origen": "persona.numero_documento",
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
          "encabezado": "REFERENCIA DEL LUGAR",
          "origen": "grupo.referencia_lugar",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "delitos.0.es_tentativa",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "delitos.0.fuero_ley_especial",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DELITO GENERAL",
          "origen": "delitos.0.delito_general",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "delitos.0.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "SUB TIPO",
          "origen": "delitos.0.subtipo",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "delitos.1.es_tentativa",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "FUERO/LEYES ESPECIALES2",
          "origen": "delitos.1.fuero_ley_especial",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "SI DET + DELITO/ DELITO GENERAL2",
          "origen": "delitos.1.delito_general",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "SI DET + DELITO/DELITO ESPECIFICO2",
          "origen": "delitos.1.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "SI DET + DELITO/SUB TIPO2",
          "origen": "delitos.1.subtipo",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "LA MODALIDAD DE LA BANDA CRIMINAL",
          "origen": "grupo.modalidad",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": "EL MOTIVO DE LA DETENCION (FLAGRANCIA - DETENCION PRELIMINAR)",
          "origen": "detencion.motivo_detencion",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": "NOMBRE DEL FISCAL",
          "origen": "detencion.fiscal_nombre",
          "tipo": "text"
        },
        {
          "columna": "AE",
          "encabezado": "FISCALIA A LA QUE PERTENECE2",
          "origen": "detencion.fiscalia",
          "tipo": "text"
        },
        {
          "columna": "AF",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "AG",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "AH",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "AI",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "AJ",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AK",
          "encabezado": "SITUACION ACTUAL DEL DETENIDO",
          "origen": "detencion.situacion_actual",
          "tipo": "text"
        },
        {
          "columna": "AL",
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AM",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AN",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
        },
        {
          "columna": "AO",
          "encabezado": "(PONER SI, SÓLO A UNO DE LOS MIEMBROS DE LAS BANDAS)\n\n",
          "origen": "derivado.contar_banda",
          "tipo": "text"
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
          "encabezado": " EL NOMBRE DE LA ORGANIZACION CRIMINAL  ( NO DEBE  COMBINAR CELDA)",
          "origen": "grupo.nombre",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "ROL QUE DESEMPEÑA  EN LA OO.CC",
          "origen": "integrante.rol",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": " APELLIDO PATERNO",
          "origen": "persona.apellido_paterno",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": " APELLIDO MATERNO ",
          "origen": "persona.apellido_materno",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": " NOMBRES ",
          "origen": "persona.nombres",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "EDAD",
          "origen": "persona.edad",
          "tipo": "number"
        },
        {
          "columna": "K",
          "encabezado": " GENERO",
          "origen": "persona.genero",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "persona.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "TIPO DOCUMENTO DE IDENTIDAD",
          "origen": "persona.tipo_documento",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": " N°  DE DOCUEMNTO DE IDENTIDAD",
          "origen": "persona.numero_documento",
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
          "encabezado": " REFERENCIA DEL LUGAR ",
          "origen": "grupo.referencia_lugar",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA ",
          "origen": "delitos.0.es_tentativa",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "FUERO/LEYES ESPECIALES ",
          "origen": "delitos.0.fuero_ley_especial",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": " DELITO GENERAL",
          "origen": "delitos.0.delito_general",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "delitos.0.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "SUB TIPO",
          "origen": "delitos.0.subtipo",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "delitos.1.es_tentativa",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "FUERO/LEYES ESPECIALES2",
          "origen": "delitos.1.fuero_ley_especial",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": " SI DET + DELITO/ DELITO GENERAL2",
          "origen": "delitos.1.delito_general",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": " SI DET + DELITO/DELITO ESPECIFICO2",
          "origen": "delitos.1.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": " SI DET + DELITO/SUB TIPO2",
          "origen": "delitos.1.subtipo",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": "  LA MODALIDAD  DE LA BANDA CRIMINAL ",
          "origen": "grupo.modalidad",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": " EL MOTIVO DE LA DETENCION (FLAGRANCIA - DETENCION PRELIMINAR)",
          "origen": "detencion.motivo_detencion",
          "tipo": "text"
        },
        {
          "columna": "AE",
          "encabezado": " NOMBRE DEL FISCAL ",
          "origen": "detencion.fiscal_nombre",
          "tipo": "text"
        },
        {
          "columna": "AF",
          "encabezado": " FISCALIA A LA QUE PERTENECE EL  FISCAL ",
          "origen": "detencion.fiscalia",
          "tipo": "text"
        },
        {
          "columna": "AG",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "AH",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "AI",
          "encabezado": " DIVISION POLICIAL ",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "AJ",
          "encabezado": " DEPARTAMENTO POLICAL ",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "AK",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO ",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AL",
          "encabezado": "SITUACION ACTUAL DEL DETENIDO ",
          "origen": "detencion.situacion_actual",
          "tipo": "text"
        },
        {
          "columna": "AM",
          "encabezado": " N° DE NOTA INFOMATIVA REALIZADA",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AN",
          "encabezado": "LATITUD ",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AO",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
          "encabezado": "PLACA",
          "origen": "vehiculo.datos.placa",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "MARCA",
          "origen": "vehiculo.datos.marca",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "SITUACION DEL VEHICULO",
          "origen": "vehiculo.datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "VALORIZACION DE LOS VEHICULOS INCAUTADOS",
          "origen": "vehiculo.datos.valorizacion",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "vehiculo.datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "vehiculo.datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DELITO GENERAL",
          "origen": "vehiculo.datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "vehiculo.datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "SUB TIPO DE DELITO",
          "origen": "vehiculo.datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "vehiculo.datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "SI EL VEH + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "origen": "vehiculo.datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "SI EL VEH + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "origen": "vehiculo.datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "SI EL VEH + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "origen": "vehiculo.datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "SI EL VEH + DE UN DELITO /DELITO/SUB TIPO2",
          "origen": "vehiculo.datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DIRECCION PNP",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "LATITUD",
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
      "nombre": "18_VEH. MENOR",
      "tabla": "intervencion_vehiculos",
      "raiz": "vehiculo",
      "tipo": "menor",
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
          "encabezado": "PLACA",
          "origen": "vehiculo.datos.placa",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "MARCA",
          "origen": "vehiculo.datos.marca",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "SITUACION DEL VEHICULO",
          "origen": "vehiculo.datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "VALORIZACION DE LOS VEHICULOS INCAUTADOS",
          "origen": "vehiculo.datos.valorizacion",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "vehiculo.datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "vehiculo.datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DELITO GENERAL",
          "origen": "vehiculo.datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "vehiculo.datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "SUB TIPO DE DELITO",
          "origen": "vehiculo.datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "vehiculo.datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "SI EL VEH + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "origen": "vehiculo.datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "SI EL VEH + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "origen": "vehiculo.datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "SI EL VEH + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "origen": "vehiculo.datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "SI EL VEH + DE UN DELITO /DELITO/SUB TIPO2",
          "origen": "vehiculo.datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DIRECCION PNP",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DIRECCION ESPECIALIZADAS/REGION /FRENTE POLICIAL",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "LATITUD",
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
      "nombre": "20_PROXENETISMO",
      "tabla": "intervencion_prostitucion",
      "raiz": "prostitucion",
      "tipo": null,
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
          "origen": "prostitucion.datos.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "HORA INTERVENCION",
          "origen": "prostitucion.datos.hora",
          "tipo": "time"
        },
        {
          "columna": "E",
          "encabezado": "EDAD",
          "origen": "prostitucion.datos.edad",
          "tipo": "number"
        },
        {
          "columna": "F",
          "encabezado": "GENERO",
          "origen": "prostitucion.datos.genero",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "prostitucion.datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "R",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
          "origen": "victima.datos.fecha",
          "tipo": "date"
        },
        {
          "columna": "D",
          "encabezado": "HORA INTERVENCION",
          "origen": "victima.datos.hora",
          "tipo": "time"
        },
        {
          "columna": "E",
          "encabezado": "EDAD",
          "origen": "victima.datos.edad",
          "tipo": "number"
        },
        {
          "columna": "F",
          "encabezado": "GENERO",
          "origen": "victima.datos.genero",
          "tipo": "text"
        },
        {
          "columna": "G",
          "encabezado": "NACIONALIDAD (PAIS)",
          "origen": "victima.datos.nacionalidad",
          "tipo": "text"
        },
        {
          "columna": "H",
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "I",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "R",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
          "encabezado": "HORA",
          "origen": "datos.hora",
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
          "encabezado": "SOLES",
          "origen": "datos.soles",
          "tipo": "number"
        },
        {
          "columna": "I",
          "encabezado": "DOLARES",
          "origen": "datos.dolares",
          "tipo": "number"
        },
        {
          "columna": "J",
          "encabezado": "EUROS",
          "origen": "datos.euros",
          "tipo": "number"
        },
        {
          "columna": "K",
          "encabezado": "DINERO OTRO",
          "origen": "datos.dinero_otro",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "M",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "DELITO GENERAL",
          "origen": "datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "SUB TIPO",
          "origen": "datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "SI EL DINERO + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "origen": "datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "SI EL DINERO + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "origen": "datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "SI EL DINERO + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "origen": "datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "SI EL DINERO + DE UN DELITO /DELITO/SUB TIPO2",
          "origen": "datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "N° DE NOTA INFOMATIVA REALIZADA",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "LATITUD",
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
      "nombre": "30_CELULAR",
      "tabla": "intervencion_complementarios",
      "raiz": "complementario",
      "tipo": "celulares",
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
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "E",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "F",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
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
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "J",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "K",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "L",
          "encabezado": "CANTIDAD",
          "origen": "datos.cantidad",
          "tipo": "number"
        },
        {
          "columna": "M",
          "encabezado": "MARCA",
          "origen": "datos.marca",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "MODELO",
          "origen": "datos.modelo",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "IMEI FÍSICO",
          "origen": "datos.imei_fisico",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "IMEI LÓGICO",
          "origen": "datos.imei_logico",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA",
          "origen": "datos.tentativa",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "FUERO/LEYES ESPECIALES",
          "origen": "datos.fuero",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DELITO GENERAL",
          "origen": "datos.delito_general",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DELITO ESPECIFICO",
          "origen": "datos.delito_especifico",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "SUB TIPO",
          "origen": "datos.subtipo",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "EL DELITO COMETIDO ES TENTANTIVA 2",
          "origen": "datos.tentativa_2",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "SI EL CELULAR + DE UN DELITO /FUERO/LEYES ESPECIALES 2",
          "origen": "datos.fuero_2",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "SI EL CELULAR + DE UN DELITO / DELITO/ DELITO GENERAL2",
          "origen": "datos.delito_general_2",
          "tipo": "text"
        },
        {
          "columna": "Y",
          "encabezado": "SI EL CELULAR + DE UN DELITO / DELITO/DELITO ESPECIFICO2",
          "origen": "datos.delito_especifico_2",
          "tipo": "text"
        },
        {
          "columna": "Z",
          "encabezado": "SI EL CELULAR + DE UN DELITO /DELITO/SUB TIPO2",
          "origen": "datos.subtipo_2",
          "tipo": "text"
        },
        {
          "columna": "AA",
          "encabezado": "OBSERVACIONES",
          "origen": "datos.observaciones",
          "tipo": "text"
        },
        {
          "columna": "AB",
          "encabezado": "SITUACION DEL EQUIPO MOVIL",
          "origen": "datos.situacion",
          "tipo": "text"
        },
        {
          "columna": "AC",
          "encabezado": "N° NOTA INFORMATIVA (SICPIP)",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "AD",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "AE",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
          "encabezado": "HORA DETENCION",
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
          "encabezado": "DEPARTAMENTO",
          "origen": "intervencion.departamento",
          "tipo": "text"
        },
        {
          "columna": "N",
          "encabezado": "PROVINCIA",
          "origen": "intervencion.provincia",
          "tipo": "text"
        },
        {
          "columna": "O",
          "encabezado": "DISTRITO",
          "origen": "intervencion.distrito",
          "tipo": "text"
        },
        {
          "columna": "P",
          "encabezado": "LEY DE MIGRACIONES SELECCIONAR",
          "origen": "datos.ley_migraciones",
          "tipo": "text"
        },
        {
          "columna": "Q",
          "encabezado": "SUB TIPO DE INFRACCION",
          "origen": "datos.subtipo_infraccion",
          "tipo": "text"
        },
        {
          "columna": "R",
          "encabezado": "DIRNIC /DIRNOS",
          "origen": "intervencion.direccion_policial",
          "tipo": "text"
        },
        {
          "columna": "S",
          "encabezado": "DIRECCIONES /REGIONES /FRENTES",
          "origen": "intervencion.direccion_especializada_region",
          "tipo": "text"
        },
        {
          "columna": "T",
          "encabezado": "DIVISION POLICIAL",
          "origen": "intervencion.division_policial",
          "tipo": "text"
        },
        {
          "columna": "U",
          "encabezado": "DEPARTAMENTO POLICAL",
          "origen": "intervencion.departamento_policial",
          "tipo": "text"
        },
        {
          "columna": "V",
          "encabezado": "EL NOMBRE DE LA UNIDAD/AREAS /EQUIPO",
          "origen": "intervencion.unidad_area_equipo",
          "tipo": "text"
        },
        {
          "columna": "W",
          "encabezado": "NOTA INFOMATIVA SICPIP",
          "origen": "intervencion.nota_sicpip",
          "tipo": "text"
        },
        {
          "columna": "X",
          "encabezado": "LATITUD",
          "origen": "intervencion.latitud",
          "tipo": "number"
        },
        {
          "columna": "Y",
          "encabezado": "LONGITUD",
          "origen": "intervencion.longitud",
          "tipo": "number"
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
    }
  ]
};
