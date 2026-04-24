import { apiRequest } from '@/services/apiClient';
import { RegisterInput } from '@/types/auth';

export interface InviteValidationResponse {
  valid: boolean;
  role: 'DOCTOR' | 'PATIENT';
  email: string;
  expiresAt: string;
}

export const inviteApi = {
  validate(token: string) {
    return apiRequest<InviteValidationResponse>('/api/invites/validate', {
      query: { token },
    });
  },

  accept(payload: RegisterInput & { token: string }) {
    return apiRequest<{ token: string; user: { id: string; name: string; email: string; role: 'ADMIN' | 'DOCTOR' | 'PATIENT' } }>(
      '/api/invites/accept',
      {
        method: 'POST',
        body: payload,
      },
    );
  },
};
