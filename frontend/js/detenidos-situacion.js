(() => {
 const keys=['situacion_actual','documento_libertad','documento_disposicion','fiscal_nombre','fiscalia','disposicion_direccion','disposicion_region','disposicion_division','disposicion_departamento','disposicion_unidad'];
 const names=['situacionActual','documentoLibertad','documentoDisposicion','fiscalNombre','fiscalia','disposicionDireccion','disposicionRegion','disposicionDivision','disposicionDepartamento','disposicionUnidad'];
 const labels=['Nueva situación','Documento de libertad','Documento de disposición','Nombre del fiscal','Fiscalía','Dirección receptora','Región / frente receptor','División receptora','Departamento receptor','Unidad / área / equipo receptor'];
 const allowed=record=>record && currentProfile?.activo && currentProfile.rol!=='visualizador' && (currentProfile.rol==='administrador'||record.creado_por===currentProfile.id);
 let button,record=null,busy=false,retry=null,generation=0;
 const dialog=document.createElement('dialog');dialog.className='record-modal';dialog.id='detaineeSituationDialog';
 dialog.innerHTML='<form id="detaineeSituationForm"><h2>Actualizar situación del detenido</h2><p>Este cambio no modifica la fecha de detención ni la producción del operativo. Se conserva el historial de cambios.</p><fieldset><div class="grid cols-2" data-fields></div><label>Motivo del cambio *<textarea name="motivo" required maxlength="2000" rows="3"></textarea></label></fieldset><p role="status" data-status></p><div class="modal-actions"><button class="secondary" type="button" data-close>Cancelar</button><button class="primary" type="submit">Guardar situación</button></div><h3>Historial de situaciones</h3><div data-history></div></form>';
 document.body.append(dialog);const form=dialog.querySelector('form'),status=dialog.querySelector('[data-status]');
 dialog.querySelector('[data-close]').addEventListener('click',()=>{if(!busy)dialog.close();});
 dialog.addEventListener('cancel',event=>{if(busy)event.preventDefault();});
 window.resetDetaineeSituation = () => {generation++;record=null;retry=null;busy=false;dialog.close();if(button)button.hidden=true;form.querySelector('fieldset').disabled=false;form.querySelector('[type="submit"]').disabled=false;};
 window.renderDetaineeSituation = data => {
  if(!button){button=document.createElement('button');button.type='button';button.className='primary';button.textContent='Actualizar situación';document.getElementById('editDetaineeButton').before(button);button.addEventListener('click',open);}
  record=data;button.hidden=!allowed(data);
 };
 async function open(){
  if(!record||!allowed(record)||busy)return;
  const turn=++generation;retry=null;form.reset();status.textContent='';const grid=dialog.querySelector('[data-fields]');grid.replaceChildren();
  keys.forEach((key,i)=>{
   const label=document.createElement('label');label.textContent=labels[i]+(i===0?' *':'');
   const original=document.querySelector(`#detaineeForm [name="${names[i]}"]`),control=original.cloneNode(true);
   control.removeAttribute('id');control.removeAttribute('data-inherited');control.name=key;control.disabled=false;control.readOnly=false;control.required=i===0;control.value=record[key]||'';
   if(control.tagName==='SELECT'&&record[key]&&![...control.options].some(o=>o.value===record[key])){control.add(new Option(record[key]+' (registrado)',record[key]));control.value=record[key];}
   label.append(control);grid.append(label);
  });
  window.bindOperativoSupport(keys.slice(5).map(k=>form.elements.namedItem(k))).set(keys.slice(5).map(k=>record[k]));
  form.elements.namedItem('situacion_actual').addEventListener('change',()=>window.syncDetaineeSituationFields(form));
  window.syncDetaineeSituationFields(form);
  dialog.showModal();const history=dialog.querySelector('[data-history]');history.textContent='Consultando historial…';const id=record.id;
  const {data,error}=await supabaseClient.from('detencion_situaciones_historial').select('creado_en,motivo,anterior,nueva,usuario_id').eq('detencion_id',id).order('creado_en',{ascending:false}).limit(20);
  if(turn!==generation||!dialog.open||record?.id!==id)return;history.replaceChildren();
  if(error){history.textContent='No se pudo consultar el historial.';return;}
  if(!data.length)history.textContent='Todavía no hay cambios de situación registrados con esta opción.';
  data.forEach(item=>{const p=document.createElement('p');p.textContent=`${new Date(item.creado_en).toLocaleString('es-PE',{timeZone:'America/Lima'})}: ${item.anterior.situacion_actual||'Sin indicar'} → ${item.nueva.situacion_actual}. Motivo: ${item.motivo}. Usuario: ${item.usuario_id===currentProfile.id?'Tú':item.usuario_id}`;history.append(p);});
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(busy||!record||!allowed(record)||!form.reportValidity())return;
  const cambios=Object.fromEntries(keys.map(k=>{const field=form.elements.namedItem(k);return [k,field.disabled?null:field.value.trim()||null]})),motivo=form.elements.motivo.value.trim();
  if(!motivo){status.textContent='Indique el motivo del cambio.';return;}
  const turn=generation;const payload={p_id:record.id,p_version:record.actualizado_en,p_cambios:cambios,p_motivo:motivo};
  const signature=JSON.stringify(payload);
  if(retry&&retry.signature!==signature){status.textContent='Reintente el envío anterior sin cambiar los datos, o cierre y vuelva a abrir para consultar la situación guardada.';return;}
  retry ||= {signature,id:crypto.randomUUID()};busy=true;form.querySelector('fieldset').disabled=true;form.querySelector('[type="submit"]').disabled=true;status.textContent='Guardando situación…';
  try{
   const {data,error}=await supabaseClient.rpc('actualizar_situacion_detenido',{...payload,p_solicitud:retry.id});if(turn!==generation)return;if(error)throw error;
   if(!data?.actualizado_en)throw Error('No se recibió la confirmación. Reintente.');
   retry=null;dialog.close();await openDetaineeRecord(payload.p_id);
  }catch(error){if(turn!==generation)return;status.textContent=error.message||'No se confirmó el cambio. Reintente.';}
  finally{if(turn!==generation)return;busy=false;form.querySelector('fieldset').disabled=false;form.querySelector('[type="submit"]').disabled=false;}
 });
})();
