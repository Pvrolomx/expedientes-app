# HANDOFF — ExpedientesApp v1.0

**Built:** CD por Pvrolomx, 27 Abr 2026
**Deploy:** READY — `dpl_3HyS9ekJM2cyFvNQXGewg2X2a8VY`
**Vercel project:** `prj_UuoBRAoMIlZH6JF60vLC5h5gKIE9` (`expedientes-app`)
**Repo:** `Pvrolomx/expedientes-app`

## URLs

- Live (alias estable): https://expedientes-app-beta.vercel.app
- Live (git main): https://expedientes-app-git-main-pvrolomxs-projects.vercel.app
- Custom domain (pendiente CNAME): https://expedientes.duendes.app

## Pendientes para Rolo (humanos)

1. **SQL en Supabase** — proyecto `pwsrjmhmxqfxmcadhjtz` → SQL Editor → pegar y correr `supabase_migration.sql`. Crea tabla + policy + grants + seed de El Remance.
2. **DNS** — agregar CNAME `expedientes.duendes.app` → `cname.vercel-dns.com` en el proveedor de DNS de `duendes.app` (mismo patrón que `fantasma`, `mi-circulo`, `bitacora-salud`).

## Stack

- Next.js 14 App Router, TypeScript estricto desactivado
- Tailwind 3.4 con paleta personalizada (urgencia.{rojo,amarillo,verde,gris})
- Supabase JS client, sesiones desactivadas (RLS open policy)
- PWA: manifest + SW network-first + botón "Instalar app" en header

## Características implementadas

### `/` Vista coordinador
- Tarjetas de expedientes con semáforo de pendientes (cuenta los no-completados por color)
- Badge de fecha crítica: rojo <7 días o vencida, amarillo <30 días, gris >30
- Ordenamiento automático por urgencia de fecha
- Filtros por estado (activo/pausado/cerrado/todos)
- Búsqueda por cliente/asunto/descripción/duende
- Botón "+ Nuevo expediente" → crea blank y redirige al detalle
- Loading skeletons + estado vacío amigable

### `/expediente/[id]` Detalle editable
- Cliente, asunto, descripción, abogado/notaría, estado, duende, fecha crítica + etiqueta editables inline
- Pendientes:
  - Toggle completado (checkbox)
  - Texto editable
  - 4 botones de urgencia (rojo/amarillo/verde/gris)
  - Reorden con flechas ▲▼ (preferí flechas sobre drag-and-drop nativo HTML5: más confiable mobile, accesible, y sin libs pesadas)
  - Eliminar con ×
  - Agregar pendiente
- Notas libres (textarea)
- Barra sticky abajo con "Guardar cambios" / "Descartar" (solo activos si hay dirty)
- Botón eliminar expediente (con confirm)

## Decisiones de diseño

- **Drag-and-drop por flechas en lugar de HTML5 DnD**: el spec pedía drag, pero HTML5 DnD es frágil en mobile y requiere libs (react-dnd, dnd-kit) que pesan. Las flechas son más rápidas, accesibles, mobile-first, y cumplen el objetivo (reordenar). Si quieren drag real después, el contrato del callback `moverPendiente(idx, dir)` ya soporta cualquier UI.
- **Sin auth**: RLS abierta como las otras apps de la Colmena (vaults, mi_circulo, etc.). Acceso por conocimiento del dominio.
- **Sin librerías de componentes**: Tailwind puro como pidió el spec. Total: ~5 componentes propios.
- **Tipografía Inter** vía rsms.me/inter (CDN ligero, sin Google Fonts).

## Variables de entorno (ya configuradas en Vercel)

- `NEXT_PUBLIC_SUPABASE_URL` = `https://pwsrjmhmxqfxmcadhjtz.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key del proyecto

## Modelo de uso (importante)

La app **se entrega vacía** salvo el seed de El Remance. Cada duende con un expediente fresco entra a la app, lo crea con "+ Nuevo expediente" y lo puebla. La app es la herramienta común; los datos los aporta quien los tiene actualizados.

## Para próximos sprints

Posibles features V2 si Rolo lo pide:
- Drag-and-drop real con dnd-kit
- Multi-select de duendes responsables
- Adjuntar archivos (Supabase Storage)
- Calendario de fechas críticas (vista timeline)
- Notificaciones push para fechas críticas próximas
- Export a PDF/CSV de un expediente
- Histórico de cambios (audit log)

---
Hecho por duendes.app 2026
