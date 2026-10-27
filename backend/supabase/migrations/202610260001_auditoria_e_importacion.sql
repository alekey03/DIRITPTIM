-- Objetos creados directamente en Supabase que ninguna migración registraba.
-- Reconstruidos el 26/10/2026 desde producción (dbneehfdhnzldzpxrmas).
-- YA EXISTEN EN PRODUCCIÓN: no aplicar allí. Para un proyecto nuevo, aplicar
-- después de todas las migraciones anteriores.
-- El trigger de evento ensure_rls (rls_auto_enable) lo administra Supabase; no se incluye.
begin;

-- Auditoría automática del módulo de detenidos (202609060001).
do $auditoria$
declare t text;
begin
 foreach t in array array['personas','operativos','detenciones','detencion_delitos','detencion_armas','detencion_archivos'] loop
  execute format('drop trigger if exists auditoria_automatica on public.%I', t);
  execute format('create trigger auditoria_automatica after insert or update or delete on public.%I for each row execute function public.registrar_auditoria_automatica()', t);
 end loop;
end $auditoria$;

-- Tabla de carga de la producción 2026 desde Excel. Sólo service_role la usa.
create table if not exists public.importacion_produccion_2026 (
  id uuid primary key,
  lote text not null check (length(lote) = 64),
  categoria text not null,
  tabla text not null,
  tipo text,
  hoja text not null,
  fila integer not null check (fila > 0),
  unidad text references public.dependencias_estadisticas(unidad),
  fecha date,
  nota_sicpip text,
  operativo_id uuid,
  datos jsonb not null check (jsonb_typeof(datos) = 'object'),
  original jsonb not null check (jsonb_typeof(original) = 'object'),
  pendientes jsonb not null check (jsonb_typeof(pendientes) = 'array'),
  unique (lote, hoja, fila)
);
alter table public.importacion_produccion_2026 enable row level security;
revoke all on public.importacion_produccion_2026 from anon, authenticated;

commit;
