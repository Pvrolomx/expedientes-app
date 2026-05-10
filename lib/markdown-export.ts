import type { Expediente, Pendiente } from "./supabase";
import { diasRestantes } from "./utils";

function urgenciaLabel(u: string): string {
  return { rojo: "🔴", amarillo: "🟡", verde: "🟢", gris: "⚪" }[u] || u;
}

function formatFecha(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Genera el markdown de la agenda completa, optimizado para que Géminis
 * lo lea y conteste preguntas en voz mientras Rolo maneja.
 */
export function generarMarkdownAgenda(expedientes: Expediente[]): string {
  const ahora = new Date();
  const fechaFormato = ahora.toLocaleString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });

  // Ordenar: activos primero (por fecha crítica), después pausados, después cerrados
  const sortKey = (e: Expediente): [number, number] => {
    const estadoOrder = { activo: 0, pausado: 1, cerrado: 2 }[e.estado] ?? 3;
    if (e.fecha_critica) {
      const d = diasRestantes(e.fecha_critica) ?? 999;
      return [estadoOrder, d];
    }
    return [estadoOrder, 999];
  };
  const sorted = [...expedientes].sort((a, b) => {
    const [ea, da] = sortKey(a);
    const [eb, db] = sortKey(b);
    if (ea !== eb) return ea - eb;
    return da - db;
  });

  const activos = sorted.filter((e) => e.estado === "activo");
  const pausados = sorted.filter((e) => e.estado === "pausado");
  const cerrados = sorted.filter((e) => e.estado === "cerrado");

  let md = "";

  // Header
  md += `# Agenda de expedientes — Lic. Rolando Romero García\n\n`;
  md += `**Última actualización:** ${fechaFormato} (CST)\n\n`;
  md += `**Total:** ${expedientes.length} expedientes — ${activos.length} activos, ${pausados.length} pausados, ${cerrados.length} cerrados.\n\n`;
  md += `---\n\n`;

  // Resumen ejecutivo de fechas próximas
  md += `## Fechas críticas próximas\n\n`;
  const conFecha = activos.filter((e) => e.fecha_critica);
  if (conFecha.length === 0) {
    md += `_Sin fechas críticas activas._\n\n`;
  } else {
    for (const e of conFecha) {
      const dias = diasRestantes(e.fecha_critica);
      const titulo = e.nombre_corto || e.cliente;
      const marca = dias !== null && dias < 7 ? "🔴" : dias !== null && dias < 30 ? "🟡" : "⚪";
      md += `- ${marca} **${titulo}** — ${e.etiqueta_fecha || "Fecha crítica"}: ${formatFecha(e.fecha_critica)} (en ${dias} días)\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;

  // Expedientes activos
  md += `## Expedientes activos\n\n`;
  if (activos.length === 0) {
    md += `_Sin expedientes activos._\n\n`;
  } else {
    for (const e of activos) {
      md += renderExpediente(e);
    }
  }

  // Pausados (si hay)
  if (pausados.length > 0) {
    md += `---\n\n## Expedientes pausados\n\n`;
    for (const e of pausados) {
      md += renderExpediente(e);
    }
  }

  // Cerrados (si hay) - solo título y resumen mínimo
  if (cerrados.length > 0) {
    md += `---\n\n## Expedientes cerrados (referencia)\n\n`;
    for (const e of cerrados) {
      const titulo = e.nombre_corto || e.cliente;
      md += `- **${titulo}** — ${e.asunto}\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;
  md += `_Snapshot generado por CD01 Coordinador desde Supabase. La fuente de verdad es la app expedientes.duendes.app — los duendes responsables tienen la información más actualizada._\n`;

  return md;
}

function renderExpediente(e: Expediente): string {
  const titulo = e.nombre_corto || e.cliente;
  let md = `### ${titulo}\n\n`;

  if (e.cliente && e.cliente !== titulo) {
    md += `**Cliente legal:** ${e.cliente}\n`;
  }
  md += `**Asunto:** ${e.asunto}\n`;
  if (e.duende_responsable) md += `**Duende responsable:** ${e.duende_responsable}\n`;
  if (e.abogado_notaria) md += `**Abogado / Notaría:** ${e.abogado_notaria}\n`;
  if (e.fecha_critica) {
    const dias = diasRestantes(e.fecha_critica);
    md += `**${e.etiqueta_fecha || "Fecha crítica"}:** ${formatFecha(e.fecha_critica)} (en ${dias} días)\n`;
  }
  if (e.descripcion) md += `**Descripción:** ${e.descripcion}\n`;

  const pendientes = (e.pendientes || []) as Pendiente[];
  const activos = pendientes.filter((p) => !p.completado);
  const completados = pendientes.filter((p) => p.completado);

  if (activos.length > 0) {
    md += `\n**Pendientes:**\n`;
    for (const p of activos) {
      md += `- ${urgenciaLabel(p.urgencia)} ${p.texto}\n`;
    }
  }

  if (completados.length > 0) {
    md += `\n**Ya completados:**\n`;
    for (const p of completados) {
      md += `- ✅ ${p.texto}\n`;
    }
  }

  if (e.notas) {
    md += `\n**Notas:** ${e.notas}\n`;
  }

  md += `\n`;
  return md;
}
