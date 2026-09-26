-- Confirmar esta sentencia antes de aplicar los permisos.
alter type public.rol_usuario add value if not exists 'visualizador';
