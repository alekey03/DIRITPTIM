// Registros históricos: misma consulta por categoría y mismos permisos de unidad.
(() => {
 const schema=window.HISTORICO_CAMPOS;
 const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const identity=()=>JSON.stringify([currentProfile?.id,currentProfile?.rol,currentProfile?.unidad,currentProfile?.activo]);
 async function read(client,category={},alive=()=>true,select='id,lote,categoria,tabla,tipo,hoja,fila,unidad,fecha,nota_sicpip,operativo_id,datos,pendientes,version') {
  const rows=[];let cursor=null;
  for(;;){if(!alive())throw new Error('Consulta cancelada.');let q=client.from('produccion_historica').select(select).order('id').limit(500);
   if(category.table)q=q.eq('tabla',category.table);if(category.type)q=q.eq('tipo',category.type);if(category.parent)q=q.eq('operativo_id',category.parent);if(cursor)q=q.gt('id',cursor);
   const {data,error}=await q;if(!alive())throw new Error('Consulta cancelada.');if(error)throw error;if(!data?.length)return rows;
   rows.push(...data.map(r=>({...r,historical:true,intervencion_id:r.operativo_id})));cursor=data[data.length-1].id;
  }
 }
 function normalize(r,c){const data={...r.datos};if(['detenidos','rq','menores','victimas','prostitucion','migraciones'].includes(c.id))data.nombre=[data.apellido_paterno,data.apellido_materno,data.nombres].filter(Boolean).join(' ');
  if(c.table==='intervencion_drogas')data.medida=/KILO|^KG$/.test(norm(data.medida))?'kg':/ENV/.test(norm(data.medida))?'envoltorios':data.medida;
  if(c.table==='intervencion_grupos')data.integrantes=1;
  return {historical:true,source:r,id:r.id,data,date:r.fecha||'',unit:r.unidad||'',ni:r.nota_sicpip||'',parentId:c.table==='intervenciones'?r.id:r.operativo_id,place:[data.departamento,data.provincia,data.distrito].filter(Boolean).join(' / '),geography:{department:data.departamento||'',province:data.provincia||'',district:data.distrito||''}};
 }
 const canEdit=r=>!!currentProfile?.activo&&(['administrador','estadistico_direccion'].includes(currentProfile.rol)||(currentProfile.rol==='estadistico_jefatura'&&DEPENDENCIAS_INSTITUCIONALES.some(d=>d.unidad===r.unidad&&d.ambito==='DESCONCENTRADO')));
 const modal=el('dialog',null,'record-dialog historico-dialog'),card=el('div',null,'record-modal-card');modal.append(card);document.body.append(modal);let epoch=0;
 // Catálogos compartidos; conserva valores originales fuera de catálogo hasta corregirlos.
 function bindHistoricalControls(inputs,config,r,unit,edit){
  const catalogs=window.getHistoricalCatalogs?.()||{};
  const equivalent=(a,b)=>norm(a).replace(/_/g,' ').replace(/\s+/g,' ')===norm(b).replace(/_/g,' ').replace(/\s+/g,' ');
  function select(key){const old=inputs.get(key);if(!old)return null;if(old.tagName==='SELECT')return old;const s=el('select');s.name=key;s.dataset.original=old.value;old.replaceWith(s);inputs.set(key,s);return s;}
  function fill(s,nodes,value='',placeholder='Seleccionar'){
   s.replaceChildren(new Option(placeholder,''));for(const n of nodes)s.add(new Option(String(n.value).replace(/_/g,' '),n.value));
   if(value&&!Array.from(s.options).some(o=>o.value===String(value)))s.add(new Option(String(value)+' · valor original',String(value)));
   s.value=value||'';s.disabled=!edit||(!nodes.length&&!value);
  }
  function cascade(keys,roots,values=keys.map(k=>r.datos[k]||''),onChange=()=>{}){
   if(keys.some(k=>!inputs.has(k)))return;
   const controls=keys.map(select);
   function render(start,initial=false){let nodes=roots||[];for(let i=0;i<keys.length;i++){
    if(i>=start)fill(controls[i],nodes,initial?values[i]:'');
    nodes=nodes.find(n=>equivalent(n.value,controls[i].value))?.children||[];
   }}
   render(0,true);controls.forEach((s,i)=>s.addEventListener('change',()=>{render(i+1);onChange(controls.map(c=>c.value));}));
  }
  const fields=config.campos;
  const byLabel=pattern=>fields.find(f=>pattern.test(norm(f.label)))?.key;
  for(const [key,name] of Object.entries({genero:'genero',nacionalidad:'nacionalidad',tipo_documento:'tipoDocumento',motivo_detencion:'motivoDetencion'})){
   const source=document.querySelector('#detaineeForm select[name="'+name+'"]');
   if(inputs.has(key)&&source)fill(select(key),Array.from(source.options).filter(o=>o.value).map(o=>({value:o.value})),r.datos[key]);
  }
  for(const f of fields)if(/TENTANTIVA|TENTATIVA|ES FUNCIONARIO|PARA CONTAR/.test(norm(f.label))&&inputs.has(f.key))fill(select(f.key),[{value:'SI'},{value:'NO'}],r.datos[f.key]);
  cascade(['departamento','provincia','distrito'],window.CATALOGO_UBIGEO);
  const policeKeys=['direccion_policial','direccion_especializada_region','division_policial','departamento_policial','unidad_area_equipo'];
  const allowed=DEPENDENCIAS_INSTITUCIONALES.filter(d=>currentProfile.rol!=='estadistico_jefatura'||d.ambito==='DESCONCENTRADO');
  const roots=JSON.parse(JSON.stringify(window.DEPENDENCIAS_FLUJO||[]));
  for(const root of roots)for(const direction of root.children||[]){direction.children=(direction.children||[]).filter(d=>allowed.some(a=>equivalent(a.unidad,d.value))||d.children?.some(c=>allowed.some(a=>equivalent(a.unidad,c.value))));for(const d of direction.children)if(d.children?.length)d.children=d.children.filter(c=>allowed.some(a=>equivalent(a.unidad,c.value)));}
  const values=policeKeys.map(k=>r.datos[k]||'');
  values[0] ||= 'DIRNIC';values[1] ||= 'DIRCTPTIM';
  // The responsible unit is authoritative when legacy columns disagree or are empty.
  for(const root of roots)for(const direction of root.children||[])for(const division of direction.children||[]){
   const department=division.children?.find(d=>equivalent(d.value,r.unidad));
   if(equivalent(division.value,r.unidad)||department){values.splice(0,4,root.value,direction.value,division.value,department?.value||'');}
  }
  cascade(policeKeys,roots,values,vs=>{
   const match=allowed.find(d=>equivalent(d.unidad,vs[3]||vs[2]));unit.value=match?.unidad||'';
  });
  // Replace the separate unit selector with the five visible hierarchical controls.
  if(policeKeys.every(k=>inputs.has(k))){unit.parentElement.hidden=true;}
  cascade(['disposicion_direccion','disposicion_region','disposicion_division','disposicion_departamento','disposicion_unidad'],catalogs.police);
  const crimeKeys=[byLabel(/^(FUERO\/|FUERO |SI DET \+ DELITO FUERO)/),byLabel(/^DELITO GENERAL$/),byLabel(/^DELITO ESPECIFICO$/),byLabel(/^SUB TIPO$/)];
  cascade(crimeKeys,catalogs.crimes);
  const second=[byLabel(/FUERO.*2$/),byLabel(/DELITO GENERAL2$/),byLabel(/DELITO ESPECIFICO2$/),byLabel(/SUB TIPO2$/)];
  cascade(second,catalogs.crimes);
  const weaponCategory=byLabel(/^ARMAS DE FUEGO -/),weaponType=byLabel(/^TIPO ARMA$/);
  cascade([weaponCategory,weaponType],catalogs.weapons);
  const membership=byLabel(/^INDICAR SI ES INTEGRANTE/);
  if(membership)fill(select(membership),['NO ES INTEGRANTE','SI ES INTEGRANTE A UNA BB.CC','SI ES INTEGRANTE A UNA OO.CC'].map(value=>({value})),r.datos[membership]);
 }

 const labels={operativo_pendiente:'Operativo pendiente de vincular',sin_ni:'NI pendiente',fecha_pendiente:'Fecha pendiente',dependencia_pendiente:'Dependencia pendiente',dependencia_contradictoria:'Dependencia por revisar',area_pendiente:'Área pendiente',ubicacion_incompleta_o_fuera_catalogo:'Ubicación por revisar',ni_ambigua_o_no_numerica:'Revisar NI del original'};
 function close(){epoch++;modal.close();card.replaceChildren();}
 modal.addEventListener('cancel',e=>{e.preventDefault();close();});
 async function open(id,edit=false,onSaved=()=>{}){
  const token=++epoch,who=identity(),alive=()=>token===epoch&&who===identity()&&currentProfile?.activo;card.replaceChildren(el('p','Consultando registro…'));if(!modal.open)modal.showModal();
  try{const {data:r,error}=await supabaseClient.from('produccion_historica').select('*').eq('id',id).single();if(!alive())return;if(error)throw error;
   const config=schema[r.categoria];if(!config)throw new Error('Categoría histórica sin catálogo.');card.replaceChildren();
   const heading=el('div',null,'modal-heading'),h=el('div');h.append(el('h2',edit?'Corregir registro histórico':'Registro histórico'),el('p',`${r.hoja.trim()} · fila ${r.fila} del Excel`));const exit=el('button','Cerrar','secondary');exit.type='button';exit.onclick=close;heading.append(h,exit);card.append(heading);
   if(r.pendientes.length)card.append(el('p',[...new Set(r.pendientes.map(x=>labels[x]||x))].join(' · '),'results-note'));
   const form=el('form'),grid=el('div',null,'form-grid'),inputs=new Map();form.append(grid);card.append(form);
   const unitLabel=el('label','Dependencia responsable'),unit=el('select');unit.append(new Option('Pendiente de identificar',''));
   for(const d of DEPENDENCIAS_INSTITUCIONALES.filter(d=>currentProfile.rol!=='estadistico_jefatura'||d.ambito==='DESCONCENTRADO'))unit.append(new Option(d.unidad,d.unidad));unit.value=r.unidad||'';unit.disabled=!edit;unitLabel.append(unit);grid.append(unitLabel);
   for(const field of config.campos){if(['fuente_1','fuente_2'].includes(field.key))continue;const label=el('label',field.label),input=el('input');input.name=field.key;input.value=r.datos[field.key]??'';input.readOnly=!edit;
    if(field.key==='fecha')input.type='date';else if(field.type==='number'&&(!input.value||Number.isFinite(Number(input.value)))){input.type='number';input.step='any';}else input.type='text';
    if(['direccion_policial','direccion_especializada_region','division_policial','departamento_policial'].includes(field.key))input.readOnly=true;
    label.append(input);grid.append(label);inputs.set(field.key,input);
   }
   bindHistoricalControls(inputs,config,r,unit,edit);
   const original=el('details'),summary=el('summary','Ver datos originales del Excel');original.append(summary);const dl=el('dl');r.original.encabezados.forEach((name,i)=>{dl.append(el('dt',String(name||'')),el('dd',String(r.original.valores[i]??'')));});original.append(dl);card.append(original);
   const status=el('p');status.setAttribute('role','status');card.append(status);
   if(edit){if(!canEdit(r))throw new Error('Su perfil no permite editar este registro.');const reasonLabel=el('label','Motivo de la corrección'),reason=el('input');reason.required=true;reason.minLength=5;reasonLabel.append(reason);form.append(reasonLabel);const save=el('button','Guardar cambios','primary');save.type='submit';form.append(save);
    form.onsubmit=async e=>{e.preventDefault();if(!alive()||!form.reportValidity()||save.disabled)return;save.disabled=true;const data={...r.datos};for(const [key,input] of inputs)if(!input.readOnly)data[key]=input.value===''?null:input.type==='number'?Number(input.value):input.value.trim();
     try{const {error}=await supabaseClient.rpc('guardar_produccion_historica',{p_id:r.id,p_version:r.version,p_datos:data,p_unidad:unit.value||null,p_motivo:reason.value.trim()});if(error)throw error;if(!alive())return;await onSaved();await open(id,false,onSaved);}catch(e){if(alive())status.textContent=e.message;}finally{if(alive())save.disabled=false;}
    };
   }else if(canEdit(r)){const b=el('button','Editar registro','primary');b.type='button';b.onclick=()=>open(id,true,onSaved);card.append(b);}
   if(r.tabla==='intervenciones'){const related=await read(supabaseClient,{parent:id},alive,'id,categoria,hoja,fila');if(!alive())return;const section=el('section');section.append(el('h3','Resultados vinculados'));for(const child of related){const b=el('button',`${child.hoja.trim()} · fila ${child.fila}`,'table-action');b.type='button';b.onclick=()=>open(child.id,false,onSaved);section.append(b);}if(!related.length)section.append(el('p','No hay resultados vinculados con certeza a este operativo.'));card.append(section);}
  }catch(e){if(alive()){card.replaceChildren(el('p',e.message));const exit=el('button','Cerrar','secondary');exit.onclick=close;card.append(exit);}}
 }
 window.HistoricoProduccion={read,normalize,canEdit,open,close,schema};
})();