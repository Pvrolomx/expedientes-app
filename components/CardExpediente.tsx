"use client";

import Link from "next/link";
import type { Expediente, Pendiente, Urgencia } from "@/lib/supabase";
import { URGENCIA_HEX } from "@/lib/supabase";
import { diasRestantes, urgenciaBadgeFecha, formatearFecha } from "@/lib/utils";

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

  const semaforo: Urgencia[] = ["rojo", "amarillo", "verde", "gris"];

  return (
    <Link
      href={`/expediente/${exp.id}`}
      className="block bg-white rounded-xl shadow-card hover:shadow-card-hover p-5 border border-gray-100 hover:border-gray-200"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {exp.cliente}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{exp.asunto}</p>
        </div>
        {badge && (
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap"
            style={{ color: badge.color, background: badge.bg }}
          >
            {badge.label}
          </span>
        )}
      </div>

      {exp.fecha_critica && (
        <div className="text-xs text-gray-400 mb-3">
          {exp.etiqueta_fecha ? `${exp.etiqueta_fecha} · ` : ""}
          {formatearFecha(exp.fecha_critica)}
        </div>
      )}

      <div className="flex items-center gap-3 mt-3">
        {semaforo.map((u) => (
          <div key={u} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: URGENCIA_HEX[u] }}
              aria-hidden
            />
            <span className="text-xs text-gray-600 tabular-nums">
              {conteos[u] || 0}
            </span>
          </div>
        ))}
        {exp.duende_responsable && (
          <span className="ml-auto text-xs text-gray-400">{exp.duende_responsable}</span>
        )}
      </div>
    </Link>
  );
}
