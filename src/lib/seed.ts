import { db } from './db';
import { concretos } from '../data/concretos';
import { textucos } from '../data/textucos';
import { materiales } from '../data/materiales';

/**
 * Puebla la tabla `productos` con todos los datos estáticos del catálogo.
 * Usa ON DUPLICATE KEY UPDATE para que sea seguro ejecutar varias veces.
 * Llamar desde un API Route o script de administración; nunca desde el cliente.
 */
export async function seedDatabase() {
  try {
    console.log('🚀 Iniciando migración de productos...');

    // ── Concretos ──────────────────────────────────────────
    for (const cat of concretos) {
      for (const prod of cat.productos) {
        await db.query(
          `INSERT INTO productos (nombre, slug, descripcion, imagen_url, seccion, categoria_slug, activo)
           VALUES (?, ?, ?, ?, 'concretos', ?, 1)
           ON DUPLICATE KEY UPDATE
             nombre=VALUES(nombre),
             descripcion=VALUES(descripcion),
             imagen_url=VALUES(imagen_url)`,
          [prod.nombre, prod.slug, prod.descripcion || '', prod.imagen, cat.slug]
        );
      }
    }

    // ── Acabados (textucos) ────────────────────────────────
    for (const cat of textucos) {
      for (const prod of cat.productos) {
        await db.query(
          `INSERT INTO productos (nombre, slug, descripcion, imagen_url, seccion, categoria_slug, activo)
           VALUES (?, ?, ?, ?, 'textucos', ?, 1)
           ON DUPLICATE KEY UPDATE
             nombre=VALUES(nombre),
             descripcion=VALUES(descripcion),
             imagen_url=VALUES(imagen_url)`,
          [prod.nombre, prod.slug, prod.descripcion || '', prod.imagen, cat.slug]
        );
      }
    }

    // ── Materiales — solo categorías (sin producto individual) ─
    for (const cat of materiales) {
      await db.query(
        `INSERT INTO productos (nombre, slug, descripcion, imagen_url, seccion, categoria_slug, activo)
         VALUES (?, ?, ?, NULL, 'materiales', ?, 1)
         ON DUPLICATE KEY UPDATE
           nombre=VALUES(nombre),
           descripcion=VALUES(descripcion)`,
        [cat.nombre, cat.slug, cat.descripcion || '', cat.slug]
      );
    }

    console.log('✅ Migración completada con éxito.');
    return { ok: true };
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    return { ok: false, error: String(error) };
  }
}
