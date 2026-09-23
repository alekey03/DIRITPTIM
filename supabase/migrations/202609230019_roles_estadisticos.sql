-- Ejecutar y confirmar antes de 020: PostgreSQL requiere confirmar nuevos enum.
alter type public.rol_usuario add value if not exists 'estadistico_direccion';
alter type public.rol_usuario add value if not exists 'estadistico_division';
alter type public.rol_usuario add value if not exists 'estadistico_jefatura';
alter type public.rol_usuario add value if not exists 'estadistico_depitptim';
