"""Correspondencia de las hojas 17, 18 y 19 del detallado."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=json.loads((root/'datos/estructura-detallado-v1.json').read_text(encoding='utf-8'))
crimes='tentativa fuero delito_general delito_especifico subtipo tentativa_2 fuero_2 delito_general_2 delito_especifico_2 subtipo_2'.split()
keys=['#numero','#mes','@fecha','@hora','placa','marca','situacion','valorizacion']+crimes+['@direccion_policial','@direccion_especializada_region','@division_policial','@departamento_policial','@unidad_area_equipo','@departamento','@provincia','@distrito','@nota_sicpip','@latitud','@longitud']
labels=dict(zip(crimes,['¿Tentativa?','Fuero / leyes especiales','Delito general','Delito específico','Subtipo','¿Tentativa del segundo delito?','Fuero / leyes especiales','Delito general','Delito específico','Subtipo']))
labels.update(placa='Placa · si corresponde',marca='Marca',situacion='Situación',valorizacion='Valorización de lo incautado · si corresponde')
out=[]
for kind,pos,title,description in [('mayor',17,'Vehículos mayores','Placa, marca, situación y valorización'),('menor',18,'Vehículos menores','Registro individual del vehículo'),('maquinaria',19,'Maquinaria','Identificación y situación de la maquinaria')]:
    sheet=next(h for h in source['hojas'] if h['posicion']==pos)
    assert len(sheet['campos'])==len(keys)==29
    fields=[dict(key=k,label=labels[k],group='delito2' if k in crimes and k.endswith('_2') else 'delito1' if k in crimes else 'vehiculo',type='number' if k=='valorizacion' else 'text',required=k in ['marca','situacion']) for k in keys if not k.startswith(('@','#'))]
    out.append(dict(tipo=kind,hoja=sheet['nombre'],titulo=title,descripcion=description,campos=fields,columnas={f['columna']:('intervencion.'+k[1:] if k.startswith('@') else 'derivado.'+k[1:] if k.startswith('#') else 'vehiculo.datos.'+k) for f,k in zip(sheet['campos'],keys)}))
text=json.dumps(dict(version=1,tipos=out),ensure_ascii=False,indent=2)+'\n'
(root/'datos/mapeo-vehiculos-v1.json').write_text(text,encoding='utf-8')
(root/'vehiculos-catalogo.js').write_text('// Generado por scripts/generar-mapeo-vehiculos.py\nwindow.VEHICULOS_CATALOGO = '+text.strip()+';\n',encoding='utf-8')
