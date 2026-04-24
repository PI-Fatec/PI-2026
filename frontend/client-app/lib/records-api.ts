import { apiRequest } from '@/lib/api';
import { HealthRecord, HealthRecordType, UpsertHealthRecordInput } from '@/types/record';

export const recordsApi = {
  list(token: string) {
    return apiRequest<HealthRecord[]>('/api/records', { token });
  },

  create(token: string, payload: UpsertHealthRecordInput) {
    return apiRequest<HealthRecord>('/api/records', {
      method: 'POST',
      token,
      body: payload,
    });
  },

  update(token: string, id: string, payload: UpsertHealthRecordInput) {
    return apiRequest<HealthRecord>(`/api/records/${id}`, {
      method: 'PUT',
      token,
      body: payload,
    });
  },

  remove(token: string, id: string) {
    return apiRequest<void>(`/api/records/${id}`, {
      method: 'DELETE',
      token,
    });
  },
};
