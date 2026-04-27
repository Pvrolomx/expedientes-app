# Expedientes App

Coordinador de expedientes legales — La Colmena / Expat Advisor MX.

**Live:** https://expedientes.duendes.app

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase (proyecto `pwsrjmhmxqfxmcadhjtz`, tabla `expedientes`)
- PWA (manifest + service worker network-first)

## Vistas

- `/` — Vista coordinador. Tarjetas con semáforo de pendientes (rojo/amarillo/verde/gris) y badge de fecha crítica (rojo <7 días, amarillo <30 días). Filtros por estado y búsqueda.
- `/expediente/[id]` — Detalle editable inline. Pendientes con reordenamiento, toggle completado y cambio de urgencia. Notas libres.

## Estructura de `pendientes` (jsonb)

```json
[
  {
    "id": "uuid",
    "texto": "Verificar acuse de recibo del Juzgado laboral",
    "urgencia": "rojo",
    "completado": false
  }
]
```

Urgencias: `rojo` (#E24B4A), `amarillo` (#EF9F27), `verde` (#639922), `gris` (#888780).

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Modelo de uso

La app se entrega vacía (excepto el seed de El Remance). Cada duende con un expediente fresco entra y carga el suyo desde la vista coordinador con "+ Nuevo expediente". El que tiene la información actualizada es quien la captura.

---

Hecho por duendes.app 2026
