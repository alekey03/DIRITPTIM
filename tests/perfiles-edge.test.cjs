const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const code=fs.readFileSync(require('path').resolve(__dirname,'../backend/supabase/functions/administrar-usuarios/index.ts'),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export default {','module.exports={');
const box={module:{exports:{}},Response,console:{error(){}},withSupabase:(_,fn)=>fn};vm.runInNewContext(code,box);
async function call(role,payload={},error=false){const writes=[];const ctx={userClaims:{sub:'caller'},supabaseAdmin:{from:()=>({select(){return this},eq(){return this},single:async()=>({data:{rol:role,activo:true,usuario:role==='administrador'?'administrador':'ficticio'}}),insert:async p=>{writes.push(p);return {error:error?new Error('simulado'):null}},update:p=>({eq:async()=>{writes.push(p);return {}}})}),auth:{admin:{createUser:async()=>({data:{user:{id:'new-user'}}}),deleteUser:async()=>{writes.push('rollback');return{}},updateUserById:async()=>({})}}}};const r=await box.module.exports.fetch({json:async()=>({accion:'crear',usuario:'ficticio',nombres:'Prueba',apellidos:'Ficticia',unidad:'DEPITPTIM CUSCO',rol:'estadistico_depitptim',contrasena:'ficticia-local-123',...payload})},ctx);return{status:r.status,body:await r.json(),writes};}
(async()=>{
 for(const role of ['estadistico_division','estadistico_depitptim','estadistico_jefatura','supervisor','operador'])assert.equal((await call(role)).status,400);
 for(const role of ['administrador','estadistico_direccion']){const r=await call(role);assert.equal(r.status,200);assert.equal(r.writes[0].departamento,'CUSCO');assert.equal(r.writes[0].ambito,'DESCONCENTRADO');}
 assert.equal((await call('estadistico_direccion',{rol:'estadistico_direccion'})).status,400);
 assert.equal((await call('estadistico_direccion',{accion:'actualizar',id:'otro'})).status,400);
 assert.equal((await call('estadistico_direccion',{rol:'administrador'})).status,400);
 assert.equal((await call('administrador',{rol:'administrador'})).status,400);
 assert.equal((await call('administrador',{rol:'estadistico_direccion'})).status,200);
 assert.equal((await call('administrador',{rol:'estadistico_division'})).status,400);
 assert.equal((await call('administrador',{rol:'supervisor'})).status,400);
 assert.equal((await call('administrador',{},true)).writes.at(-1),'rollback');
 console.log('PASS: dirección crea perfiles permitidos; división/DEPITPTIM/jefatura no; root único; sin escalada a dirección; validación territorial y reversión de Auth.');
})().catch(e=>{console.error(e);process.exitCode=1});
