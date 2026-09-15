"""Extrae solo estructura del XLSM; nunca ejecuta macros ni copia registros."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import xml.etree.ElementTree as ET
from zipfile import ZipFile

NS = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
RID = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'


def extract(source):
    with ZipFile(source) as archive:
        strings = [''.join(t.text or '' for t in item.findall('.//s:t', NS))
                   for item in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
        workbook = ET.fromstring(archive.read('xl/workbook.xml'))
        relations = {r.attrib['Id']: r.attrib['Target'] for r in
                     ET.fromstring(archive.read('xl/_rels/workbook.xml.rels'))}
        sheets = []
        for position, sheet in enumerate(workbook.find('s:sheets', NS), 1):
            target = relations[sheet.attrib[RID]]
            target = target.lstrip('/') if target.startswith('/') else 'xl/' + target
            root = ET.fromstring(archive.read(target))
            fields = []
            # Esta versión de la plantilla tiene los encabezados en la fila 1.
            for cell in root.findall("s:sheetData/s:row[@r='1']/s:c", NS):
                value = cell.findtext('s:v', default='', namespaces=NS)
                if cell.attrib.get('t') == 's':
                    value = strings[int(value)]
                elif cell.attrib.get('t') == 'inlineStr':
                    value = ''.join(t.text or '' for t in cell.findall('.//s:t', NS))
                if value:
                    fields.append({'columna': re.sub(r'\d+', '', cell.attrib['r']),
                                   'encabezado': value})
            sheets.append({'posicion': position, 'nombre': sheet.attrib['name'],
                           'visibilidad': sheet.attrib.get('state', 'visible'),
                           'tipo': 'catalogo' if sheet.attrib['name'] == 'OTRO' else 'registro',
                           'campos': fields,
                           'validaciones': [
                               {'rango': item.attrib['sqref'], 'tipo': item.attrib.get('type'),
                                'formula': item.findtext('s:formula1', default='', namespaces=NS)}
                               for item in root.findall('s:dataValidations/s:dataValidation', NS)]})
        return {'version': 1, 'plantilla': source.name,
                'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                'formato': 'xlsm', 'contiene_macros': 'xl/vbaProject.bin' in archive.namelist(),
                'hojas': sheets}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('plantilla', type=Path)
    parser.add_argument('salida', type=Path)
    args = parser.parse_args()
    result = extract(args.plantilla)
    args.salida.parent.mkdir(parents=True, exist_ok=True)
    args.salida.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"Estructura extraída: {len(result['hojas'])} hojas; sin registros ni macros ejecutadas.")
