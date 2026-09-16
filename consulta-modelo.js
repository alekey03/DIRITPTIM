// Consultas de lectura: Supabase aplica las políticas de cada tabla al usuario conectado.
(() => {
  const drugs = {env_pbc:'PBC · envoltorios',env_cc:'Clorhidrato de cocaína · envoltorios',env_marihuana:'Marihuana · envoltorios',kg_pbc:'PBC · kg',kg_cc:'Clorhidrato de cocaína · kg',kg_marihuana:'Marihuana · kg',kg_opio:'Opio · kg',kg_sintetica:'Drogas sintéticas · kg'};
  const fields = pairs => pairs.map(([key,label]) => ({key,label}));
  function categories() {
    const operativeFields=typeof document==='undefined'?[]:[...document.querySelectorAll('#operativoForm [name^="operativo."]')].map(input=>({key:input.name.split('.')[1],label:input.closest('label')?.firstChild?.textContent?.trim()||input.name}));
    const result = [
      {id:'operativos',title:'Operativos',table:'intervenciones',type:'operativo',fields:fields([['nota_sicpip','NI principal'],['detalle_ubicacion','Detalle del lugar']])},
      {id:'megaoperativos',title:'Megaoperativos',table:'intervenciones',type:'megaoperativo',fields:fields([['nota_sicpip','NI principal'],['detalle_ubicacion','Detalle del lugar']])},
      {id:'detenidos',title:'Detenidos',table:'detenciones_reportables',select:'*,personas(*),detencion_delitos(*)',fields:fields([['nombre','Apellidos y nombres'],['numero_documento','Documento'],['edad','Edad'],['genero','Género'],['nacionalidad','Nacionalidad'],['motivo_detencion','Motivo'],['situacion_actual','Situación'],['delitos','Delitos'],['nombre_organizacion','Banda / organización'],['codigo','Código']])},
      {id:'rq',title:'Requisitoriados',table:'intervencion_requisitoriados',fields:window.REQUISITORIADOS_CATALOGO.campos},
      {id:'prostitucion',title:'Prostitución femenina y masculina',table:'intervencion_prostitucion',fields:window.PROSTITUCION_CATALOGO.campos},
      {id:'victimas',title:'Víctimas de trata',table:'intervencion_victimas',fields:window.VICTIMAS_CATALOGO.campos},
      {id:'menores',title:'Menores',table:'intervencion_menores',fields:window.MENORES_CATALOGO.campos},
      ...[['banda','Bandas criminales'],['organizacion','Organizaciones criminales']].map(([type,title])=>({id:type,title,table:'intervencion_grupos',type,select:'*,intervencion_grupo_integrantes(*)',fields:fields([['nombre','Nombre'],['modalidad','Modalidad'],['referencia_lugar','Referencia'],['integrantes','Integrantes registrados']])})),
      {id:'drogas',title:'Drogas · todas las sustancias',table:'intervencion_drogas',fields:fields([['sustancia','Sustancia'],['cantidad','Cantidad'],['medida','Unidad'],['nombre_sustancia','Nombre de sustancia sintética']])},
      ...Object.entries(drugs).map(([type,title])=>({id:type,title,table:'intervencion_drogas',type,fields:fields([['cantidad','Cantidad'],['medida','Unidad'],['nombre_sustancia','Nombre de sustancia sintética']])})),
      ...[['MATERIALES_CATALOGO','intervencion_materiales'],['VEHICULOS_CATALOGO','intervencion_vehiculos']].flatMap(([catalog,table])=>window[catalog].tipos.map(t=>({id:table+'_'+t.tipo,title:t.titulo,table,type:t.tipo,fields:t.campos})))
    ];
    return result.map(c=>({...c,...(c.table==='intervenciones'?{select:'*,intervencion_operativos(*)'}:{}),fields:[...c.fields,...(c.table==='intervenciones'?operativeFields:[])].filter(f=>f.key!=='fecha').map(f=>({...f,label:/^delito[12]$/.test(f.group)?`${f.label} · Delito ${f.group.slice(-1)}`:f.label}))}));
  }
  const normalizeText = value => String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim();
  function normalize(record, category, parents) {
    const parent = category.table==='intervenciones' ? record : parents.get(record.intervencion_id);
    const data = {...record,...record.personas,...record.datos,...(Array.isArray(record.intervencion_operativos)?record.intervencion_operativos[0]:record.intervencion_operativos)};
    if (category.id==='detenidos') {
      data.nombre=[data.apellido_paterno,data.apellido_materno,data.nombres].filter(Boolean).join(' ');
      data.delitos=(record.detencion_delitos||[]).map(c=>[c.delito_general,c.delito_especifico,c.subtipo].filter(Boolean).join(' / ')).join('; ');
    }
    if(category.table==='intervencion_drogas') {data.sustancia=drugs[record.tipo];data.medida=record.tipo.startsWith('kg_')?'kg':'envoltorios';}
    if(category.table==='intervencion_grupos') data.integrantes=(record.intervencion_grupo_integrantes||[]).length;
    return {id:record.id,parentId:parent?.id||null,data,date:record.datos?.fecha||record.fecha||parent?.fecha||'',unit:parent?.unidad||record.unidad||'',place:[parent?.departamento||data.departamento,parent?.provincia||data.provincia,parent?.distrito||data.distrito].filter(Boolean).join(' / '),ni:parent?.nota_sicpip||record.nota_sicpip||''};
  }
  function filter(rows, f) {
    return rows.filter(r=>(!f.from||r.date>=f.from)&&(!f.to||(r.date&&r.date<=f.to))&&(!f.unit||r.unit===f.unit)&&(!f.place||normalizeText(r.place).includes(normalizeText(f.place)))&&(!f.search||normalizeText([r.date,r.unit,r.place,r.ni,...Object.values(r.data).filter(v=>typeof v!=='object')].join(' ')).includes(normalizeText(f.search)))&&(!f.field||!f.value||normalizeText(r.data[f.field]).includes(normalizeText(f.value))));
  }
  function metrics(rows, category) {
    const out=[['Registros',rows.length],['Operativos vinculados',new Set(rows.map(r=>r.parentId).filter(Boolean)).size],['Dependencias',new Set(rows.map(r=>r.unit).filter(Boolean)).size]];
    if(category.table==='intervencion_drogas') for(const unit of ['kg','envoltorios']) {const relevant=rows.filter(r=>r.data.medida===unit);if(relevant.length)out.push([unit==='kg'?'Cantidad (kg)':'Cantidad (envoltorios)',relevant.reduce((sum,r)=>sum+Number(r.data.cantidad||0),0)]);}
    if(category.table==='intervencion_vehiculos') out[0][0]='Vehículos / maquinaria registrados';
    if(category.table==='intervencion_grupos')out.push(['Vínculos de integrantes',rows.reduce((n,r)=>n+Number(r.data.integrantes||0),0)]);
    if(category.id==='prostitucion')out.push(['Femenino',rows.filter(r=>r.data.genero==='FEMENINO').length],['Masculino',rows.filter(r=>r.data.genero==='MASCULINO').length],['Género sin registrar',rows.filter(r=>!r.data.genero).length]);
    if(category.id==='victimas')out.push(['Víctimas rescatadas',rows.filter(r=>r.data.situacion==='VICTIMA RESCATADA').length],['Presuntas víctimas',rows.filter(r=>r.data.situacion==='PRESUNTA VICTIMA').length],['Menores de edad',rows.filter(r=>r.data.condicion_edad==='MENOR').length]);
    return out;
  }
  async function readAll(client, category, alive=()=>true) {
    const rows=[];
    // Cursor por UUID: no se limita el total a la primera página de la API.
    let cursor=null;
    for(;;) {
      if(!alive())throw new Error('Consulta cancelada');
      let query=client.from(category.table).select(category.select||'*').order('id').limit(500);
      if(category.type)query=query.eq('tipo',category.type);
      if(cursor)query=query.gt('id',cursor);
      const {data,error}=await query;
      if(!alive())throw new Error('Consulta cancelada');
      if(error)throw error;
      if(!data?.length)return rows;
      if(data[data.length-1].id===cursor)throw new Error('No se pudo avanzar en la consulta.');
      rows.push(...data);cursor=data[data.length-1].id;
    }
  }
  window.ConsultaModelo={categories,normalize,filter,metrics,readAll};
})();
