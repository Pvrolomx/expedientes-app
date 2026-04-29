"use client";

import { useEffect, useState } from "react";

const PIN_VALIDO = "1434";
const STORAGE_KEY = "exp_pin_ok";

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setAutorizado(stored === "1");
    } catch {
      setAutorizado(false);
    }
  }, []);

  const intentarAcceso = () => {
    if (pinInput === PIN_VALIDO) {
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      setAutorizado(true);
      setError(false);
    } else {
      setError(true);
      setPinInput("");
    }
  };

  if (autorizado === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-400">...</div>
      </div>
    );
  }

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm w-full">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
              E
            </div>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Expedientes
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Ingresa el PIN para continuar
          </p>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && intentarAcceso()}
            placeholder="PIN"
            className={`w-full px-3 py-3 text-center text-base border rounded-lg mb-3 tracking-widest ${
              error ? "border-red-300" : "border-gray-200"
            }`}
            autoFocus
          />
          {error && (
            <p className="text-xs text-red-600 text-center mb-3">PIN incorrecto</p>
          )}
          <button onClick={intentarAcceso} className="btn-primary w-full">
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
