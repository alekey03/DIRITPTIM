(async()=>{
 const report=document.createElement('pre');report.id='qa-result';report.style='position:fixed;bottom:0;left:0;right:0;background:#eff9f0;z-index:9999;white-space:pre-wrap;padding:10px';document.body.append(report);
 const assert=(v,m)=>{if(!v)throw Error(m)},$=id=>document.getElementById(id),tick=()=>new Promise(r=>setTimeout(r,40));
 const wait=async fn=>{for(let i=0;i<100;i++){if(fn())return;await tick();}throw Error('Tiempo de espera agotado: '+$('materialStatus').textContent+' / '+$('detaineeStatus').textContent)};
 try{
 currentProfile={id:'fixture-user',activo:true,rol:'administrador',unidad:'ADMINISTRACIÓN GENERAL DIRITPTIM',departamento:'NACIONAL'};
 const op={id:'op-demo',fecha:'2026-09-23',unidad:currentProfile.unidad,departamento_registro:'NACIONAL',tipo:'operativo',version:1,resultados_previstos:['detenidos','organizaciones','armas'],creado_por:currentProfile.id};records.set(op.id,op);
 detained.push({id:'d-demo',intervencion_id:op.id,codigo:'DET-DEMO',personas:{apellido_paterno:'FICTICIO',nombres:'UNO',edad:30,nacionalidad:'Perú',genero:'Masculino'}});
 groups.push({id:'g1',intervencion_id:op.id,tipo:'banda',nombre:'BANDA DEMO',modalidad:'PRUEBA',intervencion_grupo_integrantes:[]},{id:'g2',intervencion_id:op.id,tipo:'organizacion',nombre:'ORGANIZACION DEMO',modalidad:'PRUEBA',intervencion_grupo_integrantes:[]});
 await openOperativoResults(op.id);
 assert(getComputedStyle(document.querySelector('[data-group="banda"]')).display==='none','Banda debe ocultarse');assert(getComputedStyle(document.querySelector('[data-group="organizacion"]')).display!=='none','Organización debe mostrarse');assert(!$('groupRecords').textContent.includes('BANDA DEMO'),'Lista solo categoría marcada');
 $('addLinkedDetainee').click();await wait(()=>!$('inlineDetaineeHost').hidden);
 assert($('operativoResultsView').classList.contains('active'),'Debe seguir en operativo');assert($('inlineDetaineeHost').contains($('detaineeForm')),'Formulario dentro del operativo');assert($('detaineeForm').elements.fecha.value===op.fecha,'Hereda fecha');
 $('detaineeForm').elements.apellidoPaterno.value='FICTICIO';$('detaineeForm').elements.nombres.value='DOS';$('detaineeForm').requestSubmit();await wait(()=>detained.length===2);await wait(()=>$('inlineDetaineeHost').hidden&&!$('addLinkedDetainee').disabled);
 assert($('detaineeFormView').contains($('detaineeForm')),'Formulario restaurado después del guardado');
 document.querySelector('[data-material="fuego"]').click();const f=$('materialForm');assert(!f.elements.apellido_paterno,'No pide datos personales otra vez');assert(f.elements.detenidoSeleccionado.options.length===3,'Solo detenidos del operativo');
 f.elements.detenidoSeleccionado.value='d-demo';f.elements.situacion.value='INCAUTADA';f.elements.tipo.value='PISTOLA';f.elements.serie.value='DEMO-1';f.requestSubmit($('saveAnotherMaterial'));await wait(()=>materials.length===1&&!$('materialFields').disabled);
 assert(materials[0].datos.apellido_paterno==='FICTICIO'&&materials[0].datos.edad===30,'Datos reutilizados');assert(!f.hidden&&!f.elements.serie.value,'Abre siguiente arma sin serie duplicada');
 f.elements.situacion.value='INCAUTADA';f.elements.tipo.value='PISTOLA';f.elements.serie.value='DEMO-2';f.requestSubmit();await wait(()=>materials.length===2&&f.hidden);assert(materials[0].id!==materials[1].id,'Armas independientes');assert(materials[1].datos.nombres===null,'Hallazgo sin persona no hereda anterior');
 const band=document.querySelector('#resultCards input[value="bandas"]');band.click();assert(getComputedStyle(document.querySelector('[data-group="banda"]')).display!=='none','Ambos al seleccionar ambos');
 resetResultadosModule();assert(!$('materialInputs').textContent&&$('inlineDetaineeHost').hidden,'Limpieza al salir');await openOperativoResults(op.id);
 report.textContent='PASS: categorías separadas; detenido dentro del operativo y guardado; selector de detenidos; dos armas sin duplicación; hallazgo sin persona; limpieza de sesión.';
 }catch(e){report.textContent='FAIL: '+e.message;console.error(e)}
})();
