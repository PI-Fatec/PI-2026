import { apiRequest } from '@/services/apiClient';
import { RegisterInput } from '@/types/auth';

type AcceptInviteInput = Omit<RegisterInput, 'role'> & {
  token: string;
  role: 'DOCTOR' | 'PATIENT';
};

export interface InviteValidationResponse {
  valid: boolean;
  role: 'DOCTOR' | 'PATIENT';
  email: string;
  cpf?: string | null;
  dataNascimento?: string | null;
  sexo?: 'Masculino' | 'Feminino' | 'Outro' | null;
  expiresAt: string;
}

export const inviteApi = {
  validate(token: string) {
    return apiRequest<InviteValidationResponse>('/api/invites/validate', {
      query: { token },
    });
  },

  accept(payload: AcceptInviteInput) {
    return apiRequest<{ token: string; user: { id: string; name: string; email: string; role: 'ADMIN' | 'DOCTOR' | 'PATIENT' } }>(
      '/api/invites/accept',
      {
        method: 'POST',
        body: payload,
      },
    );
  },
};
