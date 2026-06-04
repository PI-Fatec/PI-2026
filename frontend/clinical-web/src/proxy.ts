import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/login',
  '/cadastro',
  '/cadastro/medico',
  '/convite/aceitar',
  '/convite/app',
  '/404',
  '/recuperar-senha',
];

const inviteRoutes = [
  '/convite/aceitar',
  '/convite/app',
];

const ALLOWED_ROLES = new Set(['ADMIN', 'DOCTOR']);

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete('token');
  response.cookies.delete('role');
  response.cookies.delete('user_name');
  response.cookies.delete('user_email');
}

export default function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const isInviteRoute = inviteRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Convite precisa ser público sempre, mesmo se existir cookie antigo/inválido.
  if (isInviteRoute) {
    return NextResponse.next();
  }

  // No token: only public routes are accessible.
  if (!token) {
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  const hasAllowedRole = role ? ALLOWED_ROLES.has(role) : false;

  // Token with invalid role: clear session and keep user on login.
  if (!hasAllowedRole) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    clearSessionCookies(response);
    return response;
  }

  // Authenticated doctor/admin should not access auth pages.
  if (isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};