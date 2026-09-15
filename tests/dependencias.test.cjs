const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'dependencias.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
test('catálogo exacto y versiones del navegador y servidor coinciden',()=>{
  assert.equal(catalog.filter(x=>x.ambito==='SEDE_CENTRAL').length,4);
  assert.equal(catalog.filter(x=>x.ambito==='DESCONCENTRADO').length,23);
  assert.equal(new Set(catalog.map(x=>x.unidad)).size,27);
  for(const name of ['dependencias.js','supabase/functions/administrar-usuarios/index.ts']){
    const source=fs.readFileSync(path.join(root,name),'utf8');
    const declaration=source.match(/const DEPENDENCIAS_INSTITUCIONALES = ([\s\S]*?);/)[1];
    assert.deepEqual(JSON.parse(declaration),catalog);
  }
});
function form(profile=null){
  const elements={};
  for(const id of ['newUserRole','newUserScope','newUserDepartment','newUserUnit','userDependencyHint']) elements[id]={value:'',textContent:'',innerHTML:'',insertAdjacentHTML(_p,html){this.innerHTML+=html;}};
  elements.newUserRole.value=profile?.rol||'operador';elements.newUserScope.value=profile?.ambito||'DESCONCENTRADO';
  const context={document:{getElementById:id=>elements[id]},DEPENDENCIAS_INSTITUCIONALES:catalog,editingUserProfile:profile,escapeHtml:x=>x};
  vm.createContext(context);vm.runInContext(app.slice(app.indexOf('function configureUserTerritory('),app.indexOf('function initializeUserDepartments(')),context);
  return {elements,configure:context.configureUserTerritory};
}
test('el ámbito cambia la lista y descarta una dependencia incompatible',()=>{
  const f=form();f.configure({preserveArea:false});assert.equal((f.elements.newUserUnit.innerHTML.match(/<option/g)||[]).length,24);
  f.elements.newUserUnit.value='DEPITPTIM PUNO';f.configure();assert.equal(f.elements.newUserDepartment.value,'PUNO');
  f.elements.newUserScope.value='SEDE_CENTRAL';f.configure({preserveArea:false});
  assert.equal((f.elements.newUserUnit.innerHTML.match(/<option/g)||[]).length,5);assert.equal(f.elements.newUserUnit.value,'');
  assert.equal(f.elements.newUserDepartment.value,'LIMA');assert.equal(f.elements.newUserDepartment.disabled,true);
});
test('la edición conserva la dependencia seleccionada y distingue asignaciones anteriores',()=>{
  const current={...catalog[6],rol:'operador'};const f=form(current);f.configure({initialArea:current.unidad});
  assert.equal(f.elements.newUserUnit.value,current.unidad);assert.equal(f.elements.newUserDepartment.value,'AREQUIPA');
  const old={rol:'operador',ambito:'SEDE_CENTRAL',unidad:'SEDE CENTRAL DIRITPTIM',departamento:'LIMA'};
  const legacy=form(old);legacy.configure({initialArea:old.unidad});assert.equal(legacy.elements.newUserUnit.value,old.unidad);
  assert.match(legacy.elements.userDependencyHint.textContent,/Asignación anterior/);
});
test('administrador mantiene el ámbito nacional sin selección manual',()=>{
  const f=form({rol:'administrador',ambito:'NACIONAL'});f.configure();
  assert.equal(f.elements.newUserUnit.disabled,true);assert.match(f.elements.newUserUnit.innerHTML,/ADMINISTRACIÓN GENERAL/);assert.equal(f.elements.newUserDepartment.value,'NACIONAL');
});

test('PostgreSQL rechaza asignaciones inválidas incluso fuera del formulario',async()=>{
  const {PGlite}=require('@electric-sql/pglite');const db=new PGlite();
  try{
    await db.exec("create table public.perfiles(id serial primary key,unidad text,ambito text,departamento text,rol text,activo boolean); insert into perfiles(unidad,ambito,departamento,rol,activo) values('SEDE CENTRAL DIRITPTIM','SEDE_CENTRAL','LIMA','operador',true)");
    const migration=fs.readFileSync(path.join(root,'supabase/migrations/202609150001_dependencias_institucionales.sql'),'utf8');await db.exec(migration);
    for(const item of catalog) await db.query('insert into perfiles(unidad,ambito,departamento,rol) values($1,$2,$3,$4)',[item.unidad,item.ambito,item.departamento,'operador']);
    await assert.rejects(db.exec("insert into perfiles(unidad,ambito,departamento,rol) values('MANUAL','DESCONCENTRADO','PUNO','operador')"));
    await assert.rejects(db.exec("update perfiles set departamento='LIMA' where unidad='DEPITPTIM PUNO'"));
    await db.exec('update perfiles set activo=false where id=1');
    await assert.rejects(db.exec("update perfiles set rol='supervisor' where id=1"));
    await db.exec(migration);
    assert.equal((await db.query('select count(*)::int as total from perfiles')).rows[0].total,28);
  }finally{await db.close();}
});
