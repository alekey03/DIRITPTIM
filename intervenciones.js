/* Borradores de operativos: nunca guarda información personal en el navegador. */
(() => {
  const form = document.getElementById('operativoForm');
  const status = document.getElementById('operativoStatus');
  const saveButton = document.getElementById('saveOperativo');
  const rows = document.getElementById('operativosRows');
  const listStatus = document.getElementById('operativosListStatus');
  const catalogs = window.bindOperativoCatalogs(form);
  const unit = form.elements.namedItem('intervencion.unidad_area_equipo');
  for (const item of DEPENDENCIAS_INSTITUCIONALES) unit.add(new Option(item.unidad, item.unidad));
  let id = crypto.randomUUID(), version = 0, pending = null, dirty = false, busy = false;
  let epoch = 0, listRequest = 0, page = 0, readOnly = false;
  const fields = [...form.querySelectorAll('[name]')];
  function message(text) { status.textContent = text; }
  function lock(locked) {
    form.querySelectorAll('fieldset').forEach(fieldset => { fieldset.disabled = locked; });
    saveButton.disabled = locked;
    document.getElementById('continueOperativo').disabled = busy || !version || dirty;
    document.getElementById('newOperativo').disabled = busy;
  }
  function payload() {
    const data = { intervencion: {}, operativo: {} };
    for (const field of fields) {
      const [table, column] = field.name.split('.');
      const value = field.value.trim();
      data[table][column] = value === '' ? null : field.type === 'number' ? Number(value) : value;
    }
    return data;
  }
  window.initializeOperativoForm = () => {
    document.getElementById('operativoScope').textContent = currentProfile?.unidad || 'Sin dependencia asignada';
  };
  window.resetOperativoModule = () => {
    epoch++; listRequest++;
    id = crypto.randomUUID(); version = 0; pending = null; dirty = false; busy = false; readOnly = false;
    form.reset(); catalogs.reset(); lock(false); message('');
    rows.replaceChildren(); listStatus.textContent = ''; page = 0;
    document.getElementById('operativoScope').textContent = '';
    document.getElementById('operativosPage').textContent = '';
    saveButton.textContent = 'Guardar borrador';
    // Remove values retained solely to display an older catalog entry.
    form.querySelectorAll('option[data-legacy]').forEach(option => option.remove());
  };
  function changed() { dirty = true; document.getElementById('continueOperativo').disabled = true; }
  form.addEventListener('input', changed);
  form.addEventListener('change', changed);
  document.getElementById('continueOperativo').addEventListener('click', () => {
    if (!busy && !dirty && version) window.openOperativoResults?.(id);
  });
  window.addEventListener('beforeunload', event => {
    if (dirty || busy) { event.preventDefault(); event.returnValue = ''; }
  });
  document.getElementById('newOperativo').addEventListener('click', () => {
    if (busy || (dirty && !confirm('Tiene cambios sin guardar. ¿Desea descartarlos y empezar otro operativo?'))) return;
    window.resetOperativoModule(); window.initializeOperativoForm();
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || readOnly || !form.reportValidity()) return;
    if (!currentProfile?.activo) return message('Inicie sesión con una cuenta activa.');
    const turn = epoch;
    const data = payload();
    const content = JSON.stringify({ id, version, ...data });
    if (!pending || pending.content !== content) pending = { content, request: crypto.randomUUID() };
    busy = true; lock(true); saveButton.textContent = 'Guardando…'; message('');
    try {
      const result = await supabaseClient.rpc('guardar_operativo_borrador', {
        p_solicitud: pending.request, p_id: id, p_version: version,
        p_intervencion: data.intervencion, p_operativo: data.operativo
      });
      if (turn !== epoch) return;
      if (result.error) throw result.error;
      if (!result.data?.id || !Number.isInteger(result.data.version)) throw new Error('No se recibió la confirmación del guardado. Reintente.');
      id = result.data.id; version = result.data.version; pending = null; dirty = false;
      message('Borrador guardado. Continúe a resultados para registrar lo obtenido en el operativo.');
    } catch (error) {
      if (turn !== epoch) return;
      const unavailable = ['PGRST202', '42P01'].includes(error.code);
      message(unavailable ? 'El registro de operativos todavía no está habilitado en el servidor. Sus datos siguen en este formulario.' :
        error.code === '40001' ? 'Este operativo cambió desde que lo abrió. Sus cambios siguen aquí; abra el registro actualizado desde Borradores antes de editarlo nuevamente.' :
        `No se confirmó el guardado. ${error.message || 'Compruebe la conexión y vuelva a intentarlo.'}`);
    } finally {
      if (turn === epoch) { busy = false; lock(readOnly); saveButton.textContent = 'Guardar borrador'; }
    }
  });
  async function openRecord(recordId) {
    if (busy || (dirty && !confirm('Tiene cambios sin guardar. ¿Desea descartarlos y abrir este borrador?'))) return;
    const turn = ++listRequest, session = epoch;
    busy = true; lock(true);
    listStatus.textContent = 'Abriendo borrador…';
    try {
      const { data, error } = await supabaseClient.from('intervenciones')
        .select('*,intervencion_operativos(*)').eq('id', recordId).single();
      if (session !== epoch || turn !== listRequest) return;
      if (error) throw error;
      const detail = Array.isArray(data.intervencion_operativos) ? data.intervencion_operativos[0] : data.intervencion_operativos;
      if (!detail) throw new Error('Este registro no contiene el detalle de un operativo.');
      form.reset(); catalogs.reset(); catalogs.set(data, detail);
      for (const field of fields) {
        const [table, column] = field.name.split('.');
        const value = (table === 'intervencion' ? data : detail)[column] ?? '';
        if (field.tagName === 'SELECT' && value && ![...field.options].some(option => option.value === String(value))) {
          const option = new Option(`${value} (registrado)`, value); option.dataset.legacy = 'true'; field.add(option);
        }
        field.value = value;
      }
      id = data.id; version = data.version; pending = null; dirty = false;
      readOnly = !(currentProfile?.activo && (currentProfile.rol === 'administrador' ||
        (data.creado_por === currentProfile.id && data.unidad === currentProfile.unidad)));
      lock(readOnly);
      document.querySelector('.nav-item[data-view="operativoView"]').click();
      document.getElementById('operativoScope').textContent = data.unidad;
      message(readOnly ? 'Consulta del borrador. Su cuenta no tiene permiso para editar este registro.' : 'Borrador abierto. Puede continuar completándolo.');
      listStatus.textContent = '';
    } catch (error) {
      if (session === epoch && turn === listRequest) listStatus.textContent = `No se pudo abrir el borrador. ${error.message || ''}`;
    } finally {
      if (session === epoch) { busy = false; lock(readOnly); }
    }
  }
  window.openOperativoById = openRecord;
  window.loadOperativos = async () => {
    const turn = ++listRequest, session = epoch;
    rows.replaceChildren(); listStatus.textContent = 'Consultando borradores…';
    const prev = document.getElementById('operativosPrev'), next = document.getElementById('operativosNext');
    prev.disabled = next.disabled = true;
    if (!currentProfile?.activo) { listStatus.textContent = 'Inicie sesión con una cuenta activa.'; return; }
    try {
      const { data, error } = await supabaseClient.from('intervenciones')
        .select('id,fecha,tipo,nota_sicpip,unidad,departamento,provincia,distrito')
        .in('tipo', ['operativo', 'megaoperativo']).order('creado_en', { ascending: false }).order('id')
        .range(page * 25, page * 25 + 25);
      if (session !== epoch || turn !== listRequest) return;
      if (error) throw error;
      for (const record of data.slice(0, 25)) {
        const row = document.createElement('tr');
        for (const value of [record.fecha?.split('-').reverse().join('/'), record.tipo === 'megaoperativo' ? 'Megaoperativo' : 'Operativo', record.nota_sicpip, record.unidad,
          [record.departamento, record.provincia, record.distrito].filter(Boolean).map(value => value.replace(/_/g, ' ').trim()).join(' / ')]) {
          const cell = document.createElement('td'); cell.textContent = value || '—'; row.appendChild(cell);
        }
        const action = document.createElement('td'), button = document.createElement('button');
        button.type = 'button'; button.className = 'table-action'; button.textContent = 'Abrir';
        button.addEventListener('click', () => openRecord(record.id)); action.appendChild(button);
        const resultsButton = document.createElement('button'); resultsButton.type = 'button'; resultsButton.className = 'table-action'; resultsButton.textContent = 'Resultados';
        resultsButton.addEventListener('click', () => window.openOperativoResults?.(record.id)); action.appendChild(resultsButton);
        row.appendChild(action); rows.appendChild(row);
      }
      prev.disabled = page === 0; next.disabled = data.length <= 25;
      document.getElementById('operativosPage').textContent = `Página ${page + 1}`;
      listStatus.textContent = data.length ? '' : 'No hay borradores en esta página.';
    } catch (error) {
      if (session === epoch && turn === listRequest) {
        prev.disabled = page === 0;
        listStatus.textContent = `No se pudieron consultar los borradores. ${error.message || 'Reintente.'}`;
      }
    }
  };
  document.getElementById('refreshOperativos').addEventListener('click', () => { page = 0; window.loadOperativos(); });
  document.getElementById('operativosPrev').addEventListener('click', () => { if (page > 0) { page--; window.loadOperativos(); } });
  document.getElementById('operativosNext').addEventListener('click', () => { page++; window.loadOperativos(); });
})();
