import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/cadastro', '/404', '/recuperar-senha'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.includes(pathname);

  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, exceto:
     * - api (rotas de API)
     * - _next/static (arquivos estáticos servidos pelo next)
     * - _next/image (arquivos de imagem)
     * - favicon.ico e arquivos de configuração
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};