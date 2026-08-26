import { NextResponse } from 'next/server';
import { requerirAdmin } from '@/lib/admin';
import { listFiles } from '@/lib/supabaseStorage';
import fs from 'fs/promises';
import path from 'path';

const EXTENSIONES = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);

interface NodoImagen {
  carpeta: string;
  ruta: string;
  nombre: string;
  fuente: 'local' | 'supabase';
}

async function listarLocales(
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
      await listarLocales(raizAbsoluta, subRelativa, acumulador);
    } else if (entrada.isFile()) {
      const ext = path.extname(nombreEntrada).toLowerCase();
      if (EXTENSIONES.has(ext)) {
        acumulador.push({
          carpeta: rutaRelativa || '/',
          ruta: `/productos${subRelativa.startsWith('/') ? '' : '/'}${subRelativa}`,
          nombre: nombreEntrada,
          fuente: 'local',
        });
      }
    }
  }
}

export async function GET(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const imagenes: NodoImagen[] = [];

  // 1. Imágenes locales en public/productos/
  const raiz = path.join(process.cwd(), 'public', 'productos');
  await listarLocales(raiz, '', imagenes);

  // 2. Imágenes en Supabase Storage (si las variables de entorno están definidas)
  try {
    const storageItems = await listFiles('');
    for (const item of storageItems) {
      imagenes.push({
        carpeta: item.carpeta,
        ruta: item.ruta,
        nombre: item.nombre,
        fuente: 'supabase',
      });
    }
  } catch {
    // Si Supabase no está configurado, continuar solo con locales
  }

  const porCarpeta: Record<string, NodoImagen[]> = {};
  for (const img of imagenes) {
    const key = img.carpeta || '/';
    (porCarpeta[key] ??= []).push(img);
  }

  return NextResponse.json({ ok: true, total: imagenes.length, imagenes, porCarpeta });
}
