import { apiRequest } from '@/lib/api';
import { HealthAnalysisRequestResponse, HealthAnalysisStatusResponse } from '@/types/health-analysis';

export const healthAnalysisApi = {
  request(token: string) {
    return apiRequest<HealthAnalysisRequestResponse>('/api/health/analysis', {
      method: 'POST',
      token,
      body: {},
    });
  },

  getStatus(token: string, requestId: string) {
    return apiRequest<HealthAnalysisStatusResponse>(`/api/health/analysis/${requestId}`, { token });
  },
};
