-- ExpedientesApp v1.0 — Migración Supabase
-- Proyecto: pwsrjmhmxqfxmcadhjtz (rolo-payments / Castle Ops)
-- Correr en SQL Editor del proyecto correcto

create extension if not exists "pgcrypto";

create table if not exists expedientes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  cliente text not null,
  asunto text not null,
  descripcion text,
  abogado_notaria text,
  estado text check (estado in ('activo','pausado','cerrado')) default 'activo',
  fecha_critica date,
  etiqueta_fecha text,
  pendientes jsonb default '[]'::jsonb,
  notas text,
  duende_responsable text
);

comment on table expedientes is 'App: expedientes-app | URL: expedientes.duendes.app';

alter table expedientes enable row level security;

drop policy if exists "expedientes_allow_all" on expedientes;
create policy "expedientes_allow_all" on expedientes
  for all using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on expedientes to anon, authenticated;

-- Índices útiles
create index if not exists idx_expedientes_estado on expedientes(estado);
create index if not exists idx_expedientes_fecha_critica on expedientes(fecha_critica);
create index if not exists idx_expedientes_updated_at on expedientes(updated_at desc);

-- Refrescar PostgREST
select pg_notify('pgrst', 'reload schema');

-- Seed: Claudia Castillo / El Remance
insert into expedientes (
  cliente, asunto, abogado_notaria, estado,
  fecha_critica, etiqueta_fecha, pendientes,
  notas, duende_responsable
) values (
  'Claudia Rebeca Castillo Soto',
  'Adjudicación laboral Depto 2 Torre A, El Remance',
  'Lic. Miguel Ángel Rodríguez Tovar y Mireya Plácito Martínez',
  'activo',
  '2026-05-28',
  'Audiencia constitucional amparo',
  '[
    {"id":"01000000-0000-4000-8000-000000000001","texto":"Acuse de recibo Juzgado laboral (3 días desde 17/abr, medidas de apremio)","urgencia":"rojo","completado":false},
    {"id":"02000000-0000-4000-8000-000000000002","texto":"Víctor notaría — presupuesto + fe de hechos","urgencia":"amarillo","completado":false},
    {"id":"03000000-0000-4000-8000-000000000003","texto":"Escrituración paralela al amparo","urgencia":"amarillo","completado":false},
    {"id":"04000000-0000-4000-8000-000000000004","texto":"Inmovilización registral ejecutada","urgencia":"gris","completado":true}
  ]'::jsonb,
  'Estrategia paralela: amparo (Tovar/Plácito) + escrituración notarial (Víctor). Inmovilización ya en curso.',
  'CD70'
) on conflict do nothing;
