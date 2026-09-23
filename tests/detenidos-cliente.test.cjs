const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const source = fs.readFileSync(path.join(__dirname,'../frontend/js/detenidos.js'),'utf8');
const handler = source.slice(source.indexOf('async function saveDetainee('),source.indexOf('window.loadDetaineeRecords ='));
test('entidad pública se habilita solo con Sí y se limpia con No',()=>{
  const fields={esFuncionario:{value:'false'},entidadPublica:{value:'ANTERIOR'},detalleEntidad:{value:'DETALLE'}};
  const ctx={detaineeForm:{elements:{namedItem:name=>fields[name]}}};
  vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf('function syncDetaineePublicEntity'),source.indexOf("detaineeForm.elements.namedItem('esFuncionario').addEventListener")),ctx);
  ctx.syncDetaineePublicEntity();assert.equal(fields.entidadPublica.disabled,true);assert.equal(fields.entidadPublica.value,'');assert.equal(fields.detalleEntidad.value,'');
  fields.esFuncionario.value='true';ctx.syncDetaineePublicEntity();assert.equal(fields.entidadPublica.disabled,false);assert.equal(fields.detalleEntidad.disabled,false);
  fields.entidadPublica.value='FICTICIA';fields.detalleEntidad.value='FICTICIO';fields.esFuncionario.value='false';ctx.syncDetaineePublicEntity();assert.equal(fields.entidadPublica.value,'');assert.equal(fields.detalleEntidad.value,'');
});
function setup() {
  const fields={integraOrganizacion:'false',apellidoPaterno:'FICTICIO',nombres:'PRUEBA',fecha:'2026-09-14',armaCategoria:'FICTICIA',armaCantidad:'1'};
  const elements = { detaineeStatus:{}, saveDetaineeButton:{ disabled:false } };
  const storage = new Map(), calls=[];
  let resets=0, fail=true, resolveCall;
  const context={currentProfile:{activo:true,id:'FICTICIO',unidad:'AREA FICTICIA',departamento:'LIMA'},
    editingDetaineeId:null, editingDetaineeReason:'', selectedDetainee:null,
    document:{getElementById:id=>elements[id]}, detaineeForm:{reportValidity:()=>true,reset:()=>resets++},
    crimeList:{innerHTML:''}, window:{}, addCrimeRow(){}, nullable:v=>v===''?null:v,
    detaineeValue:name=>fields[name]||'', readCrimes:()=>[{orden:1,delito_general:'FICTICIO'}],
    moduleUnavailable:e=>e.code==='PGRST202', console:{error(){}}, crypto:webcrypto, TextEncoder,
    sessionStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    supabaseClient:{async rpc(name,payload){calls.push({name,payload});
      if(resolveCall) await resolveCall;
      if(fail) throw Error('Red interrumpida');
      return {data:{id:payload.p_solicitud,codigo:'DET-FICTICIO'},error:null};
    }}
  };
  vm.createContext(context); vm.runInContext(handler,context);
  return {context,fields,elements,storage,calls,resets:()=>resets,succeed:()=>{fail=false;},hold:p=>{resolveCall=p;},save:()=>context.saveDetainee({preventDefault(){}})};
}
test('reintento conserva identificador, formulario y nunca borra registros',async()=>{
  const s=setup(); await s.save();
  assert.equal(s.resets(),0); assert.equal(s.elements.saveDetaineeButton.disabled,false);
  const pending=[...s.storage.values()][0]; assert.ok(!pending.includes('PRUEBA'));
  s.succeed(); await s.save();
  assert.equal(s.calls[0].payload.p_solicitud,s.calls[1].payload.p_solicitud);
  assert.ok(s.calls.every(c=>c.name==='guardar_detenido_atomico'));
  assert.equal(s.resets(),1); assert.equal(s.storage.size,0);
});
test('un formulario cambiado obtiene una solicitud distinta',async()=>{
  const s=setup(); await s.save(); s.fields.nombres='OTRA PRUEBA'; await s.save();
  assert.notEqual(s.calls[0].payload.p_solicitud,s.calls[1].payload.p_solicitud);
});
test('doble envío no ejecuta otra llamada mientras guarda',async()=>{
  const s=setup(); let release; s.hold(new Promise(r=>release=r));
  const first=s.save(); await s.save(); release(); await first;
  assert.equal(s.calls.length,1);
});
test('edición envía motivo, versión y conserva hallazgos adicionales',async()=>{
  const s=setup(); s.context.editingDetaineeId='ID-FICTICIO'; s.context.editingDetaineeReason='MOTIVO FICTICIO';
  s.context.selectedDetainee={actualizado_en:'2026-09-14T00:00:00Z',detencion_armas:[{categoria:'ANTERIOR'},{categoria:'ADICIONAL',cantidad:2}]};
  s.succeed(); await s.save(); const p=s.calls[0].payload;
  assert.equal(p.p_editar,true); assert.equal(p.p_motivo,'MOTIVO FICTICIO');
  assert.equal(p.p_version,'2026-09-14T00:00:00Z'); assert.equal(p.p_armas.length,2);
  assert.equal(p.p_armas[1].categoria,'ADICIONAL'); assert.equal(s.storage.size,0);
});
test('sin sesión activa no envía datos',async()=>{const s=setup();s.context.currentProfile.activo=false;await s.save();assert.equal(s.calls.length,0);});


test('alta vinculada incluye el operativo en la solicitud y en el hash de reintento',async()=>{
  const s=setup(); s.context.window.getDetaineeOperativo=()=>({id:'OPERATIVO-FICTICIO'});
  await s.save(); assert.equal(s.calls[0].payload.p_detencion.intervencion_id,'OPERATIVO-FICTICIO');
  s.succeed(); await s.save(); assert.equal(s.calls[0].payload.p_solicitud,s.calls[1].payload.p_solicitud);
});
test('una respuesta tardía de otra sesión no limpia ni confirma el formulario',async()=>{
  const s=setup(); s.context.window.detaineeWorkflowToken=1; s.succeed();
  let release; s.hold(new Promise(resolve=>release=resolve));
  const saving=s.save(); await new Promise(resolve=>setTimeout(resolve,20));
  s.context.window.detaineeWorkflowToken=2; release(); await saving;
  assert.equal(s.resets(),0); assert.notEqual(s.elements.detaineeStatus.className,'success-text');
});

for (const tipo of ['banda','organizacion','false']) test('guarda pertenencia '+tipo,async()=>{const s=setup();s.fields.integraOrganizacion=tipo;s.fields.rolOrganizacion='Integrante';s.fields.nombreOrganizacion='GRUPO FICTICIO';s.succeed();await s.save();const d=s.calls[0].payload.p_detencion;assert.equal(d.integra_organizacion,tipo!=='false');assert.equal(d.tipo_organizacion,tipo==='false'?null:tipo);if(tipo==='false'){assert.equal(d.nombre_organizacion,null);assert.equal(d.rol_organizacion,null);}});
test('clasificación pendiente impide guardar sin perder formulario',async()=>{const s=setup();s.fields.integraOrganizacion='';await s.save();assert.equal(s.calls.length,0);assert.equal(s.resets(),0);});
