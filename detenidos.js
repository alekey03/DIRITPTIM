const detaineeForm = document.getElementById('detaineeForm');
const crimeList = document.getElementById('crimeList');
const detaineeRecordModal = document.getElementById('detaineeRecordModal');
let selectedDetainee = null;
let editingDetaineeId = null;
let editingDetaineeReason = '';

function syncDetaineePublicEntity() {
  const applies = detaineeForm.elements.namedItem('esFuncionario').value === 'true';
  for (const name of ['entidadPublica', 'detalleEntidad']) {
    const field = detaineeForm.elements.namedItem(name);
    field.disabled = !applies;
    if (!applies) field.value = '';
  }
}
detaineeForm.elements.namedItem('esFuncionario').addEventListener('change', syncDetaineePublicEntity);
detaineeForm.addEventListener('reset', () => queueMicrotask(syncDetaineePublicEntity));
syncDetaineePublicEntity();

function detaineeValue(name) {
  const value = new FormData(detaineeForm).get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function nullable(value) {
  return value === '' ? null : value;
}

function isDetaineeAdmin() { return esGestorProduccion(); }
function setDetaineeField(name, value) {
  const field = detaineeForm.elements.namedItem(name);
  if (field) field.value = value ?? '';
}
function detailField(label, value) {
  return `<div class="detail-field"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value === null || value === undefined || value === '' ? '—' : String(value))}</strong></div>`;
}
function samePayload(current, next) {
  return Object.keys(next).every(key => String(current?.[key] ?? '') === String(next[key] ?? ''));
}
async function assignAuditReason(table, id, reason) {
  if (!reason || !id) return;
  const { error } = await supabaseClient.rpc('asignar_motivo_auditoria', { p_tabla: table, p_registro_id: String(id), p_motivo: reason });
  if (error) console.warn('No se pudo asociar el motivo de auditoría:', error);
}

function moduleUnavailable(error) {
  return error?.code === '42P01' || /relation .* does not exist|schema cache/i.test(error?.message || '');
}

function addCrimeRow(values = {}) {
  const order = crimeList.children.length + 1;
  const row = document.createElement('article');
  row.className = 'crime-row';
  row.innerHTML = `<div class="crime-row-heading"><strong>Delito ${order}</strong><button type="button" class="remove-crime" aria-label="Quitar delito">×</button></div>
    <div class="grid cols-5">
      <label>Tentativa<select data-field="attempt"><option value="false">No</option><option value="true">Sí</option></select></label>
      <label>Fuero/Ley especial<select data-field="jurisdiction"><option value="">Seleccionar fuero o ley</option></select></label>
      <label>Delito general<select data-field="general" disabled><option value="">Seleccione primero un fuero</option></select></label><label>Delito específico<select data-field="specific" disabled><option value="">Seleccione primero el delito general</option></select></label><label>Subtipo<select data-field="subtype" disabled><option value="">Seleccione primero el delito específico</option></select></label>
    </div>`;
  row.querySelector('[data-field="attempt"]').value = String(values.es_tentativa ?? false);
  window.createCrimeCascade?.(row, values);
  row.querySelector('.remove-crime').addEventListener('click', () => {
    if (crimeList.children.length === 1) return;
    row.remove();
    [...crimeList.children].forEach((item, index) => { item.querySelector('strong').textContent = `Delito ${index + 1}`; });
  });
  crimeList.appendChild(row);
}

function readCrimes() {
  return [...crimeList.querySelectorAll('.crime-row')].map((row, index) => ({
    orden: index + 1,
    es_tentativa: row.querySelector('[data-field="attempt"]').value === 'true',
    fuero_ley_especial: nullable(row.querySelector('[data-field="jurisdiction"]').value.trim()),
    delito_general: nullable(row.querySelector('[data-field="general"]').value.trim()),
    delito_especifico: nullable(row.querySelector('[data-field="specific"]').value.trim()),
    subtipo: nullable(row.querySelector('[data-field="subtype"]').value.trim())
  })).filter(item => item.delito_general || item.delito_especifico || item.subtipo || item.fuero_ley_especial);
}

window.initializeDetaineeForm = function initializeDetaineeForm() {
  if (!crimeList.children.length) addCrimeRow();
};

async function saveDetainee(event) {
  event.preventDefault();
  const status = document.getElementById('detaineeStatus');
  const button = document.getElementById('saveDetaineeButton');
  if (button.disabled || !detaineeForm.reportValidity()) return;
  if (!currentProfile?.activo) { status.textContent = 'La sesión no está disponible.'; return; }
  if (!currentProfile.departamento) { status.textContent = 'Su cuenta no tiene departamento asignado.'; return; }
  const workflowToken = window.detaineeWorkflowToken;
  const linkedOperativo = window.getDetaineeOperativo?.();
  window.setDetaineeBusy?.(true);
  button.disabled = true; button.textContent = 'Guardando…'; status.className = '';
  try {
  const person = {
    apellido_paterno: detaineeValue('apellidoPaterno'), apellido_materno: nullable(detaineeValue('apellidoMaterno')), nombres: detaineeValue('nombres'),
    edad: nullable(detaineeValue('edad')) ? Number(detaineeValue('edad')) : null, genero: nullable(detaineeValue('genero')), nacionalidad: nullable(detaineeValue('nacionalidad')),
    tipo_documento: nullable(detaineeValue('tipoDocumento')), numero_documento: nullable(detaineeValue('numeroDocumento')), departamento: nullable(detaineeValue('departamento')), provincia: nullable(detaineeValue('provincia')), distrito: nullable(detaineeValue('distrito')),
    unidad: currentProfile.unidad, creado_por: currentProfile.id
  };
    const organizationType = detaineeValue('integraOrganizacion');
    if (!['false', 'banda', 'organizacion'].includes(organizationType)) throw new Error('Seleccione Banda criminal, Organización criminal o Ninguno.');
    const belongsToOrganization = organizationType !== 'false';
    const organizationRole = belongsToOrganization ? detaineeValue('rolOrganizacion') : '';
    const organizationName = belongsToOrganization ? detaineeValue('nombreOrganizacion') : '';
    const detention = {
      fecha: detaineeValue('fecha'), hora: nullable(detaineeValue('hora')),
      es_funcionario_publico: detaineeValue('esFuncionario') === 'true', entidad_publica: detaineeValue('esFuncionario') === 'true' ? nullable(detaineeValue('entidadPublica')) : null, detalle_entidad_publica: detaineeValue('esFuncionario') === 'true' ? nullable(detaineeValue('detalleEntidad')) : null, motivo_detencion: nullable(detaineeValue('motivoDetencion')),
      direccion_policial: nullable(detaineeValue('direccionPolicial')), direccion_especializada_region: nullable(detaineeValue('direccionRegion')), division_policial: nullable(detaineeValue('divisionPolicial')), departamento_policial: nullable(detaineeValue('departamentoPolicial')), unidad_area_equipo: nullable(detaineeValue('unidadArea')),
      integra_organizacion: belongsToOrganization, tipo_organizacion: belongsToOrganization ? organizationType : null, rol_organizacion: nullable(organizationRole), nombre_organizacion: nullable(organizationName), situacion_actual: nullable(detaineeValue('situacionActual')), documento_libertad: nullable(detaineeValue('documentoLibertad')), documento_disposicion: nullable(detaineeValue('documentoDisposicion')),
      fiscal_nombre: nullable(detaineeValue('fiscalNombre')), fiscalia: nullable(detaineeValue('fiscalia')), disposicion_direccion: nullable(detaineeValue('disposicionDireccion')), disposicion_region: nullable(detaineeValue('disposicionRegion')), disposicion_division: nullable(detaineeValue('disposicionDivision')), disposicion_departamento: nullable(detaineeValue('disposicionDepartamento')), disposicion_unidad: nullable(detaineeValue('disposicionUnidad')), nota_sicpip: nullable(detaineeValue('notaSicpip')),
      departamento_registro: currentProfile.departamento, unidad: currentProfile.unidad, creado_por: currentProfile.id
    };

    const category = detaineeValue('armaCategoria');
    const weapons = category ? [{ categoria: category, tipo: nullable(detaineeValue('armaTipo')), cantidad: Number(detaineeValue('armaCantidad') || 1), observacion: nullable(detaineeValue('armaObservacion')) }] : [];
    // El formulario edita el primer hallazgo; conserva los demás existentes.
    if (editingDetaineeId) weapons.push(...(selectedDetainee.detencion_armas || []).slice(1));
    const payload = { p_persona: person, p_detencion: detention, p_delitos: readCrimes(), p_armas: weapons, p_editar: Boolean(editingDetaineeId), p_motivo: editingDetaineeReason || null, p_version: editingDetaineeId ? selectedDetainee.actualizado_en : null };
    if (linkedOperativo && !editingDetaineeId) payload.p_detencion.intervencion_id = linkedOperativo.id;
    const storageKey = 'detencion-pendiente:' + currentProfile.id;
    let requestId = editingDetaineeId;
    if (!requestId) {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
      if (workflowToken !== window.detaineeWorkflowToken) return;
      const signature = Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
      let pending;
      try { pending = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { pending = null; }
      requestId = pending?.signature === signature ? pending.id : crypto.randomUUID();
      // Solo guarda un identificador y un hash, nunca los datos personales.
      sessionStorage.setItem(storageKey, JSON.stringify({ id: requestId, signature }));
    }
    const { data, error } = await supabaseClient.rpc('guardar_detenido_atomico', { ...payload, p_solicitud: requestId });
    if (workflowToken !== window.detaineeWorkflowToken) return;
    if (error) throw error;
    if (!data?.id || !data?.codigo) throw new Error('Respuesta de guardado incompleta. Consulte los registros antes de reintentar.');
    if (!editingDetaineeId) sessionStorage.removeItem(storageKey);
    status.className = 'success-text';
    status.textContent = '✓ Detenido ' + data.codigo + (editingDetaineeId ? ' actualizado correctamente.' : ' registrado correctamente.');
    editingDetaineeId = null; editingDetaineeReason = ''; selectedDetainee = null;
    detaineeForm.reset(); window.resetDetaineeDependencies?.(); crimeList.innerHTML = ''; addCrimeRow();
    window.afterDetaineeSave?.(linkedOperativo?.id);
  } catch (error) {
    if (workflowToken !== window.detaineeWorkflowToken) return;
    console.error(error);
    status.className = 'error-text';
    status.textContent = moduleUnavailable(error) || error?.code === 'PGRST202'
      ? 'El guardado seguro aún no está instalado en Supabase. Contacte al administrador.'
      : 'No se confirmó el guardado: ' + (error.message || 'error de conexión') + '. Mantenga el formulario para reintentar la misma solicitud.';
  } finally { if (workflowToken === window.detaineeWorkflowToken) { window.setDetaineeBusy?.(false); button.disabled = false; button.textContent = editingDetaineeId ? 'Guardar cambios' : 'Registrar detenido'; } }
}

window.loadDetaineeRecords = async function loadDetaineeRecords() {
  const result = document.getElementById('detaineeRecordsResult');
  result.innerHTML = '<div class="empty-state"><span>▤</span><h3>Cargando detenidos…</h3></div>';
  let query = supabaseClient.from('detenciones_reportables').select('id,codigo,fecha,hora,motivo_detencion,situacion_actual,unidad,personas(apellido_paterno,apellido_materno,nombres,tipo_documento,numero_documento),detencion_delitos(delito_general,delito_especifico)').order('fecha', { ascending: false }).limit(100);
  const from = document.getElementById('detaineeDateFrom').value; const to = document.getElementById('detaineeDateTo').value;
  if (from) query = query.gte('fecha', from); if (to) query = query.lte('fecha', to);
  const { data, error } = await query;
  if (error) { result.innerHTML = `<p class="records-error">${moduleUnavailable(error) ? 'Falta habilitar las tablas del módulo en Supabase.' : 'No se pudieron consultar los detenidos.'}</p>`; return; }
  const search = document.getElementById('detaineeSearch').value.trim().toLocaleLowerCase('es');
  const situation = document.getElementById('detaineeSituation').value.trim().toLocaleLowerCase('es');
  const filtered = data.filter(row => { const p = row.personas || {}; const haystack = [row.codigo,p.apellido_paterno,p.apellido_materno,p.nombres,p.numero_documento].join(' ').toLocaleLowerCase('es'); return (!search || haystack.includes(search)) && (!situation || String(row.situacion_actual || '').toLocaleLowerCase('es').includes(situation)); });
  if (!filtered.length) { result.innerHTML = '<div class="empty-state"><span>⌕</span><h3>No se encontraron detenidos</h3><p>Pruebe con otros filtros.</p></div>'; return; }
  result.innerHTML = `<div class="records-count"><strong>${filtered.length} registro${filtered.length === 1 ? '' : 's'}</strong><span>Máximo 100 resultados</span></div><div class="table-wrap"><table><thead><tr><th>Código</th><th>Persona</th><th>Documento</th><th>Fecha</th><th>Delito</th><th>Situación</th><th>Unidad</th></tr></thead><tbody>${filtered.map(row => { const p=row.personas||{}; const crime=row.detencion_delitos?.[0]||{}; return `<tr class="detainee-record-row" data-detainee-id="${escapeHtml(row.id)}" tabindex="0"><td><span class="record-code">${escapeHtml(row.codigo)}</span></td><td><span class="record-name">${escapeHtml(`${p.apellido_paterno||''} ${p.apellido_materno||''}, ${p.nombres||''}`)}</span></td><td>${escapeHtml(p.tipo_documento||'—')} ${escapeHtml(p.numero_documento||'')}</td><td>${escapeHtml(formatDate(row.fecha))}</td><td>${escapeHtml(crime.delito_especifico||crime.delito_general||'—')}</td><td>${escapeHtml(row.situacion_actual||'—')}</td><td>${escapeHtml(row.unidad)}</td></tr>`; }).join('')}</tbody></table></div>`;
  result.querySelectorAll('[data-detainee-id]').forEach(row => { const open = () => openDetaineeRecord(row.dataset.detaineeId); row.addEventListener('click', open); row.addEventListener('keydown', event => { if (event.key === 'Enter') open(); }); });
};

async function openDetaineeRecord(id) {
  const workflowToken = window.detaineeWorkflowToken;
  document.getElementById('detaineeRecordDetail').innerHTML = '<div class="empty-state"><h3>Cargando detalle…</h3></div>';
  detaineeRecordModal.showModal();
  const { data, error } = await supabaseClient.from('detenciones_reportables').select('*,personas(*),detencion_delitos(*),detencion_armas(*)').eq('id', id).single();
  if (workflowToken !== window.detaineeWorkflowToken) return;
  if (error) { document.getElementById('detaineeRecordDetail').innerHTML = '<p class="records-error">No se pudo cargar el registro.</p>'; return; }
  selectedDetainee = data; const p = data.personas || {};
  document.getElementById('detaineeRecordModalCode').textContent = data.codigo || 'Registro de detenido';
  const crimes = (data.detencion_delitos || []).sort((a,b) => a.orden-b.orden).map((crime,index) => detailField(`Delito ${index+1}`, [crime.es_tentativa?'Tentativa':null,crime.fuero_ley_especial,crime.delito_general,crime.delito_especifico,crime.subtipo].filter(Boolean).join(' · '))).join('');
  const weapons = (data.detencion_armas || []).map(weapon => detailField('Arma o hallazgo', [weapon.categoria,weapon.tipo,`Cantidad: ${weapon.cantidad||1}`,weapon.observacion].filter(Boolean).join(' · '))).join('');
  document.getElementById('detaineeRecordDetail').innerHTML = `<div class="detail-section">Identificación</div>${detailField('Apellidos y nombres',`${p.apellido_paterno||''} ${p.apellido_materno||''}, ${p.nombres||''}`)}${detailField('Documento',[p.tipo_documento,p.numero_documento].filter(Boolean).join(' '))}${detailField('Edad / género',[p.edad,p.genero].filter(Boolean).join(' · '))}${detailField('Nacionalidad',p.nacionalidad)}${detailField('Ubicación',[p.departamento,p.provincia,p.distrito].filter(Boolean).join(' / '))}<div class="detail-section">Detención</div>${detailField('Fecha y hora',[formatDate(data.fecha),data.hora].filter(Boolean).join(' · '))}${detailField('Motivo',data.motivo_detencion)}${detailField('Situación actual',data.situacion_actual)}${detailField('Funcionario público',data.es_funcionario_publico?'Sí':'No')}${detailField('Entidad pública',[data.entidad_publica,data.detalle_entidad_publica].filter(Boolean).join(' · '))}<div class="detail-section">Delitos atribuidos</div>${crimes||detailField('Delitos','No registrados')}<div class="detail-section">Unidad, organización y hallazgos</div>${detailField('Dependencia',[data.direccion_policial,data.direccion_especializada_region,data.division_policial,data.departamento_policial,data.unidad_area_equipo].filter(Boolean).join(' / '))}${detailField('Banda u organización',data.integra_organizacion?[data.tipo_organizacion === 'banda' ? 'Banda criminal' : data.tipo_organizacion === 'organizacion' ? 'Organización criminal' : 'Pendiente de clasificar',data.rol_organizacion,data.nombre_organizacion].filter(Boolean).join(' · '):'No')}${weapons||detailField('Armas o hallazgos','Ninguno')}<div class="detail-section">Puesta a disposición</div>${detailField('Documentos',[data.documento_libertad,data.documento_disposicion].filter(Boolean).join(' · '))}${detailField('Fiscal / Fiscalía',[data.fiscal_nombre,data.fiscalia].filter(Boolean).join(' · '))}${detailField('Dependencia receptora',[data.disposicion_direccion,data.disposicion_region,data.disposicion_division,data.disposicion_departamento,data.disposicion_unidad].filter(Boolean).join(' / '))}${detailField('Nota SICPIP',data.nota_sicpip)}`;
  document.getElementById('detaineeRecordDetail').insertAdjacentHTML('afterbegin', `<div class="detail-section">Registro institucional</div>${detailField('Departamento registrador',data.departamento_registro)}${detailField('Área registradora',data.unidad)}`);
  document.getElementById('editDetaineeButton').classList.toggle('hidden-control', !isDetaineeAdmin());
  document.getElementById('deleteDetaineeButton').classList.toggle('hidden-control', !isDetaineeAdmin());
}

function beginDetaineeEdit() {
  if (!selectedDetainee || !isDetaineeAdmin()) return;
  const reason = prompt('Indique el motivo de la modificación. Este texto quedará guardado en Auditoría:');
  if (!reason?.trim()) return alert('El motivo es obligatorio para editar un detenido.');
  window.clearDetaineeOperativo?.();
  editingDetaineeId = selectedDetainee.id; editingDetaineeReason = reason.trim(); const p = selectedDetainee.personas || {}; const weapon = selectedDetainee.detencion_armas?.[0] || {};
  const values = { apellidoPaterno:p.apellido_paterno,apellidoMaterno:p.apellido_materno,nombres:p.nombres,edad:p.edad,genero:p.genero,nacionalidad:p.nacionalidad,tipoDocumento:p.tipo_documento,numeroDocumento:p.numero_documento,fecha:selectedDetainee.fecha,hora:selectedDetainee.hora,motivoDetencion:selectedDetainee.motivo_detencion,esFuncionario:String(Boolean(selectedDetainee.es_funcionario_publico)),entidadPublica:selectedDetainee.entidad_publica,detalleEntidad:selectedDetainee.detalle_entidad_publica,direccionPolicial:selectedDetainee.direccion_policial,direccionRegion:selectedDetainee.direccion_especializada_region,divisionPolicial:selectedDetainee.division_policial,departamentoPolicial:selectedDetainee.departamento_policial,unidadArea:selectedDetainee.unidad_area_equipo,integraOrganizacion:selectedDetainee.integra_organizacion ? (selectedDetainee.tipo_organizacion || '') : 'false',rolOrganizacion:selectedDetainee.rol_organizacion,nombreOrganizacion:selectedDetainee.nombre_organizacion,armaCategoria:weapon.categoria,armaTipo:weapon.tipo,armaCantidad:weapon.cantidad||1,armaObservacion:weapon.observacion,situacionActual:selectedDetainee.situacion_actual,documentoLibertad:selectedDetainee.documento_libertad,documentoDisposicion:selectedDetainee.documento_disposicion,fiscalNombre:selectedDetainee.fiscal_nombre,fiscalia:selectedDetainee.fiscalia,disposicionDireccion:selectedDetainee.disposicion_direccion,disposicionRegion:selectedDetainee.disposicion_region,disposicionDivision:selectedDetainee.disposicion_division,disposicionDepartamento:selectedDetainee.disposicion_departamento,disposicionUnidad:selectedDetainee.disposicion_unidad,notaSicpip:selectedDetainee.nota_sicpip};
  Object.entries(values).forEach(([name,value]) => setDetaineeField(name,value));
  syncDetaineePublicEntity();
  window.setDetaineeDependencies?.({ departamento:p.departamento,provincia:p.provincia,distrito:p.distrito,direccion_policial:selectedDetainee.direccion_policial,direccion_especializada_region:selectedDetainee.direccion_especializada_region,division_policial:selectedDetainee.division_policial,departamento_policial:selectedDetainee.departamento_policial,unidad_area_equipo:selectedDetainee.unidad_area_equipo,disposicion_direccion:selectedDetainee.disposicion_direccion,disposicion_region:selectedDetainee.disposicion_region,disposicion_division:selectedDetainee.disposicion_division,disposicion_departamento:selectedDetainee.disposicion_departamento,disposicion_unidad:selectedDetainee.disposicion_unidad,integra_organizacion:selectedDetainee.integra_organizacion,tipo_organizacion:selectedDetainee.tipo_organizacion,rol_organizacion:selectedDetainee.rol_organizacion,nombre_organizacion:selectedDetainee.nombre_organizacion,arma_categoria:weapon.categoria,arma_tipo:weapon.tipo });
  crimeList.innerHTML=''; (selectedDetainee.detencion_delitos?.length ? selectedDetainee.detencion_delitos.sort((a,b)=>a.orden-b.orden) : [{}]).forEach(addCrimeRow);
  document.getElementById('saveDetaineeButton').textContent='Guardar cambios'; document.getElementById('detaineeStatus').textContent=`Editando ${selectedDetainee.codigo}. El motivo quedará registrado en Auditoría.`;
  detaineeRecordModal.close(); document.querySelector('[data-view="detaineeFormView"]')?.click(); window.scrollTo({top:0,behavior:'smooth'});
}

async function deleteDetainee() {
  if (!selectedDetainee || !isDetaineeAdmin()) return;
  const reason = prompt('Indique el motivo de la eliminación. Este texto quedará guardado en Auditoría:');
  if (!reason?.trim()) return alert('El motivo es obligatorio para eliminar un detenido.');
  if (!confirm(`¿Eliminar el registro ${selectedDetainee.codigo}? Esta acción no se puede deshacer.`)) return;
  const record = selectedDetainee;
  for (const child of record.detencion_delitos || []) { const { error } = await supabaseClient.from('detencion_delitos').delete().eq('id',child.id); if (error) return alert(`No se pudo eliminar: ${error.message}`); await assignAuditReason('detencion_delitos',child.id,reason.trim()); }
  for (const child of record.detencion_armas || []) { const { error } = await supabaseClient.from('detencion_armas').delete().eq('id',child.id); if (error) return alert(`No se pudo eliminar: ${error.message}`); await assignAuditReason('detencion_armas',child.id,reason.trim()); }
  const { error } = await supabaseClient.from('detenciones').delete().eq('id',record.id); if (error) return alert(`No se pudo eliminar: ${error.message}`);
  await assignAuditReason('detenciones',record.id,reason.trim()); detaineeRecordModal.close(); selectedDetainee=null; await window.loadDetaineeRecords();
}

window.loadDetaineeDashboard = async function loadDetaineeDashboard() {
  const status = document.getElementById('detaineeDashboardStatus');
  status.textContent = 'Consultando información…'; status.classList.add('visible');
  let query = supabaseClient.from('detenciones_reportables').select('id,persona_id,fecha,motivo_detencion,situacion_actual,personas(nacionalidad,genero,departamento,provincia,distrito),detencion_delitos(delito_general)');
  const from = document.getElementById('detaineeDashboardFrom').value;
  const to = document.getElementById('detaineeDashboardTo').value;
  if (from) query = query.gte('fecha', from);
  if (to) query = query.lte('fecha', to);
  const { data, error } = await query;
  if (error) { status.textContent = 'No se pudo cargar el dashboard de detenidos.'; return; }
  const records = data || [];
  const now = new Date();
  const currentMonth = records.filter(item => { const date = new Date(`${item.fecha}T00:00:00`); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); }).length;
  document.getElementById('detaineeDashboardTotal').textContent = records.length.toLocaleString('es-PE');
  document.getElementById('detaineeDashboardPeople').textContent = new Set(records.map(item => item.persona_id)).size.toLocaleString('es-PE');
  document.getElementById('detaineeDashboardFlagrancy').textContent = records.filter(item => /flagrancia/i.test(item.motivo_detencion || '')).length.toLocaleString('es-PE');
  document.getElementById('detaineeDashboardMonth').textContent = currentMonth.toLocaleString('es-PE');
  const count = selector => records.reduce((result, item) => { const values = selector(item); for (const value of (Array.isArray(values) ? values : [values])) { const key = dashboardCategory(value); result[key] = (result[key] || 0) + 1; } return result; }, {});
  const renderCounts = (id, counts) => renderBarChart(id, counts);
  renderCounts('detaineeNationalityChart', count(item => item.personas?.nacionalidad));
  renderCounts('detaineeSituationChart', count(item => item.situacion_actual));
  renderCounts('detaineeGenderChart', count(item => item.personas?.genero));
  renderCounts('detaineeCrimeChart', count(item => item.detencion_delitos?.length ? item.detencion_delitos.map(crime => crime.delito_general) : [null]));
  window.renderCrimeMap?.('detaineeCrimeMap', records.map(item => ({ department:item.personas?.departamento, province:item.personas?.provincia, district:item.personas?.distrito })), 'detenciones');
  status.textContent = `${records.length.toLocaleString('es-PE')} detención${records.length === 1 ? '' : 'es'} en el periodo seleccionado.`;
};

document.getElementById('addCrimeButton').addEventListener('click', () => addCrimeRow());
document.getElementById('clearDetaineeButton').addEventListener('click', () => { editingDetaineeId=null; editingDetaineeReason=''; selectedDetainee=null; detaineeForm.reset(); window.resetDetaineeDependencies?.(); crimeList.innerHTML=''; addCrimeRow(); document.getElementById('saveDetaineeButton').textContent='Registrar detenido'; document.getElementById('detaineeStatus').textContent='Formulario limpio.'; });
document.getElementById('searchDetaineesButton').addEventListener('click', window.loadDetaineeRecords);
document.getElementById('refreshDetaineeDashboard').addEventListener('click', window.loadDetaineeDashboard);
document.getElementById('applyDetaineeDashboard').addEventListener('click', window.loadDetaineeDashboard);
document.getElementById('closeDetaineeRecordModal').addEventListener('click', () => detaineeRecordModal.close());
document.getElementById('closeDetaineeButton').addEventListener('click', () => detaineeRecordModal.close());
document.getElementById('editDetaineeButton').addEventListener('click', beginDetaineeEdit);
document.getElementById('deleteDetaineeButton').addEventListener('click', deleteDetainee);
detaineeForm.addEventListener('submit', saveDetainee);
window.initializeDetaineeForm();

// Contexto explícito: un alta vinculada nunca se convierte silenciosamente en otra.
(() => {
  let operativo = null, changed = false, saving = false;
  const banner = document.getElementById('detaineeOperativoBanner');
  window.detaineeWorkflowToken = 0;
  window.getDetaineeOperativo = () => operativo;
  window.setDetaineeBusy = value => {
    saving = value; detaineeForm.inert = value;
    document.getElementById('backToOperativoResults').disabled = value;
  };
  const standalone=document.getElementById('detaineeFormView');
  const inline=document.createElement('div');inline.id='inlineDetaineeHost';inline.className='detainee-view';inline.hidden=true;document.getElementById('linkedDetaineesPanel').append(inline);
  function unmount(){if(!inline.hidden){standalone.append(...inline.childNodes);inline.hidden=true;}document.getElementById('addLinkedDetainee').hidden=false;}
  window.clearDetaineeOperativo = () => { operativo = null; banner.hidden = true; unmount(); };
  window.DetaineeInline={get dirty(){return !inline.hidden&&changed;},get busy(){return !inline.hidden&&saving;},discard(){return !this.busy&&(!this.dirty||confirm('Hay un detenido sin guardar. ¿Desea descartar sus cambios?'));},close(){if(!inline.hidden)window.resetDetaineeWorkflow();}};
  detaineeForm.addEventListener('input', () => { changed = true; });
  detaineeForm.addEventListener('change', () => { changed = true; });
  detaineeForm.addEventListener('reset', () => { changed = false; });
  window.addEventListener('beforeunload', event => { if (changed || saving) { event.preventDefault(); event.returnValue = ''; } });
  window.resetDetaineeWorkflow = () => {
    window.detaineeWorkflowToken++; window.setDetaineeBusy(false); window.clearDetaineeOperativo();
    changed = false; editingDetaineeId = null; editingDetaineeReason = ''; selectedDetainee = null;
    detaineeForm.reset(); window.resetDetaineeDependencies?.(); crimeList.innerHTML = ''; addCrimeRow();
    document.getElementById('saveDetaineeButton').disabled = false;
    document.getElementById('saveDetaineeButton').textContent = 'Registrar detenido';
    document.getElementById('detaineeStatus').textContent = '';
    document.getElementById('detaineeOperativoLabel').textContent = '';
    detaineeRecordModal.close(); document.getElementById('detaineeRecordDetail').replaceChildren();
  };
  window.prepareStandaloneDetainee = () => {
    if (saving) return false;
    if (!operativo) return true;
    if (changed && !confirm('El formulario tiene cambios sin guardar. ¿Desea descartarlos y registrar un detenido independiente?')) return false;
    window.resetDetaineeWorkflow(); return true;
  };
  window.startDetaineeFromOperativo = record => {
    if (saving || (changed && !confirm('Hay datos de un detenido sin guardar. ¿Desea descartarlos y comenzar otro registro?'))) return;
    window.resetDetaineeWorkflow(); operativo = { ...record }; banner.hidden = false;
    document.getElementById('detaineeOperativoLabel').textContent = `${record.fecha?.split('-').reverse().join('/')} · ${record.unidad}`;
    setDetaineeField('fecha', record.fecha); setDetaineeField('hora', record.hora);
    setDetaineeField('notaSicpip', record.nota_sicpip); setDetaineeField('unidadArea', record.unidad_area_equipo);
    window.setDetaineeDependencies?.({ direccion_policial: record.direccion_policial, direccion_especializada_region: record.direccion_especializada_region, division_policial: record.division_policial, departamento_policial: record.departamento_policial, unidad_area_equipo: record.unidad_area_equipo });
    detaineeForm.querySelectorAll('.profile-registration-department').forEach(input => { input.value = record.departamento_registro; });
    detaineeForm.querySelectorAll('.profile-registration-area').forEach(input => { input.value = record.unidad; });
    document.getElementById('detaineeStatus').textContent = 'Al guardar, este detenido quedará vinculado al operativo indicado.';
    inline.append(...standalone.childNodes);inline.hidden=false;document.getElementById('addLinkedDetainee').hidden=true;document.getElementById('backToOperativoResults').textContent='Cerrar formulario';
    document.querySelector('[data-detainee-step-target]')?.click();
  };
  document.getElementById('backToOperativoResults').addEventListener('click', () => {
    if (saving || !operativo || (changed && !confirm('Hay datos sin guardar. ¿Desea descartarlos y volver a resultados?'))) return;
    const id = operativo.id; window.resetDetaineeWorkflow(); window.openOperativoResults?.(id);
  });
  window.afterDetaineeSave = id => {
    changed = false; window.clearDetaineeOperativo();
    if (id) window.onLinkedDetaineeSaved?.(id);
  };
  window.openLinkedDetainee = openDetaineeRecord;
})();
