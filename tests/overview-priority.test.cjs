const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const base=process.env.DIRITPTIM_ROOT||path.resolve(__dirname,'..');
const code=fs.readFileSync(path.join(base,'frontend/js/overview.js'),'utf8');
const node=()=>({hidden:false,disabled:false,children:[],style:{setProperty(k,v){this[k]=v}},dataset:{},classList:{toggle(k,v){this[k]=v}},insertBefore(c,b){if(c.parentElement)c.parentElement.children.splice(c.parentElement.children.indexOf(c),1);this.children.splice(b?this.children.indexOf(b):this.children.length,0,c);c.parentElement=this;}});
const nodes=Object.fromEntries(['.production-stage','[data-core]','[data-summary-featured]','[data-summary-all]','.production-divider','[data-summary-empty]'].map(k=>[k,node()]));
const featured=['detenidos','rq','banda','organizacion','victimas','celulares','migraciones','personas_ubicadas'];
const ids=[...featured,'dinero','menores','expulsados'],cats=ids.map(id=>({id})),cards=new Map(ids.map(k=>{const n=node();n.id=k;return [k,n]}));
const ctx={$:s=>nodes[s],featured,cats,cards};vm.createContext(ctx);vm.runInContext(code.slice(code.indexOf(' function layoutSummary()'),code.indexOf(' const empty=')),ctx);
const main=()=>nodes['[data-summary-featured]'].children.map(x=>x.id),other=()=>nodes['[data-summary-all]'].children.map(x=>x.id);
cards.get('personas_ubicadas').hidden=true;ctx.layoutSummary();assert.equal(main().length,10);assert.equal(main()[7],'dinero');assert.ok(!other().includes('dinero'));assert.equal(cards.get('dinero').dataset.side,'right');assert.equal(cards.get('dinero').style['--summary-row'],3);
// A different dependency can have fewer main categories: promote the next available ones.
cards.get('rq').hidden=true;ctx.layoutSummary();assert.ok(main().includes('menores'));assert.equal(main().length,9);
// Returning to all categories restores the main categories without duplicate cards.
cards.get('rq').hidden=false;cards.get('personas_ubicadas').hidden=false;ctx.layoutSummary();assert.deepEqual(main(),[...featured,'dinero','menores']);assert.ok(other().includes('expulsados'));assert.equal(nodes['.production-stage'].style['--summary-rows'],5);
for(const b of cards.values())b.hidden=true;cards.get('dinero').hidden=false;ctx.layoutSummary();assert.deepEqual(main(),['dinero']);assert.equal(nodes['.production-stage'].style['--summary-rows'],1);
cards.get('dinero').disabled=true;ctx.layoutSummary();assert.equal(main().length,0);assert.ok(other().includes('dinero'));
assert.equal(new Set([...main(),...other()]).size,ids.length);
console.log('PASS: diez indicadores y cinco filas; dinero completa vacantes; otras categorías cubren vacantes; cambio de dependencia sin duplicados; errores no se promocionan.');
