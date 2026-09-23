(() => {
  const catalog = [{tipo:'registro',titulo:'Ampliación de nota informativa',descripcion:'Otra NI correspondiente al mismo operativo',campos:window.NOTAS_CATALOGO.campos}];
  const $ = id => document.getElementById(id);
  const form=$('noteForm'), inputs=$('noteInputs'), status=$('noteStatus'), list=$('noteRecords');
  let context=null, bridge=null, readOnly=true, busy=false, dirty=false, epoch=0, shown=25, editing=null, selected=null, retry=null;
  const paths={registro:'M6 3h9l4 4v14H5V3z M14 3v5h5 M8 12h8 M8 16h8'};
  const icon=type=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${paths[type]}"></path></svg>`;
  for(const type of catalog){
    const button=document.createElement('button');button.type='button';button.className='material-card';button.dataset.note=type.tipo;
    button.innerHTML=`${icon(type.tipo)}<strong>${type.titulo}</strong><small>${type.descripcion}</small><span>＋ Agregar registro</span>`;
    button.addEventListener('click',()=>{if(!busy && !readOnly && discard()) open(type);});$('noteCards').append(button);
  }
  function discard(){return !dirty || confirm('Hay un ampliación sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;selected=null;dirty=false;retry=null;form.hidden=true;inputs.replaceChildren();$('noteCards').querySelectorAll('button').forEach(b=>b.classList.remove('selected'));}
  function lock(){
    $('noteFields').disabled=busy || readOnly || !context;
    $('noteCards').querySelectorAll('button').forEach(b=>{b.disabled=busy || readOnly || !context;});
    $('moreNotes').disabled=busy || !context;
  }
  function open(type,record=null,view=false){
    clear();selected=type;editing=record;form.hidden=false;
    $('noteFormTitle').textContent=`${view?'Consultar':record?'Editar':'Registrar'} · ${type.titulo}`;
    $('saveNote').hidden=view;$('cancelNote').hidden=false;
    $('noteCards').querySelector(`[data-note="${type.tipo}"]`).classList.add('selected');
    const groups=[['nota','Datos de la ampliación']];
    for(const [group,title] of groups){
      const fields=type.campos.filter(f=>f.group===group);if(!fields.length)continue;
      const section=document.createElement(group==='nota'?'div':'details');
      const heading=document.createElement(group==='nota'?'h4':'summary');heading.textContent=title;section.append(heading);
      if(group!=='nota' && fields.some(f=>record?.datos[f.key]!=null))section.open=true;
      const grid=document.createElement('div');grid.className='material-fields';section.append(grid);
      for(const field of fields){
        const label=document.createElement('label');const title=document.createElement('span');title.textContent=field.label+(field.required?' *':'');label.append(title);
        const crimeMap={fuero:'jurisdiction',delito_general:'general',delito_especifico:'specific',subtipo:'subtype'};
        const baseKey=field.key.replace(/_2$/,'');const isCrime=group.startsWith('delito') && crimeMap[baseKey];
        const source=field.source?document.querySelector('#detaineeForm [name="'+field.source+'"]'):null;
        const options=field.options||(source?[...source.options].filter(o=>o.value).map(o=>o.value):null);
        const dependent=false;
        const control=document.createElement(options||isCrime||dependent?'select':field.type==='textarea'?'textarea':'input');control.name=field.key;
        if(options||isCrime||dependent){const blank=new Option('Sin indicar','');control.append(blank);for(const value of options||[])control.append(new Option(value,value));if(isCrime)control.dataset.field=crimeMap[baseKey];}
        else{control.type=field.type;control.maxLength=2000;if(field.type==='textarea')control.rows=4;if(field.type==='number'){control.min='0';control.max='120';control.step='1';}control.autocomplete='off';}
        control.required=field.required;control.value=record?.datos[field.key]??('');control.disabled=view;label.append(control);grid.append(label);
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
    status.textContent=view?'Consulta del registro.':'';lock();
    if(view){inputs.querySelectorAll('input,select').forEach(c=>c.disabled=true);}
    form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function load(token=epoch){
    if(!context || token!==epoch)return;
    const {data,error}=await supabaseClient.from('intervencion_notas').select('id,tipo,datos,version').eq('intervencion_id',context.id).order('creado_en',{ascending:false}).order('id').range(0,shown);
    if(token!==epoch)return;if(error)throw error;list.replaceChildren();
    if(!data.length)list.textContent='Aún no hay ampliaciones registrados en este operativo.';
    for(const record of data.slice(0,shown)){
      const type=catalog[0];
      const row=document.createElement('div');row.className='material-record';const symbol=document.createElement('span');symbol.className='material-record-icon';symbol.innerHTML=icon(type.tipo);
      const info=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=record.datos.numero;
      detail.textContent=[record.datos.fecha,record.datos.hora,record.datos.detalle].filter(Boolean).join(' · ');
      info.append(title,detail);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=(readOnly||!puedeEditarUnidad(context.unidad))?'Ver detalle':'Abrir / editar';
      button.addEventListener('click',()=>{if(!busy && discard())open(type,record,readOnly||!puedeEditarUnidad(context.unidad));});row.append(symbol,info,button);list.append(row);
    }
    $('moreNotes').hidden=data.length<=shown;
  }
  form.addEventListener('input',()=>{dirty=true;status.textContent='Ampliación sin guardar';});
  $('cancelNote').addEventListener('click',()=>{if(!busy && discard()){clear();status.textContent='';}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||!context||!selected||!form.reportValidity())return;
    const token=epoch;if(!(await bridge.prepare())||token!==epoch)return;
    const datos={};for(const field of selected.campos){const value=form.elements.namedItem(field.key).value.trim();datos[field.key]=value===''?null:field.type==='number'?Number(value):value;}
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_version:editing?.version||0,p_tipo:'ampliacion',p_datos:datos};
    if(retry && JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice la lista antes de cambiarlos.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando ampliación…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_ampliacion_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code==='23505')error.message='Ya existe un registro con ese documento o número en este operativo.';if(error.code && /^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version);clear();status.textContent='✓ Registro guardado. Puede agregar otra ampliación.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Registro guardado; no se pudo actualizar la lista. Pulse Actualizar.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El registro cambió. Actualice y vuelva a abrirlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión y reintente.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  $('moreNotes').addEventListener('click',async()=>{if(busy||!context)return;const token=epoch;bridge.setBusy(true);shown+=25;try{await load(token);}catch{if(token===epoch)status.textContent='No se pudo cargar la lista. Reintente.';}finally{if(token===epoch)bridge.setBusy(false);}});
  window.NotasUI={get dirty(){return dirty;},discard,clear,
    reset(){epoch++;context=null;readOnly=true;busy=false;shown=25;clear();list.replaceChildren();status.textContent='';$('notePrimary').textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;$('notePrimary').textContent='NI principal: '+(parent.nota_sicpip||'Sin registrar. Complétela en Datos del operativo.');readOnly=readonly;bridge=callbacks;clear();await load(epoch);lock();}
  };
  window.NotasUI.reset();
})();

