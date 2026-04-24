import { AuthSession, UserRole } from '@/types/auth';

const TOKEN_COOKIE = 'token';
const ROLE_COOKIE = 'role';
const NAME_COOKIE = 'user_name';
const EMAIL_COOKIE = 'user_email';

const REMEMBER_DURATION_SECONDS = 60 * 60 * 12;
const DEFAULT_DURATION_SECONDS = 60 * 60 * 2;

const readCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split('; ');
  const cookie = cookies.find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  const [, value] = cookie.split('=');
  return value ? decodeURIComponent(value) : null;
};

const writeCookie = (name: string, value: string, maxAgeSeconds: number) => {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const setAuthSessionCookies = (session: AuthSession, remember: boolean) => {
  const maxAge = remember ? REMEMBER_DURATION_SECONDS : DEFAULT_DURATION_SECONDS;

  writeCookie(TOKEN_COOKIE, session.token, maxAge);
  writeCookie(ROLE_COOKIE, session.role, maxAge);
  writeCookie(NAME_COOKIE, session.name, maxAge);
  writeCookie(EMAIL_COOKIE, session.email, maxAge);
};

export const clearAuthSessionCookies = () => {
  deleteCookie(TOKEN_COOKIE);
  deleteCookie(ROLE_COOKIE);
  deleteCookie(NAME_COOKIE);
  deleteCookie(EMAIL_COOKIE);
};

export const readAuthSessionCookies = (): AuthSession | null => {
  const token = readCookie(TOKEN_COOKIE);
  const role = readCookie(ROLE_COOKIE) as UserRole | null;

  if (!token || !role) {
    return null;
  }

  return {
    token,
    role,
    name: readCookie(NAME_COOKIE) ?? 'Usuario autenticado',
    email: readCookie(EMAIL_COOKIE) ?? '',
  };
};
