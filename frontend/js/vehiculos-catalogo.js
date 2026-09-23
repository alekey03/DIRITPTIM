// Generado por scripts/generar-mapeo-vehiculos.py
window.VEHICULOS_CATALOGO = {
  "version": 1,
  "tipos": [
    {
      "tipo": "mayor",
      "hoja": "17_VEH MAY",
      "titulo": "Vehículos mayores",
      "descripcion": "Placa, marca, situación y valorización",
      "campos": [
        {
          "key": "placa",
          "label": "Placa · si corresponde",
          "group": "vehiculo",
          "type": "text",
          "required": false
        },
        {
          "key": "marca",
          "label": "Marca",
          "group": "vehiculo",
          "type": "text",
          "required": true
        },
        {
          "key": "situacion",
          "label": "Situación",
          "group": "vehiculo",
          "type": "text",
          "required": true
        },
        {
          "key": "valorizacion",
          "label": "Valorización de lo incautado · si corresponde",
          "group": "vehiculo",
          "type": "number",
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
        }
      ],
      "columnas": {
        "A": "derivado.numero",
        "B": "derivado.mes",
        "C": "intervencion.fecha",
        "D": "intervencion.hora",
        "E": "vehiculo.datos.placa",
        "F": "vehiculo.datos.marca",
        "G": "vehiculo.datos.situacion",
        "H": "vehiculo.datos.valorizacion",
        "I": "vehiculo.datos.tentativa",
        "J": "vehiculo.datos.fuero",
        "K": "vehiculo.datos.delito_general",
        "L": "vehiculo.datos.delito_especifico",
        "M": "vehiculo.datos.subtipo",
        "N": "vehiculo.datos.tentativa_2",
        "O": "vehiculo.datos.fuero_2",
        "P": "vehiculo.datos.delito_general_2",
        "Q": "vehiculo.datos.delito_especifico_2",
        "R": "vehiculo.datos.subtipo_2",
        "S": "intervencion.direccion_policial",
        "T": "intervencion.direccion_especializada_region",
        "U": "intervencion.division_policial",
        "V": "intervencion.departamento_policial",
        "W": "intervencion.unidad_area_equipo",
        "X": "intervencion.departamento",
        "Y": "intervencion.provincia",
        "Z": "intervencion.distrito",
        "AA": "intervencion.nota_sicpip",
        "AB": "intervencion.latitud",
        "AC": "intervencion.longitud"
      }
    },
    {
      "tipo": "menor",
      "hoja": "18_VEH MENOR",
      "titulo": "Vehículos menores",
      "descripcion": "Registro individual del vehículo",
      "campos": [
        {
          "key": "placa",
          "label": "Placa · si corresponde",
          "group": "vehiculo",
          "type": "text",
          "required": false
        },
        {
          "key": "marca",
          "label": "Marca",
          "group": "vehiculo",
          "type": "text",
          "required": true
        },
        {
          "key": "situacion",
          "label": "Situación",
          "group": "vehiculo",
          "type": "text",
          "required": true
        },
        {
          "key": "valorizacion",
          "label": "Valorización de lo incautado · si corresponde",
          "group": "vehiculo",
          "type": "number",
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
        }
      ],
      "columnas": {
        "A": "derivado.numero",
        "B": "derivado.mes",
        "C": "intervencion.fecha",
        "D": "intervencion.hora",
        "E": "vehiculo.datos.placa",
        "F": "vehiculo.datos.marca",
        "G": "vehiculo.datos.situacion",
        "H": "vehiculo.datos.valorizacion",
        "I": "vehiculo.datos.tentativa",
        "J": "vehiculo.datos.fuero",
        "K": "vehiculo.datos.delito_general",
        "L": "vehiculo.datos.delito_especifico",
        "M": "vehiculo.datos.subtipo",
        "N": "vehiculo.datos.tentativa_2",
        "O": "vehiculo.datos.fuero_2",
        "P": "vehiculo.datos.delito_general_2",
        "Q": "vehiculo.datos.delito_especifico_2",
        "R": "vehiculo.datos.subtipo_2",
        "S": "intervencion.direccion_policial",
        "T": "intervencion.direccion_especializada_region",
        "U": "intervencion.division_policial",
        "V": "intervencion.departamento_policial",
        "W": "intervencion.unidad_area_equipo",
        "X": "intervencion.departamento",
        "Y": "intervencion.provincia",
        "Z": "intervencion.distrito",
        "AA": "intervencion.nota_sicpip",
        "AB": "intervencion.latitud",
        "AC": "intervencion.longitud"
      }
    },
    {
      "tipo": "maquinaria",
      "hoja": "19_MAQUINARIA",
      "titulo": "Maquinaria",
      "descripcion": "Identificación y situación de la maquinaria",
      "campos": [
        {
          "key": "placa",
          "label": "Placa · si corresponde",
          "group": "vehiculo",
          "type": "text",
          "required": false
        },
        {
          "key": "marca",
          "label": "Marca",
          "group": "vehiculo",
          "type": "text",
          "required": true
        },
        {
          "key": "situacion",
          "label": "Situación",
          "group": "vehiculo",
          "type": "text",
          "required": true
        },
        {
          "key": "valorizacion",
          "label": "Valorización de lo incautado · si corresponde",
          "group": "vehiculo",
          "type": "number",
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
        }
      ],
      "columnas": {
        "A": "derivado.numero",
        "B": "derivado.mes",
        "C": "intervencion.fecha",
        "D": "intervencion.hora",
        "E": "vehiculo.datos.placa",
        "F": "vehiculo.datos.marca",
        "G": "vehiculo.datos.situacion",
        "H": "vehiculo.datos.valorizacion",
        "I": "vehiculo.datos.tentativa",
        "J": "vehiculo.datos.fuero",
        "K": "vehiculo.datos.delito_general",
        "L": "vehiculo.datos.delito_especifico",
        "M": "vehiculo.datos.subtipo",
        "N": "vehiculo.datos.tentativa_2",
        "O": "vehiculo.datos.fuero_2",
        "P": "vehiculo.datos.delito_general_2",
        "Q": "vehiculo.datos.delito_especifico_2",
        "R": "vehiculo.datos.subtipo_2",
        "S": "intervencion.direccion_policial",
        "T": "intervencion.direccion_especializada_region",
        "U": "intervencion.division_policial",
        "V": "intervencion.departamento_policial",
        "W": "intervencion.unidad_area_equipo",
        "X": "intervencion.departamento",
        "Y": "intervencion.provincia",
        "Z": "intervencion.distrito",
        "AA": "intervencion.nota_sicpip",
        "AB": "intervencion.latitud",
        "AC": "intervencion.longitud"
      }
    }
  ]
};
