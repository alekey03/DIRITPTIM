(() => {
  const catalog = window.MATERIALES_CATALOGO.tipos;
  const $ = id => document.getElementById(id);
  const form=$('materialForm'), inputs=$('materialInputs'), status=$('materialStatus'), list=$('materialRecords');
  let context=null, bridge=null, readOnly=true, busy=false, dirty=false, epoch=0, shown=25, editing=null, selected=null, retry=null, detainees=[];
  const paths={
    fuego:'M4 7h15v5h-7l-2 8H5l2-9H4z M12 12v3h4v-3',
    blanca:'M17 3l4 4-9 9-4-4z M8 12l4 4 M9 15l-5 6-2-2 5-6',
    municion:'M5 21V8l3-5 3 5v13z M14 21V8l3-5 3 5v13z M5 17h6 M14 17h6',
    explosivo:'M4 8h16v13H4z M4 12h16 M9 8V4h6v4 M12 12v5 M10 19h4',
    replica:'M12 3l9 4v6c0 5-9 9-9 9S3 18 3 13V7z M8 12h8 M12 8v8'
  };
  const icon=type=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${paths[type]}"></path></svg>`;
  for(const type of catalog){
    const button=document.createElement('button');button.type='button';button.className='material-card';button.dataset.material=type.tipo;
    button.innerHTML=`${icon(type.tipo)}<strong>${type.titulo}</strong><small>${type.descripcion}</small><span>＋ Agregar registro</span>`;
    button.addEventListener('click',()=>{if(!busy && !readOnly && discard()) open(type);});$('materialCards').append(button);
  }
  function discard(){return !dirty || confirm('Hay un material sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;selected=null;dirty=false;retry=null;form.hidden=true;inputs.replaceChildren();$('materialCards').querySelectorAll('button').forEach(b=>b.classList.remove('selected'));}
  function lock(){
    $('materialFields').disabled=busy || readOnly || !context;
    $('materialCards').querySelectorAll('button').forEach(b=>{b.disabled=busy || readOnly || !context;});
    $('moreMaterials').disabled=busy || !context;
  }
  const personKeys=['apellido_paterno','apellido_materno','nombres','edad','genero','nacionalidad','tipo_documento','numero_documento'];
  const personName=d=>[d.personas?.apellido_paterno,d.personas?.apellido_materno,d.personas?.nombres].filter(Boolean).join(' ');
  async function loadPeople(token){
    const result=[];for(let start=0;;start+=100){const {data,error}=await supabaseClient.from('detenciones_reportables').select('id,codigo,personas(apellido_paterno,apellido_materno,nombres,edad,genero,nacionalidad,tipo_documento,numero_documento)').eq('intervencion_id',context.id).order('id').range(start,start+99);if(token!==epoch)return;if(error)throw error;result.push(...data);if(data.length<100)break;}detainees=result;
  }
  function personSelector(record,view){
    const section=document.createElement('section');section.className='material-person-link';const label=document.createElement('label');label.textContent='Detenido a quien se le incautó';const select=document.createElement('select');select.name='detenidoSeleccionado';select.append(new Option('Sin detenido asociado · hallazgo',''));
    for(const d of detainees)select.append(new Option(`${personName(d)} · ${d.codigo||''}`,d.id));
    const existing=record?.datos||{},hasPerson=personKeys.some(k=>existing[k]!=null&&existing[k]!=='');
    const matches=hasPerson?detainees.filter(d=>personKeys.every(k=>String(d.personas?.[k]??'')===String(existing[k]??''))):[];
    if(hasPerson){select.append(new Option('Datos conservados del registro anterior','__legacy__'));select.value=matches.length===1?matches[0].id:'__legacy__';}
    select.disabled=view;label.append(select);const note=document.createElement('p');note.textContent='Seleccione un detenido de este operativo. Sus datos se incorporan automáticamente al registro del material.';section.append(label,note);
    const summary=document.createElement('div');summary.className='material-person-data';section.append(summary);
    const refresh=()=>{const d=detainees.find(d=>d.id===select.value),p=d?.personas||(select.value==='__legacy__'?existing:null);summary.textContent=p?[p.numero_documento,p.edad!=null?p.edad+' años':null,p.genero,p.nacionalidad].filter(Boolean).join(' · '):detainees.length?'Use «Sin detenido asociado» únicamente para un hallazgo sin persona.':'Aún no hay detenidos. Regístrelos en Detenidos de este operativo para poder seleccionarlos.';};select.addEventListener('change',refresh);refresh();inputs.append(section);
  }
  const another=document.createElement('button');another.id='saveAnotherMaterial';another.type='submit';another.className='secondary';another.textContent='Guardar y agregar otra';$('saveMaterial').after(another);
  function open(type,record=null,view=false){
    clear();selected=type;editing=record;form.hidden=false;
    $('materialFormTitle').textContent=`${view?'Consultar':record?'Editar':'Registrar'} · ${type.titulo}`;
    $('saveMaterial').hidden=view;another.hidden=view||!!record;$('cancelMaterial').hidden=false;
    $('materialCards').querySelector(`[data-material="${type.tipo}"]`).classList.add('selected');
    const groups=[['material','Datos del material'],['persona','Persona relacionada · si corresponde'],['delito1','Primer delito · si corresponde'],['delito2','Segundo delito · si corresponde']];
    for(const [group,title] of groups){
      if(group==='persona'){if(type.campos.some(f=>f.group==='persona'))personSelector(record,view);continue;}
      const fields=type.campos.filter(f=>f.group===group);if(!fields.length)continue;
      const section=document.createElement(group==='material'?'div':'details');
      const heading=document.createElement(group==='material'?'h4':'summary');heading.textContent=title;section.append(heading);
      if(group!=='material' && fields.some(f=>record?.datos[f.key]!=null))section.open=true;
      const grid=document.createElement('div');grid.className='material-fields';section.append(grid);
      for(const field of fields){
        const label=document.createElement('label');const title=document.createElement('span');title.textContent=field.label+(field.required?' *':'');label.append(title);
        const crimeMap={fuero:'jurisdiction',delito_general:'general',delito_especifico:'specific',subtipo:'subtype'};
        const baseKey=field.key.replace(/_2$/,'');const isCrime=group.startsWith('delito') && crimeMap[baseKey];
        const options=baseKey==='tentativa'?['Sí','No']:field.key==='genero'?['Masculino','Femenino']:null;
        const control=document.createElement(options||isCrime?'select':'input');control.name=field.key;
        if(options||isCrime){const blank=new Option('Sin indicar','');control.append(blank);for(const value of options||[])control.append(new Option(value,value));if(isCrime)control.dataset.field=crimeMap[baseKey];}
        else{control.type=field.type;control.maxLength=2000;if(field.type==='number'){control.min=field.key==='edad'||field.key==='cantidad_municiones'?'0':type.tipo==='municion'?'1':'0.000001';control.max=field.key==='edad'?'120':'999999999999';control.step=field.key==='edad'||field.key==='cantidad_municiones'||type.tipo==='municion'?'1':'0.000001';}control.autocomplete='off';}
        control.required=field.required;control.value=record?.datos[field.key]??'';control.disabled=view;label.append(control);grid.append(label);
      }
      if(group.startsWith('delito')){
        const suffix=group==='delito2'?'_2':'';const data=record?.datos||{};
        window.createCrimeCascade?.(grid,{fuero_ley_especial:data['fuero'+suffix],delito_general:data['delito_general'+suffix],delito_especifico:data['delito_especifico'+suffix],subtipo:data['subtipo'+suffix]});
        // Preserve stored values if a catalog entry was retired or is temporarily unavailable.
        grid.querySelectorAll('select').forEach(control=>{const value=data[control.name];if(value && ![...control.options].some(o=>o.value===value)){control.append(new Option(value,value));control.value=value;}});
        if(view)grid.querySelectorAll('input,select').forEach(c=>c.disabled=true);
      }
      inputs.append(section);
    }
    if(type.tipo==='explosivo'){const note=document.createElement('p');note.className='results-note';note.textContent='La plantilla no especifica unidad para esta cantidad. Indique la unidad en el detalle del material; no mezcle medidas distintas en un registro.';inputs.prepend(note);}
    status.textContent=view?'Consulta del registro.':'';lock();
    if(view){$('materialFields').disabled=false;inputs.querySelectorAll('input,select').forEach(c=>c.disabled=true);}
    form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function load(token=epoch){
    if(!context || token!==epoch)return;
    const {data,error}=await supabaseClient.from('intervencion_materiales').select('id,tipo,datos,version').eq('intervencion_id',context.id).order('creado_en',{ascending:false}).order('id').range(0,shown);
    if(token!==epoch)return;if(error)throw error;list.replaceChildren();
    if(!data.length)list.textContent='Aún no hay materiales registrados en este operativo.';
    for(const record of data.slice(0,shown)){
      const type=catalog.find(t=>t.tipo===record.tipo);if(!type)continue;
      const row=document.createElement('div');row.className='material-record';const symbol=document.createElement('span');symbol.className='material-record-icon';symbol.innerHTML=icon(type.tipo);
      const info=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=type.titulo;
      detail.textContent=[record.datos.tipo,record.datos.marca,record.datos.serie?`Serie: ${record.datos.serie}`:null,record.datos.cantidad!=null?`Cantidad: ${record.datos.cantidad}`:null,record.datos.situacion].filter(Boolean).join(' · ');
      info.append(title,detail);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=(readOnly||!puedeEditarUnidad(context.unidad))?'Ver detalle':'Abrir / editar';
      button.addEventListener('click',()=>{if(!busy && discard())open(type,record,readOnly||!puedeEditarUnidad(context.unidad));});row.append(symbol,info,button);list.append(row);
    }
    $('moreMaterials').hidden=data.length<=shown;
  }
  form.addEventListener('input',()=>{dirty=true;status.textContent='Material sin guardar';});
  $('cancelMaterial').addEventListener('click',()=>{if(!busy && discard()){clear();status.textContent='';}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||!context||!selected||!form.reportValidity())return;
    const token=epoch;if(!(await bridge.prepare())||token!==epoch)return;
    const repeat=event.submitter===another,continueType=selected;const datos={};for(const field of selected.campos.filter(f=>f.group!=='persona')){const value=form.elements.namedItem(field.key).value.trim();datos[field.key]=value===''?null:field.type==='number'?Number(value):value;}
    if(selected.campos.some(f=>f.group==='persona')){
      const id=form.elements.detenidoSeleccionado.value,person=id==='__legacy__'?editing?.datos:detainees.find(d=>d.id===id)?.personas;
      if(id&&!person){status.textContent='El detenido ya no está disponible. Actualice los resultados.';return;}
      for(const key of personKeys)datos[key]=person?.[key]??null;
    }
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_version:editing?.version||0,p_tipo:selected.tipo,p_datos:datos};
    if(retry && JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice la lista antes de cambiarlos.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando material…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_material_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code && /^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version);clear();if(repeat)open(continueType);status.textContent=repeat?'✓ Registro guardado. Complete los datos del siguiente material.':'✓ Registro guardado. Puede agregar otro material.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Registro guardado; no se pudo actualizar la lista. Pulse Actualizar.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El registro cambió. Actualice y vuelva a abrirlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión y reintente.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  $('moreMaterials').addEventListener('click',async()=>{if(busy||!context)return;const token=epoch;bridge.setBusy(true);shown+=25;try{await load(token);}catch{if(token===epoch)status.textContent='No se pudo cargar la lista. Reintente.';}finally{if(token===epoch)bridge.setBusy(false);}});
  window.MaterialesUI={get dirty(){return dirty;},discard,clear,
    reset(){epoch++;context=null;detainees=[];readOnly=true;busy=false;shown=25;clear();list.replaceChildren();status.textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;readOnly=readonly;bridge=callbacks;clear();const token=epoch;await loadPeople(token);if(token!==epoch)return;await load(token);lock();}
  };
  window.MaterialesUI.reset();
})();

