import { NextResponse } from 'next/server';
import { getDynamicSearchIndex, getStaticSearchIndex } from '@/lib/searchIndex';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Intenta obtener datos de la BD; si falla o está vacía, usa el índice estático
  const dbItems = await getDynamicSearchIndex();
  const items = dbItems ?? getStaticSearchIndex();

  return NextResponse.json(items, {
    headers: {
      // Cache 60 segundos en el cliente para no re-pedir en cada apertura del buscador
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
