// Generado por scripts/generar-mapeo-materiales.py
window.MATERIALES_CATALOGO = {
  "version": 1,
  "tipos": [
    {
      "tipo": "fuego",
      "hoja": "13_ARMAS AF",
      "titulo": "Armas de fuego",
      "descripcion": "Marca, calibre, serie y procedencia",
      "campos": [
        {
          "key": "apellido_paterno",
          "label": "Apellido paterno",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "apellido_materno",
          "label": "Apellido materno",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "nombres",
          "label": "Nombres",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "edad",
          "label": "Edad",
          "group": "persona",
          "type": "number",
          "required": false
        },
        {
          "key": "genero",
          "label": "Género",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "nacionalidad",
          "label": "Nacionalidad",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "tipo_documento",
          "label": "Tipo de documento",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "numero_documento",
          "label": "Número de documento",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "tentativa",
          "label": "¿Tentativa?",
          "group": "delito1",
          "type": "text",
          "required": false
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
          "label": "¿Tentativa del segundo delito?",
          "group": "delito2",
          "type": "text",
          "required": false
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
        },
        {
          "key": "situacion",
          "label": "Situación",
          "group": "material",
          "type": "text",
          "required": true
        },
        {
          "key": "tipo",
          "label": "Tipo",
          "group": "material",
          "type": "text",
          "required": true
        },
        {
          "key": "marca",
          "label": "Marca",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "modelo",
          "label": "Modelo",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "calibre",
          "label": "Calibre",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "serie",
          "label": "Serie",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "caracteristicas",
          "label": "Otras características",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "fiscal_fiscalia",
          "label": "Fiscal y fiscalía a cargo",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "procedencia",
          "label": "Procedencia",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "registro_sucamec",
          "label": "Registro SUCAMEC o certificado de propiedad",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "denuncia",
          "label": "Denuncia de pérdida, robo u otros",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "propietario",
          "label": "Propietario",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "cantidad_municiones",
          "label": "Cantidad de municiones asociadas",
          "group": "material",
          "type": "number",
          "required": false
        },
        {
          "key": "tipo_municiones",
          "label": "Tipo de municiones asociadas",
          "group": "material",
          "type": "text",
          "required": false
        }
      ],
      "columnas": {
        "A": "derivado.numero",
        "B": "derivado.mes",
        "C": "intervencion.fecha",
        "D": "intervencion.hora",
        "E": "material.datos.apellido_paterno",
        "F": "material.datos.apellido_materno",
        "G": "material.datos.nombres",
        "H": "material.datos.edad",
        "I": "material.datos.genero",
        "J": "material.datos.nacionalidad",
        "K": "material.datos.tipo_documento",
        "L": "material.datos.numero_documento",
        "M": "intervencion.departamento",
        "N": "intervencion.provincia",
        "O": "intervencion.distrito",
        "P": "material.datos.tentativa",
        "Q": "material.datos.fuero",
        "R": "material.datos.delito_general",
        "S": "material.datos.delito_especifico",
        "T": "material.datos.subtipo",
        "U": "material.datos.tentativa_2",
        "V": "material.datos.fuero_2",
        "W": "material.datos.delito_general_2",
        "X": "material.datos.delito_especifico_2",
        "Y": "material.datos.subtipo_2",
        "Z": "material.datos.situacion",
        "AA": "material.datos.tipo",
        "AB": "material.datos.marca",
        "AC": "material.datos.modelo",
        "AD": "material.datos.calibre",
        "AE": "material.datos.serie",
        "AF": "material.datos.caracteristicas",
        "AG": "material.datos.fiscal_fiscalia",
        "AH": "intervencion.direccion_policial",
        "AI": "intervencion.direccion_especializada_region",
        "AJ": "intervencion.division_policial",
        "AK": "intervencion.departamento_policial",
        "AL": "intervencion.unidad_area_equipo",
        "AM": "material.datos.procedencia",
        "AN": "material.datos.registro_sucamec",
        "AO": "material.datos.denuncia",
        "AP": "material.datos.propietario",
        "AQ": "material.datos.cantidad_municiones",
        "AR": "material.datos.tipo_municiones",
        "AS": "intervencion.nota_sicpip",
        "AT": "intervencion.latitud",
        "AU": "intervencion.longitud"
      }
    },
    {
      "tipo": "blanca",
      "hoja": "14_ARMAS BL",
      "titulo": "Armas blancas",
      "descripcion": "Tipo, situación y características",
      "campos": [
        {
          "key": "apellido_paterno",
          "label": "Apellido paterno",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "apellido_materno",
          "label": "Apellido materno",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "nombres",
          "label": "Nombres",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "edad",
          "label": "Edad",
          "group": "persona",
          "type": "number",
          "required": false
        },
        {
          "key": "genero",
          "label": "Género",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "nacionalidad",
          "label": "Nacionalidad",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "tipo_documento",
          "label": "Tipo de documento",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "numero_documento",
          "label": "Número de documento",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "tentativa",
          "label": "¿Tentativa?",
          "group": "delito1",
          "type": "text",
          "required": false
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
          "label": "¿Tentativa del segundo delito?",
          "group": "delito2",
          "type": "text",
          "required": false
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
        },
        {
          "key": "situacion",
          "label": "Situación",
          "group": "material",
          "type": "text",
          "required": true
        },
        {
          "key": "tipo",
          "label": "Tipo",
          "group": "material",
          "type": "text",
          "required": true
        },
        {
          "key": "otro_tipo",
          "label": "Si seleccionó otro, especifique",
          "group": "material",
          "type": "text",
          "required": false
        }
      ],
      "columnas": {
        "A": "derivado.numero",
        "B": "derivado.mes",
        "C": "intervencion.fecha",
        "D": "intervencion.hora",
        "E": "material.datos.apellido_paterno",
        "F": "material.datos.apellido_materno",
        "G": "material.datos.nombres",
        "H": "material.datos.edad",
        "I": "material.datos.genero",
        "J": "material.datos.nacionalidad",
        "K": "material.datos.tipo_documento",
        "L": "material.datos.numero_documento",
        "M": "material.datos.tentativa",
        "N": "material.datos.fuero",
        "O": "material.datos.delito_general",
        "P": "material.datos.delito_especifico",
        "Q": "material.datos.subtipo",
        "R": "material.datos.tentativa_2",
        "S": "material.datos.fuero_2",
        "T": "material.datos.delito_general_2",
        "U": "material.datos.delito_especifico_2",
        "V": "material.datos.subtipo_2",
        "W": "material.datos.situacion",
        "X": "material.datos.tipo",
        "Y": "material.datos.otro_tipo",
        "Z": "intervencion.direccion_policial",
        "AA": "intervencion.direccion_especializada_region",
        "AB": "intervencion.division_policial",
        "AC": "intervencion.departamento_policial",
        "AD": "intervencion.unidad_area_equipo",
        "AE": "intervencion.departamento",
        "AF": "intervencion.provincia",
        "AG": "intervencion.distrito",
        "AH": "intervencion.nota_sicpip",
        "AI": "intervencion.latitud",
        "AJ": "intervencion.longitud"
      }
    },
    {
      "tipo": "explosivo",
      "hoja": "31_EXPLOSIVOS ",
      "titulo": "Explosivos",
      "descripcion": "Material, situación y cantidad",
      "campos": [
        {
          "key": "apellido_paterno",
          "label": "Apellido paterno",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "apellido_materno",
          "label": "Apellido materno",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "nombres",
          "label": "Nombres",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "edad",
          "label": "Edad",
          "group": "persona",
          "type": "number",
          "required": false
        },
        {
          "key": "genero",
          "label": "Género",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "nacionalidad",
          "label": "Nacionalidad",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "tipo_documento",
          "label": "Tipo de documento",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "numero_documento",
          "label": "Número de documento",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "tentativa",
          "label": "¿Tentativa?",
          "group": "delito1",
          "type": "text",
          "required": false
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
          "label": "¿Tentativa del segundo delito?",
          "group": "delito2",
          "type": "text",
          "required": false
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
        },
        {
          "key": "motivo",
          "label": "Motivo: hallazgo o incautación",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "situacion",
          "label": "Situación",
          "group": "material",
          "type": "text",
          "required": true
        },
        {
          "key": "tipo",
          "label": "Tipo",
          "group": "material",
          "type": "text",
          "required": true
        },
        {
          "key": "detalle",
          "label": "Detalle del material",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "detalle_2",
          "label": "Detalle adicional del material",
          "group": "material",
          "type": "text",
          "required": false
        },
        {
          "key": "cantidad",
          "label": "Cantidad",
          "group": "material",
          "type": "number",
          "required": true
        }
      ],
      "columnas": {
        "A": "derivado.numero",
        "B": "derivado.mes",
        "C": "intervencion.fecha",
        "D": "intervencion.hora",
        "E": "material.datos.apellido_paterno",
        "F": "material.datos.apellido_materno",
        "G": "material.datos.nombres",
        "H": "material.datos.edad",
        "I": "material.datos.genero",
        "J": "material.datos.nacionalidad",
        "K": "material.datos.tipo_documento",
        "L": "material.datos.numero_documento",
        "M": "intervencion.departamento",
        "N": "intervencion.provincia",
        "O": "intervencion.distrito",
        "P": "material.datos.tentativa",
        "Q": "material.datos.fuero",
        "R": "material.datos.delito_general",
        "S": "material.datos.delito_especifico",
        "T": "material.datos.subtipo",
        "U": "material.datos.tentativa_2",
        "V": "material.datos.fuero_2",
        "W": "material.datos.delito_general_2",
        "X": "material.datos.delito_especifico_2",
        "Y": "material.datos.subtipo_2",
        "Z": "material.datos.motivo",
        "AA": "material.datos.situacion",
        "AB": "material.datos.tipo",
        "AC": "material.datos.detalle",
        "AD": "material.datos.detalle_2",
        "AE": "material.datos.cantidad",
        "AF": "intervencion.direccion_policial",
        "AG": "intervencion.direccion_especializada_region",
        "AH": "intervencion.division_policial",
        "AI": "intervencion.departamento_policial",
        "AJ": "intervencion.unidad_area_equipo",
        "AK": "intervencion.nota_sicpip",
        "AL": "intervencion.latitud",
        "AM": "intervencion.longitud"
      }
    },
    {
      "tipo": "municion",
      "hoja": "32_MUNICIONES",
      "titulo": "Municiones",
      "descripcion": "Cantidad registrada en el operativo",
      "campos": [
        {
          "key": "cantidad",
          "label": "Cantidad",
          "group": "material",
          "type": "number",
          "required": true
        }
      ],
      "columnas": {
        "A": "derivado.numero",
        "B": "derivado.mes",
        "C": "intervencion.fecha",
        "D": "intervencion.hora",
        "E": "intervencion.departamento",
        "F": "intervencion.provincia",
        "G": "intervencion.distrito",
        "H": "material.datos.cantidad",
        "I": "intervencion.direccion_policial",
        "J": "intervencion.direccion_especializada_region",
        "K": "intervencion.division_policial",
        "L": "intervencion.departamento_policial",
        "M": "intervencion.unidad_area_equipo",
        "N": "intervencion.nota_sicpip",
        "O": "intervencion.latitud",
        "P": "intervencion.longitud"
      }
    },
    {
      "tipo": "replica",
      "hoja": "51 REPLICA DE ARMA DE FUEGO ",
      "titulo": "Réplicas",
      "descripcion": "Tipo, situación y fiscalía",
      "campos": [
        {
          "key": "apellido_paterno",
          "label": "Apellido paterno",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "apellido_materno",
          "label": "Apellido materno",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "nombres",
          "label": "Nombres",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "edad",
          "label": "Edad",
          "group": "persona",
          "type": "number",
          "required": false
        },
        {
          "key": "genero",
          "label": "Género",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "nacionalidad",
          "label": "Nacionalidad",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "tipo_documento",
          "label": "Tipo de documento",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "numero_documento",
          "label": "Número de documento",
          "group": "persona",
          "type": "text",
          "required": false
        },
        {
          "key": "tentativa",
          "label": "¿Tentativa?",
          "group": "delito1",
          "type": "text",
          "required": false
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
          "label": "¿Tentativa del segundo delito?",
          "group": "delito2",
          "type": "text",
          "required": false
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
        },
        {
          "key": "situacion",
          "label": "Situación",
          "group": "material",
          "type": "text",
          "required": true
        },
        {
          "key": "tipo",
          "label": "Tipo",
          "group": "material",
          "type": "text",
          "required": true
        },
        {
          "key": "fiscal_fiscalia",
          "label": "Fiscal y fiscalía a cargo",
          "group": "material",
          "type": "text",
          "required": false
        }
      ],
      "columnas": {
        "A": "derivado.numero",
        "B": "derivado.mes",
        "C": "intervencion.fecha",
        "D": "intervencion.hora",
        "E": "material.datos.apellido_paterno",
        "F": "material.datos.apellido_materno",
        "G": "material.datos.nombres",
        "H": "material.datos.edad",
        "I": "material.datos.genero",
        "J": "material.datos.nacionalidad",
        "K": "material.datos.tipo_documento",
        "L": "material.datos.numero_documento",
        "M": "intervencion.departamento",
        "N": "intervencion.provincia",
        "O": "intervencion.distrito",
        "P": "material.datos.tentativa",
        "Q": "material.datos.fuero",
        "R": "material.datos.delito_general",
        "S": "material.datos.delito_especifico",
        "T": "material.datos.subtipo",
        "U": "material.datos.tentativa_2",
        "V": "material.datos.fuero_2",
        "W": "material.datos.delito_general_2",
        "X": "material.datos.delito_especifico_2",
        "Y": "material.datos.subtipo_2",
        "Z": "material.datos.situacion",
        "AA": "material.datos.tipo",
        "AB": "material.datos.fiscal_fiscalia",
        "AC": "intervencion.direccion_policial",
        "AD": "intervencion.direccion_especializada_region",
        "AE": "intervencion.division_policial",
        "AF": "intervencion.departamento_policial",
        "AG": "intervencion.unidad_area_equipo",
        "AH": "intervencion.nota_sicpip",
        "AI": "intervencion.latitud",
        "AJ": "intervencion.longitud"
      }
    }
  ]
};
