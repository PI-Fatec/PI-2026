import { Doctor, DoctorFilters, NewDoctorInput, UpdateDoctorInput } from '@/types/doctor';
import { apiRequest } from '@/services/apiClient';

export const doctorApi = {
  list(filters: DoctorFilters, token: string) {
    return apiRequest<Doctor[]>('/api/doctors', {
      token,
      query: {
        busca: filters.busca,
        status: filters.status,
        clinica: filters.clinica,
      },
    });
  },

  invite(payload: NewDoctorInput, token: string) {
    return apiRequest<{ doctor: Doctor }>('/api/invites/doctors', {
      method: 'POST',
      token,
      body: {
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        crm: payload.crm,
        especialidade: payload.especialidade,
        clinica: payload.clinica,
        status: payload.status,
      },
    }).then((response) => response.doctor);
  },

  update(id: string, payload: UpdateDoctorInput, token: string) {
    return apiRequest<Doctor>(`/api/doctors/${id}`, {
      method: 'PUT',
      token,
      body: {
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        crm: payload.crm,
        especialidade: payload.especialidade,
        clinica: payload.clinica,
        status: payload.status,
      },
    });
  },

  remove(id: string, token: string) {
    return apiRequest<void>(`/api/doctors/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
