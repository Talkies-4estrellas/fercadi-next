import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

// GET — obtener las 4 tarjetas
export async function GET(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const [rows] = await db.query('SELECT * FROM home_cards ORDER BY posicion ASC');
  return NextResponse.json({ ok: true, cards: rows });
}

// PUT — actualizar todas las tarjetas (body: { cards: HomeCard[] })
export async function PUT(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  const { cards } = await request.json();

  if (!Array.isArray(cards) || cards.length !== 4) {
    return NextResponse.json({ ok: false, message: 'Se requieren exactamente 4 tarjetas' }, { status: 400 });
  }

  for (const card of cards) {
    await db.query(
      `UPDATE home_cards
         SET titulo = ?, descripcion = ?, btn_texto = ?, btn_href = ?
       WHERE posicion = ?`,
      [card.titulo, card.descripcion, card.btn_texto, card.btn_href, card.posicion]
    );
  }

  return NextResponse.json({ ok: true });
}
