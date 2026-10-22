/* Presentación de catálogos. Las claves almacenadas no se cambian: las
   relaciones, validaciones del servidor y registros históricos las utilizan. */
(() => {
  const key = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
  const countries = new Map();
  if (typeof Intl.DisplayNames === 'function') {
    const names = new Intl.DisplayNames(['es'], { type: 'region', fallback: 'none' });
    for (let a = 65; a <= 90; a++) for (let b = 65; b <= 90; b++) {
      const code = String.fromCharCode(a, b), name = names.of(code);
      if (name && name !== code) countries.set(key(name), name);
    }
  }
  const aliases = {
    PERU: 'Perú', MEJICO: 'México', MEXICO: 'México', BELIZE: 'Belice',
    AZERBAYAN: 'Azerbaiyán', BAHREIN: 'Baréin', BHUTAN: 'Bután', BOTSWANA: 'Botsuana',
    'BOSNIA HERZEGOVINA': 'Bosnia y Herzegovina', COMORES: 'Comoras', DJIBUTI: 'Yibuti',
    'ESLOVAQUIA (REPUBLICA DE ESLOVAQUIA)': 'Eslovaquia',
    'ESTADOS FEDERADOS DE MICRONESIA': 'Estados Federados de Micronesia',
    'ESTADOS UNIDOS DE AMERICA (USA)': 'Estados Unidos de América (USA)',
    'FEDERACION RUSA': 'Federación Rusa', 'FIDJI, ISLAS': 'Islas Fiyi', IRAQ: 'Irak',
    JERUSALEM: 'Jerusalén', KAZAJSTAN: 'Kazajistán', MALAWI: 'Malaui',
    'REPUBLICA DE MOLDAVIA': 'República de Moldavia', 'REPUBLICA SUDAFRICANA': 'República Sudafricana',
    'SAINT-CHISTOPHER Y NIEVES': 'San Cristóbal y Nieves', 'SALVADOR, EL': 'El Salvador',
    SRILANKA: 'Sri Lanka', SURINAM: 'Surinam', TADJIKISTAN: 'Tayikistán',
    'FRANCE, METROPOLITAN': 'Francia metropolitana',
    'FRENCH SOUTHERN TERRITORIES': 'Territorios Australes Franceses',
    'NORTHERN MARIANA ISLANDS': 'Islas Marianas del Norte',
    'UNITED STATES MINOR OUTLING ISLANDS': 'Islas menores alejadas de Estados Unidos',
    'INDICO, OCEANO (TERITORIO BRITANICO DEL)': 'Territorio Británico del Océano Índico',
    'EX-REPUBLICA YUGOSLAVA DE MACEDONIA': 'Ex República Yugoslava de Macedonia',
    'ANTILLAS HOLANDESAS': 'Antillas Holandesas', 'SAMOA NORTEAMERICANA': 'Samoa Americana',
    'NIGER, REPUBLICA DE': 'República de Níger', 'REINA MAUD, TIERRA DE LA': 'Tierra de la Reina Maud',
    'TURKS Y CAICOS, ISLAS': 'Islas Turcas y Caicos', 'FAEROES, ISLAS': 'Islas Feroe',
    'LAISER PASSER': 'Laissez-passer', 'SALVO CONDUCTO': 'Salvoconducto',
    'PTP(PERMISO TEMPORAL PERMANENCIA)': 'PTP (Permiso Temporal de Permanencia)',
    'PRIVADO DE SU LIBERTAD_ ESTABLECIMIENTO PENITENCIARIO': 'Privado de su libertad: establecimiento penitenciario',
    'PRIVADO DE SU LIBERTAD_ ESTABLECIMIENTO PENITENCIARIO (PRISION PREVENTIVA )': 'Privado de su libertad: establecimiento penitenciario (prisión preventiva)'
  };
  Object.entries(aliases).forEach(([from, to]) => countries.set(key(from), to));
  const words = Object.fromEntries(('Perú|dirección|división|investigación|tráfico|ilícito|organización|situación|detención|continúa|disposición|fiscalía|prisión|víctima|víctimas|cédula|carné|extranjería|policía|policías|tránsito|número|trata|protección|explotación|sexual|información|identificación|intervención|intervenciones|región|regiones|ámbito|estadística|administración|público|pública|públicos|públicas|común|comunes|vehículo|vehículos|tráfico|requisitoría|posesión|fabricación|comercialización|munición|municiones|teléfono|teléfonos|electrónico|electrónicos|código|país|países|género|ocupación|profesión|educación|instrucción|básica|técnica|técnico|económica|económico|migración|migraciones|método|métodos|vigía|Huánuco|Áncash|Junín|Apurímac|San Martín|Cañete|Marañón|Pachacámac|Jesús|María|José|Martín|Ramón|Simón|Pacífico|Índico|Atlántico|Antártida').split('|').map(word => [key(word), word]));
  function label(value) {
    const text = String(value).normalize('NFC').replace(/\bDIRCTPTIM\b/gi, 'DIRITPTIM');
    const country = countries.get(key(text));
    if (country) return country;
    return text.replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g, word => {
      const corrected = words[key(word)];
      if (!corrected) return word;
      if (word === word.toUpperCase()) return corrected.toUpperCase();
      if (word[0] === word[0].toUpperCase()) return corrected[0].toUpperCase() + corrected.slice(1);
      return corrected.toLowerCase();
    });
  }
  function option(option) {
    const corrected = label(option.textContent);
    if (corrected !== option.textContent) {
      // An option without a value attribute derives its value from its text.
      // Freeze that original value before correcting the visible caption.
      if (!option.hasAttribute('value')) option.setAttribute('value', option.value);
      option.textContent = corrected;
    }
    if (option.hasAttribute('label')) {
      const caption = label(option.label);
      if (caption !== option.label) option.label = caption;
    }
  }
  function scan(node) {
    if (node.nodeType === 3) node = node.parentElement;
    if (!node) return;
    if (node.tagName === 'OPTION') option(node);
    else node.querySelectorAll?.('option').forEach(option);
  }
  window.CatalogoTexto = Object.freeze({ label });
  scan(document);
  // Covers static, protected server catalogs and options rebuilt by cascades.
  new MutationObserver(records => records.forEach(record => {
    if (record.type === 'attributes' || record.type === 'characterData') scan(record.target);
    else { if (record.target.tagName === 'OPTION') scan(record.target); record.addedNodes.forEach(scan); }
  })).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['label'] });
})();
