window.REQUISITORIADOS_CATALOGO = {
  "version": 2,
  "hoja": "2_RQ N",
  "unidad_fila": "Un requisitoriado independiente del módulo Detenidos.",
  "campos": [
    {
      "key": "fecha",
      "label": "Fecha de intervención",
      "group": "identidad",
      "type": "date",
      "required": true
    },
    {
      "key": "hora",
      "label": "Hora de intervención",
      "group": "identidad",
      "type": "time",
      "required": false
    },
    {
      "key": "apellido_paterno",
      "label": "Apellido paterno",
      "group": "identidad",
      "type": "text",
      "required": true
    },
    {
      "key": "apellido_materno",
      "label": "Apellido materno",
      "group": "identidad",
      "type": "text",
      "required": false
    },
    {
      "key": "nombres",
      "label": "Nombres",
      "group": "identidad",
      "type": "text",
      "required": true
    },
    {
      "key": "edad",
      "label": "Edad al momento del hecho",
      "group": "identidad",
      "type": "number",
      "required": false
    },
    {
      "key": "genero",
      "label": "Género",
      "group": "identidad",
      "type": "text",
      "required": false,
      "source": "genero"
    },
    {
      "key": "nacionalidad",
      "label": "Nacionalidad",
      "group": "identidad",
      "type": "text",
      "required": false,
      "source": "nacionalidad"
    },
    {
      "key": "tipo_documento",
      "label": "Tipo de documento",
      "group": "identidad",
      "type": "text",
      "required": false,
      "source": "tipoDocumento"
    },
    {
      "key": "numero_documento",
      "label": "Número de documento",
      "group": "identidad",
      "type": "text",
      "required": false
    },
    {
      "key": "tipo",
      "label": "Tipo de requisitoria",
      "group": "requisitoria",
      "type": "text",
      "required": true,
      "options": [
        "ORDEN DE CAPTURA",
        "RQ INTERNACIONAL"
      ]
    },
    {
      "key": "mas_buscado",
      "label": "¿Pertenece a los más buscados?",
      "group": "requisitoria",
      "type": "text",
      "required": true,
      "options": [
        "Sí",
        "No"
      ]
    },
    {
      "key": "es_funcionario",
      "label": "¿Es funcionario / servidor público?",
      "group": "requisitoria",
      "type": "text",
      "required": true,
      "options": [
        "Sí",
        "No"
      ]
    },
    {
      "key": "entidad_publica",
      "label": "Entidad pública",
      "group": "requisitoria",
      "type": "text",
      "required": false
    },
    {
      "key": "detalle_entidad",
      "label": "Detalle de entidad",
      "group": "requisitoria",
      "type": "text",
      "required": false
    },
    {
      "key": "tentativa",
      "label": "¿Es tentativa?",
      "group": "delito1",
      "type": "text",
      "required": false,
      "options": [
        "Sí",
        "No"
      ]
    },
    {
      "key": "fuero",
      "label": "Fuero / leyes especiales",
      "group": "delito1",
      "type": "text",
      "required": false
    },
    {
      "key": "delito_general",
      "label": "Delito general",
      "group": "delito1",
      "type": "text",
      "required": false
    },
    {
      "key": "delito_especifico",
      "label": "Delito específico",
      "group": "delito1",
      "type": "text",
      "required": false
    },
    {
      "key": "subtipo",
      "label": "Subtipo",
      "group": "delito1",
      "type": "text",
      "required": false
    },
    {
      "key": "tentativa_2",
      "label": "¿Es tentativa?",
      "group": "delito2",
      "type": "text",
      "required": false,
      "options": [
        "Sí",
        "No"
      ]
    },
    {
      "key": "fuero_2",
      "label": "Fuero / leyes especiales",
      "group": "delito2",
      "type": "text",
      "required": false
    },
    {
      "key": "delito_general_2",
      "label": "Delito general",
      "group": "delito2",
      "type": "text",
      "required": false
    },
    {
      "key": "delito_especifico_2",
      "label": "Delito específico",
      "group": "delito2",
      "type": "text",
      "required": false
    },
    {
      "key": "subtipo_2",
      "label": "Subtipo",
      "group": "delito2",
      "type": "text",
      "required": false
    }
  ],
  "catalogos": {
    "tipo": {
      "origen": "OTRO!E66:E67 (TIPO_RQ)",
      "valores": [
        "ORDEN DE CAPTURA",
        "RQ INTERNACIONAL"
      ]
    },
    "mas_buscado": {
      "origen": "OTRO!C51:C52 (MAS_BUSCADO)",
      "valores": [
        "SI",
        "NO"
      ]
    }
  },
  "columnas": {
    "A": "derivado.numero",
    "B": "derivado.mes_intervencion",
    "C": "requisitoria.datos.fecha",
    "D": "requisitoria.datos.hora",
    "E": "requisitoria.datos.apellido_paterno",
    "F": "requisitoria.datos.apellido_materno",
    "G": "requisitoria.datos.nombres",
    "H": "requisitoria.datos.edad",
    "I": "requisitoria.datos.genero",
    "J": "requisitoria.datos.nacionalidad",
    "K": "requisitoria.datos.tipo_documento",
    "L": "requisitoria.datos.numero_documento",
    "M": "requisitoria.datos.tipo",
    "N": "requisitoria.datos.mas_buscado",
    "O": "operativo.departamento",
    "P": "operativo.provincia",
    "Q": "operativo.distrito",
    "R": "requisitoria.datos.es_funcionario",
    "S": "requisitoria.datos.entidad_publica",
    "T": "requisitoria.datos.detalle_entidad",
    "U": "requisitoria.datos.tentativa",
    "V": "requisitoria.datos.fuero",
    "W": "requisitoria.datos.delito_general",
    "X": "requisitoria.datos.delito_especifico",
    "Y": "requisitoria.datos.subtipo",
    "Z": "requisitoria.datos.tentativa_2",
    "AA": "requisitoria.datos.fuero_2",
    "AB": "requisitoria.datos.delito_general_2",
    "AC": "requisitoria.datos.delito_especifico_2",
    "AD": "requisitoria.datos.subtipo_2",
    "AE": "operativo.direccion_policial",
    "AF": "operativo.direccion_especializada_region",
    "AG": "operativo.division_policial",
    "AH": "operativo.departamento_policial",
    "AI": "operativo.unidad_area_equipo",
    "AJ": "operativo.nota_sicpip",
    "AK": "operativo.latitud",
    "AL": "operativo.longitud"
  },
  "reglas": [
    "No exige ni crea una detención. Conteo independiente.",
    "La referencia detencion_id de registros anteriores se conserva únicamente como trazabilidad.",
    "Funcionario No limpia entidad y detalle.",
    "Las 38 columnas quedan mapeadas; la exportación completa sigue pendiente."
  ]
};
