"use client";

import Link from "next/link";
import type { Expediente, Pendiente, Urgencia } from "@/lib/supabase";
import { URGENCIA_HEX } from "@/lib/supabase";
import { diasRestantes, urgenciaBadgeFecha } from "@/lib/utils";

function contarPorUrgencia(pendientes: Pendiente[]): Record<Urgencia, number> {
  const c: Record<Urgencia, number> = { rojo: 0, amarillo: 0, verde: 0, gris: 0 };
  for (const p of pendientes || []) {
    if (!p.completado) c[p.urgencia] = (c[p.urgencia] || 0) + 1;
  }
  return c;
}

export default function CardExpediente({ exp }: { exp: Expediente }) {
  const conteos = contarPorUrgencia(exp.pendientes || []);
  const dias = diasRestantes(exp.fecha_critica);
  const badge = urgenciaBadgeFecha(dias);
  const titulo = exp.nombre_corto || exp.cliente;
  const semaforo: Urgencia[] = ["rojo", "amarillo", "verde", "gris"];

  return (
    <Link
      href={`/expediente/${exp.id}`}
      className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-card px-3 py-2.5"
    >
      <span
        className="text-xs font-medium px-2 py-0.5 rounded text-center tabular-nums flex-shrink-0"
        style={{
          minWidth: "44px",
          color: badge?.color || "#9CA3AF",
          background: badge?.bg || "#F3F4F6",
        }}
      >
        {badge ? badge.label : "—"}
      </span>

      <h3 className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
        {titulo}
      </h3>

      <div className="flex items-center gap-2 flex-shrink-0">
        {semaforo.map((u) => (
          <span key={u} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: URGENCIA_HEX[u] }}
              aria-hidden
            />
            <span className="text-xs text-gray-600 tabular-nums w-3">
              {conteos[u] || 0}
            </span>
          </span>
        ))}
      </div>
    </Link>
  );
}
