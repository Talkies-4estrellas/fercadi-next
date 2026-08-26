import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requerirAdmin } from '@/lib/admin';

export async function PUT(request: Request) {
  const auth = await requerirAdmin(request);
  if (!auth.ok) return auth.response;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'JSON inválido' }, { status: 400 });
  }

  if (!body.config || typeof body.config !== 'object') {
    return NextResponse.json({ ok: false, message: 'Falta config' }, { status: 400 });
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave  VARCHAR(120) PRIMARY KEY,
        valor  TEXT         NOT NULL,
        fecha  TIMESTAMPTZ  DEFAULT NOW()
      )
    `);
    await db.query(
      `INSERT INTO configuracion (clave, valor, fecha)
       VALUES ('nav_items', ?, NOW())
       ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, fecha = NOW()`,
      [JSON.stringify(body.config)]
    );
    return NextResponse.json({ ok: true, message: 'Configuración guardada' });
  } catch (err: any) {
    console.error('[PUT /api/admin/nav-config]', err);
    return NextResponse.json({ ok: false, message: err?.message }, { status: 500 });
  }
}
