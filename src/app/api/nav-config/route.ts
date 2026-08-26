import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

async function ensureTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS configuracion (
      clave  VARCHAR(120) PRIMARY KEY,
      valor  TEXT         NOT NULL,
      fecha  TIMESTAMPTZ  DEFAULT NOW()
    )
  `);
}

export async function GET() {
  try {
    await ensureTable();
    const [rows]: any = await db.query(
      "SELECT valor FROM configuracion WHERE clave = 'nav_items' LIMIT 1"
    );
    if (rows.length === 0) {
      return NextResponse.json({ ok: true, config: {} });
    }
    const config = JSON.parse(rows[0].valor);
    return NextResponse.json({ ok: true, config });
  } catch (err: any) {
    return NextResponse.json({ ok: false, config: {} });
  }
}
