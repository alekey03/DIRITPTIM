// Exportación de producción: una fila por registro; bandas/OOCC, una por integrante.
// Las consultas usan la sesión normal y RLS. No se emplean claves privilegiadas.
(() => {
  const sheets = window.PRODUCCION_CATALOGO.hojas;
  const months = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
  const path = (object, key) => key.split('.').reduce((value, part) => value?.[part], object);
  const detail = row => Array.isArray(row.intervencion_operativos) ? row.intervencion_operativos[0] : row.intervencion_operativos;
  const isOperative = p => ['operativo','megaoperativo'].includes(p.tipo);
  const stamp = parents => parents.filter(isOperative).map(p=>`${p.id}:${p.version}`).sort().join('|');
  const dateOf = (row, parent) => row.datos?.fecha || row.fecha || parent?.fecha || '';
  const matches = (date, parent, filters) => (!filters.from || date >= filters.from) && (!filters.to || (!!date && date <= filters.to)) && (!filters.unit || parent.unidad === filters.unit);
  function validateFilters(filters) {
    for (const key of ['from','to']) if (filters[key]) dateSerial(filters[key]);
    if (filters.from && filters.to && filters.from > filters.to) throw new Error('La fecha inicial no puede ser posterior a la fecha final.');
  }
  async function readTable(client, table, select='*', alive=()=>true, configure=q=>q, key='id') {
    const rows=[]; let cursor=null;
    for (;;) {
      if (!alive()) throw new Error('Exportación cancelada o sesión cambiada.');
      let q=configure(client.from(table).select(select)).order(key).limit(500);
      if (cursor!==null) q=q.gt(key,cursor);
      const {data,error}=await q;
      if (!alive()) throw new Error('Exportación cancelada o sesión cambiada.');
      if (error) throw new Error(`No se pudo leer ${table}: ${error.message || 'reintente'}`);
      if (!data?.length) return rows;
      if (data.some(r=>!r[key]) || (cursor && data[0][key]<=cursor)) throw new Error(`No se pudo completar la consulta de ${table}.`);
      rows.push(...data); cursor=data[data.length-1][key];
    }
  }
  async function snapshot(client, alive=()=>true, progress=()=>{}) {
    const parents=await readTable(client,'intervenciones','*,intervencion_operativos(*)',alive);
    const data={intervenciones:parents};
    const tables=[...new Set(sheets.map(s=>s.tabla).filter(t=>t!=='intervenciones'))];
    // A group can retain a historical detention that is excluded from the detainee total.
    tables.push('detenciones');
    for (let i=0;i<tables.length;i++) {
      const table=tables[i];progress(`Leyendo categorías ${i+1} de ${tables.length}…`);
      const select=table==='detenciones'||table==='detenciones_reportables'?'*,personas(*),detencion_delitos(*),detencion_armas(*)':'*';
      data[table]=await readTable(client,table,select,alive);
    }
    for (const group of data.intervencion_grupos) {
      group.intervencion_grupo_integrantes=await readTable(client,'intervencion_grupo_integrantes','*',alive,q=>q.eq('grupo_id',group.id),'detencion_id');
    }
    const check=await readTable(client,'intervenciones','id,tipo,version',alive);
    if (stamp(parents)!==stamp(check)) throw new Error('Hubo cambios en los operativos durante la consulta. Vuelva a preparar el Excel para incluir una versión consistente.');
    return data;
  }
  function contexts(data, sheet, filters, issues) {
    const parents=new Map(data.intervenciones.filter(isOperative).map(p=>[p.id,p]));
    const detentions=new Map((data.detenciones||data.detenciones_reportables||[]).map(d=>[d.id,d]));
    const selected=(data[sheet.tabla]||[]).filter(r=>!sheet.tipo||r.tipo===sheet.tipo);
    const rows=[];
    for (const r of selected) {
      const parent=sheet.tabla==='intervenciones'?r:parents.get(r.intervencion_id);
      if (!parent || !isOperative(parent)) { if (sheet.tabla==='detenciones_reportables') issues.orphans++; continue; }
      const date=dateOf(r,parent);
      if (!matches(date,parent,filters)) continue;
      const context={intervencion:parent,operativo:detail(parent)||{},[sheet.raiz]:r,datos:r.datos||{},fecha:date,recordId:r.id};
      if (sheet.tabla==='detenciones_reportables') {
        context.persona=r.personas||{};context.delitos=[...(r.detencion_delitos||[])].sort((a,b)=>a.orden-b.orden);
        if (context.delitos.length>2) issues.errors.push(`Detenido ${r.codigo||r.id}: tiene más de dos delitos; la plantilla solo dispone de dos bloques.`);
        if ((r.detencion_armas||[]).length) issues.legacyWeapons++;
      }
      if (sheet.tabla==='intervencion_grupos') {
        const members=[...(r.intervencion_grupo_integrantes||[])].sort((a,b)=>a.detencion_id.localeCompare(b.detencion_id));
        if (!members.length) issues.errors.push(`Grupo ${r.nombre}: no tiene integrantes vinculados.`);
        for (let i=0;i<members.length;i++) {
          const member=members[i],detention=detentions.get(member.detencion_id);
          if (!detention||detention.intervencion_id!==parent.id) {issues.errors.push(`Grupo ${r.nombre}: no se pudo consultar uno de sus integrantes en este operativo.`);continue;}
          const crimes=[...(detention.detencion_delitos||[])].sort((a,b)=>a.orden-b.orden);
          if (crimes.length>2) issues.errors.push(`Integrante ${detention.codigo||detention.id}: tiene más de dos delitos.`);
          rows.push({...context,integrante:member,persona:detention.personas||{},detencion:detention,delitos:crimes,contarBanda:i===0?'SI':'',sortId:r.id+':'+member.detencion_id});
        }
      } else rows.push(context);
    }
    return rows.sort((a,b)=>a.fecha.localeCompare(b.fecha)||(a.sortId||a.recordId).localeCompare(b.sortId||b.recordId));
  }
  function sourceValue(context, source, index) {
    if (source==='intervencion.tipo') return context.intervencion.tipo==='megaoperativo'?'MEGA OPERATIVO':'OPERATIVO';
    if (source==='operativo.resultado') return context.operativo.resultado?String(context.operativo.resultado).toUpperCase():'';
    if (/^(derivado|generado)\.(numero|numero_fila)$/.test(source)) return index+1;
    if (/^(derivado|generado)\.mes/.test(source)) return context.fecha?months[Number(context.fecha.slice(5,7))-1]:'';
    if (source==='derivado.contar_banda') return context.contarBanda;
    if (source==='derivado.grupo') return ({banda:'BANDA CRIMINAL',organizacion:'ORGANIZACION CRIMINAL',ninguno:'NINGUNO'})[context.detencion.tipo_organizacion] || (context.detencion.integra_organizacion?'SI':'NO');
    if (source==='derivado.armas') return [...new Set((context.detencion.detencion_armas||[]).map(w=>w.categoria).filter(Boolean))].join(' / ')||'NINGUNA';
    if (source==='derivado.tipos_armas') return (context.detencion.detencion_armas||[]).map(w=>w.tipo).filter(Boolean).join(' / ');
    return path(context,source);
  }
  function dateSerial(value) {
    const text=String(value),match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) throw new Error(`Fecha inválida: ${text}`);
    const [year,month,day]=match.slice(1).map(Number),utc=Date.UTC(year,month-1,day),date=new Date(utc);
    if (year<1900||date.getUTCFullYear()!==year||date.getUTCMonth()!==month-1||date.getUTCDate()!==day) throw new Error(`Fecha inválida: ${text}`);
    return (utc-Date.UTC(1899,11,30))/86400000;
  }
  function cell(value, kind) {
    if (value==null||value==='') return {t:'s',v:''};
    if (kind==='date') return {t:'n',v:dateSerial(value),z:'dd/mm/yyyy'};
    if (kind==='time') {
      const parts=/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(String(value));
      if (!parts) throw new Error(`Hora inválida: ${value}`);
      return {t:'n',v:(Number(parts[1])*3600+Number(parts[2])*60+Number(parts[3]||0))/86400,z:'hh:mm:ss'};
    }
    if (kind==='number') {
      if (typeof value==='boolean'||!Number.isFinite(Number(value))) throw new Error(`Número inválido: ${value}`);
      return {t:'n',v:Number(value),z:'0.######'};
    }
    // Explicit string cells: document numbers/IMEIs retain zeros; formula-like input is text.
    return {t:'s',v:typeof value==='boolean'?(value?'SI':'NO'):String(value)};
  }
  function build(data, filters={}) {
    validateFilters(filters);
    const issues={errors:[],orphans:0,legacyWeapons:0};
    const result=sheets.map(sheet=>{
      const records=contexts(data,sheet,filters,issues);
      const rows=records.map((record,i)=>sheet.columnas.map(c=>{
        try {return cell(sourceValue(record,c.origen,i),c.tipo);}
        catch(error) {issues.errors.push(`${sheet.nombre}, registro ${record.recordId}, ${c.encabezado.trim()}: ${error.message}`);return {t:'s',v:''};}
      }));
      return {...sheet,rows};
    });
    if (issues.errors.length) throw new Error(`No se descargó un reporte incompleto. Revise:\n${[...new Set(issues.errors)].slice(0,12).join('\n')}${issues.errors.length>12?'\nHay más registros por revisar.':''}`);
    const warnings=[];
    if (issues.orphans) warnings.push(`${issues.orphans} detenido(s) sin operativo autorizado quedaron fuera del reporte; revise su vinculación en Registros.`);
    if (issues.legacyWeapons) warnings.push('Las referencias de armas de Detenidos aparecen en esa hoja. Armas de fuego/blancas y Municiones exportan los registros de sus módulos; no se duplican automáticamente.');
    return {sheets:result,warnings,total:result.reduce((n,s)=>n+s.rows.length,0),filters:{...filters}};
  }
  function workbook(report, XLSX) {
    const book=XLSX.utils.book_new();
    book.Props={Title:'Producción DIRITPTIM',Subject:'Detallado de producción — 22 hojas',Author:'DIRITPTIM',Comments:'Datos autorizados según la cuenta y filtros indicados al descargar. Incluye registros guardados de operativos. NI principal del operativo.'};
    for (const sheet of report.sheets) {
      const ws={};
      sheet.columnas.forEach((c,j)=>{ws[XLSX.utils.encode_cell({r:0,c:j})]={t:'s',v:c.encabezado};});
      sheet.rows.forEach((row,i)=>row.forEach((c,j)=>{ws[XLSX.utils.encode_cell({r:i+1,c:j})]={...c};}));
      ws['!ref']=XLSX.utils.encode_range({s:{r:0,c:0},e:{r:sheet.rows.length,c:sheet.columnas.length-1}});
      ws['!autofilter']={ref:ws['!ref']};
      ws['!cols']=sheet.columnas.map(c=>({wch:c.tipo==='date'?14:c.tipo==='time'?12:c.encabezado.trim().length<8?12:28}));
      ws['!rows']=[{hpt:75}];
      ws['!margins']={left:0.25,right:0.25,top:0.5,bottom:0.5,header:0.2,footer:0.2};
      XLSX.utils.book_append_sheet(book,ws,sheet.nombre);
    }
    return book;
  }
  window.ProduccionModelo={sheets,readTable,snapshot,build,workbook,validateFilters,stamp};
})();
