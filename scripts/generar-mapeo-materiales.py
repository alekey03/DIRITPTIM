"""Genera el contrato de captura de las cinco hojas; no procesa registros personales."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
source = json.loads((root/'datos/estructura-detallado-v1.json').read_text(encoding='utf-8'))
person = 'apellido_paterno apellido_materno nombres edad genero nacionalidad tipo_documento numero_documento'.split()
crime = 'tentativa fuero delito_general delito_especifico subtipo tentativa_2 fuero_2 delito_general_2 delito_especifico_2 subtipo_2'.split()
geo = ['@departamento','@provincia','@distrito']
police = ['@direccion_policial','@direccion_especializada_region','@division_policial','@departamento_policial','@unidad_area_equipo']
start = ['#numero','#mes','@fecha','@hora']
end = ['@nota_sicpip','@latitud','@longitud']
specs = [
 ('fuego',13,'Armas de fuego','Marca, calibre, serie y procedencia',start+person+geo+crime+'situacion tipo marca modelo calibre serie caracteristicas fiscal_fiscalia'.split()+police+'procedencia registro_sucamec denuncia propietario cantidad_municiones tipo_municiones'.split()+end),
 ('blanca',14,'Armas blancas','Tipo, situación y características',start+person+crime+['situacion','tipo','otro_tipo']+police+geo+end),
 ('explosivo',31,'Explosivos','Material, situación y cantidad',start+person+geo+crime+['motivo','situacion','tipo','detalle','detalle_2','cantidad']+police+end),
 ('municion',32,'Municiones','Cantidad registrada en el operativo',start+geo+['cantidad']+police+end),
 ('replica',51,'Réplicas','Tipo, situación y fiscalía',start+person+geo+crime+['situacion','tipo','fiscal_fiscalia']+police+end)
]
labels = dict(zip(person,['Apellido paterno','Apellido materno','Nombres','Edad','Género','Nacionalidad','Tipo de documento','Número de documento']))
labels.update(dict(zip(crime,['¿Tentativa?','Fuero / leyes especiales','Delito general','Delito específico','Subtipo','¿Tentativa del segundo delito?','Fuero / leyes especiales','Delito general','Delito específico','Subtipo'])))
labels.update(situacion='Situación',tipo='Tipo',marca='Marca',modelo='Modelo',calibre='Calibre',serie='Serie',caracteristicas='Otras características',fiscal_fiscalia='Fiscal y fiscalía a cargo',procedencia='Procedencia',registro_sucamec='Registro SUCAMEC o certificado de propiedad',denuncia='Denuncia de pérdida, robo u otros',propietario='Propietario',cantidad_municiones='Cantidad de municiones asociadas',tipo_municiones='Tipo de municiones asociadas',otro_tipo='Si seleccionó otro, especifique',motivo='Motivo: hallazgo o incautación',detalle='Detalle del material',detalle_2='Detalle adicional del material',cantidad='Cantidad')
out=[]
for kind,pos,title,description,keys in specs:
    sheet=next(h for h in source['hojas'] if h['posicion']==pos)
    assert len(keys)==len(sheet['campos']), (kind,len(keys),len(sheet['campos']))
    fields=[]
    for key in keys:
        if key.startswith(('@','#')): continue
        group='persona' if key in person else 'delito2' if key in crime and key.endswith('_2') else 'delito1' if key in crime else 'material'
        fields.append(dict(key=key,label=labels[key],group=group,type='number' if key in ['edad','cantidad','cantidad_municiones'] else 'text',required=key in ['tipo','cantidad','situacion']))
    out.append(dict(tipo=kind,hoja=sheet['nombre'],titulo=title,descripcion=description,campos=fields,columnas={f['columna']:('intervencion.'+k[1:] if k.startswith('@') else 'derivado.'+k[1:] if k.startswith('#') else 'material.datos.'+k) for f,k in zip(sheet['campos'],keys)}))
text=json.dumps(dict(version=1,tipos=out),ensure_ascii=False,indent=2)+'\n'
(root/'datos/mapeo-materiales-v1.json').write_text(text,encoding='utf-8')
(root/'frontend/js/materiales-catalogo.js').write_text('// Generado por scripts/generar-mapeo-materiales.py\nwindow.MATERIALES_CATALOGO = '+text.strip()+';\n',encoding='utf-8')
