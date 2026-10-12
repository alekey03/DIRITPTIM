(() => {
  'use strict';
  // Build a frozen report from the authorized, rendered dashboard. No extra data queries.
  window.exportDashboardReport = (root, category) => {
    const dialog=document.createElement('dialog'); dialog.setAttribute('aria-label','Vista previa del informe PDF'); dialog.style.cssText='width:96vw;max-width:1300px;height:92vh;padding:12px;border:1px solid #ccd7df;border-radius:12px'; const close=document.createElement('button');close.textContent='Cerrar vista previa';close.type='button';close.style.cssText='margin-bottom:8px;padding:8px 16px';close.onclick=()=>dialog.close();dialog.append(close);const frame=document.createElement('iframe');frame.title='Informe PDF del dashboard';frame.style.cssText='width:100%;height:calc(100% - 48px);border:0';dialog.append(frame);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();const report=frame.contentWindow;
    if (!report) { dialog.close(); throw Error('No se pudo abrir la vista previa.'); }
    const d = report.document;
    d.title = `DIRITPTIM - ${category} - ${new Date().toISOString().slice(0,10)}`;
    d.documentElement.lang = 'es';
    const add = (tag, text, parent = d.body) => { const e=d.createElement(tag); if(text!=null)e.textContent=text; parent.append(e); return e; };
    const style=add('style',null,d.head);
    style.textContent=`
      @page{size:A4 landscape;margin:12mm}
      *{box-sizing:border-box}body{font:12px Arial,sans-serif;color:#24394d;margin:24px;background:white}
      h1{font-size:25px;margin:8px 0}h2,h3{font-size:16px;margin:10px 0}p{line-height:1.5}small{font-size:10px}
      .report-head{border-bottom:3px solid #b99b60;padding-bottom:12px;margin-bottom:18px}
      .report-scope{color:#52677c}.report-filters{background:#edf2f7;padding:10px;line-height:1.6}
      .report-controls{padding:12px;background:#edf2f7;margin-bottom:20px}.report-controls button{padding:10px 20px;background:#29475f;color:white;border:0;border-radius:6px;cursor:pointer}
      .dash-section{margin:18px 0}.dash-section-heading{margin-bottom:12px}.dash-eyebrow{color:#927941;font-size:10px;letter-spacing:1px}
      .dash-kpis{display:flex;gap:12px;flex-wrap:wrap}.dash-kpi{flex:1;padding:16px;background:#edf2f7;border-left:4px solid #b99b60;border-radius:8px;min-width:120px}.dash-kpi strong{display:block;font-size:28px;margin-top:10px}.dash-kpi-icon{display:none}
      .dash-overview-grid,.dash-territory-grid,.dash-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px}
      article{border:1px solid #dbe3eb;border-radius:8px;padding:16px;break-inside:avoid}.dash-brief{background:#f3f5f8}.dash-footnote{font-size:10px;color:#596b7b}.dash-chart-caption{display:none}
      svg.dash-line-chart{width:100%;height:auto}.dash-bar-row{display:grid;grid-template-columns:1fr auto;gap:6px;margin:12px 0}.dash-bar-track{grid-column:1 / -1;background:#edf2f7;height:8px;border-radius:4px}.dash-bar-track i{display:block;height:8px;background:#4f7595;border-radius:4px}.dash-bar-number{font-weight:bold}
      .dash-donut-wrap{display:flex;gap:22px;align-items:center}.dash-donut{width:135px;height:135px;border-radius:50%;display:grid;place-items:center;flex-shrink:0}.dash-donut>div{width:98px;height:98px;background:white;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center}.dash-donut strong{font-size:23px}.dash-donut-legend>div{display:flex;gap:8px;margin:12px 0}.dash-donut-legend i{width:9px;height:9px;display:inline-block}.dash-currency{display:flex;justify-content:space-between;padding:10px}
      .report-map{width:100%;height:310px}.dash-map-legend{display:flex;flex-wrap:wrap;gap:8px;font-size:10px}.dash-map-legend i{display:inline-block;width:10px;height:10px;margin-right:3px}.dash-map-hover{font-size:11px}.dash-territory-label{font-size:10px}
      footer{border-top:1px solid #ccd7df;margin-top:20px;padding-top:10px;color:#607080;font-size:10px}
      @media print{body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.report-controls{display:none}#dashTerritory,#dashProfile{break-before:page}h3,header{break-after:avoid}}
      @media screen and (max-width:700px){body{margin:12px}.dash-overview-grid,.dash-territory-grid,.dash-profile-grid{grid-template-columns:1fr}}
    `;
    const controls=add('div',null);controls.className='report-controls';
    const print=add('button','Guardar como PDF / Imprimir',controls);print.type='button';print.onclick=()=>report.print();
    add('p','En el diálogo, seleccione Guardar como PDF. El informe conserva los filtros y valores del momento de exportación.',controls);
    const head=add('header',null);head.className='report-head';add('small','ESTADÍSTICA DIRITPTIM · RESUMEN DE PRODUCCIÓN',head);add('h1',category,head);
    add('p',root.querySelector('[data-scope]')?.textContent||'',head).className='report-scope';
    add('p',`Emitido: ${new Intl.DateTimeFormat('es-PE',{dateStyle:'long',timeStyle:'short',timeZone:'America/Lima'}).format(new Date())} · Lima. ${root.querySelector('[data-updated]')?.textContent||''}`,head);
    add('div',root.querySelector('[data-chips]')?.textContent?.replaceAll(' ×','; ')||'Todos los registros autorizados.',head).className='report-filters';
    add('p',root.querySelector('.dash-status')?.textContent||'',head);
    for(const source of root.querySelectorAll(':scope > .dash-section')){
      const clone=source.cloneNode(true);
      clone.querySelectorAll('button').forEach(b=>{if(b.matches('.dash-bar-row,.dash-donut-legend button')){const div=d.createElement('div');div.className=b.className;div.append(...b.childNodes);b.replaceWith(div);}else b.remove();});
      clone.querySelectorAll('.dash-toggle,.dash-badge').forEach(e=>e.remove());
      const map=clone.querySelector('.dash-map');
      if(map){
        const original=source.querySelector('.dash-map svg');
        if(original){const svg=original.cloneNode(true);svg.removeAttribute('style');svg.removeAttribute('width');svg.removeAttribute('height');svg.classList.add('report-map');svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.querySelectorAll('[tabindex]').forEach(e=>e.removeAttribute('tabindex'));
          const box=original.getBoundingClientRect(),vb=original.viewBox.baseVal;
          if(box.width&&box.height)for(const label of source.querySelectorAll('.dash-territory-label')){
            if(getComputedStyle(label).visibility==='hidden')continue;
            const r=label.getBoundingClientRect(),text=d.createElementNS('http://www.w3.org/2000/svg','text');
            text.setAttribute('x',String(vb.x+(r.left+r.width/2-box.left)*vb.width/box.width));
            text.setAttribute('y',String(vb.y+(r.top+r.height/2-box.top)*vb.height/box.height));
            text.setAttribute('text-anchor','middle');text.setAttribute('font-size','11');text.setAttribute('fill','#24394d');text.setAttribute('stroke','white');text.setAttribute('stroke-width','2');text.setAttribute('paint-order','stroke');
            text.textContent=[...label.children].map(n=>n.textContent).join(' ');svg.append(text);
          }
          map.replaceWith(svg);}
        else map.replaceWith(d.createTextNode('Mapa no disponible en esta exportación. Consulte la participación territorial.'));
      }
      clone.querySelectorAll('[tabindex]').forEach(e=>e.removeAttribute('tabindex'));
      clone.querySelectorAll('p').forEach(p=>{p.textContent=p.textContent.replace('Toque una región para filtrar. Pase el cursor para ver su participación.','Participación territorial de los registros seleccionados.').replace('Seleccione una categoría del gráfico para filtrar.','Distribución de los registros seleccionados.').replace('Seleccione un territorio para explorar.','').replace('Se destacan los porcentajes más altos sin superponer etiquetas. Pase el cursor o pulse un territorio para ver su detalle.','Se destacan los porcentajes más altos.');});
      d.body.append(clone);
    }
    add('footer','Fuente: registros del sistema DIRITPTIM, según filtros y permisos de la cuenta. Incluye registros guardados y borradores. Los porcentajes representan participación, no tasas de criminalidad.');

    return report;
  };
})();

