export type HealthAnalysisStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';

export type HealthAnalysisRequestResponse = {
  requestId: string;
  status: HealthAnalysisStatus;
  dataQuality?: string[];
};

export type HealthAnalysisStatusResponse = {
  requestId: string;
  status: HealthAnalysisStatus;
  result: Record<string, unknown> | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
};
