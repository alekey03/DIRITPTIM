const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../exportaciones.js'), 'utf8');
function setup(records = [], fail = false) {
  const elements = new Map(), calls = [], alerts = [], downloads = [];
  const context = { Date, Intl, console: { error() {} }, currentProfile: { unidad: 'UNIDAD FICTICIA' },
    document: { getElementById(id) {
      if (!elements.has(id)) elements.set(id, { value: '', disabled: false, textContent: 'Exportar Excel', addEventListener() {} });
      return elements.get(id);
    } }, alert: message => alerts.push(message),
    supabaseClient: { from(table) { return {
      select() { return this; }, range(start, end) { this.start = start; this.end = end; return this; },
      order(field) { calls.push(['order', field]); return this; },
      gte() { return this; }, lte() { return this; },
      then(resolve) { calls.push(['page', table]); return Promise.resolve({ data: fail ? null : records.slice(this.start, this.end + 1), error: fail ? { message: 'Fallo simulado' } : null }).then(resolve); }
    }; } }
  };
  vm.createContext(context); vm.runInContext(source, context);
  context.downloadWorkbook = rows => downloads.push(rows);
  return { context, elements, calls, alerts, downloads };
}
test('exporta 1001 registros y desempata por identificador', async () => {
  const s = setup(Array.from({ length: 1001 }, (_, i) => ({ id: String(i), codigo: `FICTICIO-${i}`, personas: {} })));
  await s.context.exportDetaineesExcel();
  assert.equal(s.downloads[0].length, 1001);
  assert.equal(s.calls.filter(c => c[0] === 'page').length, 2);
  assert.ok(s.calls.some(c => c[0] === 'order' && c[1] === 'id'));
});
test('conserva participación, tentativa y hallazgos adicionales', async () => {
  const s = setup([{ codigo: 'FICTICIO', personas: {}, rol_organizacion: 'Cabecilla',
    detencion_delitos: [1,2,3].map(orden => ({ orden, fuero_ley_especial: 'Fuero ficticio', delito_general: `Delito ${orden}`, es_tentativa: true })),
    detencion_armas: [{ categoria: 'A', cantidad: 1 }, { categoria: 'B', tipo: 'Tipo ficticio', cantidad: 2 }]
  }]);
  await s.context.exportDetaineesExcel();
  const row = s.downloads[0][0];
  assert.equal(row['Participación BBCC/OOCC'], 'Cabecilla');
  assert.match(row['Delitos adicionales'], /Fuero ficticio/);
  assert.match(row['Delitos adicionales'], /Tentativa: Sí/);
  assert.match(row['Hallazgos adicionales'], /Tipo ficticio/);
  assert.match(row['Hallazgos adicionales'], /Cantidad: 2/);
});
test('aplica búsqueda y situación', async () => {
  const s = setup([{ codigo: 'FICTICIO-A', situacion_actual: 'Detenido' }, { codigo: 'FICTICIO-B', situacion_actual: 'Libre' }]);
  s.context.document.getElementById('detaineeSearch').value = 'ficticio-a';
  s.context.document.getElementById('detaineeSituation').value = 'detenido';
  await s.context.exportDetaineesExcel();
  assert.equal(s.downloads[0].length, 1);
  assert.equal(s.downloads[0][0]['Código'], 'FICTICIO-A');
});
for (const fail of [false, true]) test(`vacío/error (${fail}): no descarga y restaura botón`, async () => {
  const s = setup([], fail); await s.context.exportDetaineesExcel();
  assert.equal(s.downloads.length, 0); assert.equal(s.alerts.length, 1);
  assert.equal(s.elements.get('exportDetaineesExcel').disabled, false);
  assert.equal(s.elements.get('exportDetaineesExcel').textContent, 'Exportar Excel');
});
test('neutraliza fórmulas y conserva ceros iniciales y fecha de Lima', () => {
  const { context: c } = setup();
  assert.equal(c.excelSafe('=1+1'), "'=1+1");
  assert.equal(c.excelSafe('00123456'), '00123456');
  assert.equal(c.excelSafe(0), 0);
  const date = c.excelDateTime('2026-09-14T02:30:00Z');
  assert.equal(date.getDate(), 13); assert.equal(date.getHours(), 21);
});
