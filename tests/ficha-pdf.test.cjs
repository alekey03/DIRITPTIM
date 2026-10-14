const assert=require('node:assert/strict');
const {jsPDF}=require('../frontend/vendor/jspdf-4.2.1.umd.min.js');
require('../frontend/js/ficha-pdf.js');
const image={data:'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AKp//9k=',width:1,height:1};
const basic={code:'FIC-PRUEBA',photo:'main',sections:[{title:'Datos personales',fields:[{label:'Nombre',value:'PRUEBA TÉCNICA'},{label:'Documento',value:'00001234'},{label:'Edad',value:0}]}],evidence:[],description:''};
(async()=>{
 let loads=0;const options={jsPDF,loadImage:async()=>{loads++;return image;}};
 const pdf=await FichaPDF.build(basic,options);assert.equal(loads,1);assert.equal(pdf.getNumberOfPages(),1);assert.ok(pdf.output('arraybuffer').byteLength>1000);
 const large=await FichaPDF.build({...basic,sections:[{title:'Datos extensos',fields:[{label:'Descripción',value:'Contenido largo sin truncamiento. '.repeat(1200)}]}],evidence:Array.from({length:7},(_,i)=>({url:'extra'+i,label:'Documento '+i}))},options);
 assert.ok(large.getNumberOfPages()>4);assert.equal(loads,9);
 await assert.rejects(FichaPDF.build(basic,{jsPDF,loadImage:async()=>{throw new Error('Foto no disponible');}}),/Foto no disponible/);
 console.log('PASS: PDF real con foto, ceros conservados, paginación de texto largo y 7 anexos; fallo de foto bloquea exportación.');
})().catch(e=>{console.error(e);process.exitCode=1;});
