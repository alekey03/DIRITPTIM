(() => {
  const catalog=window.COMPLEMENTARIOS_CATALOGO.tipos, $=id=>document.getElementById(id);
  const form=$('complementForm'),inputs=$('complementInputs'),status=$('complementStatus'),list=$('complementRecords');
  let context=null,bridge=null,readOnly=true,busy=false,dirty=false,epoch=0,shown=25,editing=null,selected=null,retry=null,visible=[];
  const paths={dinero:'M3 6h18v12H3z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',celulares:'M7 2h10v20H7z M10 18h4',chips:'M8 3h9v18H5V6z M8 9h6v7H8z',migraciones:'M3 4h18v16H3z M7 8h4v4H7z M14 8h4 M14 12h4 M7 16h11',personas_ubicadas:'M12 22s8-8 8-13a8 8 0 0 0-16 0c0 5 8 13 8 13z M12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6',expulsados:'M3 3h10v18H3z M8 12h13 M17 8l4 4-4 4'};
  function icon(type){return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="${paths[type]}"></path></svg>`;}
  for(const type of catalog){
    const button=document.createElement('button');button.type='button';button.className='material-card';button.dataset.complement=type.tipo;
    button.innerHTML=`${icon(type.tipo)}<strong>${type.titulo}</strong><small>${type.descripcion}</small><span>＋ Agregar registro</span>`;
    button.addEventListener('click',()=>{if(!busy&&!readOnly&&discard())open(type);});$('complementCards').append(button);
  }
  function discard(){return !dirty||confirm('Hay un registro sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;selected=null;dirty=false;retry=null;form.hidden=true;inputs.replaceChildren();$('complementCards').querySelectorAll('button').forEach(b=>b.classList.remove('selected'));}
  function lock(){
    $('complementFields').disabled=busy||readOnly||!context;
    $('complementCards').querySelectorAll('button').forEach(b=>b.disabled=busy||readOnly||!context);
    $('moreComplements').disabled=busy||!context;
  }
  function show(types){
    visible=types;
    $('complementCards').querySelectorAll('button').forEach(b=>b.hidden=!types.includes(b.dataset.complement));
    list.querySelectorAll('[data-type]').forEach(row=>row.hidden=!types.includes(row.dataset.type));
    // Keep an unsaved form visible until the user saves or explicitly discards it.
  }
  function open(type,record=null,view=false){
    clear();selected=type;editing=record;form.hidden=false;
    $('complementFormTitle').textContent=`${view?'Consultar':record?'Editar':'Registrar'} · ${type.titulo}`;
    $('saveComplement').hidden=view;
    $('complementCards').querySelector(`[data-complement="${type.tipo}"]`).classList.add('selected');
    for(const [group,title]of [['registro','Datos del registro'],['delito1','Primer delito · si corresponde'],['delito2','Segundo delito · si corresponde']]){
      const fields=type.campos.filter(f=>f.group===group);if(!fields.length)continue;
      const section=document.createElement(group==='registro'?'section':'details'),heading=document.createElement(group==='registro'?'h4':'summary');heading.textContent=title;section.append(heading);
      if(group!=='registro'&&fields.some(f=>record?.datos[f.key]!=null))section.open=true;
      const grid=document.createElement('div');grid.className='material-fields';section.append(grid);
      for(const field of fields){
        const label=document.createElement('label'),caption=document.createElement('span');caption.textContent=field.label+(field.required?' *':'');label.append(caption);
        const crimeMap={fuero:'jurisdiction',delito_general:'general',delito_especifico:'specific',subtipo:'subtype'};
        const crime=group.startsWith('delito')&&crimeMap[field.key.replace(/_2$/,'')];
        const control=document.createElement(field.options||crime?'select':'input');control.name=field.key;
        if(field.options||crime){control.append(new Option('Sin indicar',''));for(const v of field.options||[])control.append(new Option(v,v));if(crime)control.dataset.field=crime;}
        else {control.type=field.type;control.maxLength=2000;control.autocomplete='off';for(const prop of ['min','max','step'])if(field[prop]!=null)control[prop]=String(field[prop]);}
        control.required=field.required;control.readOnly=!!field.computed;
        const value=record?.datos[field.key]??(field.key==='fecha'?context.fecha:field.key==='hora'?context.hora:'');
        if(field.options&&value&&!field.options.includes(value))control.append(new Option(value,value));
        control.value=value??'';control.disabled=view;label.append(control);grid.append(label);
      }
      if(group.startsWith('delito')){
        const suffix=group==='delito2'?'_2':'',data=record?.datos||{};
        window.createCrimeCascade?.(grid,{fuero_ley_especial:data['fuero'+suffix],delito_general:data['delito_general'+suffix],delito_especifico:data['delito_especifico'+suffix],subtipo:data['subtipo'+suffix]});
        grid.querySelectorAll('select').forEach(c=>{const v=data[c.name];if(v&&![...c.options].some(o=>o.value===v))c.append(new Option(v,v));if(v)c.value=v;});
      }
      inputs.append(section);
    }
    const age=form.elements.namedItem('edad'),condition=form.elements.namedItem('condicion_edad');
    if(age&&condition){const sync=()=>{condition.value=age.value===''?'':Number(age.value)<18?'MENOR':'MAYOR';};age.addEventListener('input',sync);sync();}
    const number=form.elements.namedItem('numero_documento'),doc=form.elements.namedItem('tipo_documento');
    if(number&&doc){const sync=()=>doc.required=!!number.value.trim();number.addEventListener('input',sync);sync();}
    if(type.tipo==='dinero'){const note=document.createElement('p');note.className='results-note';note.textContent='Los totales se separan en soles, dólares y euros. En otra moneda indique nombre e importe; no se sumará a las demás monedas.';inputs.prepend(note);}
    if(type.tipo==='celulares'){const note=document.createElement('p');note.className='results-note';note.textContent='Si registra un IMEI, la cantidad debe ser 1. Conserve los ceros iniciales.';inputs.prepend(note);}
    status.textContent=view?'Consulta del registro.':'';lock();
    if(view)inputs.querySelectorAll('input,select').forEach(c=>c.disabled=true);
    form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  async function load(token=epoch){
    if(!context||token!==epoch)return;
    const {data,error}=await supabaseClient.from('intervencion_complementarios').select('id,tipo,datos,version').eq('intervencion_id',context.id).order('creado_en',{ascending:false}).order('id').range(0,shown);
    if(token!==epoch)return;if(error)throw error;list.replaceChildren();
    if(!data.length)list.textContent='Aún no hay registros de estas categorías en el operativo.';
    for(const record of data.slice(0,shown)){
      const type=catalog.find(t=>t.tipo===record.tipo);if(!type)continue;
      const row=document.createElement('div');row.className='material-record';row.dataset.type=record.tipo;
      const symbol=document.createElement('span');symbol.className='material-record-icon';symbol.innerHTML=icon(record.tipo);
      const info=document.createElement('div'),title=document.createElement('strong'),detail=document.createElement('small');title.textContent=type.titulo;
      const d=record.datos;detail.textContent=[d.fecha,[d.apellido_paterno,d.apellido_materno,d.nombres].filter(Boolean).join(' '),d.marca,d.cantidad!=null?`Cantidad: ${d.cantidad}`:null,d.situacion,...(record.tipo==='dinero'?[d.soles!=null?`S/ ${d.soles}`:null,d.dolares!=null?`USD ${d.dolares}`:null,d.euros!=null?`EUR ${d.euros}`:null,d.dinero_otro]:[])].filter(Boolean).join(' · ');
      info.append(title,detail);const button=document.createElement('button');button.type='button';button.className='secondary';button.textContent=(readOnly||!puedeEditarUnidad(context.unidad))?'Ver detalle':'Abrir / editar';button.addEventListener('click',()=>{if(!busy&&discard())open(type,record,readOnly||!puedeEditarUnidad(context.unidad));});row.append(symbol,info,button);list.append(row);
    }
    $('moreComplements').hidden=data.length<=shown;show(visible);
  }
  form.addEventListener('input',()=>{dirty=true;status.textContent='Registro sin guardar';});
  $('cancelComplement').addEventListener('click',()=>{if(!busy&&discard()){clear();status.textContent='';}});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||!context||!selected||!form.reportValidity())return;
    const token=epoch;if(!(await bridge.prepare())||token!==epoch)return;
    const datos={};for(const field of selected.campos){const v=form.elements.namedItem(field.key).value.trim();datos[field.key]=v===''?null:field.type==='number'?Number(v):v;}
    if(selected.tipo==='celulares'&&datos.cantidad!==1&&(datos.imei_fisico||datos.imei_logico)){status.textContent='La cantidad debe ser 1 cuando indique un IMEI.';return;}
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_version:editing?.version||0,p_tipo:selected.tipo,p_datos:datos};
    if(retry&&JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice la lista.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando registro…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_complementarios_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code&&/^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version,selected.tipo);clear();status.textContent='✓ Registro guardado. Puede agregar otro resultado.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Registro guardado; pulse Actualizar para ver la lista.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El registro cambió. Actualice y vuelva a abrirlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  $('moreComplements').addEventListener('click',async()=>{if(busy||!context)return;const token=epoch;bridge.setBusy(true);shown+=25;try{await load(token);}catch{if(token===epoch)status.textContent='No se pudo cargar la lista. Reintente.';}finally{if(token===epoch)bridge.setBusy(false);}});
  window.ComplementariosUI={get dirty(){return dirty;},discard,clear,show,
    reset(){epoch++;context=null;readOnly=true;busy=false;shown=25;clear();list.replaceChildren();status.textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;readOnly=readonly;bridge=callbacks;clear();await load(epoch);lock();}
  };
  window.ComplementariosUI.reset();
})();
