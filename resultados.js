(() => {
  const types = [
    ['detenidos', '⚖', 'Detenidos', 'Personas detenidas y sus delitos.'],
    ['requisitoriados', '⌕', 'Requisitoriados', 'Orden de captura o requisitoria internacional.'],
    ['menores', '♙', 'Menores', 'Intervenciones que involucren menores.'],
    ['victimas', '♡', 'Víctimas', 'Datos del detallado; la ficha de enrolamiento sigue independiente.'],
    ['bandas', '♧', 'Bandas', 'Registro específico de la banda intervenida.'],
    ['organizaciones', '◎', 'Organizaciones criminales', 'Registro específico de la organización.'],
    ['armas', '◇', 'Armas y municiones', 'Armas, municiones, explosivos y réplicas.'],
    ['drogas', '▦', 'Drogas e insumos', 'Sustancias, cantidades y otros hallazgos.'],
    ['vehiculos', '▱', 'Vehículos y maquinaria', 'Vehículos mayores, menores y maquinaria.'],
    ['personas_ubicadas', '⌖', 'Personas ubicadas', 'Personas ubicadas durante la intervención.'],
    ['otros', '＋', 'Otros resultados', 'Dinero, celulares, bienes y demás resultados del detallado.']
  ];
  const cards = document.getElementById('resultCards');
  const status = document.getElementById('resultsStatus');
  const selectionStatus = document.getElementById('resultsSelectionStatus');
  const list = document.getElementById('linkedDetainees');
  let current = null, generation = 0, busy = false, dirty = false, readOnly = true, shown = 25;
  const drugForm = document.getElementById('drugResultForm');
  const drugType = document.getElementById('drugType'), drugQuantity = document.getElementById('drugQuantity'), drugName = document.getElementById('drugName');
  const drugStatus = document.getElementById('drugStatus'), drugRecords = document.getElementById('drugRecords');
  let drugDirty = false, drugId = null, drugVersion = 0, drugShown = 25, drugRetry = null;
  function resetDrug() {
    drugForm.reset(); drugDirty = false; drugId = null; drugVersion = 0; drugRetry = null;
    document.getElementById('drugFormTitle').textContent = 'Agregar sustancia';
    document.getElementById('saveDrug').textContent = 'Guardar sustancia';
    document.getElementById('cancelDrug').hidden = true; updateDrugType();
  }
  function updateDrugType() {
    const units = drugType.value.startsWith('env_'), synthetic = drugType.value === 'kg_sintetica';
    drugQuantity.step = units ? '1' : '0.000001'; drugQuantity.min = units ? '1' : '0.000001';
    document.getElementById('drugQuantityLabel').textContent = !drugType.value ? 'Cantidad' : units ? 'Cantidad de unidades' : 'Cantidad en kilogramos';
    document.getElementById('drugNameField').hidden = !synthetic; drugName.required = synthetic;
    if (!synthetic) drugName.value = '';
  }
  for (const [value, icon, title, description] of types) {
    const label = document.createElement('label'); label.className = 'result-card';
    label.innerHTML = `<input type="checkbox" value="${value}"><span class="result-card-icon" aria-hidden="true">${icon}</span><strong>${title}</strong><small>${description}</small><span class="result-card-state">Seleccionar</span>`;
    cards.appendChild(label);
  }
  const boxes = [...cards.querySelectorAll('input')];
  function selected() { return boxes.filter(box => box.checked).map(box => box.value); }
  function renderSelection() {
    for (const box of boxes) {
      box.closest('label').classList.toggle('selected', box.checked);
      box.closest('label').querySelector('.result-card-state').textContent = box.checked ? '✓ Seleccionado' : 'Seleccionar';
    }
    document.getElementById('linkedDetaineesPanel').hidden = !selected().includes('detenidos');
    document.getElementById('drugResultsPanel').hidden = !selected().includes('drogas');
    document.getElementById('materialResultsPanel').hidden = !selected().includes('armas');
    document.getElementById('vehicleResultsPanel').hidden = !selected().includes('vehiculos');
    document.getElementById('victimResultsPanel').hidden = !selected().includes('victimas');
    document.getElementById('minorResultsPanel').hidden = !selected().includes('menores');
    document.getElementById('rqResultsPanel').hidden = !selected().includes('requisitoriados');
    document.getElementById('groupResultsPanel').hidden = !selected().some(t=>['bandas','organizaciones'].includes(t));
    window.GruposUI.show(selected());
    document.getElementById('resultsPendingNote').hidden = !selected().some(type => !['detenidos','requisitoriados','victimas','menores','drogas','armas','vehiculos','bandas','organizaciones'].includes(type));
  }
  function lock() {
    document.getElementById('resultsSelection').disabled = busy || readOnly || !current;
    document.getElementById('saveResults').disabled = busy || readOnly || !current;
    document.getElementById('addLinkedDetainee').disabled = busy || readOnly || !current;
    document.getElementById('refreshResults').disabled = busy || !current;
    document.getElementById('backOperativo').disabled = busy || !current;
    document.getElementById('drugFields').disabled = busy || readOnly || !current;
    document.getElementById('moreDrugs').disabled = busy || !current;
    window.MaterialesUI.lock(busy || !current,readOnly);
    window.VehiculosUI.lock(busy || !current,readOnly);
    window.GruposUI.lock(busy || !current,readOnly);
    window.RequisitoriadosUI.lock(busy || !current,readOnly);
    window.VictimasUI.lock(busy || !current,readOnly); window.MenoresUI.lock(busy || !current,readOnly);
    window.NotasUI.lock(busy || !current,readOnly);
  }
  cards.addEventListener('change', () => { dirty = true; selectionStatus.textContent = 'Selección sin guardar'; renderSelection(); });
  window.addEventListener('beforeunload', event => { if (dirty || drugDirty || (window.MaterialesUI.dirty || window.VehiculosUI.dirty || window.GruposUI.dirty || window.NotasUI.dirty || window.VictimasUI.dirty || window.MenoresUI.dirty || window.RequisitoriadosUI.dirty) || busy) { event.preventDefault(); event.returnValue = ''; } });
  window.resetResultadosModule = () => {
    generation++; current = null; busy = false; dirty = false; readOnly = true; shown = 25;
    window.MaterialesUI.reset(); window.VehiculosUI.reset(); window.GruposUI.reset(); window.RequisitoriadosUI.reset(); window.VictimasUI.reset(); window.MenoresUI.reset(); window.NotasUI.reset();
    resetDrug(); drugShown = 25; drugRecords.replaceChildren(); drugStatus.textContent = '';
    boxes.forEach(box => { box.checked = false; }); renderSelection(); lock(); list.replaceChildren();
    status.textContent = selectionStatus.textContent = document.getElementById('resultsSummary').textContent = '';
  };
  async function loadLinked(token) {
    const { data, error } = await supabaseClient.from('detenciones_reportables')
      .select('id,codigo,fecha,personas(apellido_paterno,apellido_materno,nombres)')
      .eq('intervencion_id', current.id).order('creado_en', { ascending: false }).order('id').range(0, shown);
    if (token !== generation) return;
    if (error) throw error;
    list.replaceChildren();
    if (!data.length) { list.textContent = 'Aún no hay detenidos registrados en este operativo.'; }
    for (const record of data.slice(0, shown)) {
      const row = document.createElement('div'); row.className = 'linked-detainee-row';
      const text = document.createElement('div'), title = document.createElement('strong'), meta = document.createElement('small');
      title.textContent = record.personas ? [record.personas.apellido_paterno, record.personas.apellido_materno, record.personas.nombres].filter(Boolean).join(' ') : 'Identificación no disponible para esta cuenta';
      meta.textContent = `${record.codigo} · ${record.fecha?.split('-').reverse().join('/') || ''}`;
      text.append(title, meta);
      const button = document.createElement('button'); button.type = 'button'; button.className = 'secondary'; button.textContent = 'Ver detalle';
      button.addEventListener('click', () => window.openLinkedDetainee?.(record.id)); row.append(text, button); list.appendChild(row);
    }
    document.getElementById('moreLinkedDetainees').hidden = data.length <= shown;
  }
  window.openOperativoResults = async recordId => {
    if (busy || ((dirty || drugDirty || (window.MaterialesUI.dirty || window.VehiculosUI.dirty || window.GruposUI.dirty || window.NotasUI.dirty || window.VictimasUI.dirty || window.MenoresUI.dirty || window.RequisitoriadosUI.dirty)) && !confirm('Hay cambios sin guardar. ¿Desea descartarlos y volver a cargar los resultados?'))) return;
    const token = ++generation; current = null; busy = true; dirty = false; readOnly = true; shown = 25;
    window.MaterialesUI.reset(); window.VehiculosUI.reset(); window.GruposUI.reset(); window.RequisitoriadosUI.reset(); window.VictimasUI.reset(); window.MenoresUI.reset(); window.NotasUI.reset();
    resetDrug(); drugShown = 25; drugRecords.replaceChildren(); drugStatus.textContent = '';
    boxes.forEach(box => { box.checked = false; }); renderSelection(); lock(); list.replaceChildren();
    document.getElementById('resultsSummary').textContent = ''; selectionStatus.textContent = '';
    document.getElementById('openResultsView').click(); status.textContent = 'Cargando resultados…';
    try {
      const { data, error } = await supabaseClient.from('intervenciones').select('*').eq('id', recordId).single();
      if (token !== generation) return;
      if (error) throw error;
      current = data;
      readOnly = !(currentProfile?.activo && (currentProfile.rol === 'administrador' || (data.creado_por === currentProfile.id && data.unidad === currentProfile.unidad)));
      boxes.forEach(box => { box.checked = (data.resultados_previstos || []).includes(box.value); }); renderSelection();
      document.getElementById('resultsSummary').textContent = `${data.tipo === 'megaoperativo' ? 'Megaoperativo' : 'Operativo'} · ${data.fecha?.split('-').reverse().join('/') || 'Sin fecha'} · ${data.unidad}`;
      await loadLinked(token);
      await loadDrugs(token);
      if(token!==generation)return;
      await window.MaterialesUI.load(current,readOnly,{
        prepare:async()=>!busy && !readOnly && (!dirty || await saveSelection()),
        setBusy:value=>{busy=value;lock();},
        saved:version=>{current.version=version;if(!current.resultados_previstos.includes('armas'))current.resultados_previstos.push('armas');}
      });
      if(token!==generation)return;
      await window.VehiculosUI.load(current,readOnly,{
        prepare:async()=>!busy && !readOnly && (!dirty || await saveSelection()),
        setBusy:value=>{busy=value;lock();},
        saved:version=>{current.version=version;if(!current.resultados_previstos.includes('vehiculos'))current.resultados_previstos.push('vehiculos');}
      });
      if (token !== generation) return;
      await window.GruposUI.load(current,readOnly,{
        prepare:async()=>!busy && !readOnly && (!dirty || await saveSelection()),
        setBusy:value=>{busy=value;lock();},
        saved:(version,category)=>{current.version=version;if(!current.resultados_previstos.includes(category))current.resultados_previstos.push(category);boxes.forEach(b=>{b.checked=current.resultados_previstos.includes(b.value);});renderSelection();}
      });
      if(token!==generation)return;
      await window.NotasUI.load(current,readOnly,{
        prepare:async()=>!busy && !readOnly && (!dirty || await saveSelection()),
        setBusy:value=>{busy=value;lock();},
        saved:version=>{current.version=version;}
      });
      if(token!==generation)return;
      await window.VictimasUI.load(current,readOnly,{
        prepare:async()=>!busy && !readOnly && (!dirty || await saveSelection()),
        setBusy:value=>{busy=value;lock();},
        saved:version=>{current.version=version;if(!current.resultados_previstos.includes('victimas'))current.resultados_previstos.push('victimas');boxes.forEach(b=>{b.checked=current.resultados_previstos.includes(b.value);});renderSelection();}
      });
      if(token!==generation)return;
      await window.MenoresUI.load(current,readOnly,{
        prepare:async()=>!busy && !readOnly && (!dirty || await saveSelection()),
        setBusy:value=>{busy=value;lock();},
        saved:version=>{current.version=version;if(!current.resultados_previstos.includes('menores'))current.resultados_previstos.push('menores');boxes.forEach(b=>{b.checked=current.resultados_previstos.includes(b.value);});renderSelection();}
      });
      if(token!==generation)return;
      await window.RequisitoriadosUI.load(current,readOnly,{
        prepare:async()=>!busy && !readOnly && (!dirty || await saveSelection()),
        setBusy:value=>{busy=value;lock();},
        saved:version=>{current.version=version;if(!current.resultados_previstos.includes('requisitoriados'))current.resultados_previstos.push('requisitoriados');boxes.forEach(b=>{b.checked=current.resultados_previstos.includes(b.value);});renderSelection();},

      });
      if(token!==generation)return;
      status.textContent = readOnly ? 'Consulta de resultados: su cuenta no puede modificar este operativo.' : 'Puede seleccionar varios resultados. Seleccionar una categoría no equivale a completar su detalle.';
    } catch (error) {
      if (token === generation) { status.textContent = `No se pudieron cargar los resultados: ${error.message || 'Compruebe su conexión.'}`; readOnly = true; }
    } finally { if (token === generation) { busy = false; lock(); } }
  };
  async function saveSelection() {
    if (!current || busy || readOnly) return false;
    const token = generation; busy = true; lock(); selectionStatus.textContent = 'Guardando selección…';
    try {
      const { data, error } = await supabaseClient.rpc('seleccionar_resultados_operativo', { p_id: current.id, p_version: current.version, p_categorias: selected() });
      if (token !== generation) return false;
      if (error) throw error;
      current.version = data.version; current.resultados_previstos = data.categorias; dirty = false;
      selectionStatus.textContent = '✓ Selección guardada'; return true;
    } catch (error) {
      if (token === generation) selectionStatus.textContent = error.code === '40001' ? 'El operativo cambió. Actualice los resultados antes de guardar otra vez.' : `No se confirmó la selección: ${error.message || 'Reintente.'}`;
      return false;
    } finally { if (token === generation) { busy = false; lock(); } }
  }
  document.getElementById('saveResults').addEventListener('click', saveSelection);
  document.getElementById('refreshResults').addEventListener('click', () => { if (current) window.openOperativoResults(current.id); });
  document.getElementById('backOperativo').addEventListener('click', () => {
    if (busy || !current || ((dirty || drugDirty || (window.MaterialesUI.dirty || window.VehiculosUI.dirty || window.GruposUI.dirty || window.NotasUI.dirty || window.VictimasUI.dirty || window.MenoresUI.dirty || window.RequisitoriadosUI.dirty)) && !confirm('Hay cambios sin guardar. ¿Desea descartarlos?'))) return;
    dirty = false; resetDrug(); window.MaterialesUI.clear(); window.VehiculosUI.clear(); window.GruposUI.clear(); window.RequisitoriadosUI.clear(); window.VictimasUI.clear(); window.MenoresUI.clear(); window.NotasUI.clear(); window.openOperativoById(current.id);
  });
  document.getElementById('addLinkedDetainee').addEventListener('click', async () => {
    if (busy || readOnly || !current) return;
    if (drugDirty && !confirm('Hay una sustancia sin guardar. ¿Desea descartarla?')) return;
    if (!window.MaterialesUI.discard()) return;
    if (!window.VehiculosUI.discard()) return;
    if (!window.GruposUI.discard()) return;
    if (!window.RequisitoriadosUI.discard()) return;
    if (!window.MenoresUI.discard()) return;
    if (!window.NotasUI.discard()) return;
    if (dirty && !(await saveSelection())) return;
    resetDrug();
    window.MaterialesUI.clear(); window.VehiculosUI.clear(); window.GruposUI.clear(); window.RequisitoriadosUI.clear(); window.VictimasUI.clear(); window.MenoresUI.clear(); window.NotasUI.clear();
    window.startDetaineeFromOperativo?.(current);
  });
  document.getElementById('moreLinkedDetainees').addEventListener('click', async () => {
    if (!current || busy) return; const token = generation; busy = true; lock(); shown += 25;
    try { await loadLinked(token); } catch { if (token === generation) status.textContent = 'No se pudieron cargar más detenidos. Reintente.'; }
    finally { if (token === generation) { busy = false; lock(); } }
  });
  window.onLinkedDetaineeSaved = recordId => { dirty = false; window.openOperativoResults(recordId); };
  async function loadDrugs(token) {
    if (token !== generation || !current) return;
    const {data,error} = await supabaseClient.from('intervencion_drogas').select('id,tipo,cantidad,nombre_sustancia,version')
      .eq('intervencion_id',current.id).order('creado_en',{ascending:false}).order('id').range(0,drugShown);
    if (token !== generation) return;
    if (error) throw error;
    drugRecords.replaceChildren();
    if (!data.length) drugRecords.textContent = 'Aún no hay sustancias registradas en este operativo.';
    for (const record of data.slice(0,drugShown)) {
      const row = document.createElement('div'); row.className = 'linked-detainee-row';
      const info = document.createElement('div'), title = document.createElement('strong'), detail = document.createElement('small');
      title.textContent = [...drugType.options].find(option => option.value===record.tipo)?.textContent || record.tipo;
      detail.textContent = `${record.cantidad} ${record.tipo.startsWith('env_') ? 'unidades' : 'kg'}${record.nombre_sustancia ? ' · '+record.nombre_sustancia : ''}`;
      info.append(title,detail); row.append(info);
      if (!readOnly) {
        const edit = document.createElement('button'); edit.type='button'; edit.className='secondary'; edit.textContent='Editar';
        edit.addEventListener('click',()=>{
          if (busy || readOnly || (drugDirty && !confirm('Hay una sustancia sin guardar. ¿Desea descartarla?'))) return;
          resetDrug(); drugId=record.id; drugVersion=record.version; drugType.value=record.tipo; updateDrugType();
          drugQuantity.value=record.cantidad; drugName.value=record.nombre_sustancia || '';
          document.getElementById('drugFormTitle').textContent='Editar sustancia'; document.getElementById('saveDrug').textContent='Guardar cambios';
          document.getElementById('cancelDrug').hidden=false; drugStatus.textContent=''; drugType.focus();
        }); row.append(edit);
      }
      drugRecords.append(row);
    }
    document.getElementById('moreDrugs').hidden=data.length<=drugShown;
  }
  drugType.addEventListener('change',updateDrugType);
  drugForm.addEventListener('input',()=>{drugDirty=true; drugStatus.textContent='Sustancia sin guardar';});
  document.addEventListener('click',event=>{
    const nav=event.target.closest('[data-view]');
    if(!nav || nav.dataset.view==='operativoResultsView' || !document.getElementById('operativoResultsView').classList.contains('active')) return;
    if(busy || ((drugDirty || (window.MaterialesUI.dirty || window.VehiculosUI.dirty || window.GruposUI.dirty || window.NotasUI.dirty || window.VictimasUI.dirty || window.MenoresUI.dirty || window.RequisitoriadosUI.dirty)) && !confirm('Hay detalles sin guardar. ¿Desea descartarlos?'))) {event.preventDefault();event.stopImmediatePropagation();return;}
    if(drugDirty) resetDrug();
    window.MaterialesUI.clear(); window.VehiculosUI.clear(); window.GruposUI.clear(); window.RequisitoriadosUI.clear(); window.VictimasUI.clear(); window.MenoresUI.clear(); window.NotasUI.clear();
  },true);
  document.getElementById('cancelDrug').addEventListener('click',()=>{
    if (!busy && (!drugDirty || confirm('¿Descartar los cambios de esta sustancia?'))) { resetDrug(); drugStatus.textContent=''; }
  });
  drugForm.addEventListener('submit',async event=>{
    event.preventDefault(); if (busy || readOnly || !current || !drugForm.reportValidity()) return;
    if (dirty && !(await saveSelection())) return;
    const token=generation;
    const payload={p_id:drugId || crypto.randomUUID(),p_intervencion:current.id,p_version:drugVersion,p_tipo:drugType.value,p_cantidad:Number(drugQuantity.value),p_nombre:drugType.value==='kg_sintetica' ? drugName.value.trim() : null};
    if (!Number.isFinite(payload.p_cantidad) || payload.p_cantidad<=0) return;
    // Keep the exact request in memory across an uncertain response; never cache personal data.
    if (drugRetry) {
      const comparable={...payload,p_id:drugRetry.p_id};
      if (JSON.stringify(comparable)!==JSON.stringify(drugRetry)) {
        drugStatus.textContent='El guardado anterior no se confirmó. Reintente con los mismos datos o actualice para comprobar si se guardó antes de cambiarlos.'; return;
      }
      payload.p_id=drugRetry.p_id;
    }
    drugRetry=payload; busy=true; lock(); drugStatus.textContent='Guardando sustancia…';
    try {
      const {data,error}=await supabaseClient.rpc('guardar_droga_operativo',payload);
      if (token!==generation) return;
      if (error) { if (error.code && !['PGRST000','PGRST001','PGRST002'].includes(error.code)) drugRetry=null; throw error; }
      current.version=data.operativo_version;
      if (!current.resultados_previstos.includes('drogas')) current.resultados_previstos.push('drogas');
      resetDrug(); drugStatus.textContent='✓ Sustancia guardada. Puede agregar otra.';
      try { await loadDrugs(token); } catch { if(token===generation) drugStatus.textContent='La sustancia se guardó, pero no se pudo actualizar la lista. Pulse Actualizar.'; }
    } catch(error) {
      if(token===generation) drugStatus.textContent=error.code==='40001' ? 'Este registro cambió. Pulse Actualizar y vuelva a abrirlo.' : `No se confirmó el guardado: ${error.message || 'Compruebe su conexión y reintente.'}`;
    } finally { if(token===generation) {busy=false;lock();} }
  });
  document.getElementById('moreDrugs').addEventListener('click',async()=>{
    if(busy || !current) return; const token=generation; busy=true;lock();drugShown+=25;
    try{await loadDrugs(token);}catch{if(token===generation) drugStatus.textContent='No se pudo cargar la lista. Reintente.';}
    finally{if(token===generation){busy=false;lock();}}
  });
  window.resetResultadosModule();
})();

