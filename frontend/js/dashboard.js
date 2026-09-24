(() => {
  const root=document.getElementById('generalDashboardView'),M=window.DashboardModelo,Q=window.ConsultaModelo,categories=Q.categories();
  const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
  const fmt=n=>new Intl.NumberFormat('es-PE',{maximumFractionDigits:2}).format(n),pct=(n,total)=>`${fmt(total?n/total*100:0)}%`;
  let rows=[],filtered=[],turn=0,loaded=false,loadedIdentity='',updated='',grain='month',map=null,layer=null,geometry=null,mapTurn=0,mapResize=null;
  const identity=()=>JSON.stringify([currentProfile?.id,currentProfile?.rol,currentProfile?.unidad,currentProfile?.activo]);
  root.classList.add('executive-dashboard');
  root.innerHTML=`
  <header class="dash-hero"><div class="dash-orbit" aria-hidden="true"></div><div class="dash-hero-copy"><span class="dash-eyebrow">ESTADISTICA DIRITPTIM</span><h2>Producción en perspectiva</h2><p>Del resultado operativo a una visión para decidir.</p><div class="dash-access"><span aria-hidden="true">●</span><span data-scope></span></div></div><div class="dash-hero-actions records-toolbar"><button type="button" class="secondary" data-refresh>↻ Actualizar datos</button><small data-updated>Consulta según permisos de su cuenta</small></div></header>
  <nav class="dash-section-nav" aria-label="Secciones del dashboard"><a href="#dashOverview">01 / Panorama</a><a href="#dashTerritory">02 / Territorio</a><a href="#dashProfile">03 / Composición</a><span>Datos guardados · incluye borradores</span></nav>
  <form class="dash-filter-panel" aria-label="Filtros del dashboard"><div class="dash-filter-heading"><div><span class="dash-eyebrow">EXPLORAR PRODUCCIÓN</span><h3>¿Qué resultado desea analizar?</h3></div><button class="dash-text-button" type="button" data-clear>Restablecer filtros ↺</button></div><div class="dash-filter-grid"><label class="dash-category-label">Categoría<select name="category"></select></label><label>Desde<input name="from" type="date"></label><label>Hasta<input name="to" type="date"></label><label>Dependencia<select name="unit"><option value="">Todas las autorizadas</option></select></label></div><div class="dash-location-heading">Lugar de intervención <small>Seleccione un territorio para profundizar</small></div><div class="dash-filter-grid dash-geo-filters"><label>Departamento<select name="department"></select></label><label>Provincia<select name="province"></select></label><label>Distrito<select name="district"></select></label></div><div class="dash-specific" data-specific></div><div class="dash-filter-footer"><div class="dash-chips" data-chips></div><button class="primary" type="submit">Aplicar filtros</button></div></form>
  <p class="dash-status" role="status" aria-live="polite"></p>
  <section id="dashOverview" class="dash-section"><div class="dash-section-heading"><div><span class="dash-eyebrow">01 / PANORAMA</span><h3 data-category-title></h3></div><button type="button" class="secondary" data-records>Consultar registros ↗</button></div><div class="dash-kpis" data-kpis></div><div class="dash-overview-grid"><article class="dash-card dash-trend"><header><div><h3>Evolución de los registros</h3><p>Distribución en el tiempo del resultado seleccionado</p></div><div class="dash-toggle" role="group" aria-label="Agrupar evolución"><button type="button" aria-pressed="true" data-grain="month">Mensual</button><button type="button" aria-pressed="false" data-grain="year">Anual</button></div></header><div data-trend></div></article><article class="dash-brief"><span class="dash-eyebrow">LECTURA EJECUTIVA</span><h3>Claves del periodo</h3><div data-brief></div><p class="dash-footnote">Participaciones sobre registros filtrados. No representan tasas de criminalidad.</p></article></div></section>
  <section id="dashTerritory" class="dash-section"><div class="dash-section-heading"><div><span class="dash-eyebrow">02 / TERRITORIO</span><h3>¿Dónde se concentra la producción?</h3></div><button type="button" class="dash-text-button" data-peru>Ver todo el Perú ↗</button></div><div class="dash-territory-grid"><article class="dash-card dash-map-card"><header><div><h3 data-map-title>Distribución por departamento</h3><p>Toque una región para filtrar. Pase el cursor para ver su participación.</p></div><span class="dash-badge" data-map-place>PERÚ</span></header><button type="button" class="dash-text-button" data-map-back hidden>← Volver</button><p class="dash-map-hover" data-map-hover aria-live="polite"></p><div id="executiveMap" class="dash-map" aria-label="Mapa de registros por departamento"></div><div class="dash-map-legend"><span><i style="background:#e7ecef"></i>Sin registros</span><span><i style="background:#66c99a"></i>&lt; 5%</span><span><i style="background:#c7dd77"></i>5–10%</span><span><i style="background:#f4ba58"></i>10–20%</span><span><i style="background:#e87770"></i>≥ 20%</span></div><p class="dash-footnote" data-map-note></p></article><article class="dash-card"><header><div><h3>Participación territorial</h3><p data-territory-level>Registros y porcentaje del total filtrado</p></div></header><div data-territory-ranking></div></article></div></section>
  <section id="dashProfile" class="dash-section"><div class="dash-section-heading"><div><span class="dash-eyebrow">03 / COMPOSICIÓN</span><h3 data-composition-title>Una mirada al detalle</h3></div><span class="dash-badge">INTERACTIVO</span></div><div class="dash-profile-grid" data-profile></div></section>
  <section class="dash-section dash-card dash-units"><header><div><span class="dash-eyebrow">CONTRIBUCIÓN OPERATIVA</span><h3>Resultados por dependencia</h3><p>Cantidad de registros de la categoría seleccionada, no una evaluación de desempeño.</p></div></header><div data-units></div></section>
  <footer class="dash-footer"><span>DIRITPTIM · Producción policial</span><span>El alcance de los datos depende del perfil y la unidad asignada.</span></footer>`;
  const $=q=>root.querySelector(q),v=k=>$(`[name="${k}"]`).value,cat=()=>categories.find(c=>c.id===v('category'));
  function options(select,values,placeholder){const previous=select.value;select.replaceChildren(new Option(placeholder,''),...values.map(x=>new Option(x.label??x,x.value??x)));if([...select.options].some(o=>o.value===previous))select.value=previous;}
  const groups=[['Operaciones',c=>c.table==='intervenciones'],['Personas',c=>['desaparecidos','detenidos','rq','prostitucion','victimas','menores','migraciones','personas_ubicadas','ubicadas','expulsados'].includes(c.id)],['Grupos criminales',c=>c.table==='intervencion_grupos'],['Drogas',c=>c.table==='intervencion_drogas'],['Bienes y otros resultados',()=>true]];
  const assigned=new Set();for(const [name,test]of groups){const group=make('optgroup');group.label=name;for(const c of categories)if(!assigned.has(c.id)&&test(c)){group.append(new Option(c.title,c.id));assigned.add(c.id);}if(group.children.length)$('[name="category"]').append(group);}$('[name="category"]').value='detenidos';
  function filters(){const f=Object.fromEntries(['from','to','unit','department','province','district'].map(k=>[k,v(k)]));f.facets={};for(const input of $('[data-specific]').querySelectorAll('[name]')){if(input.dataset.facet)f.facets[input.dataset.facet]=input.value;else f[input.name]=input.value;}return f;}
  function unique(key,source=rows){return [...new Set(source.map(key).map(M.clean).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));}
  function geographic(){
    options($('[name="department"]'),[...new Set([...unique(r=>M.geo(r).department),...((window.CATALOGO_UBIGEO||[]).map(x=>x.value)),v('department')].filter(Boolean))],'Todo el territorio autorizado');
    const deps=rows.filter(r=>!v('department')||M.norm(M.geo(r).department)===M.norm(v('department')));
    options($('[name="province"]'),v('department')?[...new Set([...unique(r=>M.geo(r).province,deps),v('province')].filter(Boolean))]:[],'Todas las provincias');$('[name="province"]').disabled=!v('department');
    const provs=deps.filter(r=>!v('province')||M.norm(M.geo(r).province)===M.norm(v('province')));
    options($('[name="district"]'),v('province')?[...new Set([...unique(r=>M.geo(r).district,provs),v('district')].filter(Boolean))]:[],'Todos los distritos');$('[name="district"]').disabled=!v('province');
  }
  function specific(preserve=false){
    const old=preserve?filters():{},host=$('[data-specific]');host.replaceChildren();const c=cat();
    const add=(label,input)=>{const l=make('label',label);l.append(input);host.append(l);return input;};
    for(const field of M.facets(c)){const select=make('select');select.name=`facet_${field.key}`;select.dataset.facet=field.key;options(select,[...unique(r=>r.data[field.key]).map(x=>({value:x,label:x})),{value:'__missing__',label:'Sin registrar'}],'Todos');select.value=old.facets?.[field.key]||'';add(field.label,select);}
    if(c.fields.some(f=>f.key==='edad'))for(const [name,label]of [['ageMin','Edad desde'],['ageMax','Edad hasta']]){const input=make('input');input.type='number';input.min='0';input.max='120';input.step='1';input.name=name;input.placeholder=name==='ageMin'?'Ej. 18':'Ej. 60';input.value=old[name]||'';add(label,input);}
    if(c.id==='dinero'){const select=make('select');select.name='currency';options(select,[...M.amounts.map(([value,label])=>({value,label})),{value:'dinero_otro',label:'Otra moneda'}],'Todas las monedas');select.value=old.currency||'';add('Tipo de moneda',select);host.append(make('p','Los importes se muestran por moneda; no se suman monedas diferentes.','dash-specific-note'));}
    if(!host.children.length)host.hidden=true;else host.hidden=false;
  }
  function clearVisuals(){filtered=[];$('[data-kpis]').replaceChildren();$('[data-trend]').replaceChildren();$('[data-brief]').replaceChildren();$('[data-profile]').replaceChildren();$('[data-units]').replaceChildren();$('[data-territory-ranking]').replaceChildren();$('[data-map-note]').textContent='';if(layer){layer.remove();layer=null;}mapTurn++;$('[data-records]').disabled=true;}
  async function load(){
    const token=++turn,who=identity(),c=cat(),old=loaded&&loadedIdentity===who;loaded=false;rows=[];clearVisuals();
    $('[data-scope]').textContent=`${nombrePerfil(currentProfile?.rol)} · ${currentProfile?.unidad||''}`;
    $('.dash-status').textContent='Consultando la producción autorizada…';$('[data-updated]').textContent='Actualizando…';root.setAttribute('aria-busy','true');
    const alive=()=>token===turn&&who===identity()&&currentProfile?.activo;
    if(!alive()){root.removeAttribute('aria-busy');$('.dash-status').textContent='Inicie sesión con una cuenta activa.';return;}
    try{
      const [raw,parents]=await Promise.all([Q.readAll(supabaseClient,c,alive),c.table==='intervenciones'?[]:Q.readAll(supabaseClient,{table:'intervenciones',select:'id,fecha,unidad,departamento,provincia,distrito,nota_sicpip'},alive)]);
      if(!alive())return;
      const p=new Map(parents.map(r=>[r.id,r]));rows=raw.map(r=>Q.normalize(r,c,p));
      options($('[name="unit"]'),unique(r=>r.unit),'Todas las autorizadas');geographic();specific(old);loaded=true;loadedIdentity=who;
      updated=new Intl.DateTimeFormat('es-PE',{hour:'2-digit',minute:'2-digit',timeZone:'America/Lima'}).format(new Date());$('[data-updated]').textContent=`Actualizado a las ${updated} · hora de Lima`;render();
    }catch(e){if(alive()){$('.dash-status').textContent=`No se pudieron cargar los datos. ${e.message||'Intente actualizar.'}`;$('[data-updated]').textContent='Consulta no completada';}}
    finally{if(token===turn)root.removeAttribute('aria-busy');}
  }
  function card(title,subtitle){const a=make('article',null,'dash-card'),h=make('header'),d=make('div');d.append(make('h3',title),make('p',subtitle));h.append(d);a.append(h);return a;}
  function empty(host,message='Sin registros para esta selección.'){host.append(make('div',message,'dash-empty'));}
  function bars(host,items,total,onClick,limit=8){
    if(!items.length)return empty(host);
    const max=Math.max(1,...items.map(x=>x.count));
    for(const item of items.slice(0,limit)){const b=make(onClick?'button':'div',null,'dash-bar-row');if(onClick){b.type='button';b.addEventListener('click',()=>onClick(item.label));}const l=make('span',item.label,'dash-bar-label'),n=make('span',`${fmt(item.count)} · ${pct(item.count,total)}`,'dash-bar-number'),t=make('span',null,'dash-bar-track'),fill=make('i');fill.style.width=`${item.count/max*100}%`;t.append(fill);b.title=`${item.label}: ${fmt(item.count)} registros (${pct(item.count,total)})`;b.append(l,n,t);host.append(b);}
    if(items.length>limit)host.append(make('p',`Se muestran los ${limit} principales de ${items.length} grupos. Los porcentajes usan todos los registros filtrados.`,'dash-footnote'));
  }
  function apply(){if(!$('form').reportValidity())return;render();}
  function selectFacet(key,label){const input=$(`[data-facet="${key}"]`);if(input){input.value=label==='Sin registrar'?'__missing__':label;apply();}}
  function chips(f){const host=$('[data-chips]');host.replaceChildren();for(const input of $('form').querySelectorAll('input,select'))if(input.name!=='category'&&input.value){const label=input.closest('label')?.firstChild?.textContent||input.name,b=make('button',`${label}: ${input.selectedOptions?.[0]?.textContent||input.value} ×`,'dash-chip');b.type='button';b.addEventListener('click',()=>{input.value='';if(['department','province'].includes(input.name))geographic();apply();});host.append(b);}if(!host.children.length)host.append(make('span','Todos los registros autorizados de esta categoría.','dash-filter-hint'));}
  function trend(f){
    const host=$('[data-trend]');host.replaceChildren();const items=M.timeline(filtered,grain,f.from,f.to);
    if(!items.length)return empty(host,'No hay registros con fecha para graficar.');
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 760 240');svg.setAttribute('role','img');svg.setAttribute('aria-label','Evolución temporal del número de registros');svg.classList.add('dash-line-chart');
    const node=(tag,attrs,text)=>{const n=document.createElementNS(ns,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text)n.textContent=text;return n;};
    const max=Math.max(1,...items.map(x=>x.count)),step=660/Math.max(1,items.length-1),x=i=>items.length===1?380:60+i*step,y=n=>190-n/max*150;
    for(let i=0;i<=3;i++){const yy=190-i*50;svg.append(node('line',{x1:55,x2:725,y1:yy,y2:yy,stroke:'#e6ecf1'}),node('text',{x:44,y:yy+4,'text-anchor':'end',fill:'#758697','font-size':11},fmt(max*i/3)));}
    const points=items.map((d,i)=>`${x(i)},${y(d.count)}`).join(' ');
    svg.append(node('polygon',{points:`${x(0)},190 ${points} ${x(items.length-1)},190`,fill:'#e1e9f0',opacity:'.7'}),node('polyline',{points,fill:'none',stroke:'#426580','stroke-width':3,'stroke-linejoin':'round'}));
    const tooltip=make('p','Pase el cursor o use Tab sobre un punto para ver el valor.','dash-chart-caption');
    items.forEach((d,i)=>{const dot=node('circle',{cx:x(i),cy:y(d.count),r:items.length>80?2:5,fill:'#fff',stroke:'#426580','stroke-width':2,tabindex:0,role:'img','aria-label':`${d.label}: ${d.count} registros`});dot.append(node('title',{},`${d.label} · ${fmt(d.count)} registros`));const show=()=>tooltip.textContent=`${d.label}: ${fmt(d.count)} registros · ${pct(d.count,filtered.length)} del total filtrado`;dot.addEventListener('mouseenter',show);dot.addEventListener('focus',show);svg.append(dot);if(i===0||i===items.length-1||i%Math.max(1,Math.ceil(items.length/6))===0)svg.append(node('text',{x:x(i),y:218,'text-anchor':'middle',fill:'#758697','font-size':11},d.label));});host.append(svg,tooltip);
    const missing=filtered.filter(r=>!r.date).length;if(missing)host.append(make('p',`${fmt(missing)} registros sin fecha no aparecen en la evolución.`,'dash-footnote'));
  }
  function composition(){const host=$('[data-profile]');host.replaceChildren();const c=cat();
    if(c.id==='dinero'){const a=card('Importes por moneda','Montos independientes, sin conversión de divisas.');const selected=filters().currency;for(const [key,label]of M.amounts){if(selected&&selected!==key)continue;const row=make('div',null,'dash-currency');row.append(make('span',label),make('strong',fmt(filtered.reduce((n,r)=>n+Math.round(Number(r.data[key]||0)*100),0)/100)));a.append(row);}if(!selected||selected==='dinero_otro')a.append(make('p',`${filtered.filter(r=>M.clean(r.data.dinero_otro)).length} registros con otra moneda declarada. Consulte el detalle para conocer el importe.`,'dash-footnote'));host.append(a);}
    const facets=M.facets(c).slice(0,3);for(const f of facets){const a=card(`Por ${f.label.toLocaleLowerCase('es')}`,'Seleccione una categoría del gráfico para filtrar.');const items=M.group(filtered,r=>r.data[f.key]);if(f.key==='genero'&&items.length&&items.length<=6)donut(a,items,f.key);else bars(a,items,filtered.length,label=>selectFacet(f.key,label));host.append(a);}
    if(c.fields.some(f=>f.key==='edad')){const a=card('Distribución por edad','Rangos de edad declarada; los vacíos no cuentan como cero.');bars(a,M.group(filtered,M.ageBand),filtered.length,null);host.append(a);}
    if(!host.children.length){const a=card('Por lugar de intervención','Distribución de los registros seleccionados.');bars(a,M.group(filtered,r=>M.geo(r).district),filtered.length,null);host.append(a);}
  }
  function donut(host,items,key){const colors=['#426580','#b99b60','#91a8ba','#6e879b','#c8b88f','#bcc8d2'],wrap=make('div',null,'dash-donut-wrap'),ring=make('div',null,'dash-donut'),center=make('div');let offset=0;ring.style.background=`conic-gradient(${items.map((x,i)=>{const start=offset;offset+=x.count/filtered.length*100;return `${colors[i]} ${start}% ${offset}%`;}).join(',')})`;ring.setAttribute('role','img');ring.setAttribute('aria-label',items.map(x=>`${x.label}: ${pct(x.count,filtered.length)}`).join('; '));center.append(make('strong',fmt(filtered.length)),make('small','REGISTROS'));ring.append(center);const legend=make('div',null,'dash-donut-legend');items.forEach((x,i)=>{const b=make('button');b.type='button';b.title=`${x.label}: ${fmt(x.count)} registros`;const dot=make('i');dot.style.background=colors[i];b.append(dot,make('span',x.label),make('strong',pct(x.count,filtered.length)));b.addEventListener('click',()=>selectFacet(key,x.label));legend.append(b);});wrap.append(ring,legend);host.append(wrap);}
  async function drawMap(){const version=++mapTurn,total=filtered.length,f=filters();
    const level=f.province?'district':f.department?'province':'department';
    const urls={department:'departamentos',province:'provincias',district:'distritos'};
    const names={department:'Departamentos',province:'Provincias',district:'Distritos'};
    try{
      if(!window.L)throw Error('El visor cartográfico no está disponible.');
      geometry ||= {};
      if(!geometry[level]){const response=await fetch('frontend/assets/maps/'+urls[level]+'.geojson');if(!response.ok)throw Error('No se pudo cargar la cartografía.');geometry[level]=await response.json();}
      if(version!==mapTurn||!loaded||identity()!==loadedIdentity)return;
      let features=geometry[level].features.filter(feature=>{const p=feature.properties;return level==='department'||(M.norm(level==='province'?p.FIRST_NOMB:p.NOMBDEP)===M.norm(f.department)&&(level!=='district'||M.norm(p.NOMBPROV)===M.norm(f.province)));});
      const nameOf=feature=>feature.properties[{department:'NOMBDEP',province:'NOMBPROV',district:'NOMBDIST'}[level]];
      const counts=new Map(M.group(filtered,r=>M.geo(r)[level]).map(x=>[M.norm(x.label),x.count]));
      if(!map){map=L.map('executiveMap',{attributionControl:false,scrollWheelZoom:false,minZoom:4,maxZoom:15,zoomSnap:.25});mapResize=new ResizeObserver(()=>{if(!map)return;map.invalidateSize();if(layer&&layer.getBounds().isValid())map.fitBounds(layer.getBounds(),{padding:[30,30],maxZoom:14,animate:false});});mapResize.observe(map.getContainer());}
      if(layer)layer.remove();layer=L.featureGroup().addTo(map);
      const info=$('[data-map-hover]');info.textContent=`${names[level]} de ${f.province||f.department||'Perú'} · ${fmt(total)} registros. Seleccione un territorio para explorar.`;
      $('[data-map-back]').hidden=level==='department';$('[data-map-back]').textContent=level==='district'?'← Volver a '+f.department:'← Volver al Perú';
      $('[data-map-title]').textContent='Distribución por '+({department:'departamento',province:'provincia',district:'distrito'})[level];
      $('[data-map-place]').textContent=f.province||f.department||'PERÚ';
      const color=n=>!n?'#e7ecef':n/Math.max(total,1)<.05?'#66c99a':n/total<.1?'#c7dd77':n/total<.2?'#f4ba58':'#e87770';
      const geoLayer=L.geoJSON({type:'FeatureCollection',features},{interactive:true,style:feature=>({fillColor:color(counts.get(M.norm(nameOf(feature)))||0),color:'#fff',weight:1.4,fillOpacity:.95}),onEachFeature:(feature,shape)=>{
        const name=nameOf(feature),n=counts.get(M.norm(name))||0,tip=make('div',null,'dash-map-tip');tip.append(make('strong',name),make('span',`${fmt(n)} registros · ${pct(n,total)}`));shape.bindTooltip(tip,{sticky:true,className:'dash-region-tooltip',opacity:1});
        const show=()=>{shape.setStyle({weight:3,color:'#274c55'});info.textContent=`${name} · ${fmt(n)} registros · ${pct(n,total)} del total seleccionado`;};
        const hide=()=>{shape.setStyle({weight:1.4,color:'#fff'});shape.closeTooltip();};
        const select=()=>{const control=$(`[name="${level}"]`);let option=[...control.options].find(o=>M.norm(o.value)===M.norm(name));if(!option){option=new Option(name,name);control.add(option);}control.value=option.value;
          if(level==='department'){ $('[name="province"]').value='';$('[name="district"]').value=''; }
          if(level==='province')$('[name="district"]').value='';
          geographic();apply();
        };
        shape.on('click',select);shape.on('mouseover',show);shape.on('mouseout',hide);
        shape.on('add',()=>{const path=shape.getElement();if(path){path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',`${name}: ${n} registros, ${pct(n,total)}. Explorar ${level==='department'?'provincias':level==='province'?'distritos':'distrito'}`);path.style.pointerEvents='auto';path.addEventListener('focus',()=>{show();shape.openTooltip(shape.getBounds().getCenter());});path.addEventListener('blur',hide);path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}});}});
        const label=make('div',null,'dash-territory-label');label.append(make('span',name),make('strong',pct(n,total)));
        L.marker(shape.getBounds().getCenter(),{interactive:false,keyboard:false,icon:L.divIcon({className:'dash-territory-marker',html:label,iconSize:[86,34],iconAnchor:[43,17]})}).addTo(layer);
      }}).addTo(layer);
      map.invalidateSize({pan:false});
      const bounds=f.district&&level==='district'?L.geoJSON(features.filter(x=>M.norm(nameOf(x))===M.norm(f.district))).getBounds():geoLayer.getBounds();
      if(bounds.isValid())map.fitBounds(bounds,{padding:[30,30],maxZoom:level==='department'?6:level==='province'?10:14,animate:true,duration:.5});
      const recognized=new Set(features.map(x=>M.norm(nameOf(x)))),located=filtered.filter(r=>recognized.has(M.norm(M.geo(r)[level]))).length;
      $('[data-map-note]').textContent=`${fmt(located)} de ${fmt(total)} registros ubicados en este nivel. ${fmt(total-located)} sin ubicación cartográfica reconocida. Porcentajes sobre el total filtrado; los colores indican participación, no riesgo.`;
      if(!features.length)info.textContent='No hay cartografía disponible para esta selección. Use Volver para cambiar de territorio.';
    }catch(e){if(version===mapTurn)$('[data-map-note]').textContent=e.message;}
  }
  function render(){
    if(!loaded||loadedIdentity!==identity())return;
    const f=filters(),c=cat();clearVisuals();
    if(f.from&&f.to&&f.from>f.to){$('.dash-status').textContent='La fecha inicial no puede ser posterior a la fecha final.';return;}
    if(f.ageMin!==undefined&&f.ageMin!==''&&f.ageMax!==''&&Number(f.ageMin)>Number(f.ageMax)){$('.dash-status').textContent='La edad mínima no puede ser mayor que la edad máxima.';return;}
    filtered=M.filter(rows,f);chips(f);$('[data-category-title]').textContent=c.title;$('[data-records]').disabled=false;
    $('.dash-status').textContent=`${fmt(filtered.length)} de ${fmt(rows.length)} registros autorizados coinciden con su selección.${filtered.length?'':' No hay resultados con estos filtros.'}`;
    const symbols=['▤','↗','⌂','∑','∑','∑'];M.totals(filtered,c,f).forEach(([label,n],i)=>{const a=make('article',null,`dash-kpi ${i===0?'dash-kpi-main':''}`);a.append(make('span',symbols[i]||'∑','dash-kpi-icon'),make('span',label,'dash-kpi-label'),make('strong',fmt(n)));$('[data-kpis]').append(a);});
    trend(f);composition();
    const territories=M.group(filtered,r=>M.geo(r).department),top=territories.filter(x=>x.label!=='Sin registrar')[0],dated=filtered.filter(r=>r.date),dates=dated.map(r=>r.date).sort();
    const brief=$('[data-brief]');for(const [label,text]of [['CONCENTRACIÓN',top?`${top.label} reúne el ${pct(top.count,filtered.length)} de los registros.`:'Sin ubicación suficiente para identificar una concentración.'],['COBERTURA',`${new Set(filtered.map(r=>r.unit).filter(Boolean)).size} dependencias con registros en esta selección.`],['PERIODO OBSERVADO',dates.length?`${dates[0].slice(0,10)} al ${dates.at(-1).slice(0,10)}`:'Sin fechas registradas.']]){const d=make('div');d.append(make('small',label),make('p',text));brief.append(d);}
    const level=f.province?'district':f.department?'province':'department';$('[data-territory-level]').textContent=`${({department:'Departamentos',province:'Provincias',district:'Distritos'})[level]} · participación sobre ${fmt(filtered.length)} registros`;
    bars($('[data-territory-ranking]'),M.group(filtered,r=>M.geo(r)[level]),filtered.length,label=>{if(label==='Sin registrar')return;const select=$(`[name="${level}"]`);if([...select.options].some(o=>o.value===label)){select.value=label;geographic();apply();}},10);
    bars($('[data-units]'),M.group(filtered,r=>r.unit),filtered.length,label=>{$('[name="unit"]').value=label;apply();},12);drawMap();
  }
  $('form').addEventListener('submit',e=>{e.preventDefault();apply();});
  $('form').addEventListener('change',e=>{if(e.target.name==='category'){for(const n of ['province','district'])$(`[name="${n}"]`).value='';specific();load();return;}if(e.target.name==='department'){$('[name="province"]').value='';$('[name="district"]').value='';}if(e.target.name==='province')$('[name="district"]').value='';if(['department','province'].includes(e.target.name))geographic();apply();});
  $('[data-refresh]').addEventListener('click',load);
  $('[data-clear]').addEventListener('click',()=>{const id=cat().id;$('form').reset();$('[name="category"]').value=id;geographic();specific();apply();});
  $('[data-map-back]').addEventListener('click',()=>{if(v('province')){$('[name="province"]').value='';$('[name="district"]').value='';}else{for(const k of ['department','province','district'])$(`[name="${k}"]`).value='';}geographic();apply();});
  $('[data-peru]').addEventListener('click',()=>{for(const k of ['department','province','district'])$(`[name="${k}"]`).value='';geographic();apply();if(map)map.fitBounds([[-18.5,-81.5],[0,-68.5]]);});
  for(const button of root.querySelectorAll('[data-grain]'))button.addEventListener('click',()=>{grain=button.dataset.grain;root.querySelectorAll('[data-grain]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(loaded)trend(filters());});
  $('[data-records]').addEventListener('click',()=>{if(loaded&&identity()===loadedIdentity)window.openConsultaFromDashboard?.(cat().id,filters());});
  window.loadGeneralDashboard=load;
  window.resetExecutiveDashboard=()=>{turn++;loaded=false;loadedIdentity='';rows=[];clearVisuals();$('form').reset();$('[name="category"]').value='detenidos';options($('[name="unit"]'),[],'Todas las autorizadas');geographic();specific();$('.dash-status').textContent='';$('[data-scope]').textContent='';$('[data-chips]').replaceChildren();$('[data-updated]').textContent='Consulta según permisos de su cuenta';if(map){mapResize?.disconnect();mapResize=null;map.remove();map=null;}root.removeAttribute('aria-busy');};
  geographic();specific();if(currentProfile?.activo&&root.classList.contains('active'))load();
})();