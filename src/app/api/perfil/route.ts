import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'userId requerido' }, { status: 400 });
  }

  const [compras, servicios, suscripciones] = await Promise.all([
    db.query('SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY fecha DESC', [userId])
      .then(([rows]) => rows)
      .catch(() => []),
    db.query('SELECT * FROM servicios_contratados WHERE usuario_id = ? ORDER BY fecha DESC', [userId])
      .then(([rows]) => rows)
      .catch(() => []),
    db.query('SELECT * FROM suscripciones WHERE usuario_id = ? ORDER BY fecha_inicio DESC', [userId])
      .then(([rows]) => rows)
      .catch(() => []),
  ]);

  return NextResponse.json({ compras, servicios, suscripciones });
}
