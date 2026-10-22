// Un único grupo por operativo y tipo; los integrantes reutilizan la detención.
(() => {
 const form=document.getElementById('detaineeForm'),type=form.elements.integraOrganizacion,name=form.elements.nombreOrganizacion,role=form.elements.rolOrganizacion;
 const panel=document.createElement('section');panel.className='detainee-group-section';panel.style.gridColumn='1 / -1';
 panel.innerHTML='<h3>Banda u organización criminal</h3><p>Registre el grupo aquí una sola vez y seleccione el mismo para sus demás integrantes de este operativo.</p><div class="grid cols-2" data-group-fields></div><p data-group-status role="status"></p>';
 type.closest('label').before(panel);const grid=panel.querySelector('[data-group-fields]'),status=panel.querySelector('[data-group-status]');
 grid.append(type.closest('label'));
 const choiceLabel=document.createElement('label');choiceLabel.textContent='Grupo de este operativo';const choice=document.createElement('select');choice.name='grupoExistente';choiceLabel.append(choice);grid.append(choiceLabel);
 name.closest('label').classList.remove('span-2');grid.append(name.closest('label'),role.closest('label'));
 function field(label,key,required){const l=document.createElement('label');l.textContent=label;const t=document.createElement('textarea');t.name=key;t.rows=2;t.maxLength=2000;t.required=required;l.append(t);grid.append(l);return t;}
 const modality=field('Modalidad delictiva *','grupoModalidad',true),reference=field('Referencia del lugar (opcional)','grupoReferencia',false);
 const refresh=document.createElement('button');refresh.type='button';refresh.className='secondary';refresh.textContent='Actualizar grupos';panel.append(refresh);
 name.maxLength=200;let groups=[],epoch=0,loading=false,error='',parent=null;
 const normalize=s=>String(s||'').trim().toLocaleLowerCase('es');
 const currentParent=()=>window.getDetaineeOperativo?.()?.id||selectedDetainee?.intervencion_id||null;
 function render(){
  const active=['banda','organizacion'].includes(type.value),selected=groups.find(g=>g.id===choice.value&&g.tipo===type.value);
  choice.disabled=!active||loading||!!error||!parent;name.disabled=role.disabled=modality.disabled=reference.disabled=!active;
  modality.required=active;name.required=role.required=active;name.readOnly=modality.readOnly=reference.readOnly=!!selected;
  if(selected){name.value=selected.nombre;modality.value=selected.modalidad;reference.value=selected.referencia_lugar||'';}
  status.textContent=!active?'Si no pertenece a un grupo, continúe con los demás datos.':loading?'Consultando los grupos de este operativo…':error||(!parent?'Abra el registro desde un operativo para guardar también el grupo.':selected?'Se añadirá este detenido al grupo seleccionado. Sus demás integrantes se conservan.':'El detenido y el nuevo grupo se guardarán juntos.');
  refresh.hidden=!active;refresh.disabled=loading;
 }
 function options(preferred=''){
  choice.replaceChildren(new Option('Crear un nuevo grupo',''));
  for(const g of groups.filter(g=>g.tipo===type.value)){const n=g.intervencion_grupo_integrantes?.length||0;choice.add(new Option(g.nombre+' · '+n+(n===1?' integrante':' integrantes'),g.id));}
  const matched=groups.find(g=>g.tipo===type.value&&(g.id===preferred||normalize(g.nombre)===normalize(name.value)));
  choice.value=matched?.id||'';render();
 }
 async function load(){
  const token=++epoch;parent=currentParent();groups=[];error='';loading=!!parent;options();if(!parent)return;
  try{for(let start=0;;start+=100){const {data,error:e}=await supabaseClient.from('intervencion_grupos').select('id,tipo,nombre,modalidad,referencia_lugar,intervencion_grupo_integrantes(detencion_id)').eq('intervencion_id',parent).order('id').range(start,start+99);if(token!==epoch)return;if(e)throw e;groups.push(...data);if(data.length<100)break;}
   const linked=groups.find(g=>g.intervencion_grupo_integrantes?.some(m=>m.detencion_id===editingDetaineeId));options(linked?.id);
  }catch(e){if(token===epoch)error='No se pudieron consultar los grupos. Pulse Actualizar grupos antes de guardar.';}
  finally{if(token===epoch){loading=false;render();}}
 }
 type.addEventListener('change',()=>{modality.value='';reference.value='';if(parent!==currentParent())load();else options();});
 choice.addEventListener('change',()=>{if(!choice.value){name.value='';modality.value='';reference.value='';}render();});
 name.addEventListener('change',()=>options());refresh.addEventListener('click',load);
 form.addEventListener('reset',()=>{epoch++;groups=[];parent=null;loading=false;error='';queueMicrotask(()=>options());});
 window.loadDetaineeGroup=load;
 window.readDetaineeGroup=()=>{
  if(!['banda','organizacion'].includes(type.value))return null;
  if(loading)throw Error('Espere a que termine la consulta de grupos.');
  if(error)throw Error(error);
  if(!parent||parent!==currentParent())throw Error('Abra el detenido desde su operativo y actualice los grupos.');
  if(!modality.value.trim())throw Error('Complete la modalidad delictiva del grupo.');
  return {id:choice.value||null,modalidad:modality.value.trim(),referencia:reference.value.trim()||null};
 };
 options();
})();
