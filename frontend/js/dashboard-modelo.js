// Agregados de registros ya autorizados por Supabase. No consulta otras unidades.
(() => {
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('_',' ').trim().toUpperCase();
  const clean=v=>String(v??'').replaceAll('_',' ').trim();
  const age=r=>r.data.edad==null||String(r.data.edad).trim()===''?null:Number.isFinite(Number(r.data.edad))?Number(r.data.edad):null;
  const ageBand=r=>age(r)==null?'Sin registrar':age(r)<18?'Menores de 18':age(r)<30?'18–29':age(r)<45?'30–44':age(r)<60?'45–59':'60 a más';
  const geo=r=>r.geography?Object.fromEntries(Object.entries(r.geography).map(([k,v])=>[k,clean(v)])):({department:clean(r.place.split(' / ')[0]),province:clean(r.place.split(' / ')[1]),district:clean(r.place.split(' / ')[2])});
  const amounts=[['soles','Soles · PEN'],['dolares','Dólares · USD'],['euros','Euros · EUR']];
  function facets(c){
    const preferred=['nacionalidad','genero','motivo_detencion','situacion_actual','situacion','motivo','tipo','marca','modalidad','es_funcionario','mas_buscado','sustancia','medida','tipo_municiones','procedencia','delito_general','grupo'];
    const fields=preferred.map(k=>c.fields.find(f=>f.key===k)).filter(Boolean);
    return fields.slice(0,6);
  }
  function filter(rows,f={}){
    return rows.filter(r=>{
      const g=geo(r),n=age(r);
      return (!f.from||r.date>=f.from)&&(!f.to||(r.date&&r.date.slice(0,10)<=f.to))&&(!f.unit||r.unit===f.unit)
        && ['department','province','district'].every(k=>!f[k]||norm(g[k])===norm(f[k]))
        && (f.ageMin==null||f.ageMin===''||(n!==null&&n>=Number(f.ageMin)))
        && (f.ageMax==null||f.ageMax===''||(n!==null&&n<=Number(f.ageMax)))
        && (!f.ageBand||ageBand(r)===f.ageBand)
        && (!f.currency||(f.currency==='dinero_otro'?!!clean(r.data.dinero_otro):Number(r.data[f.currency])>0))
        && Object.entries(f.facets||{}).every(([key,v])=>!v||(v==='__missing__'?!clean(r.data[key]):norm(r.data[key])===norm(v)));
    });
  }
  function group(rows,key){
    const groups=new Map();for(const r of rows){const label=clean(key(r))||'Sin registrar',k=norm(label);if(!groups.has(k))groups.set(k,{label,count:0});groups.get(k).count++;}
    return [...groups.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));
  }
  function timeline(rows,grain='month',from='',to=''){
    const dated=rows.filter(r=>/^\d{4}-\d{2}-\d{2}/.test(r.date)),size=grain==='year'?4:7;
    const counts=new Map(group(dated,r=>r.date.slice(0,size)).map(x=>[x.label,x.count]));
    if(!dated.length)return [];
    let start=(from||dated.map(r=>r.date).sort()[0]).slice(0,size),end=(to||dated.map(r=>r.date).sort().at(-1)).slice(0,size);
    const out=[];for(let k=start;k<=end&&out.length<1200;){out.push({label:k,count:counts.get(k)||0});if(grain==='year')k=String(Number(k)+1);else{let [y,m]=k.split('-').map(Number);m++;if(m>12){m=1;y++;}k=`${y}-${String(m).padStart(2,'0')}`;}}
    return out;
  }
  function totals(rows,c,f={}){
    let list=window.ConsultaModelo.metrics(rows,c);
    if(c.id==='dinero'&&f.currency)list=list.filter(([label])=>!['Soles (S/)','Dólares (USD)','Euros (EUR)'].includes(label)||({soles:'Soles (S/)',dolares:'Dólares (USD)',euros:'Euros (EUR)'})[f.currency]===label);
    return list;
  }
  window.DashboardModelo={norm,clean,age,ageBand,geo,amounts,facets,filter,group,timeline,totals};
})();
