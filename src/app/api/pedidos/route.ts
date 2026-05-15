import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { usuario_id, items, total } = await request.json();

    // Insertar cada item del carrito en la tabla pedidos
    for (const item of items) {
      await db.query(
        'INSERT INTO pedidos (usuario_id, producto, cantidad, total, estado) VALUES (?, ?, ?, ?, ?)',
        [usuario_id, item.nombre, item.cantidad, item.precio * item.cantidad, 'pendiente']
      );
    }

    return NextResponse.json({ message: 'Pedido registrado con éxito' }, { status: 201 });
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}