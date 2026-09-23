(() => {
  const catalog = [{tipo:'menor',titulo:'Menor de edad',descripcion:'Identidad, detención y puesta a disposición',campos:window.MENORES_CATALOGO.campos}];
  const $ = id => document.getElementById(id);
  const form=$('minorForm'), inputs=$('minorInputs'), status=$('minorStatus'), list=$('minorRecords');
  let context=null, bridge=null, readOnly=true, busy=false, dirty=false, epoch=0, shown=25, editing=null, selected=null, retry=null;
  const paths={menor:'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6 M5 21v-4a7 7 0 0 1 14 0v4 M9 21v-5 M15 21v-5'};
  const icon=type=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="${paths[type]}"></path></svg>`;
  for(const type of catalog){
    const button=document.createElement('button');button.type='button';button.className='material-card';button.dataset.minor=type.tipo;
    button.innerHTML=`${icon(type.tipo)}<strong>${type.titulo}</strong><small>${type.descripcion}</small><span>＋ Agregar registro</span>`;
    button.addEventListener('click',()=>{if(!busy && !readOnly && discard()) open(type);});$('minorCards').append(button);
  }
  function discard(){return !dirty || confirm('Hay un menor sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;selected=null;dirty=false;retry=null;form.hidden=true;inputs.replaceChildren();$('minorCards').querySelectorAll('button').forEach(b=>b.classList.remove('selected'));}
  function lock(){
    $('minorFields').disabled=busy || readOnly || !context;
    $('minorCards').querySelectorAll('button').forEach(b=>{b.disabled=busy || readOnly || !context;});
    $('moreMinors').disabled=busy || !context;
  }
  function open(type,record=null,view=false){
    clear();selected=type;editing=record;form.hidden=false;
    $('minorFormTitle').textContent=`${view?'Consultar':record?'Editar':'Registrar'} · ${type.titulo}`;
    $('saveMinor').hidden=view;$('cancelMinor').hidden=false;
    $('minorCards').querySelector(`[data-minor="${type.tipo}"]`).classList.add('selected');
    const groups=[['identidad','01 · Identificación y detención'],['delito1','02 · Primer delito'],['delito2','03 · Segundo delito · si corresponde'],['hallazgos','04 · Grupo criminal y hallazgos'],['situacion','05 · Situación y puesta a disposición'],['receptor','06 · Dependencia receptora']];
    for(const [group,title] of groups){
      const fields=type.campos.filter(f=>f.group===group);if(!fields.length)continue;
      const section=document.createElement(group==='identidad'?'div':'details');
      const heading=document.createElement(group==='identidad'?'h4':'summary');heading.textContent=title;section.append(heading);
      if(group!=='identidad' && fields.some(f=>record?.datos[f.key]!=null))section.open=true;
      const grid=document.createElement('div');grid.className='material-fields';section.append(grid);
      for(const field of fields){
        const label=document.createElement('label');const title=document.createElement('span');title.textContent=field.label+(field.required?' *':'');label.append(title);
        const crimeMap={fuero:'jurisdiction',delito_general:'general',delito_especifico:'specific',subtipo:'subtype'};
        const baseKey=field.key.replace(/_2$/,'');const isCrime=group.startsWith('delito') && crimeMap[baseKey];
        const source=field.source?document.querySelector('#detaineeForm [name="'+field.source+'"]'):null;
        const options=field.options||(source?[...source.options].filter(o=>o.value).map(o=>o.value):null);
        const dependent=['arma_categoria','arma_tipo','disposicion_direccion','disposicion_region','disposicion_division','disposicion_departamento','disposicion_unidad'].includes(field.key);
        const control=document.createElement(options||isCrime||dependent?'select':'input');control.name=field.key;
        if(options||isCrime||dependent){const blank=new Option('Sin indicar','');control.append(blank);for(const value of options||[])control.append(new Option(value,value));if(isCrime)control.dataset.field=crimeMap[baseKey];}
        else{control.type=field.type;control.maxLength=2000;if(field.type==='number'){control.min='2';control.max='17';control.step='1';}control.autocomplete='off';}
        control.required=field.required;control.value=record?.datos[field.key]??(field.key==='grupo'?'Ninguno':field.key==='fecha'?context.fecha:field.key==='hora'?context.hora:'');control.disabled=view;label.append(control);grid.append(label);
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
    window.bindMinorCatalogs?.(inputs,record?.datos||{});
    const group= form.elements.namedItem('grupo'),name=form.elements.namedItem('nombre_grupo');
    const sync=()=>{name.disabled=group.value==='Ninguno'||view;name.required=group.value!=='Ninguno';if(group.value==='Ninguno')name.value='';};group.addEventListener('change',sync);sync();
    status.textContent=view?'Consulta del registro.':'';lock();
    if(view){inputs.querySelectorAll('input,select').forEach(c=>c.disabled=true);}
    form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function load(token=epoch){
    if(!context || token!==epoch)return;
    const {data,error}=await supabaseClient.from('intervencion_menores').select('id,tipo,datos,version').eq('intervencion_id',context.id).order('creado_en',{ascending:false}).order('id').range(0,shown);
    if(token!==epoch)return;if(error)throw error;list.replaceChildren();
    if(!data.length)list.textContent='Aún no hay menores registrados en este operativo.';
    for(const record of data.slice(0,shown)){
      const type=catalog.find(t=>t.tipo===record.tipo);if(!type)continue;
      const row=document.createElement('div');row.className='material-record';const symbol=document.createElement('span');symbol.className='material-record-icon';symbol.innerHTML=icon(type.tipo);
      const info=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=[record.datos.apellido_paterno,record.datos.apellido_materno,record.datos.nombres].filter(Boolean).join(' ');
      detail.textContent=[record.datos.edad+' años',record.datos.fecha,record.datos.situacion].filter(Boolean).join(' · ');
      info.append(title,detail);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=readOnly?'Ver detalle':'Abrir / editar';
      button.addEventListener('click',()=>{if(!busy && discard())open(type,record,readOnly);});row.append(symbol,info,button);list.append(row);
    }
    $('moreMinors').hidden=data.length<=shown;
  }
  form.addEventListener('input',()=>{dirty=true;status.textContent='Menor sin guardar';});
  $('cancelMinor').addEventListener('click',()=>{if(!busy && discard()){clear();status.textContent='';}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||!context||!selected||!form.reportValidity())return;
    const token=epoch;if(!(await bridge.prepare())||token!==epoch)return;
    const datos={};for(const field of selected.campos){const value=form.elements.namedItem(field.key).value.trim();datos[field.key]=value===''?null:field.type==='number'?Number(value):value;}
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_version:editing?.version||0,p_tipo:selected.tipo,p_datos:datos};
    if(retry && JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice la lista antes de cambiarlos.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando menor…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_menor_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code && /^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version);clear();status.textContent='✓ Registro guardado. Puede agregar otro menor.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Registro guardado; no se pudo actualizar la lista. Pulse Actualizar.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El registro cambió. Actualice y vuelva a abrirlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión y reintente.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  $('moreMinors').addEventListener('click',async()=>{if(busy||!context)return;const token=epoch;bridge.setBusy(true);shown+=25;try{await load(token);}catch{if(token===epoch)status.textContent='No se pudo cargar la lista. Reintente.';}finally{if(token===epoch)bridge.setBusy(false);}});
  window.MenoresUI={get dirty(){return dirty;},discard,clear,
    reset(){epoch++;context=null;readOnly=true;busy=false;shown=25;clear();list.replaceChildren();status.textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;readOnly=readonly;bridge=callbacks;clear();await load(epoch);lock();}
  };
  window.MenoresUI.reset();
})();

