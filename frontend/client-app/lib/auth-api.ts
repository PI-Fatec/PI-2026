import { apiRequest } from '@/lib/api';

export type AppRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export type AuthPayload = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: AppRole;
  };
};

export const authApi = {
  login(identifier: string, password: string) {
    return apiRequest<AuthPayload>('/api/auth/login', {
      method: 'POST',
      body: { identifier, password },
    });
  },

  registerSelf(payload: {
    role: 'DOCTOR' | 'PATIENT';
    name: string;
    email: string;
    password: string;
    telefone?: string;
    crm?: string;
    especialidade?: string;
    clinica?: string;
    cpf?: string;
    dataNascimento?: string;
    sexo?: 'Masculino' | 'Feminino' | 'Outro';
  }) {
    return apiRequest<AuthPayload>('/api/auth/register/self', {
      method: 'POST',
      body: payload,
    });
  },

  validateInvite(token: string) {
    return apiRequest<{ valid: boolean; role: 'DOCTOR' | 'PATIENT'; email: string; expiresAt: string }>('/api/invites/validate', {
      query: { token },
    });
  },

  acceptInvite(payload: {
    token: string;
    role: 'DOCTOR' | 'PATIENT';
    email: string;
    name: string;
    password: string;
    telefone?: string;
    crm?: string;
    especialidade?: string;
    clinica?: string;
    cpf?: string;
    dataNascimento?: string;
    sexo?: 'Masculino' | 'Feminino' | 'Outro';
  }) {
    return apiRequest<AuthPayload>('/api/invites/accept', {
      method: 'POST',
      body: payload,
    });
  },
};
