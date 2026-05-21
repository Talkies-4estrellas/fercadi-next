import { NextResponse } from 'next/server';
<<<<<<< HEAD
import { getDynamicSearchIndex } from '@/lib/searchIndex';
=======
import { getDynamicSearchIndex, getStaticSearchIndex } from '@/lib/searchIndex';
>>>>>>> dab3f03e4ee62ee1a980a59c54840416a43523ea

export const dynamic = 'force-dynamic';

export async function GET() {
<<<<<<< HEAD
  const items = await getDynamicSearchIndex();

  if (!items) {
    return NextResponse.json([], { status: 503 });
  }

  return NextResponse.json(items, {
    headers: {
=======
  // Intenta obtener datos de la BD; si falla o está vacía, usa el índice estático
  const dbItems = await getDynamicSearchIndex();
  const items = dbItems ?? getStaticSearchIndex();

  return NextResponse.json(items, {
    headers: {
      // Cache 60 segundos en el cliente para no re-pedir en cada apertura del buscador
>>>>>>> dab3f03e4ee62ee1a980a59c54840416a43523ea
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
