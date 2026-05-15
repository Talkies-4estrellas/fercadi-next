import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

/**
 * GET /api/admin/seed
 * Popula la tabla `productos` con todos los datos estáticos del catálogo.
 * Usar solo en desarrollo / primera carga. Proteger con contraseña en producción.
 *
 * Uso: abrir en el navegador → http://localhost:3000/api/admin/seed
 */
export async function GET() {
  const result = await seedDatabase();

  if (result.ok) {
    return NextResponse.json({ ok: true, mensaje: 'Base de datos poblada correctamente.' });
  } else {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
}
