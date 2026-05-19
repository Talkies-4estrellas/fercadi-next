import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/pedidos
 * Body: { usuario_id, items: CartItem[], total }
 *
 * Flujo:
 *  1. Valida que el usuario y el carrito existan.
 *  2. Abre una transacción MySQL.
 *  3. Por cada ítem: busca el producto en DB, verifica que esté activo
 *     y usa el precio REAL de la BD (no el que viene del cliente).
 *  4. Inserta una fila en `pedidos` por cada ítem.
 *  5. Si algo falla (producto inactivo, error de DB) hace rollback completo.
 *
 * Nota sobre item.id:
 *  El carrito guarda ids con el formato "dbId-opción" (ej. "5-Estándar").
 *  parseInt("5-Estándar") → 5, que es el id real del producto en la BD.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { usuario_id, items } = body;

    // Validación 1: Verificar que el usuario esté identificado
    if (!usuario_id) {
      return NextResponse.json(
        { ok: false, error: 'Usuario no autenticado o ID faltante.' },
        { status: 401 }
      );
    }

    // Validación 2: Verificar que el carrito no venga vacío
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'El carrito de compras está vacío.' },
        { status: 400 }
      );
    }

    // Iniciamos una transacción para asegurar la integridad de los datos
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const item of items) {
        // El id del carrito tiene formato "productoDbId-opcion" (ej. "5-Estándar").
        // parseInt se detiene en el primer carácter no numérico → obtenemos el id real.
        const productoId = parseInt(String(item.id), 10);

        if (isNaN(productoId)) {
          throw new Error(`ID de producto inválido: "${item.id}".`);
        }

        // Validación 3: Verificar que el producto exista y esté activo en la BD
        const [rows]: any = await connection.query(
          'SELECT id, nombre, precio, activo FROM productos WHERE id = ? LIMIT 1',
          [productoId]
        );

        const productoDb = rows[0];

        if (!productoDb || productoDb.activo === 0) {
          throw new Error(`El producto "${item.nombre || 'ID: ' + productoId}" ya no está disponible.`);
        }

        // Usamos el precio REAL de la base de datos, NO el que viene del cliente
        const precioReal = Number(productoDb.precio);
        const cantidad = Number(item.cantidad);
        const subtotal = precioReal * cantidad;

        // Insertar una fila por ítem en la tabla plana `pedidos`
        await connection.query(
          `INSERT INTO pedidos (usuario_id, producto, opciones, cantidad, precio_unitario, total, estado)
           VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
          [
            usuario_id,
            productoDb.nombre,   // nombre oficial de la BD (no el del cliente)
            item.opciones ?? null,
            cantidad,
            precioReal,
            subtotal,
          ]
        );
      }

      // Si todo salió bien, consolidamos los cambios en MySQL
      await connection.commit();
      connection.release();

      return NextResponse.json({
        ok: true,
        message: 'Pedido procesado y verificado correctamente.',
        items: items.length,
      });

    } catch (transactionError: any) {
      // Si algo falla, cancelamos todo el progreso
      await connection.rollback();
      connection.release();

      return NextResponse.json(
        { ok: false, error: transactionError.message || 'Error interno en la transacción.' },
        { status: 409 }
      );
    }

  } catch (error) {
    console.error('Error crítico en el endpoint de pedidos:', error);
    return NextResponse.json(
      { ok: false, error: 'Error del servidor al procesar la solicitud.' },
      { status: 500 }
    );
  }
}
