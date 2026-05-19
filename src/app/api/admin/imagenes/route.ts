import { NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';
import fs from 'fs/promises';
import path from 'path';

/**
 * GET /api/admin/imagenes
 *   Devuelve un listado de todas las imágenes disponibles en
 *   public/productos/, agrupadas por carpeta. Las rutas vienen relativas
 *   (ej. "/productos/concretos/clase-a/fc150.png") listas para
 *   guardarse en la columna `imagen_url` de la tabla `productos`.
 *
 *   Sólo para administradores.
 */

const EXTENSIONES = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);

interface NodoImagen {
  carpeta: string;
  ruta: string;       // ruta lista para guardar en BD
  nombre: string;     // sólo el nombre del archivo
}

async function listarImagenesRecursivo(
  raizAbsoluta: string,
  rutaRelativa: string,
  acumulador: NodoImagen[]
): Promise<void> {
  const carpetaActual = path.join(raizAbsoluta, rutaRelativa);
  let entradas: any[];
  try {
    entradas = await fs.readdir(carpetaActual, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entrada of entradas) {
    const nombreEntrada = entrada.name;
    const subRelativa = path.posix.join(rutaRelativa, nombreEntrada);

    if (entrada.isDirectory()) {
      await listarImagenesRecursivo(raizAbsoluta, subRelativa, acumulador);
    } else if (entrada.isFile()) {
      const ext = path.extname(nombreEntrada).toLowerCase();
      if (EXTENSIONES.has(ext)) {
        acumulador.push({
          carpeta: rutaRelativa || '/',
          ruta: `/productos${subRelativa.startsWith('/') ? '' : '/'}${subRelativa}`,
          nombre: nombreEntrada,
        });
      }
    }
  }
}

export async function GET(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const raiz = path.join(process.cwd(), 'public', 'productos');
  const imagenes: NodoImagen[] = [];

  try {
    await listarImagenesRecursivo(raiz, '', imagenes);
  } catch (error: any) {
    console.error('[GET /api/admin/imagenes]', error);
    return NextResponse.json(
      { ok: false, message: 'No se pudieron listar las imágenes', detalle: error?.message },
      { status: 500 }
    );
  }

  // Agrupar por carpeta
  const porCarpeta: Record<string, NodoImagen[]> = {};
  for (const img of imagenes) {
    const key = img.carpeta || '/';
    (porCarpeta[key] ??= []).push(img);
  }

  return NextResponse.json({ ok: true, total: imagenes.length, imagenes, porCarpeta });
}
