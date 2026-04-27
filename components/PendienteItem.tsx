"use client";

import type { Pendiente, Urgencia } from "@/lib/supabase";
import { URGENCIA_HEX } from "@/lib/supabase";

const URGENCIAS: Urgencia[] = ["rojo", "amarillo", "verde", "gris"];

export default function PendienteItem({
  p,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  p: Pendiente;
  onChange: (p: Pendiente) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg ${
        p.completado ? "opacity-60" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={p.completado}
        onChange={(e) => onChange({ ...p, completado: e.target.checked })}
        className="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
        aria-label="Completado"
      />
      <input
        type="text"
        value={p.texto}
        onChange={(e) => onChange({ ...p, texto: e.target.value })}
        placeholder="Describe el pendiente..."
        className={`flex-1 text-sm bg-transparent border-0 px-1 py-0.5 ${
          p.completado ? "line-through text-gray-400" : "text-gray-900"
        }`}
      />
      <div className="flex gap-1 flex-shrink-0" role="radiogroup" aria-label="Urgencia">
        {URGENCIAS.map((u) => (
          <button
            key={u}
            onClick={() => onChange({ ...p, urgencia: u })}
            className={`w-5 h-5 rounded-full border-2 ${
              p.urgencia === u ? "border-gray-900" : "border-transparent"
            }`}
            style={{ background: URGENCIA_HEX[u] }}
            aria-label={`Urgencia ${u}`}
            title={u}
          />
        ))}
      </div>
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none px-1"
          aria-label="Mover arriba"
        >
          ▲
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs leading-none px-1"
          aria-label="Mover abajo"
        >
          ▼
        </button>
      </div>
      <button
        onClick={onDelete}
        className="text-gray-300 hover:text-red-500 text-base leading-none flex-shrink-0 px-1"
        aria-label="Eliminar"
      >
        ×
      </button>
    </div>
  );
}
