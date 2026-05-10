import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generarMarkdownAgenda } from "@/lib/markdown-export";
import { getDriveClient, getOrCreateFolder, upsertFile } from "@/lib/drive";
import type { Expediente } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FOLDER_NAME = "Colmena Carro";
const FILE_NAME = "agenda_expedientes.md";

export async function GET(req: NextRequest) {
  // Auth simple: el cron de Vercel manda el header Authorization automáticamente,
  // o se puede triggear manual con ?key=1434
  const auth = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const keyParam = req.nextUrl.searchParams.get("key");

  const isCron = cronSecret && auth === `Bearer ${cronSecret}`;
  const isManual = keyParam === "1434";

  if (!isCron && !isManual) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const t0 = Date.now();
  const log: Record<string, any> = { trigger: isCron ? "cron" : "manual" };

  try {
    // 1. Leer Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("expedientes")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: "supabase", detail: error.message },
        { status: 500 }
      );
    }

    const expedientes = (data as Expediente[]) || [];
    log.expedientes_count = expedientes.length;

    // 2. Generar markdown
    const markdown = generarMarkdownAgenda(expedientes);
    log.markdown_bytes = markdown.length;

    // 3. Subir a Drive
    const drive = getDriveClient();
    const folderId = await getOrCreateFolder(drive, FOLDER_NAME);
    log.folder_id = folderId;

    const result = await upsertFile(drive, folderId, FILE_NAME, markdown);
    log.file_id = result.id;
    log.file_action = result.created ? "created" : "updated";

    log.elapsed_ms = Date.now() - t0;

    return NextResponse.json({
      ok: true,
      ...log,
      file_url: `https://drive.google.com/file/d/${result.id}/view`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "drive_export_failed",
        detail: err?.message || String(err),
        ...log,
        elapsed_ms: Date.now() - t0,
      },
      { status: 500 }
    );
  }
}
