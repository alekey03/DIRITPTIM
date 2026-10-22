/* The database enforces the same dates using America/Lima; this is early feedback. */
window.ProductionDeadline = (() => {
  function limits(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
    const value = type => parts.find(p=>p.type===type).value;
    const today = `${value('year')}-${value('month')}-${value('day')}`;
    const start = new Date(`${today}T12:00:00Z`); start.setUTCDate(start.getUTCDate()-3);
    return {min:start.toISOString().slice(0,10),max:today};
  }
  function error(date) {
    const {min,max}=limits();
    if (!date) return 'Indique la fecha de la producción.';
    if (date<min) return `Registro fuera de plazo. Solo se admite producción de hoy y de los tres días anteriores (desde ${min.split('-').reverse().join('/')}).`;
    return date>max?'No se permite registrar producción con fecha futura.':'';
  }
  function configure(input) {
    if(!input)return;
    const range=limits();
    input.min=range.min;input.max=range.max;
    input.title='Se permite hoy y los tres días anteriores, según la hora de Perú.';
  }
  return {limits,error,configure};
})();
