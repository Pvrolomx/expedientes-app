-- ExpedientesApp v1.1 — Migration: nombre_corto
-- Correr en SQL Editor del proyecto pwsrjmhmxqfxmcadhjtz

-- 1. Agregar columna nombre_corto (nullable, retrocompatible)
alter table expedientes add column if not exists nombre_corto text;

comment on column expedientes.nombre_corto is
  'Identificador breve para mostrar en el dashboard (ej: "Terry Lo de Marcos"). Si está vacío, se usa cliente.';

-- 2. Asignar nombres cortos a los expedientes existentes
-- Estrategia: sufijo del duende_responsable sin el "CDxx "
update expedientes set nombre_corto = 'Naarena'              where duende_responsable like 'CD01%';
update expedientes set nombre_corto = 'Herb 5204'            where duende_responsable like 'CD60%';
update expedientes set nombre_corto = 'Carrie Gist'          where duende_responsable like 'CD65 Carrie%';
update expedientes set nombre_corto = 'Al Brandenburg'       where duende_responsable like 'CD65 Al%';
update expedientes set nombre_corto = 'Connie FM3'           where duende_responsable like 'CD67 Connie%';
update expedientes set nombre_corto = 'Terry Lo de Marcos'   where duende_responsable like 'CD67 Terry%';
update expedientes set nombre_corto = 'IMPI Los Pueblos'     where duende_responsable like 'CD70 IMPI%';
update expedientes set nombre_corto = 'El Remance'           where duende_responsable like 'CD70 El Remance%';
update expedientes set nombre_corto = 'NITTA Amparos'        where duende_responsable like 'CD70 Nitta%';

-- 3. Refrescar PostgREST
select pg_notify('pgrst', 'reload schema');

-- 4. Verificar resultado
select nombre_corto, duende_responsable, fecha_critica, estado
from expedientes
order by fecha_critica nulls last;
