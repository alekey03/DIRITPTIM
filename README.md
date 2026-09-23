# DIRITPTIM

Sistema web de producción policial. Frontend publicado en GitHub Pages; autenticación, datos y permisos en Supabase.

## Estructura vigente

- `index.html`: entrada de la web, en la raíz para mantener la dirección actual de GitHub Pages.
- `frontend/js/`: lógica de pantallas y catálogos usados en la web.
- `frontend/css/`: estilos, dashboard, registros, seguimiento y tema institucional.
- `frontend/assets/`: emblema y cartografía.
- `frontend/vendor/`: biblioteca local de exportación Excel.
- `backend/supabase/migrations/`: cambios de base de datos ordenados por versión.
- `backend/supabase/functions/`: administración de usuarios en Supabase.
- `datos/`: estructuras y mapeos de formatos; no contiene producción operativa.
- `scripts/`: utilidades para generar catálogos.
- `tests/`: comprobaciones y vistas de prueba con datos ficticios.
- `docs/`: documentación del comportamiento vigente.

## Desarrollo y publicación

Servir la raíz con un servidor estático local; no abrir HTML con file://. Publicar esta estructura completa en GitHub Pages. Mantener index.html y las rutas frontend/... juntos. No publicar documentos privados, credenciales, archivos de producción ni respaldos locales. El historial de GitHub conserva los cambios del código.

Las migraciones ya aplicadas no se vuelven a ejecutar completas: aplicar sólo la versión pendiente. Las políticas en Supabase son la autoridad de acceso, también para reportes y exportaciones.

Seguimiento usa la migración 202609230022 y el contrato descrito en docs/seguimiento.md. Se puede probar su lógica en una base temporal PGlite con `node tests/seguimiento.test.cjs` (requiere @electric-sql/pglite). Las vistas de prueba nunca se conectan a producción.
