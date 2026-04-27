"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  supabase,
  type Expediente,
  type Pendiente,
  type Estado,
} from "@/lib/supabase";
import { uuidv4, diasRestantes, urgenciaBadgeFecha } from "@/lib/utils";
import PendienteItem from "@/components/PendienteItem";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DetalleExpediente() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [exp, setExp] = useState<Expediente | null>(null);
  const [original, setOriginal] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    cargar();
  }, [id]);

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase
      .from("expedientes")
      .select("*")
      .eq("id", id)
      .single();
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setExp(data as Expediente);
    setOriginal(JSON.parse(JSON.stringify(data)));
  }

  async function guardar() {
    if (!exp) return;
    setGuardando(true);
    setError(null);
    const { error } = await supabase
      .from("expedientes")
      .update({
        cliente: exp.cliente,
        asunto: exp.asunto,
        descripcion: exp.descripcion,
        abogado_notaria: exp.abogado_notaria,
        estado: exp.estado,
        fecha_critica: exp.fecha_critica || null,
        etiqueta_fecha: exp.etiqueta_fecha,
        pendientes: exp.pendientes,
        notas: exp.notas,
        duende_responsable: exp.duende_responsable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", exp.id);

    setGuardando(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOriginal(JSON.parse(JSON.stringify(exp)));
    setMensaje("Guardado");
    setTimeout(() => setMensaje(null), 2000);
  }

  async function eliminar() {
    if (!exp) return;
    if (!confirm(`¿Eliminar el expediente "${exp.cliente}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setEliminando(true);
    const { error } = await supabase.from("expedientes").delete().eq("id", exp.id);
    setEliminando(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
  }

  function update<K extends keyof Expediente>(campo: K, valor: Expediente[K]) {
    if (!exp) return;
    setExp({ ...exp, [campo]: valor });
  }

  function agregarPendiente() {
    if (!exp) return;
    const nuevo: Pendiente = {
      id: uuidv4(),
      texto: "",
      urgencia: "amarillo",
      completado: false,
    };
    update("pendientes", [...(exp.pendientes || []), nuevo]);
  }

  function actualizarPendiente(idx: number, p: Pendiente) {
    if (!exp) return;
    const arr = [...exp.pendientes];
    arr[idx] = p;
    update("pendientes", arr);
  }

  function eliminarPendiente(idx: number) {
    if (!exp) return;
    const arr = exp.pendientes.filter((_, i) => i !== idx);
    update("pendientes", arr);
  }

  function moverPendiente(idx: number, dir: -1 | 1) {
    if (!exp) return;
    const nuevo = idx + dir;
    if (nuevo < 0 || nuevo >= exp.pendientes.length) return;
    const arr = [...exp.pendientes];
    [arr[idx], arr[nuevo]] = [arr[nuevo], arr[idx]];
    update("pendientes", arr);
  }

  const dirty = exp && original && JSON.stringify(exp) !== JSON.stringify(original);
  const dias = exp ? diasRestantes(exp.fecha_critica) : null;
  const badge = urgenciaBadgeFecha(dias);

  if (loading) {
    return (
      <>
        <Header titulo="Expedientes" />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="skeleton h-8 w-1/2 rounded mb-4" />
          <div className="skeleton h-4 w-3/4 rounded mb-2" />
          <div className="skeleton h-4 w-2/3 rounded mb-6" />
          <div className="skeleton h-32 w-full rounded-xl" />
        </main>
      </>
    );
  }

  if (!exp) {
    return (
      <>
        <Header titulo="Expedientes" />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
            Expediente no encontrado{error ? `: ${error}` : ""}
          </div>
          <Link href="/" className="btn-ghost inline-block mt-4">
            ← Volver
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header titulo="Expedientes" />
      <main className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">
          ← Volver
        </Link>

        <div className="flex items-start justify-between gap-3 mt-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={exp.cliente}
              onChange={(e) => update("cliente", e.target.value)}
              placeholder="Cliente"
              className="w-full text-2xl font-semibold text-gray-900 bg-transparent border-0 px-0 py-1"
            />
            <input
              type="text"
              value={exp.asunto}
              onChange={(e) => update("asunto", e.target.value)}
              placeholder="Asunto"
              className="w-full text-sm text-gray-600 bg-transparent border-0 px-0 py-0.5 mt-1"
            />
          </div>
          {badge && (
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap"
              style={{ color: badge.color, background: badge.bg }}
            >
              {badge.label}
            </span>
          )}
        </div>

        <section className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Datos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Estado">
              <select
                value={exp.estado}
                onChange={(e) => update("estado", e.target.value as Estado)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md bg-white"
              >
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </Field>
            <Field label="Duende responsable">
              <input
                type="text"
                value={exp.duende_responsable || ""}
                onChange={(e) => update("duende_responsable", e.target.value)}
                placeholder="ej. CD70"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </Field>
            <Field label="Fecha crítica">
              <input
                type="date"
                value={exp.fecha_critica || ""}
                onChange={(e) => update("fecha_critica", e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </Field>
            <Field label="Etiqueta de fecha">
              <input
                type="text"
                value={exp.etiqueta_fecha || ""}
                onChange={(e) => update("etiqueta_fecha", e.target.value)}
                placeholder="ej. Audiencia constitucional"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </Field>
            <Field label="Abogado / Notaría" full>
              <input
                type="text"
                value={exp.abogado_notaria || ""}
                onChange={(e) => update("abogado_notaria", e.target.value)}
                placeholder="ej. Lic. ... / Notaría 8 Tepic"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md"
              />
            </Field>
            <Field label="Descripción" full>
              <textarea
                value={exp.descripcion || ""}
                onChange={(e) => update("descripcion", e.target.value)}
                rows={2}
                placeholder="Resumen del expediente"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md resize-y"
              />
            </Field>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Pendientes ({exp.pendientes?.length || 0})
            </h3>
            <button onClick={agregarPendiente} className="btn-ghost text-xs">
              + Agregar
            </button>
          </div>
          {exp.pendientes?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Sin pendientes. Agrega el primero.
            </p>
          ) : (
            <div className="space-y-2">
              {exp.pendientes.map((p, idx) => (
                <PendienteItem
                  key={p.id}
                  p={p}
                  onChange={(np) => actualizarPendiente(idx, np)}
                  onDelete={() => eliminarPendiente(idx)}
                  onMoveUp={() => moverPendiente(idx, -1)}
                  onMoveDown={() => moverPendiente(idx, 1)}
                  isFirst={idx === 0}
                  isLast={idx === exp.pendientes.length - 1}
                />
              ))}
            </div>
          )}
          <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            <Leyenda color="#E24B4A" label="Crítico" />
            <Leyenda color="#EF9F27" label="Pendiente" />
            <Leyenda color="#639922" label="En curso" />
            <Leyenda color="#888780" label="Completado" />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Notas
          </h3>
          <textarea
            value={exp.notas || ""}
            onChange={(e) => update("notas", e.target.value)}
            rows={6}
            placeholder="Apuntes libres, contexto, recordatorios..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md resize-y"
          />
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="sticky bottom-4 z-10 flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-3 shadow-card-hover">
          <button
            onClick={guardar}
            disabled={!dirty || guardando}
            className="btn-primary"
          >
            {guardando ? "Guardando..." : dirty ? "Guardar cambios" : mensaje || "Sin cambios"}
          </button>
          {dirty && (
            <button
              onClick={() => exp && original && setExp(JSON.parse(JSON.stringify(original)))}
              className="btn-ghost"
            >
              Descartar
            </button>
          )}
          <span className="flex-1" />
          <button
            onClick={eliminar}
            disabled={eliminando}
            className="text-xs text-red-600 hover:text-red-700 px-2"
          >
            {eliminando ? "Eliminando..." : "Eliminar expediente"}
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-xs text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function Leyenda({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}
