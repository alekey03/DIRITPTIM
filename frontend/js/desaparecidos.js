(() => {
 const root=document.getElementById('desaparecidosView'),fields=window.DESAPARECIDOS_CATALOGO;
 const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const manager=()=>['administrador','estadistico_direccion','estadistico_jefatura'].includes(currentProfile?.rol);
 const identity=()=>JSON.stringify([currentProfile?.id,currentProfile?.rol,currentProfile?.unidad,currentProfile?.activo]);
 let rows=[],units=[],editing=null,busy=false,dirty=false,token=0,page=0,retry=null;
 root.innerHTML=`<header class="missing-hero"><div><span>DENUNCIAS Y BÚSQUEDA</span><h2>Cada denuncia, un seguimiento</h2><p>Registre la desaparición y consulte su evolución, informe y datos de ubicación.</p></div><button type="button" class="primary" data-new>＋ Registrar denuncia</button></header>
 <p data-scope></p><div class="missing-metrics"></div>
 <section class="missing-editor" hidden><header><h3 data-editor-title>Registrar denuncia</h3><button type="button" class="secondary" data-close>Cerrar formulario</button></header><p>Los campos con * son obligatorios. La denuncia se registra de forma independiente de los operativos.</p><form><fieldset><label>Dependencia registradora *<select name="unidad" required></select></label><div data-fields></div><p data-form-status role="status"></p><button class="primary" data-save>Guardar denuncia</button></fieldset></form></section>
 <section class="missing-panel"><div class="missing-filters"><label>Buscar persona o denuncia<input name="search" type="search" placeholder="Apellidos, nombres o número de denuncia…"></label><label>Desde<input name="from" type="date"></label><label>Hasta<input name="to" type="date"></label><label>Dependencia<select name="filterUnit"><option value="">Todas las autorizadas</option></select></label><label>Ubicación<select name="location"><option value="">Todas</option><option value="pending">Sin fecha de ubicación</option><option value="located">Con fecha de ubicación</option></select></label><button class="secondary" type="button" data-refresh>Actualizar</button></div><p data-status role="status"></p><div class="missing-table"><table><thead><tr><th>Denuncia</th><th>Persona</th><th>Dependencia</th><th>Estado de denuncia</th><th>Situación / ubicación</th><th>Acciones</th></tr></thead><tbody></tbody></table></div><footer><span data-count></span><button class="secondary" type="button" data-prev>Anterior</button><button class="secondary" type="button" data-next>Siguiente</button></footer><p class="missing-note">Las descargas de Excel están en Registros → Denuncias de desaparición. Registrar una fecha de ubicación aquí no crea automáticamente un resultado en Personas ubicadas.</p></section>`;
 const $=q=>root.querySelector(q),form=$('form'),editor=$('.missing-editor');
 function options(select,items,empty){select.replaceChildren(...(empty?[new Option(empty,'')]:[]),...items.map(v=>new Option(v,v)));}
 function lock(){form.querySelector('fieldset').disabled=busy;$('[data-new]').disabled=busy;$('[data-close]').disabled=busy;$('[data-refresh]').disabled=busy;}
 function discard(){return !dirty||confirm('Hay una denuncia sin guardar. ¿Desea descartar los cambios?');}
 function close(){editor.hidden=true;form.reset();editing=null;dirty=false;retry=null;$('[data-fields]').replaceChildren();}
 function open(r=null,view=false){
  if(busy||!discard())return;close();editing=r;editor.hidden=false;
  $('[data-editor-title]').textContent=view?'Detalle de la denuncia':r?'Editar denuncia':'Registrar denuncia';
  options(form.elements.unidad,r?[r.unidad]:units.map(u=>u.unidad),'Seleccionar dependencia');
  if(r)form.elements.unidad.value=r.unidad;else if(units.length===1)form.elements.unidad.value=units[0].unidad;
  form.elements.unidad.disabled=!!r;
  const blocks=[['Datos de la denuncia',fields.slice(0,5)],['Persona desaparecida y lugar del hecho',fields.slice(5,13)],['Investigación e informe',fields.slice(13,20)],['Situación y ubicación',fields.slice(20)]];
  for(const [title,items]of blocks){const section=make('section');section.append(make('h4',title));const grid=make('div',null,'missing-grid');
   for(const f of items){const label=make('label',f.label+(f.required?' *':'')),input=make(f.options?'select':'input');input.name=f.key;
    if(f.options)options(input,f.options,'Sin indicar');else{input.type=f.type;input.maxLength=2000;for(const k of ['min','max','step'])if(f[k]!=null)input[k]=f[k];if(f.type==='date')input.max=today();}
    input.required=f.required;input.value=r?.datos[f.key]??(f.key==='fecha'?today():'');input.disabled=view;label.append(input);grid.append(label);
   }section.append(grid);$('[data-fields]').append(section);
  }
  $('[data-save]').hidden=view;$('[data-form-status]').textContent=view?'Consulta del registro.':'';form.elements.unidad.disabled=!!r||view;
  editor.scrollIntoView({behavior:'smooth',block:'start'});
 }
 function render(){
  const f=Object.fromEntries(['search','from','to','filterUnit','location'].map(k=>[k,$(`[name="${k}"]`).value]));
  if(f.from&&f.to&&f.from>f.to){$('[data-status]').textContent='La fecha inicial no puede ser posterior a la final.';$('tbody').replaceChildren();return;}
  const filtered=rows.filter(r=>(!f.from||r.fecha>=f.from)&&(!f.to||r.fecha<=f.to)&&(!f.filterUnit||r.unidad===f.filterUnit)&&(!f.location||(f.location==='located'?!!r.datos.fecha_ubicacion:!r.datos.fecha_ubicacion))&&(!f.search||norm([r.unidad,...Object.values(r.datos)].join(' ')).includes(norm(f.search))));
  $('.missing-metrics').replaceChildren(...[['Denuncias',filtered.length],['Sin fecha de ubicación',filtered.filter(r=>!r.datos.fecha_ubicacion).length],['Con fecha de ubicación',filtered.filter(r=>r.datos.fecha_ubicacion).length]].map(([l,n])=>{const a=make('article');a.append(make('span',l),make('strong',String(n)));return a;}));
  page=Math.min(page,Math.max(0,Math.ceil(filtered.length/15)-1));$('tbody').replaceChildren();
  for(const r of filtered.slice(page*15,page*15+15)){const tr=make('tr'),d=r.datos;for(const text of [r.fecha+' · '+(d.numero_denuncia||'Sin número consignado'),[d.apellido_paterno,d.apellido_materno,d.nombres].filter(Boolean).join(' '),r.unidad,d.estado_denuncia||'Sin consignar',[d.situacion,d.fecha_ubicacion].filter(Boolean).join(' · ')||'Sin consignar'])tr.append(make('td',text));
   const td=make('td');for(const [label,action]of [['Ver detalle',()=>open(r,true)],...(manager()?[['Editar',()=>open(r)],['Eliminar',()=>remove(r)]]:[])]){const b=make('button',label,'table-action');b.type='button';b.disabled=busy;b.addEventListener('click',action);td.append(b);}tr.append(td);$('tbody').append(tr);
  }
  if(!filtered.length){const tr=make('tr'),td=make('td','No hay denuncias en este alcance.');td.colSpan=6;tr.append(td);$('tbody').append(tr);}
  $('[data-count]').textContent=`${filtered.length} denuncias · Página ${page+1} de ${Math.max(1,Math.ceil(filtered.length/15))}`;$('[data-prev]').disabled=page===0;$('[data-next]').disabled=(page+1)*15>=filtered.length;
  $('[data-status]').textContent='Se muestran únicamente las dependencias autorizadas para su cuenta.';
 }
 async function load(){
  if(busy||!currentProfile?.activo)return;const turn=++token,who=identity(),alive=()=>turn===token&&who===identity()&&currentProfile?.activo;busy=true;lock();rows=[];$('tbody').replaceChildren();$('.missing-metrics').replaceChildren();$('[data-status]').textContent='Consultando denuncias…';
  try{
   const [data,result]=await Promise.all([window.ConsultaModelo.readAll(supabaseClient,{table:'desapariciones'},alive),supabaseClient.from('dependencias_estadisticas').select('unidad,ambito').order('unidad')]);
   if(!alive())return;if(result.error)throw result.error;
   units=result.data.filter(u=>['administrador','estadistico_direccion'].includes(currentProfile.rol)||currentProfile.rol==='estadistico_jefatura'&&u.ambito==='DESCONCENTRADO'||u.unidad===currentProfile.unidad);
   rows=data.sort((a,b)=>b.fecha.localeCompare(a.fecha)||b.creado_en.localeCompare(a.creado_en));const selected=$('[name=filterUnit]').value;options($('[name=filterUnit]'),units.map(u=>u.unidad),'Todas las autorizadas');$('[name=filterUnit]').value=selected;
   $('[data-scope]').textContent=`${nombrePerfil(currentProfile.rol)} · ${currentProfile.unidad}`;busy=false;render();
  }catch(e){if(alive())$('[data-status]').textContent=`No se pudo consultar: ${e.message}`;}finally{if(alive()){busy=false;lock();}}
 }
 form.addEventListener('input',()=>{dirty=true;retry=null;});form.addEventListener('change',()=>{dirty=true;retry=null;});
 form.addEventListener('submit',async e=>{e.preventDefault();if(busy||!currentProfile?.activo||!form.reportValidity())return;
  const datos={};for(const f of fields){const v=form.elements[f.key].value.trim();if(v!=='')datos[f.key]=f.type==='number'?Number(v):v;}
  const payload={p_id:editing?.id||retry||crypto.randomUUID(),p_version:editing?.version||0,p_unidad:form.elements.unidad.value,p_datos:datos};retry=payload.p_id;
  const who=identity(),turn=token;busy=true;lock();$('[data-form-status]').textContent='Guardando…';
  try{const {error}=await supabaseClient.rpc('guardar_desaparicion',payload);if(who!==identity()||turn!==token)return;if(error)throw error;close();busy=false;await load();$('[data-status]').textContent='Denuncia guardada correctamente.';}
  catch(e){if(who===identity()&&turn===token)$('[data-form-status]').textContent=e.message;}
  finally{if(who===identity()&&turn===token){busy=false;lock();}}
 });
 async function remove(r){if(busy||!manager()||!discard()||!confirm('¿Eliminar esta denuncia? Se conservará el historial de auditoría.'))return;const who=identity(),turn=token;busy=true;lock();try{const {data,error}=await supabaseClient.from('desapariciones').delete().eq('id',r.id).eq('version',r.version).select('id');if(who!==identity()||turn!==token)return;if(error)throw error;if(!data?.length)throw new Error('La denuncia cambió o ya no está disponible. Actualice.');close();busy=false;await load();}catch(e){if(who===identity())$('[data-status]').textContent=e.message;}finally{if(who===identity()){busy=false;lock();}}}
 $('[data-new]').addEventListener('click',()=>open());$('[data-close]').addEventListener('click',()=>{if(!busy&&discard())close();});$('[data-refresh]').addEventListener('click',()=>{if(discard()){close();load();}});
 for(const n of ['search','from','to','filterUnit','location'])$(`[name="${n}"]`).addEventListener(n==='search'?'input':'change',()=>{page=0;render();});
 $('[data-prev]').addEventListener('click',()=>{page--;render();});$('[data-next]').addEventListener('click',()=>{page++;render();});
 window.addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue='';}});
 window.guardDesaparecidos=target=>{if(!root.classList.contains('active')||target==='desaparecidosView')return true;if(busy)return false;if(!discard())return false;close();return true;};
 window.loadDesaparecidos=()=>{if(!dirty)return load();};
 window.resetDesaparecidos=()=>{token++;rows=[];units=[];busy=false;close();$('tbody').replaceChildren();$('.missing-metrics').replaceChildren();for(const n of ['search','from','to','filterUnit','location'])$(`[name="${n}"]`).value='';$('[data-status]').textContent='';$('[data-scope]').textContent='';};
})();
