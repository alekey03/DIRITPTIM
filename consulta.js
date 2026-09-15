(() => {
  const model=window.ConsultaModelo, categories=model.categories(), states=new Map();
  let session=0;
  const el=(tag,text,cls)=>{const node=document.createElement(tag);if(text!=null)node.textContent=text;if(cls)node.className=cls;return node;};
  const fmt=n=>new Intl.NumberFormat('es-PE',{maximumFractionDigits:6}).format(n);
  const show=v=>v==null||v===''?'—':typeof v==='boolean'?(v?'Sí':'No'):String(v);
  const detail=document.createElement('dialog');detail.className='modal';
  const detailCard=el('div',null,'modal-card'),detailTitle=el('h2'),detailContent=el('div',null,'consulta-detail'),detailClose=el('button','Cerrar','secondary');
  detailClose.addEventListener('click',()=>detail.close());detailCard.append(detailTitle,detailContent,detailClose);detail.append(detailCard);document.body.append(detail);
  function openDetail(r,c){detailTitle.textContent=c.title;detailContent.replaceChildren();for(const [label,v]of [['Fecha',r.date],['Dependencia',r.unit],['Lugar',r.place],['NI principal',r.ni],...c.fields.map(f=>[f.label,r.data[f.key]])]){const row=el('p');row.append(el('strong',label+': '),document.createTextNode(show(v)));detailContent.append(row);}detail.showModal();}
  const value=(s,key)=>s.root.querySelector(`[name="${key}"]`).value;
  const category=s=>categories.find(c=>c.id===value(s,'category'));
  function filterValues(s){return Object.fromEntries(['from','to','unit','place','search','field','value'].map(k=>[k,value(s,k)]));}
  function options(select,items,empty){select.replaceChildren(new Option(empty,''),...items.map(([v,t])=>new Option(t,v)));}
  function clearOutput(s){s.rows=[];s.filtered=[];s.body.replaceChildren();s.summary.replaceChildren();s.charts.replaceChildren();s.pageText.textContent='';s.prev.disabled=s.next.disabled=true;}
  function setup(id,dashboard){
    const root=document.getElementById(id),s={root,dashboard,rows:[],filtered:[],page:0,turn:0};states.set(id,s);
    root.innerHTML=`<div class="records-toolbar"><div><h2>${dashboard?'Resultados a la vista':'Todos los registros, por categoría'}</h2><p>${dashboard?'Explore los indicadores y abra los registros que los sustentan.':'Consulte resultados de distintas intervenciones desde un solo lugar.'}</p></div><button class="secondary" data-refresh>↻ Actualizar</button></div><div class="consulta-scope"></div><form class="card consulta-filters"><label class="consulta-category-search">Buscar categoría<input name="categorySearch" type="search" placeholder="Ej. vehículos, detenidos…"></label><label class="consulta-category">Categoría<select name="category"></select></label><label>Desde<input name="from" type="date"></label><label>Hasta<input name="to" type="date"></label><label>Dependencia<select name="unit"><option value="">Todas las autorizadas</option></select></label><label>Lugar<input name="place" type="search" placeholder="Departamento, provincia o distrito"></label><label>Buscar en registros<input name="search" type="search" placeholder="Nombre, documento, placa, NI…"></label><label>Campo específico<select name="field"></select></label><label>Contiene<input name="value" type="search" placeholder="Valor del campo elegido"></label><div class="consulta-filter-actions"><button class="primary" type="submit">Aplicar filtros</button><button class="secondary" type="button" data-clear>Limpiar</button></div></form><p class="consulta-status" role="status" aria-live="polite"></p><div class="consulta-metrics"></div><div class="consulta-charts"></div><div class="consulta-table-wrap" tabindex="0" aria-label="Tabla de registros, desplazamiento horizontal"><table><thead></thead><tbody></tbody></table></div><div class="consulta-pagination"><button class="secondary" data-prev>Anterior</button><span></span><button class="secondary" data-next>Siguiente</button></div>`;
    s.status=root.querySelector('.consulta-status');s.body=root.querySelector('tbody');s.summary=root.querySelector('.consulta-metrics');s.charts=root.querySelector('.consulta-charts');s.prev=root.querySelector('[data-prev]');s.next=root.querySelector('[data-next]');s.pageText=root.querySelector('.consulta-pagination span');
    if(!dashboard){const exportButton=el('button','⇩ Exportar consulta a Excel','secondary');exportButton.type='button';root.querySelector('.records-toolbar').append(exportButton);exportButton.addEventListener('click',()=>{if(!s.loaded||!currentProfile?.activo)return;render(s);const f=filterValues(s);if(f.from&&f.to&&f.from>f.to)return;if(!s.filtered.length){s.status.textContent='No hay registros para exportar con estos filtros.';return;}try{const c=category(s),rows=s.filtered.map((r,i)=>Object.fromEntries([['N°',i+1],['Fecha',excelDate(r.date)],['Dependencia',r.unit],['Lugar',r.place],['NI principal',r.ni],...c.fields.map(field=>[field.label,r.data[field.key]])]));downloadWorkbook(rows,'Consulta',`registros_${c.id}`);}catch(error){s.status.textContent=error.message;}});}
    const select=root.querySelector('[name="category"]');select.replaceChildren(...categories.map(c=>new Option(c.title,c.id)));select.value='detenidos';
    function fields(){options(root.querySelector('[name="field"]'),category(s).fields.map(f=>[f.key,f.label]),'Todos los campos');}
    fields();
    select.addEventListener('change',()=>{fields();root.querySelector('[name="value"]').value='';load(s);});
    root.querySelector('[name="categorySearch"]').addEventListener('input',event=>{const norm=v=>v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase();const search=norm(event.target.value);for(const option of select.options)option.hidden=!norm(option.text).includes(search)&&!option.selected;});
    root.querySelector('form').addEventListener('submit',event=>{event.preventDefault();s.page=0;render(s);});
    root.querySelector('[data-clear]').addEventListener('click',()=>{for(const name of ['from','to','unit','place','search','field','value'])root.querySelector(`[name="${name}"]`).value='';s.page=0;render(s);});
    root.querySelector('[data-refresh]').addEventListener('click',()=>load(s));
    s.prev.addEventListener('click',()=>{s.page--;table(s);});s.next.addEventListener('click',()=>{s.page++;table(s);});
    root.querySelector('.consulta-table-wrap').hidden=dashboard;root.querySelector('.consulta-pagination').hidden=dashboard;
    return s;
  }
  async function load(s){
    const turn=++s.turn,epoch=session,profile=currentProfile?.id,c=category(s);clearOutput(s);s.page=0;s.loaded=false;
    const alive=()=>turn===s.turn&&epoch===session&&currentProfile?.id===profile&&currentProfile?.activo;
    s.root.querySelector('.consulta-scope').textContent=currentProfile?.rol==='administrador'?'Ámbito nacional · Administrador general':currentProfile?.rol==='supervisor'?'Solo dependencias autorizadas para su cuenta':`Solo su área · ${currentProfile?.unidad||''}`;
    s.status.textContent='Consultando los registros autorizados…';
    if(!alive()){s.status.textContent='Inicie sesión con una cuenta activa.';return;}
    try{
      const [raw,parents]=await Promise.all([model.readAll(supabaseClient,c,alive),c.table==='intervenciones'?Promise.resolve([]):model.readAll(supabaseClient,{table:'intervenciones',select:'id,fecha,unidad,departamento,provincia,distrito,nota_sicpip'},alive)]);
      if(!alive())return;
      const map=new Map(parents.map(p=>[p.id,p]));s.rows=raw.map(r=>model.normalize(r,c,map)).sort((a,b)=>b.date.localeCompare(a.date)||a.id.localeCompare(b.id));
      const units=s.root.querySelector('[name="unit"]'),previous=units.value;
      options(units,[...new Set(s.rows.map(r=>r.unit).filter(Boolean))].sort().map(u=>[u,u]),'Todas las autorizadas');
      if([...units.options].some(o=>o.value===previous))units.value=previous;
      s.loaded=true;render(s);
    }catch(error){if(alive()){clearOutput(s);s.status.textContent=`No se pudieron consultar los datos. ${error.message||'Pulse Actualizar para reintentar.'}`;}}
  }
  function render(s){
    if(!s.loaded)return;
    const filters=filterValues(s);
    if(filters.from&&filters.to&&filters.from>filters.to){s.summary.replaceChildren();s.charts.replaceChildren();s.body.replaceChildren();s.prev.disabled=s.next.disabled=true;s.pageText.textContent='';s.status.textContent='La fecha inicial no puede ser posterior a la fecha final.';return;}
    const c=category(s);s.filtered=model.filter(s.rows,filters);
    s.summary.replaceChildren(...model.metrics(s.filtered,c).map(([title,n])=>{const card=el('article',null,'card');card.append(el('small',title),el('strong',fmt(n)));return card;}));
    s.status.textContent=`${c.title} · ${fmt(s.filtered.length)} registros coincidentes de ${fmt(s.rows.length)} autorizados. ${s.filtered.length?'':'No hay registros para estos filtros.'}`;
    s.charts.replaceChildren();
    if(s.dashboard){
      const button=el('button','Ver estos registros','primary');button.type='button';button.addEventListener('click',()=>{
        const target=states.get('consultaRecordsView');target.root.querySelector('[name="category"]').value=c.id;
        options(target.root.querySelector('[name="field"]'),c.fields.map(f=>[f.key,f.label]),'Todos los campos');
        options(target.root.querySelector('[name="unit"]'),[...new Set(s.rows.map(r=>r.unit).filter(Boolean))].sort().map(u=>[u,u]),'Todas las autorizadas');
        for(const [key,val]of Object.entries(filters))target.root.querySelector(`[name="${key}"]`).value=val;
        document.querySelector('.nav-item[data-view="consultaRecordsView"]').click();
      });s.charts.append(button);
      chart(s,'Por dependencia',r=>r.unit||'Sin dependencia');chart(s,'Evolución mensual',r=>r.date.slice(0,7)||'Sin fecha',true);
      if(c.table==='intervencion_drogas')chart(s,'Registros por sustancia',r=>r.data.sustancia);
      else if(c.fields.some(f=>f.key==='situacion'))chart(s,'Registros por situación',r=>r.data.situacion||'Sin registrar');
    }else table(s);
  }
  function chart(s,title,key,chronological=false){
    const counts=new Map();for(const r of s.filtered){const label=key(r);counts.set(label,(counts.get(label)||0)+1);}
    const article=el('article',null,'card consulta-chart');article.append(el('h3',title),el('p','Número de registros según los filtros aplicados.'));
    const items=[...counts].sort(chronological?(a,b)=>a[0].localeCompare(b[0]):(a,b)=>b[1]-a[1]);
    const max=Math.max(1,...items.map(([,n])=>n));
    for(const [label,n]of items){const row=el('div',null,'consulta-bar');row.append(el('span',label),el('strong',fmt(n)));const track=el('div',null,'consulta-track'),bar=el('i');bar.style.width=`${n/max*100}%`;track.append(bar);row.append(track);article.append(row);}
    if(!items.length)article.append(el('p','Sin datos para este periodo.'));s.charts.append(article);
  }
  function table(s){
    const c=category(s),columns=[{key:'date',label:'Fecha'},...c.fields.slice(0,5).map(f=>({...f,data:true})),{key:'unit',label:'Dependencia'},{key:'place',label:'Lugar'},{key:'ni',label:'NI principal'}];
    const head=el('tr');for(const f of columns){const th=el('th',f.label);th.scope='col';head.append(th);}head.append(el('th','Acciones'));s.root.querySelector('thead').replaceChildren(head);s.body.replaceChildren();
    const pages=Math.max(1,Math.ceil(s.filtered.length/25));s.page=Math.min(Math.max(0,s.page),pages-1);
    for(const r of s.filtered.slice(s.page*25,s.page*25+25)){
      const tr=el('tr');for(const f of columns)tr.append(el('td',show(f.data?r.data[f.key]:r[f.key])));
      const actions=el('td');
      if(c.id==='detenidos'){const b=el('button','Ver detalle','table-action');b.addEventListener('click',()=>window.openLinkedDetainee(r.id));actions.append(b);}
      else {const b=el('button','Ver detalle','table-action');b.addEventListener('click',()=>openDetail(r,c));actions.append(b);}
      if(r.parentId){const b=el('button','Ver operativo','table-action');b.addEventListener('click',()=>window.openOperativoResults(r.parentId));actions.append(b);}else actions.append(el('span','Sin operativo vinculado'));
      tr.append(actions);s.body.append(tr);
    }
    s.prev.disabled=s.page===0;s.next.disabled=s.page+1>=pages;s.pageText.textContent=`Página ${s.page+1} de ${pages} · ${fmt(s.filtered.length)} registros`;
  }
  const records=setup('consultaRecordsView',false),dashboard=setup('generalDashboardView',true);
  window.loadConsultaRecords=()=>load(records);window.loadGeneralDashboard=()=>load(dashboard);
  window.resetConsulta=()=>{session++;detail.close();detailContent.replaceChildren();for(const s of states.values()){s.turn++;s.loaded=false;clearOutput(s);s.root.querySelector('form').reset();s.root.querySelector('[name="category"]').value='detenidos';options(s.root.querySelector('[name="unit"]'),[],'Todas las autorizadas');options(s.root.querySelector('[name="field"]'),categories.find(c=>c.id==='detenidos').fields.map(f=>[f.key,f.label]),'Todos los campos');s.status.textContent='';s.root.querySelector('.consulta-scope').textContent='';}};
})();
