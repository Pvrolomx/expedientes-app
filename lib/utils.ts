export function diasRestantes(fechaISO: string | null): number | null {
  if (!fechaISO) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaISO + "T00:00:00");
  const diff = fecha.getTime() - hoy.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function urgenciaBadgeFecha(dias: number | null): {
  color: string;
  bg: string;
  label: string;
} | null {
  if (dias === null) return null;
  if (dias < 0) {
    return { color: "#E24B4A", bg: "#FEE2E2", label: `Vencida hace ${Math.abs(dias)} d` };
  }
  if (dias === 0) return { color: "#E24B4A", bg: "#FEE2E2", label: "Hoy" };
  if (dias < 7) return { color: "#E24B4A", bg: "#FEE2E2", label: `${dias} d` };
  if (dias < 30) return { color: "#B45309", bg: "#FEF3C7", label: `${dias} d` };
  return { color: "#374151", bg: "#F3F4F6", label: `${dias} d` };
}

export function formatearFecha(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function uuidv4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
