import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger todas las páginas del panel admin en el servidor.
  // Si no existe la cookie httpOnly que emite /api/login, redirigir a /login.
  // La validación real del rol ocurre en cada API route con requerirAdmin().
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('fercadi_session');
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirigir', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
