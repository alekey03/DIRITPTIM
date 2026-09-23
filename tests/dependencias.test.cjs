const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test'),root=path.resolve(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'datos/dependencias.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'frontend/js/app.js'),'utf8');
test('cinco divisiones y 23 DEPITPTIM; catálogo idéntico en navegador y servidor',()=>{
 assert.equal(catalog.filter(d=>d.ambito==='SEDE_CENTRAL').length,5);assert.equal(catalog.filter(d=>d.ambito==='DESCONCENTRADO').length,23);
 assert.equal(new Set(catalog.map(d=>d.unidad)).size,28);
 for(const name of ['frontend/js/dependencias.js','backend/supabase/functions/administrar-usuarios/index.ts'])assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,name),'utf8').match(/const DEPENDENCIAS_INSTITUCIONALES = ([\s\S]*?);/)[1]),catalog);
});
function form(role){const elements={};for(const id of ['newUserRole','newUserScope','newUserDepartment','newUserUnit','userDependencyHint','userUnitField','userUnitLabel'])elements[id]={value:'',textContent:'',replaceChildren(...items){this.options=items;this.value=items[0]?.value||'';}};elements.newUserRole.value=role;
 const context={document:{getElementById:id=>elements[id]},DEPENDENCIAS_INSTITUCIONALES:catalog,Option:function(label,value){this.label=label;this.value=value;}};
 vm.createContext(context);vm.runInContext(app.slice(app.indexOf('function configureUserTerritory('),app.indexOf("document.getElementById('newUserRole').addEventListener")),context);return{e:elements,configure:context.configureUserTerritory};}
test('seleccionar división o DEPITPTIM filtra y deriva el territorio',()=>{
 const f=form('estadistico_division');f.configure();assert.equal(f.e.newUserUnit.options.length,6);assert.equal(f.e.userUnitField.hidden,false);assert.equal(f.e.userUnitLabel.textContent,'División asignada');f.e.newUserUnit.value='DIVISIÓN DE EXTRANJERIA';f.configure();assert.equal(f.e.newUserDepartment.value,'LIMA');
 f.e.newUserRole.value='estadistico_depitptim';f.configure({preserveArea:false});assert.equal(f.e.newUserUnit.options.length,24);assert.equal(f.e.newUserUnit.value,'');f.e.newUserUnit.value='DEPITPTIM CUSCO';f.configure();assert.equal(f.e.newUserDepartment.value,'CUSCO');
});
test('dirección y jefatura fijan su ámbito sin campos libres',()=>{
 for(const [role,unit] of [['estadistico_direccion','ESTADÍSTICA DE DIRECCIÓN DIRITPTIM'],['estadistico_jefatura','JEFDDITP'],['administrador','ADMINISTRACIÓN GENERAL DIRITPTIM']]){const f=form(role);f.configure();assert.equal(f.e.newUserUnit.value,unit);assert.equal(f.e.newUserUnit.disabled,true);assert.equal(f.e.userUnitField.hidden,true);assert.equal(f.e.newUserScope.disabled,true);assert.equal(f.e.newUserDepartment.value,'NACIONAL');}
});
