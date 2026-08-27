/**
 * lib/supabaseStorage.ts — acceso a Supabase Storage via REST API.
 * No usa @supabase/supabase-js para no añadir dependencias.
 *
 * Bucket requerido: "productos" — debe existir en el dashboard de Supabase
 * con política de lectura pública (SELECT para anon) y escritura solo para
 * service role (INSERT para authenticated/service_role).
 */

const SUPABASE_URL   = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const BUCKET         = 'productos';

function storageHeaders() {
  return {
    Authorization: `Bearer ${SERVICE_KEY}`,
    apikey: SERVICE_KEY,
  };
}

/** URL pública de un objeto en el bucket */
export function publicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * Sube un archivo al bucket.
 * @param path  Ruta dentro del bucket, ej. "concretos/clase-a/fc150.webp"
 * @param body  Buffer o Blob con el contenido
 * @param contentType  MIME type, ej. "image/webp"
 * @returns URL pública del archivo subido
 */
export async function uploadFile(
  path: string,
  body: Buffer | Blob,
  contentType: string
): Promise<string> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidas.');
  }

  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      ...storageHeaders(),
      'Content-Type': contentType,
      'x-upsert': 'true', // sobreescribir si ya existe
    },
    body: body instanceof Buffer ? new Uint8Array(body) : body,
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Supabase Storage error ${res.status}: ${detail}`);
  }

  return publicUrl(path);
}

export interface StorageItem {
  nombre: string;
  ruta: string;     // URL pública completa
  carpeta: string;
}

/**
 * Lista los archivos dentro de una carpeta del bucket (un nivel).
 * Para listar recursivamente usa listFilesRecursive.
 */
async function listOnce(prefix = ''): Promise<any[]> {
  const url = `${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...storageHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prefix,
      limit: 1000,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    }),
  });
  if (!res.ok) return [];
  return res.json();
}

/**
 * Lista recursivamente todos los archivos del bucket.
 */
export async function listFiles(prefix = ''): Promise<StorageItem[]> {
  if (!SUPABASE_URL || !SERVICE_KEY) return [];

  const result: StorageItem[] = [];
  const items = await listOnce(prefix);

  for (const item of items) {
    if (!item.name) continue;
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

    if (item.id === null) {
      // Es una "carpeta virtual" — listar su contenido recursivamente
      const sub = await listFiles(fullPath);
      result.push(...sub);
    } else {
      result.push({
        nombre: item.name,
        ruta:   publicUrl(fullPath),
        carpeta: prefix || '/',
      });
    }
  }

  return result;
}
