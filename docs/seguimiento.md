# Seguimiento diario

Consulta `consultar_seguimiento(fecha)` y declara mediante `declarar_seguimiento(fecha, unidad, sin_produccion)`.

- La fecha controlada es la del operativo; los detalles usan la fecha de su operativo.
- Se cuentan por separado operativos y detalles. No se suman como producción total.
- Tardío: creación posterior al día del operativo en America/Lima. El corte diario es 23:59:59.
- Con registros incluye borradores, no afirma integridad ni cierre del parte.
- Pendiente no prueba falta de producción. La declaración sin producción es explícita y conserva autor, fecha y retiros.
- Si se añade producción después de declarar cero, los registros prevalecen; el historial de declaraciones permanece.
- Ingresados ese día son altas, incluidas las correspondientes a fechas anteriores. No incluye ediciones, fichas de enrolamiento independientes ni detalles auxiliares como delitos de una persona.
- Las 28 dependencias del catálogo forman el denominador (5 divisiones centrales y 23 DEPITPTIM). Unidades administrativas con registros se muestran aparte y no alteran ese porcentaje.
- Acceso según las mismas funciones de ámbito ya vigentes. La vista de metadatos no se concede directamente a usuarios; la RPC sólo entrega el agregado de sus unidades.
- No modifica registros de producción ni activa usuarios.

El panel y la RPC de lectura son exclusivos de estadistico_direccion (general) y estadistico_jefatura (sólo las 23 dependencias desconcentradas). Los perfiles locales declaran desde Registros. Administrador general no está incluido en el panel, conforme a la instrucción de limitarlo a esos dos perfiles.
