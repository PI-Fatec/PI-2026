export type HealthRecordType =
  | 'glicemia'
  | 'pressao_arterial'
  | 'alimentacao'
  | 'exame'
  | 'prontuario'
  | 'predicao_risco';

export type HealthRecordTypeMeta = {
  value: HealthRecordType;
  label: string;
  unit: string;
  placeholder: string;
};

export type HealthRecord = {
  id: string;
  type: HealthRecordType;
  value: number;
  unit: string;
  notes: string;
  recordedAt: string;
};

export type UpsertHealthRecordInput = {
  type: HealthRecordType;
  value: number;
  unit: string;
  notes: string;
  recordedAt: string;
};
