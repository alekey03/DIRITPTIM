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

## Armas, municiones, explosivos y réplicas

Cinco tarjetas con iconos SVG abren los formularios de las hojas 13, 14, 31, 32 y 51. `datos/mapeo-materiales-v1.json` relaciona todas sus columnas con el contexto del operativo, los datos del material y las columnas derivadas. `scripts/generar-mapeo-materiales.py` regenera ese contrato y `materiales-catalogo.js`. La captura conserva los datos particulares del registro en JSON validado por categoría; no crea automáticamente una persona detenida ni atribuye delitos por seleccionar un material. Los datos de persona y hasta dos delitos son opcionales y corresponden al registro del detallado.

`202609150006_materiales_operativo.sql` agrega `intervencion_materiales` y su guardado con RLS, control de versiones y reintentos. Las pruebas cubren todas las columnas, campos ajenos a la categoría, permisos, cantidades, inmutabilidad del vínculo, conflictos y reaplicación. El recorrido de interfaz verifica tarjetas, alta, edición y consulta. No permite borrar registros ni trasladarlos entre operativos o categorías.

Las municiones son unidades enteras. La plantilla no define unidad para la cantidad de explosivos: se conserva el valor y se pide indicar su medida en el detalle, sin conversiones ni suma de medidas distintas. Las armas se capturan individualmente. Las municiones asociadas a un arma no se duplican automáticamente en la hoja de municiones. La conciliación con `detencion_armas`, la carga de fotografías y la exportación XLSM permanecen pendientes.

## Vehículos y maquinaria

Las tarjetas de vehículos mayores, menores y maquinaria capturan los campos de las hojas 17, 18 y 19. `datos/mapeo-vehiculos-v1.json` conserva sus 29 columnas por hoja; `scripts/generar-mapeo-vehiculos.py` regenera el contrato y el catálogo de formularios. La fecha, ubicación y dependencia provienen del operativo. Placa y valorización pueden quedar sin indicar; marca y situación son necesarias para guardar el borrador. La plantilla no especifica moneda: no se convierte ni se totaliza la valorización automáticamente.

La migración `202609150007_vehiculos_operativo.sql` agrega la tabla y el guardado con permisos, versión y reintentos; debe aplicarse antes de publicar esta interfaz. `tests/vehiculos-operativo.test.cjs` comprueba las tres correspondencias, importes y permisos. El recorrido local verifica alta, edición y consulta. No se incorporan fotografías: únicamente la Ficha de Enrolamiento las admite. La exportación completa del detallado sigue pendiente.


### Bandas y organizaciones vinculadas al operativo

Aplicar `supabase/migrations/202609150009_grupos_operativo.sql` después de la migración 008 y antes de publicar `grupos.js`. Crea cabeceras y vínculos a detenciones, con lectura según el operativo y escritura mediante una función que verifica cuenta activa y ámbito. Cada detención puede estar vinculada a un grupo; el tipo debe coincidir con su clasificación. Los registros anteriores sin clasificación no se asignan automáticamente.

Nombre, modalidad y referencia pertenecen al grupo; el rol específico pertenece al vínculo. El nombre anterior en Detenidos se conserva como referencia y no se sobrescribe. Los datos de identidad, delitos, fiscalía y situación se leen del detenido; los datos comunes se toman del operativo. `datos/mapeo-grupos-v1.json` relaciona las 40/41 columnas de ambas hojas. Más de dos delitos se señala para revisión; la exportación completa sigue pendiente. No hay fotografías en este módulo.

Pruebas: `node tests/grupos-operativo.test.cjs` (PGlite) y `node tests/operativos-preview.cjs` (interfaz con datos ficticios).


### Requisitoriados del operativo

La migración 010 introdujo el módulo; la 012 lo convierte en registro independiente conforme a `2_RQ N`. El formulario captura identidad, fecha/hora, tipo de requisitoria, más buscado, funcionario y dos delitos. No exige registrar un detenido. La ubicación, dependencia, NI principal y coordenadas se toman del operativo. `datos/mapeo-requisitoriados-v1.json` documenta las 38 columnas. Sin fotografías. Validación integrada en `tests/requisitoriados-notas.test.cjs` y `tests/operativos-preview.cjs`.

## Menores del operativo

La migración 011 crea `intervencion_menores` con permisos heredados del operativo, versiones y reintentos. Aplicar antes de publicar `menores.js`. `datos/mapeo-menores-v1.json` cubre las 48 columnas de 4_MENORES: edad histórica 2–17 según el catálogo del Excel, dos delitos, grupo, armas, situación y dependencia receptora. Ubicación, unidad interviniente, nota y coordenadas se reutilizan del operativo. No incluye funcionario público ni fotografías. No traslada registros previos de Detenidos ni genera vínculos automáticos con grupos. La exportación completa sigue pendiente.

## Requisitoriados independientes y ampliaciones de NI

Migración 012: Requisitoriados captura identidad y datos propios sin crear Detenidos. Conserva los registros anteriores y su referencia de origen, copiando sus datos; `detenciones_reportables` excluye únicamente esos orígenes del listado, indicadores y exportación de Detenidos. No borra personas ni detenciones históricas.

Migración 013: ampliaciones en `intervencion_notas`, con número, fecha, hora y detalle, vinculadas al mismo operativo. No sustituye la NI principal, no crea otro operativo ni agrega automáticamente bienes. Los hallazgos se registran en su categoría correspondiente. Permisos y control de versiones del operativo. La exportación completa del detallado sigue pendiente.

### Registros y Dashboard generales

Accesos principales independientes para consultar las categorías implementadas sin recorrer cada operativo. Comparten filtros por fechas, dependencia, lugar, texto y campo de la categoría; Registros incorpora paginación, detalle, vínculo al operativo y exportación de la consulta a Excel. Dashboard presenta conteos, distribución por dependencia y evolución mensual, con enlace a los registros filtrados. Las cantidades de drogas se separan en kg y envoltorios. Esta exportación de consulta no sustituye al detallado completo de 56 hojas.

Las lecturas usan las tablas y políticas RLS existentes y `detenciones_reportables`: administrador nacional, operador de su unidad, supervisor de dependencias autorizadas. Los datos se limpian al cambiar/cerrar sesión y se descartan respuestas tardías. No requiere migración ni cambia permisos. Verificación: `node tests/consulta.test.cjs`; vista con datos ficticios: `node tests/consulta-preview.cjs` (puerto 8767).

### Víctimas de trata · estructura histórica v1

Implementada la hoja `21_VICTIMAS_DE_TRATA`: correspondencia de sus 23 columnas en `datos/mapeo-victimas-v1.json`. Fecha, hora, identificación, edad, situación y puesta a disposición se registran en `intervencion_victimas`; ubicación, dependencia, NI y coordenadas se reutilizan del operativo. La condición MAYOR/MENOR se calcula y valida según la edad. Se conservan los catálogos del Excel (edad 2–100, género, nacionalidad y tipo de documento), normalizando espacios sobrantes. La plantilla no pide número de documento. No hay fotos ni vínculo automático con Ficha de enrolamiento o Menores.

Migración `202609160014_victimas_operativo.sql`: RLS heredada del operativo, sin lectura anónima, identidad y autoría inmutables, versiones y reintentos idempotentes; impide desmarcar una categoría con víctimas registradas. Disponible en Intervenciones, Registros y Dashboard (rescatadas/presuntas/menores de edad). El listado de operativos muestra NI principal; Dirección especializada / región se presenta en mayúsculas conservando los valores del catálogo.

## Proxenetismo · estructura histórica v1

La migración 015 añade `intervencion_prostitucion`, vinculada obligatoriamente a un operativo o megaoperativo. `datos/mapeo-prostitucion-v1.json` conserva las 21 columnas de `20_PROSTITUCION FEM Y MASC`: fecha/hora, identidad, edad, género, nacionalidad y documento; lugar, dependencia, NI y coordenadas proceden del operativo. Número de documento como texto; edad entera 2–100 según TOTAL_EDAD. No crea registros en Detenidos, Víctimas de trata ni Ficha de enrolamiento y no incluye fotografías. Se integra en Resultados, Registros y Dashboard con permisos del operativo, versiones y reintentos. La exportación vigente se describe en Producción v2, más abajo.

## Producción DIRITPTIM · septiembre 2026

El nombre visible de la hoja 20 es Proxenetismo. Se conservan sus identificadores históricos y los datos existentes; el cambio de nombre no reclasifica personas ni delitos.

Migración 017: seis categorías en `intervencion_complementarios` (dinero, celulares, migraciones, chips, personas ubicadas, expulsados). Catálogo, contrato de columnas y formularios integrados en Resultados, Registros y Dashboard. Dinero separado por moneda; otra moneda conserva texto con nombre e importe y no se suma. IMEI/documentos como texto; un registro con IMEI corresponde a un equipo. Sin fotografías, sin altas automáticas en Detenidos. RLS por operativo, autores/admin, bloqueo de cuentas inactivas, versiones y reintentos. Aplicar 017 después de 015; no necesita el bloque 016 de Bienes pendiente.

`datos/estructura-produccion-v2.json` conserva únicamente los encabezados de las 22 hojas nuevas. Chips usa la estructura anterior 52 CHIP porque la nueva hoja está vacía. Se mantienen los campos anteriores de armas de fuego y organizaciones por la misma razón. El campo ENERO de Personas ubicadas se interpreta como mes derivado de la fecha. La exportación completa y la adaptación de los formularios se completan con la migración 018 y los módulos de Producción v2 siguientes.


### Producción v2: formulario actualizado y Excel de 22 hojas

En Registros y Dashboard, **Excel completo · 22 pestañas** permite elegir fechas y dependencia, revisar el número de filas por hoja y descargar un único XLSX. Los filtros de la consulta por categoría no se trasladan silenciosamente al reporte completo. Incluye registros guardados, también borradores; las fechas se aplican a cada registro y, donde no hay fecha propia, a la del operativo. Todas las lecturas usan la sesión y RLS existentes; no hay claves privilegiadas ni almacenamiento persistente del reporte en el navegador. Se limpia al cerrar sesión y se invalida al cambiar de cuenta o cambiar la versión de operativos durante la consulta.

`datos/mapeo-produccion-v2.json` y `produccion-catalogo.js` documentan cada columna, origen y tipo. Los nombres y el orden coinciden con `PRODUCCION DIRITPTIM.xlsx`. Armas de fuego, OO. CC. y Chip estaban sin encabezados: se recuperan los del detallado anterior. El encabezado literal ENERO de Personas ubicadas se conserva y contiene el mes derivado. No se copian datos de ejemplo del Excel. Las hojas vacías conservan encabezados y filtros.

La migración 018, aplicada después de 017, actualiza solo los validadores existentes de Víctimas y Proxenetismo. Sus formularios piden fecha/hora, edad (0–120), género y nacionalidad. Lugar, jerarquía policial, NI y coordenadas vienen del operativo. Los campos retirados siguen almacenados y se muestran como información histórica al abrir un registro antiguo; editar no los borra. En Operativos los dos campos de delito del formato anterior dejan de solicitarse y sus valores anteriores se conservan. El identificador interno `prostitucion` se mantiene por compatibilidad.

El XLSX separa dinero por moneda, cantidades numéricas, fechas/horas reales, documentos/IMEI como texto y RQ de Detenidos. Bandas y OO. CC. generan una fila por integrante; Bandas marca SI únicamente en el primer integrante de cada grupo. No duplica armas referidas en Detenidos dentro del módulo Armas: esa referencia se exporta en Detenidos y se avisa antes de descargar. Para más de dos delitos de un detenido/integrante, avisa y detiene la descarga porque el formato solo admite dos bloques; nunca los trunca silenciosamente. La NI exportada es la principal; las ampliaciones siguen consultables en el operativo. Las categorías ajenas a estas 22 hojas conservan la exportación individual existente.

Validación: `node tests/produccion-export.test.cjs`, `node tests/consulta.test.cjs`, `node tests/exportaciones.test.cjs`, `node tests/formato-produccion.test.cjs` (PGlite). Recorridos de navegador con datos ficticios: `node tests/operativos-preview.cjs` (8773) y `node tests/produccion-preview.cjs` (8774). El segundo genera y reabre un XLSX real, comprueba 22 hojas, ceros, tipos, marca única por banda, conflictos/cambio de cuenta y limpieza. Su archivo `tests/produccion-fixture.xlsx` es temporal, no se publica ni se usa como dato real.
