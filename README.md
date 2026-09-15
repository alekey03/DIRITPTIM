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

La migración `202609150010_requisitoriados_operativo.sql` agrega la categoría Requisitoriados y la tabla `intervencion_requisitoriados`. Debe aplicarse antes de publicar `requisitoriados.js`. Cada detalle se vincula a una detención del mismo operativo, sin crear otra persona ni otra detención. El formulario permite iniciar el registro de un detenido desde ese operativo cuando aún no existe.

Se registran tipo de requisitoria (ORDEN DE CAPTURA / RQ INTERNACIONAL, según TIPO_RQ de OTRO!E66:E67) y condición de más buscado (Sí / No, MAS_BUSCADO de OTRO!C51:C52). La identidad, fecha/hora, funcionario y delitos provienen de Detenidos; los datos comunes del hecho provienen del operativo. `datos/mapeo-requisitoriados-v1.json` documenta las 38 columnas. No se asigna una condición automáticamente a las personas. Un detalle por detención; no sumar el listado de requisitoriados al de detenidos para obtener personas únicas.

El guardado valida ámbito, vínculo inmutable, versiones y reintentos. Más de dos delitos se muestra como pendiente de revisión para el futuro Excel. Sin fotografías. Pruebas de base de datos en `tests/requisitoriados-operativo.test.cjs` y de interfaz en `tests/operativos-preview.cjs`.

## Menores del operativo

La migración 011 crea `intervencion_menores` con permisos heredados del operativo, versiones y reintentos. Aplicar antes de publicar `menores.js`. `datos/mapeo-menores-v1.json` cubre las 48 columnas de 4_MENORES: edad histórica 2–17 según el catálogo del Excel, dos delitos, grupo, armas, situación y dependencia receptora. Ubicación, unidad interviniente, nota y coordenadas se reutilizan del operativo. No incluye funcionario público ni fotografías. No traslada registros previos de Detenidos ni genera vínculos automáticos con grupos. La exportación completa sigue pendiente.
