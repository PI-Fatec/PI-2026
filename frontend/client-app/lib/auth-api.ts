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

export type PatientRegisterPayload = {
  name: string;
  email: string;
  password: string;
  cpf: string;
  dataNascimento: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  telefone?: string;
};

export type InviteValidationPayload = {
  valid: boolean;
  role: 'DOCTOR' | 'PATIENT';
  email: string;
  cpf?: string | null;
  dataNascimento?: string | null;
  sexo?: 'Masculino' | 'Feminino' | 'Outro' | null;
  expiresAt: string;
};

export const authApi = {
  login(identifier: string, password: string) {
    return apiRequest<AuthPayload>('/api/auth/login', {
      method: 'POST',
      body: { identifier, password, portal: 'MOBILE_APP' },
    });
  },

  registerPatient(payload: PatientRegisterPayload) {
    return apiRequest<AuthPayload>('/api/auth/register/self', {
      method: 'POST',
      body: {
        role: 'PATIENT',
        ...payload,
      },
    });
  },

  validateInvite(token: string) {
    return apiRequest<InviteValidationPayload>('/api/invites/validate', {
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
