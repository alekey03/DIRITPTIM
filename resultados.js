(() => {
  const types = [
    ['detenidos', '⚖', 'Detenidos', 'Personas detenidas y sus delitos.'],
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
    document.getElementById('resultsPendingNote').hidden = !selected().some(type => type !== 'detenidos');
  }
  function lock() {
    document.getElementById('resultsSelection').disabled = busy || readOnly || !current;
    document.getElementById('saveResults').disabled = busy || readOnly || !current;
    document.getElementById('addLinkedDetainee').disabled = busy || readOnly || !current;
    document.getElementById('refreshResults').disabled = busy || !current;
    document.getElementById('backOperativo').disabled = busy || !current;
  }
  cards.addEventListener('change', () => { dirty = true; selectionStatus.textContent = 'Selección sin guardar'; renderSelection(); });
  window.addEventListener('beforeunload', event => { if (dirty || busy) { event.preventDefault(); event.returnValue = ''; } });
  window.resetResultadosModule = () => {
    generation++; current = null; busy = false; dirty = false; readOnly = true; shown = 25;
    boxes.forEach(box => { box.checked = false; }); renderSelection(); lock(); list.replaceChildren();
    status.textContent = selectionStatus.textContent = document.getElementById('resultsSummary').textContent = '';
  };
  async function loadLinked(token) {
    const { data, error } = await supabaseClient.from('detenciones')
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
    if (busy || (dirty && !confirm('Hay una selección sin guardar. ¿Desea descartarla y volver a cargar los resultados?'))) return;
    const token = ++generation; current = null; busy = true; dirty = false; readOnly = true; shown = 25;
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
      if (token !== generation) return;
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
    if (busy || !current || (dirty && !confirm('Hay una selección sin guardar. ¿Desea descartarla?'))) return;
    dirty = false; window.openOperativoById(current.id);
  });
  document.getElementById('addLinkedDetainee').addEventListener('click', async () => {
    if (busy || readOnly || !current) return;
    if (dirty && !(await saveSelection())) return;
    window.startDetaineeFromOperativo?.(current);
  });
  document.getElementById('moreLinkedDetainees').addEventListener('click', async () => {
    if (!current || busy) return; const token = generation; busy = true; lock(); shown += 25;
    try { await loadLinked(token); } catch { if (token === generation) status.textContent = 'No se pudieron cargar más detenidos. Reintente.'; }
    finally { if (token === generation) { busy = false; lock(); } }
  });
  window.onLinkedDetaineeSaved = recordId => { dirty = false; window.openOperativoResults(recordId); };
  window.resetResultadosModule();
})();
