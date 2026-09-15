# Sistema de enrolamiento

Aplicación web institucional para registrar y consultar fichas de enrolamiento con autenticación, permisos y almacenamiento privado mediante Supabase.

## Ampliación de intervenciones: base en desarrollo

La ficha de enrolamiento permanece independiente. El nuevo flujo agrupará los resultados de una intervención y reutilizará el módulo de detenidos; no debe retirarse el módulo actual antes de completar y validar su integración.

En este proyecto, **sustento** significa el Excel detallado. No implica adjuntar un PDF. `datos/estructura-detallado-v1.json` conserva nombres, orden, encabezados y validaciones de las 56 hojas originales, sin registros personales. La hoja oculta `OTRO` es un catálogo y `51_CHIP` es una variante oculta, no un formulario adicional obligatorio.

La migración `202609150002_base_intervenciones.sql` prepara exclusivamente la base de borradores (intervención y detalle operativo). Se aplicó en Supabase el 15 de septiembre de 2026. No finaliza intervenciones, no vincula aún las detenciones existentes y no genera el XLSM. No sustituye la tabla histórica `operativos`. La integración posterior debe definir el enlace con ese historial.

`datos/mapeo-operativo-v1.json` relaciona las 40 columnas de `1_OPERATIVO-MEGA` con los nuevos campos; número de fila y mes se derivarán al exportar. El detalle de otras entidades, control de identidad de extranjeros e intervención a penales conserva texto hasta confirmar sus unidades de captura. Los catálogos y validaciones originales se preservan como referencia; no se consideran automáticamente reglas correctas del nuevo sistema.

Para regenerar la estructura: `python scripts/extraer-estructura-detallado.py "ruta/DETALLADO VACIO.xlsm" datos/estructura-detallado-v1.json`. El extractor no ejecuta macros. La exportación futura debe preservar la plantilla XLSM y verificar sus macros por separado.

## Seguridad

- No incluya contraseñas, claves `service_role`, claves secretas ni copias de la base de datos en este repositorio.
- Use únicamente datos ficticios durante desarrollo y pruebas.
- El acceso a datos y fotografías debe permanecer protegido mediante autenticación y políticas RLS de Supabase.

## Formulario de operativos

`Intervenciones → Registrar operativo` captura los 38 campos de entrada de la primera hoja, agrupados en cinco bloques. Número de fila y mes se derivan al exportar. Se conserva el diseño institucional y los módulos existentes.

`202609150003_guardar_operativo_borrador.sql` añade el guardado transaccional, identificadores de solicitud para reintentos y control de versión. Se aplicó después de `202609150002_base_intervenciones.sql` el 15 de septiembre de 2026. El listado permite consultar borradores por permisos y retomar la edición al autor en su unidad o al administrador. El supervisor tiene consulta de los registros autorizados por la política de acceso. Los borradores no son reportes finalizados.

Validación: `node tests/intervenciones-base.test.cjs` con PGlite; `node tests/operativos-preview.cjs` sirve un entorno local sin conexión a Supabase en `http://127.0.0.1:8766/`, con pruebas de interfaz y únicamente datos ficticios. No publicar ni usar esa vista como sistema real. Pendientes: vínculo con detenciones, formularios de otros resultados y exportación fiel del XLSM completo.

## Resultados y detenidos vinculados

La siguiente etapa añade tarjetas de resultados declarados y permite registrar detenidos dentro de un operativo, reutilizando personas, detenciones, delitos y armas. La ficha de enrolamiento permanece independiente. Marcar una banda u organización no implica desarticulación y no se infiere de la pertenencia de una persona.

La migración `202609150004_resultados_y_detenidos.sql` añade el vínculo opcional `detenciones.intervencion_id`, sin trasladar detenciones anteriores. El vínculo y su ámbito son inmutables. El alta hereda el ámbito del operativo; solo el autor en su unidad y el administrador pueden agregar registros. La edición de detenidos mantiene las reglas previas de administrador, motivo y auditoría. Para evitar identidades invisibles a la unidad del operativo, una identidad existente en otro ámbito requiere revisión y no se reutiliza automáticamente en este flujo.

Los otros tipos de resultado pueden seleccionarse y guardarse; sus formularios aún están pendientes y se señala en pantalla. El Excel completo sigue pendiente. Las pruebas de guardado incluyen selección, conflictos, aislamiento, reintentos, reversión del resultado y alta nacional del administrador. La vista local de pruebas también verifica el recorrido desde las tarjetas hasta el detenido vinculado.

## Drogas dentro del operativo

La migración `202609150005_drogas_operativo.sql`, aplicada el 15 de septiembre de 2026, incorpora `intervencion_drogas`: ocho tipos que corresponden a las hojas 5 a 12. El formulario permite agregar y editar sustancias, distingue unidades enteras de kilogramos (hasta seis decimales) y exige el nombre de la droga sintética. La fecha, ubicación, dependencia interviniente y nota SICPIP se obtienen del operativo; al corregir ese contexto se corrige el contexto común de sus resultados.

`datos/mapeo-drogas-v1.json` conserva la correspondencia completa de columnas para la exportación futura. Los kilogramos y las unidades no se convierten ni suman entre sí. Los insumos químicos y la generación del Excel continúan pendientes.

El acceso hereda los permisos del operativo: consulta autorizada por dependencia, edición por autor en su unidad o administrador, bloqueo de cuentas inactivas. El guardado tiene control de versión y reintentos idénticos; no permite trasladar ni eliminar resultados. La selección de drogas no puede retirarse si ya existen registros. Validación: `node tests/drogas-operativo.test.cjs` con PGlite y recorrido ficticio en `tests/operativos-preview.cjs`.
