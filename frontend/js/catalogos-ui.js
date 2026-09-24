(function initializeDependentCatalogs() {
  const GEO = window.CATALOGO_UBIGEO || [];
  let CRIMES = [];
  let POLICE = [];
  let WEAPONS = [];
  let operativoCatalogs = null;

  const ROOT_LABELS = {
    FUERO_COMUN: 'Fuero común',
    FUERO_MILITAR_POLICIAL: 'Fuero militar policial',
    LEYES_ESPECIALES: 'Leyes especiales',
    ARMA_DE_FUEGO: 'Arma de fuego',
    ARMA_BLANCA: 'Arma blanca',
    OTRO: 'Otro',
    DIRNIC: 'DIRNIC',
    DIRNOS: 'DIRNOS'
  };

  function htmlEscape(value) {
    return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  function readable(value) {
    if (!value) return '';
    if (ROOT_LABELS[value]) return ROOT_LABELS[value];
    const repaired = String(value)
      .replace(/N�/g, 'N°')
      .replace(/M�TODOS/g, 'MÉTODOS')
      .replace(/M�TODO/g, 'MÉTODO')
      .replace(/VIG�A/g, 'VIGÍA')
      .replace(/POLIC�A/g, 'POLICÍA')
      .replace(/AQU�L/g, 'AQUÉL')
      .replace(/�/g, 'Ó')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return repaired.toLocaleLowerCase('es-PE').replace(/(^|[\s(/.-])([a-záéíóúñü])/g, (_, before, letter) => before + letter.toLocaleUpperCase('es-PE'));
  }

  function fillSelect(select, nodes, placeholder, selectedValue = '') {
    if (!select) return;
    const options = [`<option value="">${placeholder}</option>`];
    for (const node of nodes || []) {
      const label = select.dataset.uppercaseOptions === 'true' ? readable(node.value).toLocaleUpperCase('es-PE') : readable(node.value);
      options.push(`<option value="${htmlEscape(node.value)}">${htmlEscape(label)}</option>`);
    }
    select.innerHTML = options.join('');
    select.disabled = !(nodes && nodes.length);
    if (selectedValue && [...select.options].some(option => option.value === selectedValue)) select.value = selectedValue;
  }

  function selectedNode(nodes, value) {
    return (nodes || []).find(node => node.value === value) || null;
  }

  function bindCascade(selects, roots, placeholders) {
    let sourceNodes = roots || [];
    const refreshFrom = index => {
      let nodes = sourceNodes;
      for (let level = 0; level < index; level += 1) {
        const node = selectedNode(nodes, selects[level].value);
        nodes = node?.children || [];
      }
      const parent = selectedNode(nodes, selects[index].value);
      let children = parent?.children || [];
      for (let level = index + 1; level < selects.length; level += 1) {
        fillSelect(selects[level], children, placeholders[level]);
        children = [];
      }
    };
    selects.forEach((select, index) => select?.addEventListener('change', () => refreshFrom(index)));
    fillSelect(selects[0], sourceNodes, placeholders[0]);
    for (let index = 1; index < selects.length; index += 1) fillSelect(selects[index], [], placeholders[index]);
    return {
      reset() {
        fillSelect(selects[0], sourceNodes, placeholders[0]);
        for (let index = 1; index < selects.length; index += 1) fillSelect(selects[index], [], placeholders[index]);
      },
      set(values = []) {
        let nodes = sourceNodes;
        selects.forEach((select, index) => {
          fillSelect(select, nodes, placeholders[index], values[index] || '');
          const node = selectedNode(nodes, select.value);
          nodes = node?.children || [];
        });
      },
      setRoots(nextRoots) {
        sourceNodes = nextRoots || [];
        fillSelect(selects[0], sourceNodes, placeholders[0]);
        for (let index = 1; index < selects.length; index += 1) fillSelect(selects[index], [], placeholders[index]);
      }
    };
  }

  // Every police form shares five levels; historical paths remain readable on edit.
  function bindPolice(selects) {
    selects.forEach(s => { if (s) s.dataset.uppercaseOptions = 'true'; });
    const labels = ['Seleccionar dirección policial', 'Seleccionar dirección / región / frente', 'Seleccionar división / jefatura', 'Seleccionar departamento policial', 'Seleccionar unidad / área / equipo'];
    let roots = POLICE;
    const cascade = bindCascade(selects, roots, labels);
    function pending() {
      if (selects.length < 5) return;
      const division = selects[2]?.value || '';
      const central = (window.DEPENDENCIAS_FLUJO?.[0]?.children?.[0]?.children || []).some(n => n.value === division && !n.children.length);
      for (const s of selects.slice(3)) if (central && !s.value) fillSelect(s, [], 'Pendiente de catálogo');
    }
    selects.forEach(s => s?.addEventListener('change', pending));
    return {
      reset() { cascade.setRoots(roots); pending(); },
      setRoots(next) { roots = next; cascade.setRoots(roots); pending(); },
      set(values = []) {
        const copy = JSON.parse(JSON.stringify(roots));
        let nodes = copy;
        // Preserve exact stored names, without making retired paths available in new records.
        for (const value of values) {
          if (!value) break;
          let node = nodes.find(n => n.value === value);
          if (!node) { node = {value, children: []}; nodes.push(node); }
          nodes = node.children || (node.children = []);
        }
        cascade.setRoots(copy); cascade.set(values);
        selects.forEach((select, index) => {
          const value = values[index];
          if (value && select.value !== value) { select.add(new Option(value, value)); select.value = value; select.disabled = false; }
        });
        pending();
      }
    };
  }

  function policeCatalog(existing) {
    const roots = JSON.parse(JSON.stringify(existing || []));
    for (const incoming of window.DEPENDENCIAS_FLUJO || []) {
      let root = roots.find(n => n.value === incoming.value);
      if (!root) { root = {value: incoming.value, children: []}; roots.push(root); }
      root.children = (root.children || []).filter(n => !/^DIRC?TPTIM$/i.test(n.value));
      root.children.push(...incoming.children);
    }
    return roots;
  }

  function bindLocation(prefix) {
    const selects = [
      document.getElementById(`${prefix}Department`),
      document.getElementById(`${prefix}Province`),
      document.getElementById(`${prefix}District`)
    ];
    if (selects.some(select => !select)) return null;
    return bindCascade(selects, GEO, ['Seleccionar departamento', 'Seleccionar provincia', 'Seleccionar distrito']);
  }

  const victimLocation = bindLocation('victim');
  const detaineeLocation = bindLocation('detainee');
  const policeDependency = bindPolice(['policeDirection', 'policeRegion', 'policeDivision', 'policeDepartment', 'policeUnit'].map(id => document.getElementById(id)));
  const receiverDependency = bindPolice(['disposicionDireccion','disposicionRegion','disposicionDivision','disposicionDepartamento','disposicionUnidad'].map(name => document.querySelector('#detaineeForm [name="'+name+'"]')));
  const weaponDependency = bindCascade(
    ['weaponCategory', 'weaponType'].map(id => document.getElementById(id)),
    WEAPONS,
    ['Ninguna', 'Seleccionar tipo de arma']
  );
  let victimLocationLegacy = '';

  const organizationToggle = document.getElementById('criminalOrganization');
  const organizationRole = document.getElementById('organizationRole');
  const organizationName = document.getElementById('organizationName');
  function updateOrganizationFields() {
    const enabled = ['banda', 'organizacion', ''].includes(organizationToggle?.value);
    if (organizationRole) {
      organizationRole.disabled = !enabled;
      organizationRole.required = enabled;
      if (!enabled) organizationRole.value = '';
    }
    if (organizationName) {
      organizationName.disabled = !enabled;
      organizationName.required = enabled;
      if (!enabled) organizationName.value = '';
    }
  }
  organizationToggle?.addEventListener('change', updateOrganizationFields);
  updateOrganizationFields();

  window.getVictimLocation = function getVictimLocation() {
    const selected = ['victimDepartment', 'victimProvince', 'victimDistrict']
      .map(id => readable(document.getElementById(id)?.value || ''))
      .filter(Boolean)
      .join(' / ');
    return selected || victimLocationLegacy;
  };
  window.resetVictimLocation = () => { victimLocationLegacy = ''; victimLocation?.reset(); };
  window.resetDetaineeLocation = () => detaineeLocation?.reset();
  window.resetDetaineeDependencies = () => {
    detaineeLocation?.reset();
    policeDependency?.reset();
    receiverDependency?.reset();
    weaponDependency?.reset();
    updateOrganizationFields();
  };
  window.setDetaineeDependencies = function setDetaineeDependencies(values = {}) {
    detaineeLocation?.set([values.departamento, values.provincia, values.distrito]);
    policeDependency?.set([values.direccion_policial, values.direccion_especializada_region, values.division_policial, values.departamento_policial, values.unidad_area_equipo]);
    receiverDependency?.set([values.disposicion_direccion,values.disposicion_region,values.disposicion_division,values.disposicion_departamento,values.disposicion_unidad]);
    weaponDependency?.set([values.arma_categoria, values.arma_tipo]);
    if (organizationToggle) organizationToggle.value = values.integra_organizacion ? (values.tipo_organizacion || '') : 'false';
    updateOrganizationFields();
    if (organizationRole) organizationRole.value = values.rol_organizacion || '';
    if (organizationName) organizationName.value = values.nombre_organizacion || '';
  };
  window.setVictimLocation = function setVictimLocation(storedValue) {
    const wanted = String(storedValue || '').split('/').map(value => value.trim());
    victimLocationLegacy = '';
    if (wanted.length < 2) {
      victimLocationLegacy = String(storedValue || '').trim();
      return victimLocation?.reset();
    }
    let nodes = GEO;
    const rawValues = wanted.map(label => {
      const match = nodes.find(node => readable(node.value).toLocaleLowerCase('es-PE') === label.toLocaleLowerCase('es-PE'));
      nodes = match?.children || [];
      return match?.value || '';
    });
    if (!rawValues[0]) victimLocationLegacy = String(storedValue || '').trim();
    victimLocation?.set(rawValues);
  };

  window.createCrimeCascade = function createCrimeCascade(row, values = {}) {
    const selects = [
      row.querySelector('[data-field="jurisdiction"]'),
      row.querySelector('[data-field="general"]'),
      row.querySelector('[data-field="specific"]'),
      row.querySelector('[data-field="subtype"]')
    ];
    const cascade = row._crimeCascade || bindCascade(selects, CRIMES, ['Seleccionar fuero o ley', 'Seleccionar delito general', 'Seleccionar delito específico', 'Seleccionar subtipo']);
    row._crimeCascade = cascade;
    cascade.setRoots(CRIMES);
    cascade.set([values.fuero_ley_especial, values.delito_general, values.delito_especifico, values.subtipo]);
    return cascade;
  };

  window.bindMinorCatalogs = function(container, values = {}) {
    const controls = keys => keys.map(k => container.querySelector('[name="'+k+'"]'));
    const weapon = bindCascade(controls(['arma_categoria','arma_tipo']), WEAPONS, ['Ninguna','Seleccionar tipo']);
    weapon.set([values.arma_categoria,values.arma_tipo]);
    const keys=['disposicion_direccion','disposicion_region','disposicion_division','disposicion_departamento','disposicion_unidad'];
    const police=bindPolice(controls(keys));
    police.set(keys.map(k=>values[k]));
    // Keep historical values readable if the source catalog changes.
    controls(['arma_categoria','arma_tipo',...keys]).forEach(control=>{const value=values[control.name];if(value&&!Array.from(control.options).some(o=>o.value===value)){control.append(new Option(value,value));control.value=value;control.disabled=false;}});
  };

  window.bindOperativoCatalogs = function bindOperativoCatalogs(form) {
    const selects = kind => [...form.querySelectorAll(`[data-op-catalog="${kind}"]`)];
    const geo = bindCascade(selects('geo'), GEO, ['Seleccionar departamento', 'Seleccionar provincia', 'Seleccionar distrito']);
    const police = bindPolice(selects('police'));
    const crime = bindCascade(selects('crime'), [], ['Seleccionar delito general', 'Seleccionar delito específico']);
    function refresh() {
      const generals = new Map();
      for (const root of CRIMES) for (const general of root.children || []) {
        const children = generals.get(general.value)?.children || [];
        const merged = new Map([...children, ...(general.children || [])].map(node => [node.value, node]));
        generals.set(general.value, { value: general.value, children: [...merged.values()] });
      }
      police.setRoots(POLICE);
      crime.setRoots([...generals.values()]);
    }
    operativoCatalogs = { refresh, reset() { geo.reset(); police.reset(); crime.reset(); },
      set(i, o) {
        geo.set([i.departamento, i.provincia, i.distrito]);
        police.set([i.direccion_policial, i.direccion_especializada_region, i.division_policial, i.departamento_policial, i.unidad_area_equipo]);
        crime.set([o.delito_general, o.delito_especifico]);
      }
    };
    refresh();
    return operativoCatalogs;
  };

  window.getHistoricalCatalogs = () => ({crimes: CRIMES, police: POLICE, weapons: WEAPONS});

  window.setProtectedCatalogs = function setProtectedCatalogs(catalogs) {
    CRIMES = Array.isArray(catalogs?.delitos) ? catalogs.delitos : [];
    POLICE = policeCatalog(Array.isArray(catalogs?.dependencias_policiales) ? catalogs.dependencias_policiales : []);
    WEAPONS = Array.isArray(catalogs?.armas) ? catalogs.armas : [];
    operativoCatalogs?.refresh();
    policeDependency?.setRoots(POLICE);
    receiverDependency?.setRoots(POLICE);
    weaponDependency?.setRoots(WEAPONS);
    document.querySelectorAll('.crime-row').forEach(row => {
      const values = {
        fuero_ley_especial: row.querySelector('[data-field="jurisdiction"]')?.value || '',
        delito_general: row.querySelector('[data-field="general"]')?.value || '',
        delito_especifico: row.querySelector('[data-field="specific"]')?.value || '',
        subtipo: row.querySelector('[data-field="subtype"]')?.value || ''
      };
      window.createCrimeCascade(row, values);
    });
  };

  window.clearProtectedCatalogs = function clearProtectedCatalogs() {
    CRIMES = [];
    POLICE = [];
    WEAPONS = [];
    operativoCatalogs?.refresh();
    policeDependency?.setRoots([]);
    receiverDependency?.setRoots([]);
    weaponDependency?.setRoots([]);
    document.querySelectorAll('.crime-row').forEach(row => row._crimeCascade?.setRoots([]));
  };
}());