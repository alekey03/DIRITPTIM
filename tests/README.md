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
