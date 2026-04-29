"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Expediente, type Estado } from "@/lib/supabase";
import { diasRestantes } from "@/lib/utils";
import CardExpediente from "@/components/CardExpediente";
import CardSkeleton from "@/components/CardSkeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PinGate from "@/components/PinGate";

export default function Home() {
  const router = useRouter();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Estado | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("expedientes")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setExpedientes((data as Expediente[]) || []);
    setLoading(false);
  }

  async function crearNuevo() {
    setCreando(true);
    const { data, error } = await supabase
      .from("expedientes")
      .insert({
        cliente: "Nuevo cliente",
        asunto: "Sin asunto",
        estado: "activo",
        pendientes: [],
      })
      .select()
      .single();
    setCreando(false);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    if (data) router.push(`/expediente/${data.id}`);
  }

  // Ordenar por urgencia: primero los con fecha crítica próxima, luego activos por updated_at
  const ordenados = [...expedientes].sort((a, b) => {
    const da = diasRestantes(a.fecha_critica);
    const db = diasRestantes(b.fecha_critica);
    if (da !== null && db !== null) return da - db;
    if (da !== null) return -1;
    if (db !== null) return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const filtrados = ordenados.filter((e) => {
    if (filtro !== "todos" && e.estado !== filtro) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        e.cliente.toLowerCase().includes(q) ||
        (e.nombre_corto || "").toLowerCase().includes(q) ||
        e.asunto.toLowerCase().includes(q) ||
        (e.descripcion || "").toLowerCase().includes(q) ||
        (e.duende_responsable || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PinGate>
      <Header titulo="Expedientes" />
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Vista coordinador
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {filtrados.length} {filtrados.length === 1 ? "expediente" : "expedientes"}
              {filtro !== "todos" ? ` ${filtro}s` : " en agenda"}
            </p>
          </div>
          <button
            onClick={crearNuevo}
            disabled={creando}
            className="btn-primary self-start"
          >
            {creando ? "Creando..." : "+ Nuevo expediente"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            placeholder="Buscar cliente, asunto, duende..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
          />
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {(["todos", "activo", "pausado", "cerrado"] as const).map((f) => {
              const count =
                f === "todos"
                  ? expedientes.length
                  : expedientes.filter((e) => e.estado === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize ${
                    filtro === f
                      ? "bg-indigo-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {f} <span className="tabular-nums opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-4">
            Error al cargar: {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📂</div>
            <h3 className="text-base font-medium text-gray-900 mb-1">
              {busqueda
                ? "Sin resultados"
                : filtro === "activo"
                ? "No hay expedientes activos"
                : `No hay expedientes ${filtro}`}
            </h3>
            <p className="text-sm text-gray-500">
              {busqueda
                ? "Prueba con otros términos"
                : "Crea uno nuevo para comenzar"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtrados.map((exp) => (
              <CardExpediente key={exp.id} exp={exp} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </PinGate>
  );
}
