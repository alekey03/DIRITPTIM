(() => {
  const catalog = window.VEHICULOS_CATALOGO.tipos;
  const $ = id => document.getElementById(id);
  const form=$('vehicleForm'), inputs=$('vehicleInputs'), status=$('vehicleStatus'), list=$('vehicleRecords');
  let context=null, bridge=null, readOnly=true, busy=false, dirty=false, epoch=0, shown=25, editing=null, selected=null, retry=null;
  const paths={
    mayor:'M3 16V9l3-5h12l3 5v7z M3 9h18 M6 16v4 M18 16v4 M6 12h2 M16 12h2',
    menor:'M8 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M24 17a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 17l5-8h6l5 8 M9 9l5 8H4 M15 9V5h3',
    maquinaria:'M3 16h12v5H3z M5 16V8h8v8 M7 8V4h6v4 M13 9l5-5 3 10h-5 M16 14v3h6 M6 18h6'
  };
  const icon=type=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${paths[type]}"></path></svg>`;
  for(const type of catalog){
    const button=document.createElement('button');button.type='button';button.className='material-card';button.dataset.vehicle=type.tipo;
    button.innerHTML=`${icon(type.tipo)}<strong>${type.titulo}</strong><small>${type.descripcion}</small><span>＋ Agregar registro</span>`;
    button.addEventListener('click',()=>{if(!busy && !readOnly && discard()) open(type);});$('vehicleCards').append(button);
  }
  function discard(){return !dirty || confirm('Hay un vehículo sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;selected=null;dirty=false;retry=null;form.hidden=true;inputs.replaceChildren();$('vehicleCards').querySelectorAll('button').forEach(b=>b.classList.remove('selected'));}
  function lock(){
    $('vehicleFields').disabled=busy || readOnly || !context;
    $('vehicleCards').querySelectorAll('button').forEach(b=>{b.disabled=busy || readOnly || !context;});
    $('moreVehicles').disabled=busy || !context;
  }
  function open(type,record=null,view=false){
    clear();selected=type;editing=record;form.hidden=false;
    $('vehicleFormTitle').textContent=`${view?'Consultar':record?'Editar':'Registrar'} · ${type.titulo}`;
    $('saveVehicle').hidden=view;$('cancelVehicle').hidden=false;
    $('vehicleCards').querySelector(`[data-vehicle="${type.tipo}"]`).classList.add('selected');
    const groups=[['vehiculo','Datos del vehículo o maquinaria'],['delito1','Primer delito · si corresponde'],['delito2','Segundo delito · si corresponde']];
    for(const [group,title] of groups){
      const fields=type.campos.filter(f=>f.group===group);if(!fields.length)continue;
      const section=document.createElement(group==='vehiculo'?'div':'details');
      const heading=document.createElement(group==='vehiculo'?'h4':'summary');heading.textContent=title;section.append(heading);
      if(group!=='vehiculo' && fields.some(f=>record?.datos[f.key]!=null))section.open=true;
      const grid=document.createElement('div');grid.className='material-fields';section.append(grid);
      for(const field of fields){
        const label=document.createElement('label');const title=document.createElement('span');title.textContent=field.label+(field.required?' *':'');label.append(title);
        const crimeMap={fuero:'jurisdiction',delito_general:'general',delito_especifico:'specific',subtipo:'subtype'};
        const baseKey=field.key.replace(/_2$/,'');const isCrime=group.startsWith('delito') && crimeMap[baseKey];
        const options=baseKey==='tentativa'?['Sí','No']:field.key==='genero'?['Masculino','Femenino']:null;
        const control=document.createElement(options||isCrime?'select':'input');control.name=field.key;
        if(options||isCrime){const blank=new Option('Sin indicar','');control.append(blank);for(const value of options||[])control.append(new Option(value,value));if(isCrime)control.dataset.field=crimeMap[baseKey];}
        else{control.type=field.type;control.maxLength=2000;if(field.type==='number'){control.min='0';control.max='999999999999.99';control.step='0.01';}control.autocomplete='off';}
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
    status.textContent=view?'Consulta del registro.':'';lock();
    if(view){$('vehicleFields').disabled=false;inputs.querySelectorAll('input,select').forEach(c=>c.disabled=true);}
    form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function load(token=epoch){
    if(!context || token!==epoch)return;
    const {data,error}=await supabaseClient.from('intervencion_vehiculos').select('id,tipo,datos,version').eq('intervencion_id',context.id).order('creado_en',{ascending:false}).order('id').range(0,shown);
    if(token!==epoch)return;if(error)throw error;list.replaceChildren();
    if(!data.length)list.textContent='Aún no hay vehículos o maquinaria registrados en este operativo.';
    for(const record of data.slice(0,shown)){
      const type=catalog.find(t=>t.tipo===record.tipo);if(!type)continue;
      const row=document.createElement('div');row.className='material-record';const symbol=document.createElement('span');symbol.className='material-record-icon';symbol.innerHTML=icon(type.tipo);
      const info=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=type.titulo;
      detail.textContent=[record.datos.placa ? `Placa: ${record.datos.placa}` : 'Sin placa indicada',record.datos.marca,record.datos.situacion,record.datos.valorizacion!=null?`Valorización: ${record.datos.valorizacion}`:null].filter(Boolean).join(' · ');
      info.append(title,detail);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=(readOnly||!puedeEditarUnidad(context.unidad))?'Ver detalle':'Abrir / editar';
      button.addEventListener('click',()=>{if(!busy && discard())open(type,record,readOnly||!puedeEditarUnidad(context.unidad));});row.append(symbol,info,button);list.append(row);
    }
    $('moreVehicles').hidden=data.length<=shown;
  }
  form.addEventListener('input',()=>{dirty=true;status.textContent='Vehículo sin guardar';});
  $('cancelVehicle').addEventListener('click',()=>{if(!busy && discard()){clear();status.textContent='';}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||!context||!selected||!form.reportValidity())return;
    const token=epoch;if(!(await bridge.prepare())||token!==epoch)return;
    const datos={};for(const field of selected.campos){const value=form.elements.namedItem(field.key).value.trim();datos[field.key]=value===''?null:field.type==='number'?Number(value):value;}
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_version:editing?.version||0,p_tipo:selected.tipo,p_datos:datos};
    if(retry && JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice la lista antes de cambiarlos.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando vehículo…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_vehiculo_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code && /^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version);clear();status.textContent='✓ Registro guardado. Puede agregar otro vehículo o maquinaria.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Registro guardado; no se pudo actualizar la lista. Pulse Actualizar.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El registro cambió. Actualice y vuelva a abrirlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión y reintente.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  $('moreVehicles').addEventListener('click',async()=>{if(busy||!context)return;const token=epoch;bridge.setBusy(true);shown+=25;try{await load(token);}catch{if(token===epoch)status.textContent='No se pudo cargar la lista. Reintente.';}finally{if(token===epoch)bridge.setBusy(false);}});
  window.VehiculosUI={get dirty(){return dirty;},discard,clear,
    reset(){epoch++;context=null;readOnly=true;busy=false;shown=25;clear();list.replaceChildren();status.textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;readOnly=readonly;bridge=callbacks;clear();await load(epoch);lock();}
  };
  window.VehiculosUI.reset();
})();

