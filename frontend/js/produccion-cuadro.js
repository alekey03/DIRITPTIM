// Cuadro de producción por dependencia para presentaciones. Usa los mismos registros
// autorizados que el resumen; Supabase sigue aplicando los permisos de la cuenta.
(() => {
 const Q=window.ConsultaModelo,root=document.getElementById('generalDashboardView');if(!Q||!root)return;
 const cats=new Map(Q.categories().map(c=>[c.id,c]));
 const el=(tag,text,cls)=>{const x=document.createElement(tag);if(text!=null)x.textContent=text;if(cls)x.className=cls;return x;};
 const norm=v=>String(v??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().trim();
 const num=v=>{if(v==null||v==='')return null;const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;};
 const fmt=n=>new Intl.NumberFormat('es-PE',{maximumFractionDigits:2}).format(n);
 const money=(n,symbol)=>symbol+' '+new Intl.NumberFormat('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
 const dmy=d=>d?d.split('-').reverse().join('/'):'';
 const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima'}).format(new Date());

 // Nacionalidad y edad: lo que no se puede clasificar va a "Sin dato" para que la suma cuadre.
 const peru=r=>{const n=norm(r.data.nacionalidad);return n?/^PERU(ANO|ANA)?$/.test(n):null;};
 const minor=r=>{const n=num(r.data.edad);return n==null?null:n<18;};
 const motive=r=>{const m=norm(r.data.motivo_detencion);return m.includes('FLAGRAN')?'flagrancia':m.includes('PRELIMINAR')?'preliminar':'otro';};
 // Toda víctima no registrada como rescatada se informa como presunta víctima.
 const rescued=r=>norm(r.data.situacion).includes('RESCATAD');
 const qty=r=>num(r.data.cantidad)??0;
 const nat=[{label:'Nacionales',test:r=>peru(r)===true},{label:'Extranjeros',test:r=>peru(r)===false}];
 const natAge=[{label:'Nacionales menores de edad',test:r=>peru(r)===true&&minor(r)===true},{label:'Nacionales mayores de edad',test:r=>peru(r)===true&&minor(r)===false},{label:'Extranjeros menores de edad',test:r=>peru(r)===false&&minor(r)===true},{label:'Extranjeros mayores de edad',test:r=>peru(r)===false&&minor(r)===false}];
 const items=[
  {id:'mega',title:'Megaoperativos',cat:'megaoperativos',color:'#fff1c2'},
  {id:'operativos',title:'Operativos',cat:'operativos',color:'#ffc857'},
  {id:'bandas',title:'Bandas criminales desarticuladas',cat:'banda',color:'#e25b5b',ink:'#fff'},
  {id:'organizaciones',title:'Organizaciones criminales desarticuladas',cat:'organizacion',color:'#b3261e',ink:'#fff'},
  {id:'rq',title:'Requisitoriados',cat:'rq',cols:nat,color:'#e6d7bf'},
  {id:'flagrancia',title:'Personas detenidas en flagrancia',cat:'detenidos',where:r=>motive(r)==='flagrancia',cols:nat,color:'#e6d7bf'},
  {id:'preliminar',title:'Personas detenidas por detención preliminar',cat:'detenidos',where:r=>motive(r)==='preliminar',cols:nat,color:'#e6d7bf'},
  {id:'detenidos_otro',title:'Personas detenidas · otro motivo o sin registrar',cat:'detenidos',where:r=>motive(r)==='otro',cols:nat,color:'#efe5d4'},
  {id:'menores',title:'Retenidos (menores de edad)',cat:'menores',cols:nat,color:'#e6d7bf'},
  {id:'rescatadas',title:'Víctimas rescatadas por el delito contra la dignidad humana',cat:'victimas',where:rescued,cols:natAge,color:'#fff3a8'},
  {id:'presuntas',title:'Presuntas víctimas del delito contra la dignidad humana',cat:'victimas',where:r=>!rescued(r),cols:natAge,color:'#fff3a8'},
  {id:'proxenetismo',title:'Proxenetismo (agraviadas)',cat:'prostitucion',cols:nat,color:'#f6b3c6'},
  {id:'ubicadas',title:'Personas ubicadas',cat:'personas_ubicadas',color:'#97497a',ink:'#fff'},
  {id:'migraciones',title:'Intervenidos extranjeros (Ley de Migraciones)',cat:'migraciones',color:'#fde1c6'},
  {id:'expulsados',title:'Extranjeros expulsados',cat:'expulsados',color:'#fff1c2'},
  {id:'veh_mayor',title:'Vehículos mayores incautados',cat:'intervencion_vehiculos_mayor',color:'#c6d7f3'},
  {id:'veh_menor',title:'Vehículos menores incautados',cat:'intervencion_vehiculos_menor',color:'#c6d7f3'},
  {id:'celulares',title:'Celulares incautados',cat:'celulares',measure:qty,color:'#f19494'},
  {id:'armas',title:'Armas',cols:[{label:'De fuego',cat:'intervencion_materiales_fuego'},{label:'Blancas',cat:'intervencion_materiales_blanca'}],color:'#b5d9a4'},
  {id:'explosivos',title:'Explosivos',cat:'intervencion_materiales_explosivo',measure:qty,color:'#fff1c2'},
  {id:'dinero',title:'Dinero incautado',cat:'dinero',cols:[{label:'Soles',measure:r=>num(r.data.soles)??0,money:'S/'},{label:'Dólares',measure:r=>num(r.data.dolares)??0,money:'US$'},{label:'Euros',measure:r=>num(r.data.euros)??0,money:'€',optional:true}],color:'#d9d0ee'},
  {id:'municiones',title:'Municiones',cat:'intervencion_materiales_municion',measure:qty,color:'#d7ead0',extra:true},
  {id:'drogas_kg',title:'Drogas (kg)',cols:['kg_pbc','kg_cc','kg_marihuana','kg_opio','kg_sintetica'].map(cat=>({label:cats.get(cat)?.title.replace(' · kg','')||cat,cat,measure:qty})),color:'#cfe3e8',extra:true},
  {id:'drogas_env',title:'Drogas (envoltorios)',cols:['env_pbc','env_cc','env_marihuana'].map(cat=>({label:cats.get(cat)?.title.replace(' · envoltorios','')||cat,cat,measure:qty})),color:'#cfe3e8',extra:true},
  {id:'chips',title:'Chips incautados',cat:'chips',measure:qty,color:'#f7c6c6',extra:true},
  {id:'locales',title:'Locales intervenidos',cat:'locales',color:'#e8dcc8',extra:true},
  {id:'maquinaria',title:'Maquinaria incautada',cat:'intervencion_vehiculos_maquinaria',color:'#c6d7f3',extra:true},
  {id:'desaparecidos',title:'Denuncias de desaparición',cat:'desaparecidos',color:'#e3d6ec',extra:true}
 ];
 const defaults=items.filter(i=>!i.extra).map(i=>i.id);
 const memory={get(k,f){try{const v=localStorage.getItem('diritptim.cuadro.'+k);return v==null?f:JSON.parse(v);}catch{return f;}},set(k,v){try{localStorage.setItem('diritptim.cuadro.'+k,JSON.stringify(v));}catch{}}};

 const section=el('section',null,'dash-section prod-cuadro');section.id='produccionCuadro';section.setAttribute('aria-label','Cuadro de producción por dependencia');
 section.innerHTML='<header class="prod-heading"><div><span class="dash-eyebrow">CUADRO DE PRODUCCIÓN</span><h3>Producción policial por dependencia</h3><p>Elija el periodo, las dependencias y los ítems. El cuadro suma la producción registrada y el botón exporta solo este cuadro.</p></div><button type="button" class="primary" data-pc-export>⇩ Exportar cuadro en PDF</button></header>'
  +'<div class="prod-filters"><fieldset class="prod-period"><legend>Periodo</legend><label>Desde<input type="date" data-pc-from></label><label>Hasta<input type="date" data-pc-to></label><div class="prod-quick"><button type="button" data-range="mes">Mes actual</button><button type="button" data-range="anterior">Mes anterior</button><button type="button" data-range="anio">Año actual</button></div></fieldset>'
  +'<fieldset class="prod-units"><legend>Dependencias <small data-pc-units-count></small></legend><div class="prod-quick"><button type="button" data-units="all">Todas</button><button type="button" data-units="SEDE_CENTRAL">Sede central</button><button type="button" data-units="DESCONCENTRADO">Desconcentradas</button><button type="button" data-units="none">Ninguna</button></div><div class="prod-checks" data-pc-units></div></fieldset>'
  +'<fieldset class="prod-items"><legend>Ítems del cuadro <small data-pc-items-count></small></legend><div class="prod-quick"><button type="button" data-items="default">Cuadro habitual</button><button type="button" data-items="all">Todos</button><button type="button" data-items="none">Ninguno</button><label class="prod-toggle"><input type="checkbox" data-pc-hide-empty> Ocultar ítems sin producción</label></div><div class="prod-checks" data-pc-items></div></fieldset></div>'
  +'<div class="prod-sheet"><div class="prod-sheet-title"><img src="frontend/assets/logo-diriptim.png" alt="" width="46" height="46"><div><small>DIRITPTIM · PNP</small><strong data-pc-title>PRODUCCIÓN POLICIAL</strong></div></div><div class="prod-table-wrap" data-pc-table></div></div>'
  +'<p class="prod-status" role="status" data-pc-status>Consultando la producción autorizada…</p>';
 root.append(section);
 const $=s=>section.querySelector(s);

 // Filtros
 const from=$('[data-pc-from]'),to=$('[data-pc-to]'),hideEmpty=$('[data-pc-hide-empty]');
 function setRange(kind){const t=today(),[y,m]=t.split('-').map(Number);
  if(kind==='mes'){from.value=`${y}-${String(m).padStart(2,'0')}-01`;to.value=t;}
  if(kind==='anterior'){const py=m===1?y-1:y,pm=m===1?12:m-1,last=new Date(Date.UTC(py,pm,0)).getUTCDate();from.value=`${py}-${String(pm).padStart(2,'0')}-01`;to.value=`${py}-${String(pm).padStart(2,'0')}-${last}`;}
  if(kind==='anio'){from.value=`${y}-01-01`;to.value=t;}
 }
 setRange('mes');
 let chosenItems=new Set(memory.get('items',defaults).filter(id=>items.some(i=>i.id===id)));hideEmpty.checked=!!memory.get('ocultar',false);
 const itemBox=$('[data-pc-items]');
 for(const item of items){const l=el('label');const i=el('input');i.type='checkbox';i.value=item.id;i.checked=chosenItems.has(item.id);const sw=el('i');sw.style.background=item.color;l.append(i,sw,el('span',item.title));itemBox.append(l);}
 const institutional=typeof DEPENDENCIAS_INSTITUCIONALES==='undefined'?[]:DEPENDENCIAS_INSTITUCIONALES;
 const ambito=new Map(institutional.map(d=>[d.unidad,d.ambito]));
 let knownUnits=[],chosenUnits=null;

 // Se normaliza una vez por carga de datos: cada recarga del resumen trae arreglos nuevos.
 const normalized=new WeakMap();
 function base(id){
  const data=window.getProductionData?.(),c=cats.get(id);
  if(!data||!c||data.failedTables.has(c.table)||!data.cache.has(c.table))return null;
  const records=data.cache.get(c.table);let byCat=normalized.get(records);if(!byCat){byCat=new Map();normalized.set(records,byCat);}
  if(!byCat.has(id)){const parents=new Map((data.cache.get('intervenciones')||[]).map(r=>[r.id,r]));byCat.set(id,(c.type?records.filter(r=>r.tipo===c.type):records).map(r=>Q.normalize(r,c,parents)));}
  return byCat.get(id);
 }
 function rowsFor(id,units,a,b){
  const rows=base(id);if(!rows)return null;
  return rows.filter(r=>{const d=String(r.date||'').slice(0,10);return (!units||units.has(r.unit))&&(!a||(d&&d>=a))&&(!b||(d&&d<=b));});
 }
 function allUnits(){
  const found=new Set();for(const item of items)for(const id of item.cols?item.cols.map(c=>c.cat||item.cat):[item.cat])for(const r of rowsFor(id)||[])if(r.unit)found.add(r.unit);
  const order=institutional.map(d=>d.unidad);
  return [...new Set([...order.filter(u=>found.has(u)),...[...found].filter(u=>!order.includes(u)).sort((a,b)=>a.localeCompare(b,'es'))])];
 }
 function renderUnits(){
  const units=allUnits();if(units.join('|')===knownUnits.join('|'))return;
  const fresh=units.filter(u=>!knownUnits.includes(u));knownUnits=units;
  if(!chosenUnits)chosenUnits=new Set(units);else fresh.forEach(u=>chosenUnits.add(u));
  const box=$('[data-pc-units]');box.replaceChildren();
  for(const u of units){const l=el('label'),i=el('input');i.type='checkbox';i.value=u;i.checked=chosenUnits.has(u);l.append(i,el('span',u));box.append(l);}
  if(!units.length)box.append(el('p','Sin dependencias con producción registrada.','prod-empty'));
 }

 // Cálculo: cada columna suma por dependencia; "Sin dato" recoge lo no clasificable.
 function compute(units){
  const a=from.value,b=to.value,set=new Set(units),out=[];
  for(const item of items.filter(i=>chosenItems.has(i.id))){
   const cols=(item.cols||[{label:null}]).map(c=>({...c,cat:c.cat||item.cat,measure:c.measure||item.measure||(()=>1)}));
   const split=cols.some(c=>c.test);if(split)cols.push({label:'Sin dato',cat:item.cat,measure:item.measure||(()=>1),leftover:true,optional:true});
   let failed=false;
   const result=cols.map(c=>{const rows=rowsFor(c.cat,set,a,b);if(!rows){failed=true;return {...c,values:new Map(),total:0};}
    const values=new Map(units.map(u=>[u,0]));
    for(const r of rows){if(item.where&&!item.where(r))continue;if(c.test&&!c.test(r))continue;if(c.leftover&&cols.some(o=>o.test&&o.test(r)))continue;values.set(r.unit,(values.get(r.unit)||0)+c.measure(r));}
    return {...c,values,total:[...values.values()].reduce((s,n)=>s+n,0)};});
   const shown=result.filter(c=>!c.optional||c.total>0);
   if(hideEmpty.checked&&!failed&&shown.every(c=>c.total===0))continue;
   out.push({item,cols:shown,failed});
  }
  return out;
 }
 function cell(c,v,failed,tag='td'){const td=el(tag,failed?'—':c.money?money(v,c.money):fmt(v));if(failed)td.className='na';else if(v>0)td.className='pos';return td;}
 function renderTable(){
  const host=$('[data-pc-table]'),status=$('[data-pc-status]'),data=window.getProductionData?.();
  $('[data-pc-units-count]').textContent=chosenUnits?`(${[...chosenUnits].filter(u=>knownUnits.includes(u)).length} de ${knownUnits.length})`:'';
  $('[data-pc-items-count]').textContent=`(${chosenItems.size} de ${items.length})`;
  const a=from.value,b=to.value;
  $('[data-pc-title]').textContent=a&&b?`PRODUCCIÓN POLICIAL DEL ${dmy(a)} AL ${dmy(b)}`:'PRODUCCIÓN POLICIAL';
  host.replaceChildren();
  if(!data?.cache.size){status.textContent=typeof currentProfile!=='undefined'&&currentProfile?.activo?'Consultando la producción autorizada…':'Inicie sesión para consultar la producción de su ámbito.';return;}
  if(!a||!b||a>b){status.textContent='Indique un periodo válido: la fecha inicial no puede ser posterior a la final.';return;}
  const units=knownUnits.filter(u=>chosenUnits?.has(u));
  if(!units.length){status.textContent='Seleccione al menos una dependencia.';return;}
  const groups=compute(units);
  if(!groups.length){status.textContent=chosenItems.size?'Ningún ítem seleccionado tiene producción en este periodo.':'Seleccione al menos un ítem.';return;}
  const table=el('table',null,'prod-table'),thead=el('thead'),h1=el('tr'),h2=el('tr');
  const corner=el('th','DIRITPTIM','pc-brand');corner.colSpan=2;corner.rowSpan=2;h1.append(corner);
  for(const g of groups){
   const ink=g.item.ink||'#1f2f3d',paint=th=>{th.style.background=g.item.color;th.style.color=ink;return th;};
   if(g.cols.length===1&&!g.cols[0].label){const th=paint(el('th',null,'pc-single'));th.rowSpan=2;th.append(el('span',g.item.title,'v'));h1.append(th);continue;}
   const th=paint(el('th',g.item.title,'pc-group'));th.colSpan=g.cols.length;h1.append(th);
   for(const c of g.cols){const sub=paint(el('th',null,'pc-sub'));sub.append(el('span',c.label,'v'));h2.append(sub);}
  }
  thead.append(h1,h2);table.append(thead);
  const body=el('tbody');
  units.forEach((u,i)=>{const tr=el('tr');tr.append(el('td',String(i+1),'pc-n'),el('td',u,'pc-name'));for(const g of groups)for(const c of g.cols)tr.append(cell(c,c.values.get(u)||0,g.failed));body.append(tr);});
  table.append(body);
  if(units.length>1){const foot=el('tfoot'),tr=el('tr'),label=el('td','TOTAL','pc-total');label.colSpan=2;tr.append(label);for(const g of groups)for(const c of g.cols)tr.append(cell(c,c.total,g.failed));foot.append(tr);table.append(foot);}
  host.append(table);
  const failed=groups.filter(g=>g.failed).length;
  status.textContent=(failed?'Algunos ítems no pudieron consultarse y se muestran como —, no como cero. ':'')+`${units.length} dependencia${units.length===1?'':'s'} · ${groups.length} ítem${groups.length===1?'':'s'} · registros con fecha entre ${dmy(a)} y ${dmy(b)}. Incluye producción guardada e histórica.`;
 }
 function render(){renderUnits();renderTable();}

 // Exportación: solo el cuadro, en hoja horizontal.
 function exportPdf(){
  const table=$('[data-pc-table] table');if(!table){$('[data-pc-status]').textContent='Arme el cuadro antes de exportarlo.';return;}
  const columns=table.querySelectorAll('tbody tr:first-child td').length;
  const dialog=el('dialog');dialog.className='prod-preview';dialog.setAttribute('aria-label','Vista previa del cuadro de producción');
  const close=el('button','Cerrar vista previa','secondary');close.type='button';close.onclick=()=>dialog.close();
  const frame=el('iframe');frame.title='Cuadro de producción para imprimir';dialog.append(close,frame);document.body.append(dialog);
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
  const d=frame.contentDocument,title=$('[data-pc-title]').textContent,css=document.querySelector('link[href*="produccion-cuadro.css"]')?.href;
  d.title=`DIRITPTIM - ${title}`;d.documentElement.lang='es';
  // Reduce el cuadro hasta el ancho útil de la hoja (A4 o A3 horizontal, márgenes de 8 mm).
  const sheet=columns>28?'A3':'A4',usable=(sheet==='A3'?404:281)*96/25.4;
  const base=`@page{size:${sheet} landscape;margin:8mm}`,page=d.createElement('style');page.textContent=base;d.head.append(page);
  const fit=()=>{const copy=d.querySelector('.prod-table');if(!copy)return;page.textContent=base;const width=copy.scrollWidth;page.textContent=base+`.prod-report .prod-table{zoom:${Math.min(1,usable/width).toFixed(3)}}`;};
  if(css){const link=d.createElement('link');link.rel='stylesheet';link.href=css;link.onload=fit;d.head.append(link);}
  d.body.className='prod-report';
  const controls=d.createElement('div');controls.className='prod-print-controls';
  const print=d.createElement('button');print.type='button';print.textContent='Guardar como PDF / Imprimir';print.onclick=()=>frame.contentWindow.print();
  const hint=d.createElement('span');hint.textContent='En el diálogo elija "Guardar como PDF". La hoja ya está configurada en horizontal.';controls.append(print,hint);
  const head=d.createElement('header');head.className='prod-report-head';
  const logo=d.createElement('img');logo.src=new URL('frontend/assets/logo-diriptim.png',location.href).href;logo.alt='';
  const text=d.createElement('div');text.innerHTML='<small>POLICÍA NACIONAL DEL PERÚ · DIRECCIÓN DE INVESTIGACIÓN DE TRATA DE PERSONAS Y TRÁFICO ILÍCITO DE MIGRANTES</small>';
  const h1=d.createElement('h1');h1.textContent=title;text.append(h1);head.append(logo,text);
  const foot=d.createElement('footer');foot.textContent=`FUENTE: SISTEMA DE ESTADÍSTICA DIRITPTIM · Emitido el ${new Intl.DateTimeFormat('es-PE',{dateStyle:'long',timeStyle:'short',timeZone:'America/Lima'}).format(new Date())} (hora de Lima) · Incluye producción guardada e histórica, según los permisos de la cuenta.`;
  d.body.append(controls,head,d.importNode(table,true),foot);fit();
 }

 section.addEventListener('change',e=>{
  const t=e.target;
  if(t.closest('[data-pc-items]')){t.checked?chosenItems.add(t.value):chosenItems.delete(t.value);memory.set('items',[...chosenItems]);}
  else if(t.closest('[data-pc-units]')){t.checked?chosenUnits.add(t.value):chosenUnits.delete(t.value);}
  else if(t===hideEmpty)memory.set('ocultar',hideEmpty.checked);
  renderTable();
 });
 section.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.range){setRange(b.dataset.range);renderTable();}
  if(b.dataset.units){const v=b.dataset.units;chosenUnits=new Set(v==='all'?knownUnits:v==='none'?[]:knownUnits.filter(u=>ambito.get(u)===v));section.querySelectorAll('[data-pc-units] input').forEach(i=>i.checked=chosenUnits.has(i.value));renderTable();}
  if(b.dataset.items){const v=b.dataset.items;chosenItems=new Set(v==='all'?items.map(i=>i.id):v==='none'?[]:defaults);memory.set('items',[...chosenItems]);section.querySelectorAll('[data-pc-items] input').forEach(i=>i.checked=chosenItems.has(i.value));renderTable();}
  if(b.hasAttribute('data-pc-export'))exportPdf();
 });
 window.addEventListener('produccion:datos',()=>{if(!window.getProductionData?.().cache.size){knownUnits=[];chosenUnits=null;$('[data-pc-units]').replaceChildren();}render();});
 render();
})();
