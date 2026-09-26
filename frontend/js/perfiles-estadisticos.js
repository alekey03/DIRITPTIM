// Permisos de presentación. Supabase valida independientemente cada operación.
window.PERFILES_ESTADISTICOS = {"visualizador":"Visualizador · Jefes y General","estadistico_direccion": "Estadístico de Dirección", "estadistico_division": "Estadístico de División", "estadistico_jefatura": "Estadístico de Jefatura · JEFDDITP", "estadistico_depitptim": "Estadístico de DEPITPTIM"};
window.nombrePerfil = role => ({administrador:'Administrador general',...PERFILES_ESTADISTICOS}[role] || 'Perfil anterior · inactivo');
window.esGestorProduccion = () => Boolean(currentProfile?.activo && ['administrador','estadistico_direccion','estadistico_jefatura'].includes(currentProfile.rol));
window.puedeCrearUsuarios = () => Boolean(currentProfile?.activo && ['administrador','estadistico_direccion'].includes(currentProfile.rol));
window.puedeRegistrarUnidad = unidad => {
 if (!currentProfile?.activo||currentProfile.rol==='visualizador') return false;
 if (['administrador','estadistico_direccion'].includes(currentProfile.rol)) return true;
 if (currentProfile.rol === 'estadistico_jefatura') return unidad === 'JEFDDITP' || DEPENDENCIAS_INSTITUCIONALES.some(d=>d.ambito==='DESCONCENTRADO' && d.unidad===unidad);
 return currentProfile.unidad === unidad;
};
window.puedeEditarUnidad = unidad => esGestorProduccion() && puedeRegistrarUnidad(unidad);
