const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html'),source=read('frontend/js/detenidos.js');
const options=[...html.match(/<select name="situacionActual">([\s\S]*?)<\/select>/)[1].matchAll(/<option value="([^"]*)">/g)].map(m=>m[1]);
test('Situación del detenido contiene las diez opciones SITUACION_DETENIDO del Excel',()=>{
 const expected=['LIBERTAD SEDE POLICIAL','LIBERTAD SEDE FISCAL','LIBERTAD SEDE JUDICIAL','LIBERTAD CONDICIONAL','PRIVADO DE SU LIBERTAD_ ESTABLECIMIENTO PENITENCIARIO','PRIVADO DE SU LIBERTAD_ ESTABLECIMIENTO PENITENCIARIO (PRISION PREVENTIVA )','CONTINUA DETENIDO','PUESTO A DISPOSICION DE UNIDAD PNP','PUESTO A DISPOSICION DE FISCALIA','PUESTO A DISPOSICION DE JUZGADO'];
 assert.deepEqual(options,['',...expected]);
});
test('Editar conserva valores anteriores y limpia opciones heredadas al cambiar de registro',()=>{
 const field={tagName:'SELECT',options:[],value:'',add(o){o.remove=()=>{this.options=this.options.filter(x=>x!==o)};this.options.push(o)}};
 function Option(text,value){this.text=text;this.value=value;this.dataset={};}
 for(const value of options)field.add(new Option(value,value));
 const ctx={detaineeForm:{elements:{namedItem:()=>field}},Option};vm.createContext(ctx);
 vm.runInContext(source.slice(source.indexOf('function setDetaineeField('),source.indexOf('function detailField(')),ctx);
 for(const value of ['PUESTO A DISPOSICION DE FISCALIA','CITADO','OTRO VALOR ANTIGUO','']){
  ctx.setDetaineeField('situacionActual',value);assert.equal(field.value,value);
  assert.equal(field.options.filter(o=>o.dataset.legacy).length,value&&!options.includes(value)?1:0);
 }
 assert(source.includes("situacion_actual: nullable(detaineeValue('situacionActual'))"));
});
test('Edición histórica comparte el desplegable y conserva el valor original',()=>{
 const s=read('frontend/js/historico.js');assert(s.includes("situacion_actual:'situacionActual'"));
 assert(s.includes("String(value)+' · valor original'"));
});
