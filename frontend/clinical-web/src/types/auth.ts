export type UserRole = 'ADMIN' | 'DOCTOR';

export interface MockUserRecord {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  crm?: string;
  password: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface AuthSession {
  token: string;
  role: UserRole;
  name: string;
  email: string;
}

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  ADMIN: '/admin',
  DOCTOR: '/medico',
};
