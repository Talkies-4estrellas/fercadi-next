import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/pedidos
 * Body: { usuario_id, items: CartItem[], notas?, direccion? }
 *
 * Flujo en una sola transacción:
 *  1. Valida usuario y carrito.
 *  2. Por cada ítem verifica que el producto exista y esté activo en DB.
 *     Usa el precio REAL de la BD — no el del cliente.
 *  3. Crea un registro en `ordenes` con el total calculado en servidor.
 *  4. Inserta una fila en `pedidos` por ítem, vinculada a esa orden.
 *  5. Si algo falla → rollback completo.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { usuario_id, items, notas, direccion, metodo_pago } = body;

    if (!usuario_id) {
      return NextResponse.json({ ok: false, error: 'Usuario no autenticado.' }, { status: 401 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'El carrito está vacío.' }, { status: 400 });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // ── 1. Verificar cada producto y calcular total real ──────────
      let totalReal = 0;
      const itemsVerificados: {
        nombre:    string;
        opciones:  string | null;
        cantidad:  number;
        precio:    number;
        subtotal:  number;
      }[] = [];

      for (const item of items) {
        const productoId = parseInt(String(item.id), 10);
        if (isNaN(productoId)) {
          throw new Error(`ID de producto inválido: "${item.id}".`);
        }

        const [rows]: any = await connection.query(
          'SELECT id, nombre, precio, activo FROM productos WHERE id = ? LIMIT 1',
          [productoId]
        );
        const p = rows[0];
        if (!p || p.activo === 0) {
          throw new Error(`El producto "${item.nombre || 'ID ' + productoId}" ya no está disponible.`);
        }

        const precio   = Number(p.precio);
        const cantidad = Math.max(1, Number(item.cantidad));
        const subtotal = precio * cantidad;
        totalReal += subtotal;

        itemsVerificados.push({
          nombre:   p.nombre,
          opciones: item.opciones ?? null,
          cantidad,
          precio,
          subtotal,
        });
      }

      // ── 2. Crear el registro de la orden ─────────────────────────
      const METODOS_VALIDOS = ['efectivo', 'transferencia', 'tarjeta'];
      const metodoPago = METODOS_VALIDOS.includes(metodo_pago) ? metodo_pago : null;

      const [ordenResult]: any = await connection.query(
        `INSERT INTO ordenes (usuario_id, total, estado, notas, direccion_entrega, metodo_pago)
         VALUES (?, ?, 'pendiente', ?, ?, ?)`,
        [usuario_id, totalReal, notas?.trim() || null, direccion?.trim() || null, metodoPago]
      );
      const ordenId: number = ordenResult.insertId;

      // ── 3. Insertar cada ítem vinculado a la orden ────────────────
      for (const item of itemsVerificados) {
        await connection.query(
          `INSERT INTO pedidos
             (orden_id, usuario_id, producto, opciones, cantidad, precio_unitario, total, estado)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
          [ordenId, usuario_id, item.nombre, item.opciones, item.cantidad, item.precio, item.subtotal]
        );
      }

      await connection.commit();
      connection.release();

      return NextResponse.json({
        ok:       true,
        orden_id: ordenId,
        total:    totalReal,
        items:    itemsVerificados.length,
      });

    } catch (e: any) {
      await connection.rollback();
      connection.release();
      return NextResponse.json(
        { ok: false, error: e.message || 'Error en la transacción.' },
        { status: 409 }
      );
    }

  } catch (e) {
    console.error('[POST /api/pedidos]', e);
    return NextResponse.json({ ok: false, error: 'Error del servidor.' }, { status: 500 });
  }
}
