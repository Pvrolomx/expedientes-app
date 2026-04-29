"use client";

import { useEffect, useRef, useState } from "react";

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [num, setNum] = useState("");
  const [nombre, setNombre] = useState("");
  const [copiado, setCopiado] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);

  const onFooterClick = () => {
    clickCount.current += 1;
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => {
      clickCount.current = 0;
    }, 600);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      setOpen(true);
    }
  };

  const texto = `Campeón, chécame este link para que veas el proyecto expedientes:

curl -s https://expedientes.duendes.app/api/prompt

Te informo que tu nombre es CD${num || "___"} ${nombre || "_____________"}`;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert("No se pudo copiar.");
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <footer
        onClick={onFooterClick}
        className="mt-12 py-6 text-center text-xs text-gray-400 cursor-default select-none"
        title=""
      >
        Hecho por duendes.app 2026
      </footer>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-gray-200 max-w-lg w-full p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Onboarding rápido de duende
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Llena los campos, copia y pégaselo al duende
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-[80px_1fr] gap-2 mb-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Número</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={num}
                  onChange={(e) => setNum(e.target.value)}
                  placeholder="68"
                  maxLength={3}
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md text-center tabular-nums"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Nombre del expediente
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Watson Casa Catalina"
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
                />
              </div>
            </div>

            <pre className="text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-md p-3 whitespace-pre-wrap font-mono leading-relaxed mb-4">
              {texto}
            </pre>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5"
              >
                Cerrar
              </button>
              <button
                onClick={copiar}
                className={`text-sm font-medium px-4 py-1.5 rounded-md ${
                  copiado
                    ? "bg-green-50 text-green-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {copiado ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
