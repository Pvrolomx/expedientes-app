"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PROMPT_DUENDE } from "@/lib/prompt-duende";

const TOKEN_VALIDO = "1434";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const [autorizado, setAutorizado] = useState(false);
  const [tokenInput, setTokenInput] = useState("");
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const k = searchParams.get("key");
    if (k === TOKEN_VALIDO) setAutorizado(true);
  }, [searchParams]);

  const intentarAcceso = () => {
    if (tokenInput === TOKEN_VALIDO) {
      setAutorizado(true);
      const url = new URL(window.location.href);
      url.searchParams.set("key", TOKEN_VALIDO);
      window.history.replaceState({}, "", url.toString());
    } else {
      alert("Token incorrecto");
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_DUENDE);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      alert("No se pudo copiar. Selecciona y copia manualmente.");
    }
  };

  if (!autorizado) {
    return (
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Acceso restringido</h2>
          <p className="text-sm text-gray-600 mb-4">
            Esta página tiene la consigna para que un duende suba un expediente
            a la agenda. Necesitas el token.
          </p>
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && intentarAcceso()}
            placeholder="Token"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3"
            autoFocus
          />
          <button onClick={intentarAcceso} className="btn-primary w-full">
            Entrar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Onboarding del duende
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Pega este prompt en el chat del duende que va a subir su expediente.
          El duende lo ejecuta directo contra Supabase, no por la UI.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <span className="text-xs text-gray-500 font-medium">PROMPT v5</span>
          <button
            onClick={copiar}
            className={`text-xs font-medium px-3 py-1 rounded ${
              copiado
                ? "bg-green-50 text-green-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {copiado ? "✓ Copiado" : "Copiar al portapapeles"}
          </button>
        </div>
        <pre className="text-xs text-gray-800 p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
          {PROMPT_DUENDE}
        </pre>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
        <p className="font-medium mb-1">Para duendes que prefieren consumirlo via curl:</p>
        <code className="block bg-white border border-blue-200 rounded px-3 py-2 mt-2 text-xs text-gray-800 break-all">
          curl https://expedientes.duendes.app/api/prompt
        </code>
        <p className="mt-2 text-xs text-blue-800">
          Devuelve el prompt en texto plano, listo para procesar.
        </p>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <>
      <Header titulo="Expedientes" />
      <Suspense fallback={<main className="max-w-md mx-auto px-4 py-16 text-center text-sm text-gray-500">Cargando...</main>}>
        <OnboardingContent />
      </Suspense>
      <Footer />
    </>
  );
}
