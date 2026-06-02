import { apiRequest } from '@/services/apiClient';
import { HealthAnalysisRequestResponse, HealthAnalysisStatusResponse } from '@/types/healthAnalysis';

export const healthAnalysisApi = {
  requestByPatientProfile(patientProfileId: string, token: string) {
    return apiRequest<HealthAnalysisRequestResponse>('/api/health/analysis', {
      method: 'POST',
      token,
      body: { patientProfileId },
    });
  },

  getStatus(requestId: string, token: string) {
    return apiRequest<HealthAnalysisStatusResponse>(`/api/health/analysis/${requestId}`, { token });
  },
};
