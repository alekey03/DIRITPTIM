(() => {
  const catalog = [{tipo:'prostitucion',titulo:'Persona registrada',descripcion:'Edad, género y nacionalidad según el formato actualizado',campos:window.PROSTITUCION_CATALOGO.campos}];
  const $ = id => document.getElementById(id);
  const form=$('prostitucionForm'), inputs=$('prostitucionInputs'), status=$('prostitucionStatus'), list=$('prostitucionRecords');
  let context=null, bridge=null, readOnly=true, busy=false, dirty=false, epoch=0, shown=25, editing=null, selected=null, retry=null;
  const paths={prostitucion:'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M5 21v-4a7 7 0 0 1 14 0v4 M9 21v-5 M15 21v-5'};
  const icon=type=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${paths[type]}"></path></svg>`;
  for(const type of catalog){
    const button=document.createElement('button');button.type='button';button.className='material-card';button.dataset.prostitucion=type.tipo;
    button.innerHTML=`${icon(type.tipo)}<strong>${type.titulo}</strong><small>${type.descripcion}</small><span>＋ Agregar registro</span>`;
    button.addEventListener('click',()=>{if(!busy && !readOnly && discard()) open(type);});$('prostitucionCards').append(button);
  }
  function discard(){return !dirty || confirm('Hay un registro sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;selected=null;dirty=false;retry=null;form.hidden=true;inputs.replaceChildren();$('prostitucionCards').querySelectorAll('button').forEach(b=>b.classList.remove('selected'));}
  function lock(){
    $('prostitucionFields').disabled=busy || readOnly || !context;
    $('prostitucionCards').querySelectorAll('button').forEach(b=>{b.disabled=busy || readOnly || !context;});
    $('moreProstitucion').disabled=busy || !context;
  }
  function open(type,record=null,view=false){
    clear();selected=type;editing=record;form.hidden=false;
    $('prostitucionFormTitle').textContent=`${view?'Consultar':record?'Editar':'Registrar'} · ${type.titulo}`;
    $('saveProstitucion').hidden=view;$('cancelProstitucion').hidden=false;
    $('prostitucionCards').querySelector(`[data-prostitucion="${type.tipo}"]`).classList.add('selected');
    const groups=[['hecho','01 · Fecha y hora'],['identidad','02 · Datos de la persona']];
    for(const [group,title] of groups){
      const section=document.createElement('section'),heading=document.createElement('h4');heading.textContent=title;section.append(heading);
      const grid=document.createElement('div');grid.className='material-fields';section.append(grid);
      for(const field of type.campos.filter(f=>f.group===group)){
        const label=document.createElement('label'),caption=document.createElement('span');caption.textContent=field.label+(field.required?' *':'');label.append(caption);
        const control=document.createElement(field.options?'select':'input');control.name=field.key;
        if(field.options){control.append(new Option('Seleccionar',''));for(const v of field.options)control.append(new Option(v,v));}
        else{control.type=field.type;control.maxLength=2000;control.autocomplete='off';if(field.type==='number'){control.min='0';control.max='120';control.step='1';}}
        control.required=field.required;control.readOnly=!!field.computed;control.value=record?.datos[field.key]??(field.key==='fecha'?context.fecha:field.key==='hora'?context.hora:'');control.disabled=view;
        label.append(control);grid.append(label);
      }
      inputs.append(section);
    }
    const historical=window.PROSTITUCION_CATALOGO.camposHistoricos.filter(f=>record?.datos[f.key]!=null&&record.datos[f.key]!=='');
    if(historical.length){
      const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Datos del formato anterior · conservados';details.append(summary);
      for(const f of historical){const p=document.createElement('p');p.textContent=f.label+': '+record.datos[f.key];details.append(p);}inputs.append(details);
    }
    const shared=document.createElement('p');shared.className='results-note';shared.textContent='El lugar, la dirección policial, la división, el departamento policial, la unidad, la NI y las coordenadas se toman del operativo.';inputs.append(shared);
    status.textContent=view?'Consulta del registro.':'';lock();
    if(view){inputs.querySelectorAll('input,select').forEach(c=>c.disabled=true);}
    form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function load(token=epoch){
    if(!context || token!==epoch)return;
    const {data,error}=await supabaseClient.from('intervencion_prostitucion').select('id,tipo,datos,version').eq('intervencion_id',context.id).order('creado_en',{ascending:false}).order('id').range(0,shown);
    if(token!==epoch)return;if(error)throw error;list.replaceChildren();
    if(!data.length)list.textContent='Aún no hay personas registradas en este operativo.';
    for(const record of data.slice(0,shown)){
      const type=catalog.find(t=>t.tipo===record.tipo);if(!type)continue;
      const row=document.createElement('div');row.className='material-record';const symbol=document.createElement('span');symbol.className='material-record-icon';symbol.innerHTML=icon(type.tipo);
      const info=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=[record.datos.apellido_paterno,record.datos.apellido_materno,record.datos.nombres].filter(Boolean).join(' ')||'Registro · '+(record.datos.genero||'Sin género consignado');
      detail.textContent=[record.datos.edad+' años',record.datos.fecha,record.datos.numero_documento].filter(Boolean).join(' · ');
      info.append(title,detail);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=(readOnly||!puedeEditarUnidad(context.unidad))?'Ver detalle':'Abrir / editar';
      button.addEventListener('click',()=>{if(!busy && discard())open(type,record,readOnly||!puedeEditarUnidad(context.unidad));});row.append(symbol,info,button);list.append(row);
    }
    $('moreProstitucion').hidden=data.length<=shown;
  }
  form.addEventListener('input',()=>{dirty=true;status.textContent='Registro sin guardar';});
  $('cancelProstitucion').addEventListener('click',()=>{if(!busy && discard()){clear();status.textContent='';}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||!context||!selected||!form.reportValidity())return;
    const token=epoch;if(!(await bridge.prepare())||token!==epoch)return;
    const datos={...(editing?.datos||{})};for(const field of selected.campos){const value=form.elements.namedItem(field.key).value.trim();datos[field.key]=value===''?null:field.type==='number'?Number(value):value;}
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_version:editing?.version||0,p_tipo:selected.tipo,p_datos:datos};
    if(retry && JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice la lista antes de cambiarlos.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando registro…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_prostitucion_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code && /^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version);clear();status.textContent='✓ Registro guardado. Puede agregar otra persona.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Registro guardado; no se pudo actualizar la lista. Pulse Actualizar.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El registro cambió. Actualice y vuelva a abrirlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión y reintente.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  $('moreProstitucion').addEventListener('click',async()=>{if(busy||!context)return;const token=epoch;bridge.setBusy(true);shown+=25;try{await load(token);}catch{if(token===epoch)status.textContent='No se pudo cargar la lista. Reintente.';}finally{if(token===epoch)bridge.setBusy(false);}});
  window.ProstitucionUI={get dirty(){return dirty;},discard,clear,
    reset(){epoch++;context=null;readOnly=true;busy=false;shown=25;clear();list.replaceChildren();status.textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;readOnly=readonly;bridge=callbacks;clear();await load(epoch);lock();}
  };
  window.ProstitucionUI.reset();
})();

