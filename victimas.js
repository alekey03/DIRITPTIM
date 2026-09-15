(() => {
  const catalog = [{tipo:'victima',titulo:'Víctima de trata',descripcion:'Identificación, situación y puesta a disposición',campos:window.VICTIMAS_CATALOGO.campos}];
  const $ = id => document.getElementById(id);
  const form=$('victimForm'), inputs=$('victimInputs'), status=$('victimStatus'), list=$('victimRecords');
  let context=null, bridge=null, readOnly=true, busy=false, dirty=false, epoch=0, shown=25, editing=null, selected=null, retry=null;
  const paths={victima:'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M5 21v-4a7 7 0 0 1 14 0v4 M9 21v-5 M15 21v-5'};
  const icon=type=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${paths[type]}"></path></svg>`;
  for(const type of catalog){
    const button=document.createElement('button');button.type='button';button.className='material-card';button.dataset.victim=type.tipo;
    button.innerHTML=`${icon(type.tipo)}<strong>${type.titulo}</strong><small>${type.descripcion}</small><span>＋ Agregar registro</span>`;
    button.addEventListener('click',()=>{if(!busy && !readOnly && discard()) open(type);});$('victimCards').append(button);
  }
  function discard(){return !dirty || confirm('Hay una víctima sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;selected=null;dirty=false;retry=null;form.hidden=true;inputs.replaceChildren();$('victimCards').querySelectorAll('button').forEach(b=>b.classList.remove('selected'));}
  function lock(){
    $('victimFields').disabled=busy || readOnly || !context;
    $('victimCards').querySelectorAll('button').forEach(b=>{b.disabled=busy || readOnly || !context;});
    $('moreVictims').disabled=busy || !context;
  }
  function open(type,record=null,view=false){
    clear();selected=type;editing=record;form.hidden=false;
    $('victimFormTitle').textContent=`${view?'Consultar':record?'Editar':'Registrar'} · ${type.titulo}`;
    $('saveVictim').hidden=view;$('cancelVictim').hidden=false;
    $('victimCards').querySelector(`[data-victim="${type.tipo}"]`).classList.add('selected');
    const groups=[['hecho','01 · Fecha y hora'],['identidad','02 · Identificación'],['proteccion','03 · Situación y puesta a disposición']];
    for(const [group,title] of groups){
      const section=document.createElement('section'),heading=document.createElement('h4');heading.textContent=title;section.append(heading);
      const grid=document.createElement('div');grid.className='material-fields';section.append(grid);
      for(const field of type.campos.filter(f=>f.group===group)){
        const label=document.createElement('label'),caption=document.createElement('span');caption.textContent=field.label+(field.required?' *':'');label.append(caption);
        const control=document.createElement(field.options?'select':'input');control.name=field.key;
        if(field.options){control.append(new Option('Seleccionar',''));for(const v of field.options)control.append(new Option(v,v));}
        else{control.type=field.type;control.maxLength=2000;control.autocomplete='off';if(field.type==='number'){control.min='2';control.max='100';control.step='1';}}
        control.required=field.required;control.readOnly=!!field.computed;control.value=record?.datos[field.key]??(field.key==='fecha'?context.fecha:field.key==='hora'?context.hora:'');control.disabled=view;
        label.append(control);grid.append(label);
      }
      inputs.append(section);
    }
    const age=form.elements.namedItem('edad'),condition=form.elements.namedItem('condicion_edad');
    const sync=()=>{condition.value=age.value!==''&&age.validity.valid?(Number(age.value)<18?'MENOR':'MAYOR'):'';};age.addEventListener('input',sync);sync();
    status.textContent=view?'Consulta del registro.':'';lock();
    if(view){inputs.querySelectorAll('input,select').forEach(c=>c.disabled=true);}
    form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function load(token=epoch){
    if(!context || token!==epoch)return;
    const {data,error}=await supabaseClient.from('intervencion_victimas').select('id,tipo,datos,version').eq('intervencion_id',context.id).order('creado_en',{ascending:false}).order('id').range(0,shown);
    if(token!==epoch)return;if(error)throw error;list.replaceChildren();
    if(!data.length)list.textContent='Aún no hay víctimas registradas en este operativo.';
    for(const record of data.slice(0,shown)){
      const type=catalog.find(t=>t.tipo===record.tipo);if(!type)continue;
      const row=document.createElement('div');row.className='material-record';const symbol=document.createElement('span');symbol.className='material-record-icon';symbol.innerHTML=icon(type.tipo);
      const info=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=[record.datos.apellido_paterno,record.datos.apellido_materno,record.datos.nombres].filter(Boolean).join(' ');
      detail.textContent=[record.datos.edad+' años',record.datos.fecha,record.datos.situacion].filter(Boolean).join(' · ');
      info.append(title,detail);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=readOnly?'Ver detalle':'Abrir / editar';
      button.addEventListener('click',()=>{if(!busy && discard())open(type,record,readOnly);});row.append(symbol,info,button);list.append(row);
    }
    $('moreVictims').hidden=data.length<=shown;
  }
  form.addEventListener('input',()=>{dirty=true;status.textContent='Víctima sin guardar';});
  $('cancelVictim').addEventListener('click',()=>{if(!busy && discard()){clear();status.textContent='';}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||!context||!selected||!form.reportValidity())return;
    const token=epoch;if(!(await bridge.prepare())||token!==epoch)return;
    const datos={};for(const field of selected.campos){const value=form.elements.namedItem(field.key).value.trim();datos[field.key]=value===''?null:field.type==='number'?Number(value):value;}
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_version:editing?.version||0,p_tipo:selected.tipo,p_datos:datos};
    if(retry && JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice la lista antes de cambiarlos.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando víctima…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_victima_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code && /^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version);clear();status.textContent='✓ Registro guardado. Puede agregar otra víctima.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Registro guardado; no se pudo actualizar la lista. Pulse Actualizar.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El registro cambió. Actualice y vuelva a abrirlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión y reintente.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  $('moreVictims').addEventListener('click',async()=>{if(busy||!context)return;const token=epoch;bridge.setBusy(true);shown+=25;try{await load(token);}catch{if(token===epoch)status.textContent='No se pudo cargar la lista. Reintente.';}finally{if(token===epoch)bridge.setBusy(false);}});
  window.VictimasUI={get dirty(){return dirty;},discard,clear,
    reset(){epoch++;context=null;readOnly=true;busy=false;shown=25;clear();list.replaceChildren();status.textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;readOnly=readonly;bridge=callbacks;clear();await load(epoch);lock();}
  };
  window.VictimasUI.reset();
})();

