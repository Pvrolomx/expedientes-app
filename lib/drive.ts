import { google } from "googleapis";

/**
 * Devuelve un cliente de Drive autenticado usando el refresh token persistente.
 * Las 3 env vars deben estar configuradas en Vercel:
 *   - GOOGLE_CLIENT_ID
 *   - GOOGLE_CLIENT_SECRET
 *   - GOOGLE_REFRESH_TOKEN
 */
export function getDriveClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Faltan credenciales de Google. Verifica GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN en Vercel."
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.drive({ version: "v3", auth: oauth2Client });
}

/**
 * Encuentra una carpeta por nombre, o la crea si no existe.
 * Como usamos scope drive.file, solo vemos archivos creados por esta app.
 */
export async function getOrCreateFolder(
  drive: ReturnType<typeof getDriveClient>,
  folderName: string
): Promise<string> {
  // Buscar carpeta existente
  const search = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
    pageSize: 1,
  });

  if (search.data.files && search.data.files.length > 0) {
    return search.data.files[0].id!;
  }

  // Crear carpeta
  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return created.data.id!;
}

/**
 * Crea o actualiza un archivo en Drive (upsert por nombre dentro de una carpeta).
 */
export async function upsertFile(
  drive: ReturnType<typeof getDriveClient>,
  folderId: string,
  fileName: string,
  contents: string,
  mimeType: string = "text/markdown"
): Promise<{ id: string; created: boolean }> {
  // Buscar archivo existente
  const escapedName = fileName.replace(/'/g, "\\'");
  const search = await drive.files.list({
    q: `name='${escapedName}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id, name)",
    pageSize: 1,
  });

  const media = { mimeType, body: contents };

  if (search.data.files && search.data.files.length > 0) {
    const fileId = search.data.files[0].id!;
    await drive.files.update({
      fileId,
      media,
    });
    return { id: fileId, created: false };
  }

  const created = await drive.files.create({
    requestBody: { name: fileName, parents: [folderId], mimeType },
    media,
    fields: "id",
  });
  return { id: created.data.id!, created: true };
}
