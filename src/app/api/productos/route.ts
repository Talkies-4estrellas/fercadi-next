import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const seccion = searchParams.get('seccion');
    const categoria = searchParams.get('categoria');

    try {
        let query = 'SELECT * FROM productos WHERE activo = TRUE';
        const params: any[] = [];

        if (seccion) {
            query += ' AND seccion = ?';
            params.push(seccion);
        }
        if (categoria) {
            query += ' AND categoria_slug = ?';
            params.push(categoria);
        }

        const [rows] = await db.query(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ message: 'Error al cargar productos' }, { status: 500 });
  }
}