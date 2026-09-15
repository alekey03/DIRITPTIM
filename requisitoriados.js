(() => {
  const $=id=>document.getElementById(id),form=$('rqForm'),select=$('rqDetention'),list=$('rqRecords'),status=$('rqStatus');
  let context=null,bridge=null,readOnly=true,busy=false,dirty=false,epoch=0,editing=null,retry=null,rows=[],detainees=[],viewing=false;
  const text=(tag,value,cls)=>{const el=document.createElement(tag);el.textContent=value??'';if(cls)el.className=cls;return el;};
  const fullName=d=>[d?.personas?.apellido_paterno,d?.personas?.apellido_materno,d?.personas?.nombres].filter(Boolean).join(' ')||'Identificación no disponible';
  function discard(){return !dirty||confirm('Hay un requisitoriado sin guardar. ¿Desea descartar sus cambios?');}
  function clear(){editing=null;retry=null;dirty=false;viewing=false;form.reset();form.hidden=true;select.replaceChildren();$('rqDetail').replaceChildren();}
  function lock(){
    $('rqFields').disabled=busy||readOnly||!context||viewing;
    select.disabled=busy||readOnly||!!editing;
    $('addRq').disabled=busy||readOnly||!context;
    $('rqNewDetainee').disabled=busy||readOnly||!context;
    $('cancelRq').disabled=busy;
    list.querySelectorAll('button').forEach(b=>b.disabled=busy||!context);
  }
  async function all(table,columns,token){
    const result=[];
    for(let start=0;;start+=100){
      const {data,error}=await supabaseClient.from(table).select(columns).eq('intervencion_id',context.id).order('id').range(start,start+99);
      if(token!==epoch)return null;if(error)throw error;result.push(...data);if(data.length<100)return result;
    }
  }
  function renderDetail(){
    const box=$('rqDetail');box.replaceChildren();const d=detainees.find(d=>d.id===select.value);if(!d)return;
    const p=d.personas||{},fields=[
      ['Apellidos y nombres',fullName(d)],['Documento',[p.tipo_documento,p.numero_documento].filter(Boolean).join(' ')],
      ['Edad / género / nacionalidad',[p.edad,p.genero,p.nacionalidad].filter(v=>v!=null&&v!=='').join(' · ')],
      ['Fecha y hora de detención',[d.fecha,d.hora].filter(Boolean).join(' · ')],
      ['Lugar del operativo',[context.departamento,context.provincia,context.distrito].filter(Boolean).join(' / ')],
      ['Funcionario / servidor público',d.es_funcionario_publico?'Sí':'No']
    ];
    if(d.es_funcionario_publico)fields.push(['Entidad pública',d.entidad_publica],['Detalle de entidad',d.detalle_entidad_publica]);
    fields.push(['Dependencia interviniente',[context.direccion_policial,context.direccion_especializada_region,context.division_policial,context.departamento_policial,context.unidad_area_equipo].filter(Boolean).join(' / ')],['Nota SICPIP',context.nota_sicpip],['Coordenadas',[context.latitud,context.longitud].filter(v=>v!=null).join(', ')]);
    box.append(text('h4','Datos reutilizados'));
    const dl=document.createElement('dl');dl.className='rq-summary';for(const [label,value]of fields){dl.append(text('dt',label),text('dd',value??'Sin registrar'));if(value==='')dl.lastChild.textContent='Sin registrar';}box.append(dl);
    const crimes=[...(d.detencion_delitos||[])].sort((a,b)=>a.orden-b.orden);
    box.append(text('h4','Delitos registrados en la detención'));
    for(const [n,c]of crimes.entries())box.append(text('p',`${n+1}. ${[c.es_tentativa?'Tentativa':'Consumado',c.fuero_ley_especial,c.delito_general,c.delito_especifico,c.subtipo].filter(Boolean).join(' / ')}`));
    if(!crimes.length)box.append(text('p','Sin delitos registrados. Complete los datos en Detenidos.','results-note'));
    if(crimes.length>2)box.append(text('p','La hoja 2_RQ N dispone de dos bloques de delitos. Este caso requiere revisión antes de exportar; aquí se muestran todos.','results-note'));
  }
  function open(record=null,view=false){
    clear();editing=record;viewing=view;form.hidden=false;$('rqFormTitle').textContent=view?'Consultar requisitoriado':record?'Editar requisitoriado':'Registrar requisitoriado';
    select.append(new Option('Seleccione un detenido del operativo',''));
    for(const d of detainees){
      const taken=rows.some(r=>r.detencion_id===d.id&&r.id!==record?.id);
      if(taken||record&&d.id!==record.detencion_id)continue;
      select.append(new Option(`${fullName(d)} · ${d.codigo||''}`,d.id));
    }
    if(record)select.value=record.detencion_id;
    $('rqType').value=record?.tipo||'';$('rqMostWanted').value=record?String(record.mas_buscado):'';
    $('saveRq').hidden=view;
    status.textContent=!detainees.length?'Primero registre al detenido en este operativo.':select.options.length===1?'No hay detenidos disponibles para vincular. Consulte los registros existentes.':'';
    if(record&&!select.value)status.textContent='No se pudo consultar la detención vinculada. Actualice antes de editar.';
    renderDetail();lock();form.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function render(){
    list.replaceChildren();if(!rows.length)list.textContent='Aún no hay requisitoriados registrados en este operativo.';
    for(const r of rows){
      const d=detainees.find(d=>d.id===r.detencion_id),row=document.createElement('div');row.className='material-record';const info=document.createElement('div');
      info.append(text('strong',fullName(d)),text('small',`${r.tipo} · Más buscados: ${r.mas_buscado?'Sí':'No'} · ${d?.codigo||'Detención vinculada'}`));
      const button=text('button',readOnly?'Ver detalle':'Abrir / editar','secondary');button.type='button';button.addEventListener('click',()=>{if(!busy&&discard())open(r,readOnly);});row.append(info,button);list.append(row);
    }
    $('rqTotals').textContent=`${rows.length} registros vinculados · ${rows.filter(r=>r.mas_buscado).length} marcados como más buscados`;
  }
  async function load(token=epoch){
    const rs=await all('intervencion_requisitoriados','id,intervencion_id,detencion_id,tipo,mas_buscado,version',token);if(token!==epoch)return;
    const ds=await all('detenciones','id,codigo,fecha,hora,es_funcionario_publico,entidad_publica,detalle_entidad_publica,personas(apellido_paterno,apellido_materno,nombres,edad,genero,nacionalidad,tipo_documento,numero_documento),detencion_delitos(orden,es_tentativa,fuero_ley_especial,delito_general,delito_especifico,subtipo)',token);
    if(token!==epoch)return;rows=rs;detainees=ds;render();lock();
  }
  $('addRq').addEventListener('click',()=>{if(!busy&&!readOnly&&context&&discard())open();});
  $('rqNewDetainee').addEventListener('click',()=>{if(!busy&&!readOnly&&context)bridge.startDetainee();});
  $('cancelRq').addEventListener('click',()=>{if(!busy&&discard()){clear();status.textContent='';}});
  select.addEventListener('change',renderDetail);
  form.addEventListener('input',()=>{dirty=true;status.textContent='Requisitoriado sin guardar';});
  form.addEventListener('change',()=>{dirty=true;});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(busy||readOnly||viewing||!context||!form.reportValidity())return;
    const detencion=select.value;if(!detainees.some(d=>d.id===detencion)){status.textContent='Seleccione un detenido disponible en este operativo.';return;}
    const token=epoch;if(!await bridge.prepare()||token!==epoch)return;
    const payload={p_id:editing?.id||retry?.p_id||crypto.randomUUID(),p_intervencion:context.id,p_detencion:detencion,p_version:editing?.version||0,p_tipo:$('rqType').value,p_mas_buscado:$('rqMostWanted').value==='true'};
    if(retry&&JSON.stringify(retry)!==JSON.stringify(payload)){status.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice antes de modificarlos.';return;}
    retry=payload;bridge.setBusy(true);status.textContent='Guardando requisitoriado…';
    try{
      const {data,error}=await supabaseClient.rpc('guardar_requisitoriado_operativo',payload);if(token!==epoch)return;
      if(error){if(error.code&&/^\d/.test(error.code))retry=null;throw error;}
      bridge.saved(data.operativo_version);clear();status.textContent='✓ Requisitoriado guardado y vinculado a su detención.';
      try{await load(token);}catch{if(token===epoch)status.textContent='Registro guardado. Pulse Actualizar para consultar la lista.';}
    }catch(error){if(token===epoch)status.textContent=error.code==='40001'?'El registro cambió. Actualice y vuelva a abrirlo.':error.code==='23505'?'Ese detenido ya tiene un registro de requisitoria. Actualice y ábralo para editarlo.':`No se confirmó el guardado: ${error.message||'Compruebe su conexión.'}`;}
    finally{if(token===epoch)bridge.setBusy(false);}
  });
  window.RequisitoriadosUI={get dirty(){return dirty;},discard,clear,
    reset(){epoch++;context=null;bridge=null;readOnly=true;busy=false;rows=[];detainees=[];clear();list.replaceChildren();status.textContent='';$('rqTotals').textContent='';lock();},
    lock(value,readonly){busy=value;readOnly=readonly;lock();},
    async load(parent,readonly,callbacks){epoch++;context=parent;readOnly=readonly;bridge=callbacks;clear();await load(epoch);lock();}
  };window.RequisitoriadosUI.reset();
})();
