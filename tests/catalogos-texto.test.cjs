const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'frontend/js/catalogos-texto.js'), 'utf8');
function setup(options = []) {
  let observer;
  const context = { window: {}, Intl, document: { body: {}, querySelectorAll: () => options }, MutationObserver: class { constructor(callback) { observer = callback; } observe() {} } };
  vm.runInNewContext(source, context);
  return { label: context.window.CatalogoTexto.label, changed: node => observer([{ type: 'childList', target: {}, addedNodes: [node] }]) };
}
function option(text, stored) {
  const attributes = new Map(stored === undefined ? [] : [['value', stored]]);
  return { nodeType: 1, tagName: 'OPTION', textContent: text, selected: true,
    get value() { return attributes.get('value') ?? this.textContent; },
    hasAttribute: name => attributes.has(name), setAttribute: (name, value) => attributes.set(name, value) };
}
test('unifica sigla, países y acentos sin alterar las claves seleccionadas', () => {
  const initial = option('PERU'), police = option('DIRCTPTIM', 'DIRCTPTIM');
  const { label, changed } = setup([initial, police]);
  assert.equal(initial.textContent, 'Perú'); assert.equal(initial.value, 'PERU'); assert.equal(initial.selected, true);
  assert.equal(police.textContent, 'DIRITPTIM'); assert.equal(police.value, 'DIRCTPTIM');
  const dynamic = option('PUESTO A DISPOSICION DE FISCALIA'); changed(dynamic);
  assert.equal(dynamic.textContent, 'PUESTO A DISPOSICIÓN DE FISCALÍA');
  assert.equal(dynamic.value, 'PUESTO A DISPOSICION DE FISCALIA');
  for (const [from, to] of [['Peru','Perú'],['CANADA','Canadá'],['JAPON','Japón'],['Junin','Junín']]) assert.equal(label(from), to);
  assert.equal(label(label('DIRCTPTIM')), 'DIRITPTIM');
});
test('resultado obligatorio y geografía en Detención, sin duplicar campos', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.match(html, /id="op-resultado" required/);
  const identification = html.split('id="stepDetaineeIdentification"')[1].split('</section>')[0];
  const detention = html.split('id="stepDetaineeDetention"')[1].split('</section>')[0];
  for (const id of ['detaineeDepartment', 'detaineeProvince', 'detaineeDistrict']) {
    assert.ok(!identification.includes(id)); assert.ok(detention.includes(id));
    assert.equal(html.split(`id="${id}"`).length, 2);
  }
  assert.ok(detention.includes('profile-registration-department'));
  assert.ok(identification.includes('name="numeroDocumento"'));
});
