const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../frontend/js/app.js'), 'utf8');
const functionSource = source.slice(source.indexOf('async function uploadRecordFiles('), source.indexOf('async function loadRecords('));
function setup(options = {}) {
  const calls = [];
  const storage = {
    async upload() { calls.push('upload'); if (options.throwUpload) throw new Error('Red interrumpida'); return { error: options.uploadError || null }; },
    async remove() { calls.push('remove'); if (options.throwRemove) throw new Error('Limpieza interrumpida'); return { error: null }; }
  };
  const context = { console: { error() {} }, photo: { files: options.files || [{ type: 'image/jpeg', size: 100 }] },
    pendingMarkFiles: [], pendingDocumentFiles: [], currentProfile: { unidad: 'PRUEBA', id: 'FICTICIO' },
    crypto: { randomUUID: () => 'FICTICIO' }, compressImage: async () => { if (options.throwCompress) throw new Error('Imagen inválida'); return {}; },
    supabaseClient: { storage: { from: () => storage }, from: () => ({ async insert() { calls.push('metadata'); if (options.throwMetadata) throw new Error('Red interrumpida'); return { error: options.metadataError || null }; } }) }
  };
  vm.createContext(context); vm.runInContext(functionSource, context);
  return { context, calls };
}
test('registra fotografía y metadatos', async () => {
  const s = setup(); const r = await s.context.uploadRecordFiles('FICTICIO');
  assert.equal(r.uploaded, 1); assert.equal(r.failed, 0); assert.deepEqual(s.calls, ['upload', 'metadata']);
});
test('rechaza tipo y tamaño inválidos antes de subir', async () => {
  const s = setup({ files: [{ type: 'application/pdf', size: 100 }, { type: 'image/jpeg', size: 26 * 1024 * 1024 }] });
  const r = await s.context.uploadRecordFiles('FICTICIO');
  assert.equal(r.failed, 2); assert.equal(s.calls.length, 0);
});
for (const flag of ['throwCompress', 'throwUpload', 'throwMetadata']) test(`informa el fallo ${flag} sin romper el guardado`, async () => {
  const s = setup({ [flag]: true }); const r = await s.context.uploadRecordFiles('FICTICIO');
  assert.equal(r.uploaded, 0); assert.equal(r.failed, 1);
});
test('intenta limpiar cuando falla el metadato y tolera fallo de limpieza', async () => {
  const s = setup({ metadataError: { message: 'Fallo ficticio' }, throwRemove: true });
  const r = await s.context.uploadRecordFiles('FICTICIO');
  assert.equal(r.failed, 1); assert.equal(r.uploaded, 0); assert.ok(s.calls.includes('remove'));
});
