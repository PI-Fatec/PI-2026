import { apiRequest } from '@/lib/api';
import { PatientAccount, UpdatePatientProfileInput } from '@/types/patient-profile';

type UpdateAccountResponse = {
  account: PatientAccount;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'PATIENT';
  };
};

export const patientProfileApi = {
  getMe(token: string) {
    return apiRequest<PatientAccount>('/api/account/me', { token });
  },

  updateMe(token: string, payload: UpdatePatientProfileInput) {
    return apiRequest<UpdateAccountResponse>('/api/account/me', {
      method: 'PUT',
      token,
      body: payload,
    });
  },
};
