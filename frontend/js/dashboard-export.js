// Configurable, read-only reports. Queries retain the signed-in user's Supabase policies.
(() => {
  const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;return e;};
  const fmt=n=>new Intl.NumberFormat('es-PE',{maximumFractionDigits:2}).format(n);
  const colors=['#426580','#58948f','#b49a5e','#837594','#ba8078'];
  const identity=()=>JSON.stringify([currentProfile?.id,currentProfile?.rol,currentProfile?.unidad,currentProfile?.activo]);
  const svgNode=(tag,attrs,text)=>{const n=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!=null)n.textContent=text;return n;};
  function bars(host,items,total){
    if(!items.length){host.append(el('p','Sin registros para estos filtros.'));return;}
    const max=Math.max(1,...items.map(i=>i.count));
    for(const x of items.slice(0,8)){const row=el('div',null,'dash-bar-row'),track=el('span',null,'dash-bar-track'),fill=el('i');fill.style.width=`${100*x.count/max}%`;track.append(fill);row.append(el('span',x.label),el('strong',`${fmt(x.count)} · ${fmt(total?100*x.count/total:0)}%`),track);host.append(row);}
    if(items.length>8)host.append(el('p',`Ocho principales de ${items.length} grupos. Porcentajes sobre los ${fmt(total)} registros seleccionados.`,'dash-footnote'));
  }
  function ring(host,items,total){
    if(items.length<2||items.length>5)return bars(host,items,total);
    const wrap=el('div',null,'dash-donut-wrap'),svg=svgNode('svg',{viewBox:'0 0 200 200',class:'dash-ring-chart',role:'img','aria-label':'Distribución de registros'}),legend=el('div',null,'dash-donut-legend');let offset=0;const circumference=2*Math.PI*72;
    items.forEach((x,i)=>{const len=x.count/total*circumference;svg.append(svgNode('circle',{cx:100,cy:100,r:72,fill:'none',stroke:colors[i%colors.length],'stroke-width':26,'stroke-dasharray':`${Math.max(0,len-2)} ${circumference-Math.max(0,len-2)}`,'stroke-dashoffset':-offset,transform:'rotate(-90 100 100)'}));offset+=len;const row=el('div'),dot=el('i');dot.style.background=colors[i%colors.length];row.append(dot,el('span',x.label),el('strong',`${fmt(x.count)} · ${fmt(100*x.count/total)}%`));legend.append(row);});
    svg.append(svgNode('text',{x:100,y:103,'text-anchor':'middle','font-size':26,fill:'#29455c','font-weight':700},fmt(total)));wrap.append(svg,legend);host.append(wrap);
  }
  function timeline(host,rows,filters,mode){
    const M=window.DashboardModelo,items=M.timeline(rows,'month',filters.from,filters.to);
    if(!items.length){host.append(el('p','Sin fechas disponibles para la evolución.'));return;}
    const svg=svgNode('svg',{viewBox:'0 0 760 240',class:'dash-line-chart',role:'img','aria-label':'Evolución mensual: cantidad de registros'}),max=Math.max(1,...items.map(x=>x.count)),step=660/Math.max(1,items.length-1),x=i=>items.length===1?380:60+i*step,y=n=>190-150*n/max;
    for(let i=0;i<4;i++)svg.append(svgNode('line',{x1:55,x2:725,y1:190-i*50,y2:190-i*50,stroke:'#e3eaf0'}),svgNode('text',{x:48,y:194-i*50,'text-anchor':'end','font-size':11,fill:'#627789'},fmt(max*i/3)));
    if(mode==='line')svg.append(svgNode('polyline',{points:items.map((v,i)=>`${x(i)},${y(v.count)}`).join(' '),fill:'none',stroke:'#426580','stroke-width':3}));
    items.forEach((v,i)=>{if(mode==='bar'){const w=Math.min(38,step*.65);svg.append(svgNode('rect',{x:x(i)-w/2,y:y(v.count),width:w,height:190-y(v.count),rx:2,fill:v.count===max?'#b49a5e':'#58948f'}));}else svg.append(svgNode('circle',{cx:x(i),cy:y(v.count),r:3,fill:'#426580'}));if(items.length<=12)svg.append(svgNode('text',{x:x(i),y:y(v.count)-9,'text-anchor':'middle','font-size':12,fill:'#29455c'},fmt(v.count)));if(i===items.length-1||i%Math.max(1,Math.ceil(items.length/6))===0)svg.append(svgNode('text',{x:x(i),y:217,'text-anchor':'middle','font-size':11,fill:'#627789'},v.label));});host.append(svg);
    const missing=rows.filter(r=>!r.date).length;if(missing)host.append(el('p',`${fmt(missing)} registros sin fecha no aparecen en la evolución.`,'dash-footnote'));
  }
  function metric(rows,c){
    const sum=k=>rows.reduce((n,r)=>n+(Number(r.data[k])||0),0);
    if(c.id==='drogas')return [fmt(rows.length),'registros · sustancias y unidades diferentes; no se suman kg con envoltorios'];
    if(c.id==='dinero')return [`S/ ${fmt(sum('soles'))}`,`USD ${fmt(sum('dolares'))} · EUR ${fmt(sum('euros'))} · ${fmt(rows.length)} registros. Monedas independientes.`];
    if(['celulares','chips'].includes(c.id)||c.table==='intervencion_drogas'||(c.table==='intervencion_materiales'&&c.fields.some(f=>f.key==='cantidad')))return [fmt(sum('cantidad')),`${c.table==='intervencion_drogas'?(c.type?.startsWith('kg_')?'kg':'envoltorios'):'unidades'} · ${fmt(rows.length)} registros`];
    return [fmt(rows.length),c.table==='intervencion_grupos'?`grupos · ${fmt(sum('integrantes'))} vínculos de integrantes`:'registros'];
  }
  window.openDashboardExport = (dashboard,initialCategory) => {
    if(document.querySelector('[data-export-config]'))return;
    const Q=window.ConsultaModelo,M=window.DashboardModelo,cats=Q.categories(),owner=identity(),dialog=el('dialog',null,'export-config');dialog.dataset.exportConfig='';
    const alive=()=>dialog.isConnected&&owner===identity()&&currentProfile?.activo;
    const style=el('style');style.textContent='.export-config{width:min(880px,94vw);max-height:92vh;border:1px solid #cdd8e2;border-radius:16px;padding:24px;color:#294154;background:#f8fafc}.export-config::backdrop{background:#10223599}.export-config h2{font-size:22px;margin:0}.export-config header{display:flex;justify-content:space-between;gap:16px}.export-config p{font-size:13px;color:#607487}.export-config label{font-size:12px;display:flex;flex-direction:column;gap:6px}.export-config select,.export-config input[type=date]{padding:10px;border:1px solid #cdd8e2;border-radius:7px;min-width:0;background:white;color:#294154}.export-config .export-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0}.export-config fieldset{border:1px solid #dce4eb;border-radius:9px;padding:14px;margin:14px 0}.export-config legend{font-size:13px;font-weight:bold}.export-config .export-checks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;max-height:220px;overflow:auto}.export-config .export-checks label{flex-direction:row;align-items:center}.export-config input[type=checkbox]{width:17px;height:17px;min-height:0;min-width:17px;margin:0;flex:0 0 17px;accent-color:#426580}.export-config button{border:1px solid #cbd7e1;border-radius:7px;padding:10px 16px;background:white;color:#294154}.export-config button[type=submit]{background:#29475f;color:white}.export-config footer{display:flex;justify-content:flex-end;gap:10px}.export-config [hidden]{display:none!important}@media(max-width:600px){.export-config{padding:16px}.export-config .export-grid{grid-template-columns:1fr}.export-config .export-checks{grid-template-columns:1fr 1fr}}';dialog.append(style);
    const header=el('header'),title=el('h2','Preparar informe PDF'),close=el('button','Cerrar');close.type='button';close.onclick=()=>dialog.close();header.append(title,close);dialog.append(header,el('p','Elige el contenido y los filtros del informe. Estos ajustes no cambian tu dashboard.'));
    const form=el('form'),grid=el('div',null,'export-grid');form.append(grid);dialog.append(form);
    const select=(name,label,options)=>{const l=el('label',label),s=el('select');s.name=name;for(const [value,text]of options)s.add(new Option(text,value));l.append(s);grid.append(l);return s;};
    const mode=select('mode','Tipo de informe',[['detail','Detallado por ítem'],['general','General de producción']]);
    const category=select('category','Ítem a analizar',cats.map(c=>[c.id,c.title]));category.value=initialCategory;
    for(const [name,label]of [['from','Desde'],['to','Hasta']]){const l=el('label',label),i=el('input');i.type='date';i.name=name;i.value=dashboard.querySelector(`[name="${name}"]`)?.value||'';l.append(i);grid.append(l);}
    const values=selector=>[...new Set([...dashboard.querySelectorAll(selector)].map(o=>o.value).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const unit=select('unit','Dependencia',[['','Todas las autorizadas'],...values('[name="unit"] option,[data-summary-unit] option').map(v=>[v,v])]);unit.value=dashboard.querySelector('[name="unit"]')?.value||'';
    const department=select('department','Departamento del hecho',[['','Todos los departamentos'],...values('[name="department"] option').map(v=>[v,v])]);department.value=dashboard.querySelector('[name="department"]')?.value||'';
    const chart=select('chart','Evolución mensual',[['bar','Barras'],['line','Línea']]);
    const selections=el('fieldset'),legend=el('legend','Categorías del informe general'),checks=el('div',null,'export-checks');selections.append(legend,checks);selections.hidden=true;
    for(const c of cats.filter(c=>c.id!=='drogas')){const l=el('label'),i=el('input');i.type='checkbox';i.name='items';i.value=c.id;i.checked=['operativos','megaoperativos','detenidos','rq','victimas','banda','organizacion','migraciones','celulares','dinero'].includes(c.id);l.append(i,document.createTextNode(c.title));checks.append(l);}form.append(selections);
    const sections=el('fieldset');sections.append(el('legend','Contenido a incluir'));const parts=el('div',null,'export-checks');for(const [key,label]of [['totals','Cantidades'],['trend','Evolución mensual'],['territory','Distribución territorial'],['composition','Composición del ítem'],['units','Por dependencia']]){const l=el('label'),i=el('input');i.type='checkbox';i.name='parts';i.value=key;i.checked=true;l.append(i,document.createTextNode(label));parts.append(l);}sections.append(parts);form.append(sections);
    const note=el('p','Se aplican los filtros indicados aquí. Los filtros específicos de la pantalla (edad, situación, etc.) no se heredan. No se incluyen nombres ni documentos personales.');form.append(note);
    const status=el('p');status.setAttribute('role','status');const footer=el('footer'),generate=el('button','Generar vista previa');generate.type='submit';footer.append(generate);form.append(status,footer);
    mode.onchange=()=>{selections.hidden=mode.value!=='general';category.closest('label').hidden=mode.value==='general';for(const input of parts.querySelectorAll('input'))input.checked=mode.value==='detail'||['totals','trend'].includes(input.value);};
    let busy=false;
    form.onsubmit=async event=>{
      event.preventDefault();if(busy||!alive())return;
      const f={from:form.elements.from.value,to:form.elements.to.value,unit:unit.value,department:department.value};
      if(f.from&&f.to&&f.from>f.to){status.textContent='La fecha inicial no puede ser posterior a la final.';return;}
      const enabled=new Set([...parts.querySelectorAll('input:checked')].map(i=>i.value));
      const chosen=mode.value==='detail'?[cats.find(c=>c.id===category.value)]:cats.filter(c=>[...checks.querySelectorAll('input:checked')].some(i=>i.value===c.id));
      if(!chosen.length||!enabled.size){status.textContent='Selecciona al menos una categoría y un contenido.';return;}
      const reportMode=mode.value,chartStyle=chart.value;
      busy=true;generate.disabled=true;status.textContent='Consultando los registros autorizados…';
      try{
        const parents=await Q.readAll(supabaseClient,{table:'intervenciones',select:'id,fecha,unidad,departamento,provincia,distrito,nota_sicpip'},alive),parentMap=new Map(parents.map(r=>[r.id,r])),data=new Map();let cursor=0;
        async function worker(){while(cursor<chosen.length){const c=chosen[cursor++],raw=await Q.readAll(supabaseClient,c,alive);if(!alive())throw Error('La sesión cambió. Vuelve a abrir la exportación.');data.set(c.id,M.filter(raw.map(r=>Q.normalize(r,c,parentMap)),f));}}
        await Promise.all([worker(),worker(),worker()]);if(!alive())return;
        const report=el('div');report.dataset.customReport=reportMode;
        const marker=(attribute,text)=>{const n=el('p',text);n.setAttribute(attribute,'');report.append(n);};
        marker('data-scope',dashboard.querySelector('[data-scope]')?.textContent||'Ámbito autorizado');marker('data-updated','Consulta actualizada para este informe');marker('data-chips',`${f.from||'Inicio del historial'} a ${f.to||'Fin del historial'} · ${f.unit||'Todas las dependencias autorizadas'} · ${f.department||'Todos los departamentos'}`);
        const summary=el('p',`${chosen.length} categoría(s). Cada indicador conserva su unidad de medida; no se suman personas, operativos, objetos ni monedas entre sí.`,'dash-status');report.append(summary);
        for(const c of chosen){const rows=data.get(c.id),section=el('section',null,'dash-section export-category');section.append(el('h2',c.title));const [value,detail]=metric(rows,c);
          if(enabled.has('totals')){const kpis=el('div',null,'dash-kpis'),kpi=el('article',null,'dash-kpi');kpi.append(el('span',c.title),el('strong',value),el('small',detail));kpis.append(kpi);section.append(kpis);}
          if(!rows.length)section.append(el('p','Sin registros para los filtros seleccionados.'));
          else{const charts=el('div',null,'dash-profile-grid');const card=(heading,description)=>{const a=el('article');a.append(el('h3',heading));if(description)a.append(el('p',description,'dash-footnote'));charts.append(a);return a;};
            if(enabled.has('trend'))timeline(card('Evolución mensual','Cantidad de registros por mes; no equivale necesariamente a unidades o importes.'),rows,f,chartStyle);
            if(enabled.has('territory'))bars(card('Distribución por departamento'),M.group(rows,r=>M.geo(r).department),rows.length);
            if(enabled.has('units'))bars(card('Participación por dependencia'),M.group(rows,r=>r.unit),rows.length);
            if(enabled.has('composition')){if(c.id==='dinero'){const a=card('Importes por moneda','Monedas independientes, sin conversión.');for(const [key,label]of M.amounts)a.append(el('p',`${label}: ${fmt(rows.reduce((s,r)=>s+(Number(r.data[key])||0),0))}`));}
              const facets=M.facets(c).slice(0,reportMode==='general'?1:3);for(const field of facets)ring(card(`Por ${field.label.toLocaleLowerCase('es')}`),M.group(rows,r=>r.data[field.key]),rows.length);
              if(c.fields.some(x=>x.key==='edad')&&reportMode==='detail')bars(card('Distribución por edad'),M.group(rows,M.ageBand),rows.length);
              if(!facets.length&&c.id!=='dinero')ring(card('Distribución por provincia'),M.group(rows,r=>M.geo(r).province),rows.length);
            }section.append(charts);
          }report.append(section);
        }
        window.exportDashboardReport(report,reportMode==='general'?'Informe general de producción':chosen[0].title);
        status.textContent='Vista previa generada. Puedes cerrarla y ajustar estos filtros.';
      }catch(error){if(alive())status.textContent=`No se generó el informe. ${error.message||'Comprueba la conexión e intenta nuevamente.'}`;}
      finally{busy=false;generate.disabled=false;}
    };
    document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
  };
})();
