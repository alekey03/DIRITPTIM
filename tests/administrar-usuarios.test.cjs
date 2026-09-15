const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sourcePath = process.env.EDGE_SOURCE || path.resolve(__dirname, '../supabase/functions/administrar-usuarios/index.ts');
const source = fs.readFileSync(sourcePath,'utf8')
  .replace(/^import .*;\r?\n/gm,'')
  .replace('export default {','module.exports = {');
const sandbox = { module:{exports:{}}, Response, console:{error(){}}, withSupabase:(_config,handler)=>handler };
vm.runInNewContext(source,sandbox,{filename:sourcePath});
const handler=sandbox.module.exports.fetch;
const valid={accion:'crear',usuario:'prueba_ficticia',nombres:'Prueba',apellidos:'Ficticia',unidad:'DIVISIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS',rol:'operador',ambito:'SEDE_CENTRAL',departamento:'LIMA',activo:true,contrasena:'solo-prueba-local'};

async function invoke(overrides={},options={}) {
  const writes=[];
  const caller=options.caller || {rol:'administrador',activo:true};
  const admin={
    from(table){
      return {
        select(columns){this.columns=columns;return this;}, eq(){return this;},
        async single(){return {data:this.columns==='rol, activo'?caller:options.previous,error:null};},
        async insert(data){writes.push({op:'insert',table,data});return {error:options.profileError ? {message:'Fallo simulado'} : null};},
        update(data){writes.push({op:'update',table,data});return {eq:async()=>({error:null})};}
      };
    },
    auth:{admin:{
      async createUser(data){writes.push({op:'createUser',data});return {data:{user:{id:'synthetic-user'}},error:null};},
      async deleteUser(id){writes.push({op:'deleteUser',id});return {error:null};},
      async updateUserById(id,data){writes.push({op:'updatePassword',id,data});return {error:null};}
    }}
  };
  const response=await handler({json:async()=>({...valid,...overrides})},{userClaims:{sub:'synthetic-admin'},supabaseAdmin:admin});
  return {status:response.status,body:await response.json(),writes};
}

test('un administrador inactivo no puede gestionar usuarios',async()=>{
  const result=await invoke({}, {caller:{rol:'administrador',activo:false}});
  assert.equal(result.status,400); assert.equal(result.writes.length,0);
});
test('un supervisor no puede gestionar usuarios',async()=>{
  const result=await invoke({}, {caller:{rol:'supervisor',activo:true}});
  assert.equal(result.status,400); assert.equal(result.writes.length,0);
});
test('rechaza perfiles sin departamento antes de escribir',async()=>{
  const result=await invoke({departamento:''});
  assert.equal(result.status,400); assert.equal(result.writes.length,0);
});
test('sede central exige Lima antes de escribir',async()=>{
  const result=await invoke({departamento:'CUSCO'});
  assert.equal(result.status,400); assert.equal(result.writes.length,0);
});
test('crea perfil y territorio juntos desde el servidor',async()=>{
  const result=await invoke(); assert.equal(result.status,200);
  const profile=result.writes.find(x=>x.op==='insert').data;
  assert.equal(profile.ambito,'SEDE_CENTRAL'); assert.equal(profile.departamento,'LIMA');
});
test('normaliza administrador al ámbito nacional',async()=>{
  const result=await invoke({rol:'administrador',ambito:'SEDE_CENTRAL',departamento:'LIMA'});
  assert.equal(result.status,200);
  const profile=result.writes.find(x=>x.op==='insert').data;
  assert.equal(profile.ambito,'NACIONAL'); assert.equal(profile.departamento,'NACIONAL');
  assert.equal(profile.unidad,'ADMINISTRACIÓN GENERAL DIRITPTIM');
});
test('una contraseña corta en actualización no modifica el perfil',async()=>{
  const result=await invoke({accion:'actualizar',id:'synthetic-user',contrasena:'corta'});
  assert.equal(result.status,400); assert.equal(result.writes.length,0);
});
test('si falla el perfil se revierte la cuenta ficticia recién creada',async()=>{
  const result=await invoke({}, {profileError:true});
  assert.equal(result.status,400);
  assert.equal(result.writes.at(-1).op,'deleteUser');
  assert.equal(result.writes.at(-1).id,'synthetic-user');
});

test('acepta cada una de las 27 dependencias con su ámbito y departamento',async()=>{
  const dependencies=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../dependencias.json'),'utf8'));
  for(const dependency of dependencies){
    const result=await invoke(dependency); assert.equal(result.status,200,dependency.unidad);
    assert.equal(result.writes.find(x=>x.op==='insert').data.unidad,dependency.unidad);
  }
});
test('rechaza nombres manuales, ámbito nacional de operador y cruces de departamento',async()=>{
  for(const assignment of [
    {unidad:'DEPENDENCIA INVENTADA'},
    {ambito:'NACIONAL'},
    {unidad:'DEPITPTIM PUNO',ambito:'DESCONCENTRADO',departamento:'LIMA'},
    {unidad:'DEPITPTIM PUNO',ambito:'SEDE_CENTRAL',departamento:'LIMA'}
  ]) { const result=await invoke(assignment); assert.equal(result.status,400);assert.equal(result.writes.length,0); }
});
test('permite desactivar una asignación anterior sin reasignarla',async()=>{
  const previous={unidad:'SEDE CENTRAL DIRITPTIM',ambito:'SEDE_CENTRAL',departamento:'LIMA',rol:'operador'};
  const result=await invoke({...previous,accion:'actualizar',id:'synthetic-user',activo:false,contrasena:''},{previous});
  assert.equal(result.status,200);assert.equal(result.writes[0].data.activo,false);
});
test('no permite usar asignación antigua de otro perfil como nueva',async()=>{
  const result=await invoke({unidad:'SEDE CENTRAL DIRITPTIM',accion:'actualizar',id:'synthetic-user',contrasena:''},{previous:{...valid,unidad:'OTRA'}});
  assert.equal(result.status,400);assert.equal(result.writes.length,0);
});
