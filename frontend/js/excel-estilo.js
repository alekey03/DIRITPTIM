// Mantiene SheetJS y la estructura existente; añade estilo a la primera fila del XLSX.
(() => {
  function colorHeaders(bytes,zip){
    const files=zip.unzipSync(new Uint8Array(bytes)),name='xl/styles.xml';
    if(!files[name])throw new Error('No se encontraron los estilos del Excel.');
    let xml=zip.strFromU8(files[name]);
    function append(tag,entry){let index;xml=xml.replace(new RegExp(`<${tag}([^>]*)>([\\s\\S]*?)</${tag}>`),(all,attrs,body)=>{index=Number(attrs.match(/count="(\d+)"/)?.[1]||0);return `<${tag}${attrs.replace(/count="\d+"/,`count="${index+1}"`)}>${body}${entry}</${tag}>`;});if(index==null)throw new Error('No se pudo aplicar el encabezado celeste.');return index;}
    const font=append('fonts','<font><sz val="11"/><color rgb="FF17374D"/><name val="Calibri"/><b/></font>');
    const fill=append('fills','<fill><patternFill patternType="solid"><fgColor rgb="FFCCE8F6"/><bgColor indexed="64"/></patternFill></fill>');
    const style=append('cellXfs',`<xf numFmtId="0" fontId="${font}" fillId="${fill}" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>`);
    files[name]=zip.strToU8(xml);
    for(const path of Object.keys(files).filter(p=>/^xl\/worksheets\/sheet\d+\.xml$/.test(p))){
      let sheet=zip.strFromU8(files[path]);sheet=sheet.replace(/<row\b[^>]*\br="1"[^>]*>[\s\S]*?<\/row>/,row=>row.replace(/<c\b([^>]*)>/g,(_,attrs)=>`<c${attrs.replace(/\s+s="[^"]*"/g,'')} s="${style}">`));files[path]=zip.strToU8(sheet);
    }
    return zip.zipSync(files,{level:6});
  }
  window.ExcelEstilo={colorHeaders};
  window.downloadStyledWorkbook=(book,filename)=>{
    if(!window.XLSX||!window.fflate)throw new Error('No se pudo cargar el formato de Excel. Recargue la página.');
    const bytes=colorHeaders(XLSX.write(book,{bookType:'xlsx',type:'array',compression:true}),fflate);
    const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  };
})();
