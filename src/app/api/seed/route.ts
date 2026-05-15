import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';

export async function GET() {
  // Solo permitir esto en desarrollo por seguridad
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  await seedDatabase();
  return NextResponse.json({ message: 'Base de datos sincronizada con los archivos .ts' });
}