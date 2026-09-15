# Pruebas locales de seguridad

Usan exclusivamente datos ficticios y servicios simulados; no se conectan a Supabase.

Desde la raíz del repositorio:

```powershell
npm install --prefix tests --ignore-scripts
npm test --prefix tests
```

Requiere una versión reciente de Node.js con `Response` y `node:test`.
La primera prueba ejecuta el cuerpo del controlador sin importar su middleware remoto de Supabase.
La segunda usa PostgreSQL en memoria (PGlite 0.5.8), con las funciones y políticas necesarias reproducidas como fixtures.
No valida el runtime Deno, el middleware remoto, Supabase Auth/Storage por HTTP ni las políticas ajenas a los escenarios incluidos.

Las pruebas de exportaciones ejecutan el código del navegador con consultas y descarga simuladas: paginación, filtros, datos adicionales, recuperación de errores y fechas. No crean un archivo XLSX real.
Las pruebas de archivos simulan compresión, almacenamiento y metadatos, incluyendo interrupciones de red. No suben fotografías reales.

`guardado-atomico.test.cjs` ejecuta la migración de guardado en PostgreSQL/PGlite con tablas del módulo, perfiles ficticios y RLS. Comprueba rollback de altas y ediciones, reintentos de alta, control de versión y permisos. Usa un trigger de auditoría simplificado y la función real de asignación de motivos por transacción. `detenidos-cliente.test.cjs` comprueba reintentos, doble envío y conservación del formulario ante errores.

Aplicar `202609140001_guardado_detenidos_atomico.sql` antes de publicar el nuevo `detenidos.js`. El 14/09/2026 se verificaron alta, reintento, edición y auditoría con los triggers y políticas reales en Supabase dentro de una transacción revertida; después se instaló la migración. No se conservaron registros ficticios. Las secuencias de PostgreSQL pueden avanzar incluso al revertir una transacción.
