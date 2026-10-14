(function(root){
  'use strict';
  const clean=value=>String(value??'').replace(/\s+/g,' ').trim()||'—';
  function read(sheet,code){
    return {code:clean(code),photo:sheet.querySelector('.print-photo img')?.src,
      sections:[...sheet.querySelectorAll('.print-block')].map(section=>({title:section.querySelector('h2').textContent,
        fields:[...section.querySelectorAll('.print-field')].map(field=>({label:field.querySelector('b').textContent,value:field.querySelector('span').textContent}))})),
      evidence:[...sheet.querySelectorAll('.print-evidence-item')].map(item=>({url:item.querySelector('img').src,label:item.querySelector('img').alt})),
      description:sheet.querySelector('.print-evidence-description p')?.textContent};
  }
  function loadImage(url){
    return new Promise((resolve,reject)=>{
      const image=new Image();image.crossOrigin='anonymous';
      const timer=setTimeout(()=>{image.onload=image.onerror=null;reject(new Error('La fotografía tarda en descargar. Vuelva a abrir la ficha e intente nuevamente.'));},20000);
      image.onerror=()=>{clearTimeout(timer);reject(new Error('No se pudo incluir una fotografía en el PDF. Vuelva a abrir la ficha para renovar su acceso.'));};
      image.onload=()=>{clearTimeout(timer);try{
        const canvas=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(image.naturalWidth,image.naturalHeight));
        canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
        const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
        resolve({data:canvas.toDataURL('image/jpeg',0.9),width:canvas.width,height:canvas.height});
      }catch(error){reject(new Error('No se pudo procesar una fotografía para el PDF. '+error.message));}};
      image.src=url;
    });
  }
  async function build(data,options={}){
    const PDF=options.jsPDF||root.jspdf?.jsPDF;if(!PDF)throw new Error('No se pudo cargar el generador de PDF. Recargue la página.');
    const imageLoader=options.loadImage||loadImage;
    const urls=[data.photo,...data.evidence.map(item=>item.url)].filter(Boolean),images=new Map();
    // All photos must be available before any file is offered for download.
    for(const url of new Set(urls))images.set(url,await imageLoader(url));
    const pdf=new PDF({unit:'mm',format:'a4',compress:true});
    pdf.setProperties({title:'Ficha '+data.code,subject:'Ficha voluntaria de identificación',creator:'DIRITPTIM Estadistica'});
    const left=14,width=182,bottom=269;let y=38;
    function header(title){
      pdf.setFillColor(32,49,67);pdf.rect(0,0,210,29,'F');pdf.setTextColor(255);pdf.setFont('helvetica','bold');pdf.setFontSize(15);pdf.text(title,14,13);
      pdf.setFont('helvetica','normal');pdf.setFontSize(9);pdf.text('DIRITPTIM - PNP  |  '+clean(data.code),14,22);pdf.setTextColor(32,49,67);
    }
    function next(title='Ficha voluntaria de identificación'){pdf.addPage();header(title);y=38;}
    function ensure(height){if(y+height>bottom)next();}
    function section(title,x=left,w=width){ensure(12);pdf.setFillColor(234,239,244);pdf.rect(x,y,w,8,'F');pdf.setFont('helvetica','bold');pdf.setFontSize(9);pdf.text(clean(title),x+2,y+5.5);y+=9;}
    function row(fields,x,w){
      const cell=w/fields.length;
      pdf.setFont('helvetica','normal');pdf.setFontSize(8.5);
      const values=fields.map(f=>pdf.splitTextToSize(clean(f.value),cell-5));
      const labels=fields.map(f=>{pdf.setFont('helvetica','bold');pdf.setFontSize(6.5);return pdf.splitTextToSize(clean(f.label).toUpperCase(),cell-5);});
      let offset=0;const max=Math.max(...values.map(v=>v.length));
      while(offset<max){
        const labelHeight=Math.max(...labels.map(l=>l.length))*2.7;
        ensure(labelHeight+8);
        const count=Math.min(max-offset,Math.max(1,Math.floor((bottom-y-labelHeight-4)/3.5)));
        const height=labelHeight+4+count*3.5;
        fields.forEach((field,i)=>{
          const cx=x+i*cell;pdf.setDrawColor(205,214,223);pdf.setLineWidth(0.2);pdf.rect(cx,y,cell,height);
          pdf.setFont('helvetica','bold');pdf.setFontSize(6.5);pdf.setTextColor(84,102,121);pdf.text(labels[i],cx+2.5,y+3.5,{lineHeightFactor:1.2});
          const lines=values[i].slice(offset,offset+count);if(lines.length){pdf.setFont('helvetica','normal');pdf.setFontSize(8.5);pdf.setTextColor(25,37,51);pdf.text(lines,cx+2.5,y+labelHeight+3.5,{lineHeightFactor:1.16});}
        });
        y+=height;offset+=count;if(offset<max)next();
      }
    }
    function photo(url,x,top,w,h){
      const img=images.get(url);pdf.setDrawColor(205,214,223);pdf.rect(x,top,w,h);
      if(!img){pdf.setFontSize(8);pdf.text('Sin fotografía',x+w/2,top+h/2,{align:'center'});return;}
      const scale=Math.min((w-2)/img.width,(h-2)/img.height),iw=img.width*scale,ih=img.height*scale;
      pdf.addImage(img.data,'JPEG',x+(w-iw)/2,top+(h-ih)/2,iw,ih);
    }
    header('Ficha voluntaria de identificación');photo(data.photo,left,y,43,56);
    data.sections.forEach((s,index)=>{
      const x=index===0?62:left,w=index===0?134:width;section(s.title,x,w);
      for(let i=0;i<s.fields.length;i+=3)row(s.fields.slice(i,i+3),x,w);
      y+=5;
    });
    ensure(38);pdf.setFont('helvetica','normal');pdf.setFontSize(7.5);pdf.setTextColor(84,102,121);
    pdf.text(pdf.splitTextToSize('La información se proporciona de forma voluntaria, observando el respeto a los derechos humanos.',width),left,y+3);
    y+=26;pdf.setDrawColor(100);pdf.line(24,y,88,y);pdf.line(122,y,186,y);pdf.text('Firma de la persona registrada',56,y+5,{align:'center'});pdf.text('Firma del responsable',154,y+5,{align:'center'});
    if(data.evidence.length){
      next('Registro fotográfico');section('Descripción registrada');row([{label:'Cicatrices, tatuajes y documentos',value:data.description}],left,width);y+=5;
      for(let i=0;i<data.evidence.length;i+=2){
        if(y+105>bottom)next('Registro fotográfico');
        data.evidence.slice(i,i+2).forEach((item,j)=>{const x=left+j*94;photo(item.url,x,y,88,93);pdf.setFontSize(8);pdf.setFont('helvetica','normal');pdf.text(clean(item.label),x+2,y+98);});y+=105;
      }
    }
    const pages=pdf.getNumberOfPages();for(let n=1;n<=pages;n++){pdf.setPage(n);pdf.setFont('helvetica','normal');pdf.setFontSize(7);pdf.setTextColor(100);pdf.text('Información protegida - Uso exclusivo de personal autorizado',left,285);pdf.text(`${n} / ${pages}`,196,285,{align:'right'});}
    return pdf;
  }
  async function download(sheet,code){
    const pdf=await build(read(sheet,code));const safe=String(code||'ficha').replace(/[^a-zA-Z0-9_-]/g,'_');await pdf.save(safe+'.pdf',{returnPromise:true});
  }
  root.FichaPDF={read,build,download};
})(typeof window==='undefined'?globalThis:window);
