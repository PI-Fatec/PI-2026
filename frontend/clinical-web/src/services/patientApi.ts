import { NewPatientInput, Patient, PatientFilters, UpdatePatientInput } from '@/types/patient';
import { apiRequest } from '@/services/apiClient';

export const patientApi = {
  list(filters: PatientFilters, token: string) {
    return apiRequest<Patient[]>('/api/patients', {
      token,
      query: {
        busca: filters.busca,
        risco: filters.risco,
        status: filters.status,
        dataInicio: filters.dataInicio,
        dataFim: filters.dataFim,
      },
    });
  },

  getById(id: string, token: string) {
    return apiRequest<Patient>(`/api/patients/${id}`, { token });
  },

  invite(payload: NewPatientInput, token: string) {
    return apiRequest<{ patient: Patient }>('/api/invites/patients', {
      method: 'POST',
      token,
      body: payload,
    }).then((response) => response.patient);
  },

  update(id: string, payload: UpdatePatientInput, token: string) {
    return apiRequest<Patient>(`/api/patients/${id}`, {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  remove(id: string, token: string) {
    return apiRequest<void>(`/api/patients/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
