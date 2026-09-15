(() => {
  const $=id=>document.getElementById(id), form=$('groupForm'), list=$('groupRecords'), members=$('groupMembers'), status=$('groupStatus');
  const labels={banda:'Banda criminal',organizacion:'Organización criminal'};
  let context=null,bridge=null,readOnly=true,busy=false,dirty=false,epoch=0,editing=null,type=null,retry=null,groups=[],detainees=[],showTypes=[];
  const text=(tag,value,cls)=>{const el=document.createElement(tag);el.textContent=value??'';if(cls)el.className=cls;return el;};
  const name=d=>[d.personas?.apellido_paterno,d.personas?.apellido_materno,d.personas?.nombres].filter(Boolean).join(' ')||'Identificación no disponible';
  function discard(){return !dirty||confirm('Hay un grupo sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;type=null;retry=null;dirty=false;form.reset();form.hidden=true;members.replaceChildren();}
  function lock(){
    $('groupFields').disabled=busy||readOnly||!context;
    $('groupCards').querySelectorAll('button').forEach(b=>b.disabled=busy||readOnly||!context);
    list.querySelectorAll('button').forEach(b=>b.disabled=busy||!context);
  }
  function show(categories){showTypes=categories;for(const b of $('groupCards').querySelectorAll('button'))b.hidden=!categories.includes(b.dataset.group==='banda'?'bandas':'organizaciones');}
  async function all(table,columns,token){
    let rows=[];
    for(let start=0;;start+=100){
      const {data,error}=await supabaseClient.from(table).select(columns).eq('intervencion_id',context.id).order('id').range(start,start+99);
      if(token!==epoch)return null;if(error)throw error;rows.push(...data);if(data.length<100)return rows;
    }
  }
  function details(d,member){
    const el=document.createElement('details');el.className='group-person-detail';el.append(text('summary','Ver datos reutilizados del detenido'));
    const p=d.personas||{}, crimes=[...(d.detencion_delitos||[])].sort((a,b)=>a.orden-b.orden);
    const fields=[['Documento',[p.tipo_documento,p.numero_documento].filter(Boolean).join(' ')],['Edad / género / nacionalidad',[p.edad,p.genero,p.nacionalidad].filter(x=>x!=null&&x!=='').join(' · ')],['Motivo de detención',d.motivo_detencion],['Fiscal',d.fiscal_nombre],['Fiscalía',d.fiscalia],['Situación actual',d.situacion_actual],['Participación registrada',d.rol_organizacion],['Nombre registrado en Detenidos',d.nombre_organizacion]];
    for(const [title,value]of fields)el.append(text('p',`${title}: ${value||'Sin registrar'}`));
    for(const [index,c]of crimes.entries())el.append(text('p',`Delito ${index+1}: ${[c.es_tentativa?'Tentativa':null,c.fuero_ley_especial,c.delito_general,c.delito_especifico,c.subtipo].filter(Boolean).join(' / ')}`));
    if(!crimes.length)el.append(text('p','Delitos: sin registrar'));
    if(crimes.length>2)el.append(text('p','La hoja del Excel tiene espacio para dos delitos. Este caso requerirá revisión al preparar la exportación.','results-note'));
    if(member)el.append(text('p',`Rol en este grupo: ${member.rol}`));
    return el;
  }
  function open(kind,record=null,view=false){
    clear();type=kind;editing=record;form.hidden=false;
    $('groupFormTitle').textContent=`${view?'Consultar':record?'Editar':'Registrar'} · ${labels[kind]}`;
    form.elements.nombre.value=record?.nombre||'';form.elements.modalidad.value=record?.modalidad||'';
    form.elements.referencia.value=record?.referencia_lugar??context.detalle_ubicacion??'';
    $('saveGroup').hidden=view;
    const existing=record?.intervencion_grupo_integrantes||[];
    const candidates=detainees.filter(d=>view?existing.some(m=>m.detencion_id===d.id):d.integra_organizacion&&d.tipo_organizacion===kind);
    if(!candidates.length)members.append(text('p',`No hay detenidos clasificados como ${labels[kind].toLowerCase()} en este operativo. Regístrelos o corrija su clasificación en Detenidos y pulse Actualizar.`,'results-note'));
    for(const d of candidates){
      const selected=existing.find(m=>m.detencion_id===d.id), other=groups.find(g=>g.id!==record?.id&&g.intervencion_grupo_integrantes.some(m=>m.detencion_id===d.id));
      const row=document.createElement('div');row.className='group-member';row.dataset.detencion=d.id;
      const label=document.createElement('label');label.className='group-member-choice';const check=document.createElement('input');check.type='checkbox';check.checked=!!selected;check.disabled=view||!!other;check.dataset.member=d.id;
      label.append(check,text('strong',name(d)));row.append(label,text('small',`${d.codigo||''}${other?' · Ya vinculado a '+other.nombre:''}`));
      const roleLabel=document.createElement('label');roleLabel.textContent='Rol o participación *';const role=document.createElement('input');role.type='text';role.maxLength=200;role.dataset.role=d.id;role.value=selected?.rol||d.rol_organizacion||'';role.placeholder=kind==='organizacion'?'Indique el rol que desempeña':'Integrante o cabecilla';role.disabled=view||!check.checked;role.required=check.checked;roleLabel.append(role);row.append(roleLabel,details(d,selected));
      check.addEventListener('change',()=>{role.disabled=!check.checked;role.required=check.checked;dirty=true;if(check.checked&&!form.elements.nombre.value.trim())form.elements.nombre.value=d.nombre_organizacion||'';});members.append(row);
    }
    const absent=existing.filter(m=>!candidates.some(d=>d.id===m.detencion_id));
    if(absent.length){members.append(text('p','No se pudieron consultar todos los integrantes. Actualice antes de editar.','error-text'));$('saveGroup').hidden=true;}
    status.textContent=view?'Consulta del grupo. Los datos personales se leen del registro original.':'';lock();
    if(view){$('groupFields').disabled=false;form.querySelectorAll('input').forEach(el=>el.disabled=true);}
    form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function render(){
    list.replaceChildren();
    if(!groups.length)list.textContent='Aún no hay bandas ni organizaciones registradas en este operativo.';
    for(const g of groups){
      const row=document.createElement('div');row.className='material-record';const info=document.createElement('div');
      info.append(text('strong',g.nombre),text('small',`${labels[g.tipo]} · ${g.intervencion_grupo_integrantes.length} integrantes · ${g.modalidad}`));
      const button=text('button',readOnly?'Ver detalle':'Abrir / editar','secondary');button.type='button';button.addEventListener('click',()=>{if(!busy&&discard())open(g.tipo,g,readOnly);});row.append(info,button);list.append(row);
    }
    const unclassified=detainees.filter(d=>d.integra_organizacion&&!d.tipo_organizacion).length;
    $('groupLegacyNote').textContent=unclassified?`${unclassified} detenido(s) del operativo están pendientes de clasificar como banda u organización. Revise su ficha antes de vincularlos.`:'';
    $('groupTotals').textContent=`${groups.filter(g=>g.tipo==='banda').length} bandas · ${groups.filter(g=>g.tipo==='organizacion').length} organizaciones · ${groups.reduce((n,g)=>n+g.intervencion_grupo_integrantes.length,0)} integrantes`;
  }
  async function load(token=epoch){
    const gs=await all('intervencion_grupos','*,intervencion_grupo_integrantes(detencion_id,rol)',token);if(token!==epoch)return;
    const ds=await all('detenciones','id,codigo,intervencion_id,integra_organizacion,tipo_organizacion,nombre_organizacion,rol_organizacion,motivo_detencion,fiscal_nombre,fiscalia,situacion_actual,personas(apellido_paterno,apellido_materno,nombres,edad,genero,nacionalidad,tipo_documento,numero_documento),detencion_delitos(orden,es_tentativa,fuero_ley_especial,delito_general,delito_especifico,subtipo)',token);
    if(token!==epoch)return;groups=gs;detainees=ds;render();lock();
  }
  $('groupCards').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(!busy&&!readOnly&&discard())open(b.dataset.group);}));
  form.addEventListener('input',()=>{dirty=true;status.textContent='Grupo sin guardar';});
  $('cancelGroup').addEventListener('click',()=>{if(!busy&&discard()){clear();status.textContent='';}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||!context||!type||!form.reportValidity())return;
    if(editing?.intervencion_grupo_integrantes.some(m=>!detainees.some(d=>d.id===m.detencion_id))){status.textContent='Faltan integrantes por consultar. Actualice antes de guardar.';return;}
    const selected=[...members.querySelectorAll('input[data-member]:checked')].map(el=>({detencion_id:el.dataset.member,rol:members.querySelector(`[data-role="${el.dataset.member}"]`).value.trim()})).sort((a,b)=>a.detencion_id.localeCompare(b.detencion_id));
    if(!selected.length){status.textContent='Seleccione al menos un detenido para vincularlo al grupo.';return;}
    const token=epoch;if(!await bridge.prepare()||token!==epoch)return;
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_version:editing?.version||0,p_tipo:type,p_nombre:form.elements.nombre.value.trim(),p_modalidad:form.elements.modalidad.value.trim(),p_referencia:form.elements.referencia.value.trim()||null,p_integrantes:selected};
    if(retry&&JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice antes de modificarlos.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando grupo e integrantes…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_grupo_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code&&/^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version,type==='banda'?'bandas':'organizaciones');clear();status.textContent='✓ Grupo e integrantes guardados.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Grupo guardado. Pulse Actualizar para consultar la lista.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El grupo cambió. Actualice y vuelva a abrirlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  window.GruposUI={get dirty(){return dirty;},discard,clear,show,
    reset(){epoch++;context=null;readOnly=true;busy=false;groups=[];detainees=[];clear();list.replaceChildren();status.textContent='';$('groupLegacyNote').textContent='';$('groupTotals').textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;readOnly=readonly;bridge=callbacks;clear();await load(epoch);lock();}
  };window.GruposUI.reset();
})();
