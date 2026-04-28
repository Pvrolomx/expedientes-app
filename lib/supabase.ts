import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export type Urgencia = "rojo" | "amarillo" | "verde" | "gris";

export type Pendiente = {
  id: string;
  texto: string;
  urgencia: Urgencia;
  completado: boolean;
};

export type Estado = "activo" | "pausado" | "cerrado";

export type Expediente = {
  id: string;
  created_at: string;
  updated_at: string;
  cliente: string;
  nombre_corto: string | null;
  asunto: string;
  descripcion: string | null;
  abogado_notaria: string | null;
  estado: Estado;
  fecha_critica: string | null;
  etiqueta_fecha: string | null;
  pendientes: Pendiente[];
  notas: string | null;
  duende_responsable: string | null;
};

export const URGENCIA_LABEL: Record<Urgencia, string> = {
  rojo: "Crítico",
  amarillo: "Pendiente",
  verde: "En curso",
  gris: "Completado",
};

export const URGENCIA_HEX: Record<Urgencia, string> = {
  rojo: "#E24B4A",
  amarillo: "#EF9F27",
  verde: "#639922",
  gris: "#888780",
};
