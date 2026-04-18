export type RiskLevel = 'ALTO' | 'MEDIO' | 'BAIXO';

export type PatientStatus = 'ATIVO' | 'INATIVO';

export type HealthOverallStatus = 'MUITO_BOM' | 'BOM' | 'ATENCAO' | 'CRITICO';

export interface PatientDataStep {
  nomeCompleto: string;
  cpf: string;
  dataNascimento: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  telefone: string;
  email: string;
}

export interface PatientBiometryStep {
  alturaCm: number;
  pesoKg: number;
  imc: number;
  pressaoSistolica: number;
  pressaoDiastolica: number;
  glicemiaMgDl: number;
}

export interface PatientPredictorsStep {
  fumante: boolean;
  atividadeFisica: boolean;
  historicoAvc: boolean;
  diabetes: boolean;
  consumoAlcoolDoses: number;
  estadoGeralSaude: HealthOverallStatus;
}

export interface Patient extends PatientDataStep, PatientBiometryStep, PatientPredictorsStep {
  id: string;
  risco: RiskLevel;
  probabilidadeRisco: number;
  status: PatientStatus;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PatientFilters {
  busca?: string;
  risco?: RiskLevel | 'TODOS';
  status?: PatientStatus | 'TODOS';
  dataInicio?: string;
  dataFim?: string;
}

export type NewPatientInput = Omit<Patient, 'id' | 'risco' | 'probabilidadeRisco' | 'criadoEm' | 'atualizadoEm'>;

export type UpdatePatientInput = Partial<NewPatientInput>;

export interface PatientRepository {
  list: (filters?: PatientFilters) => Promise<Patient[]>;
  getById: (id: string) => Promise<Patient | null>;
  create: (payload: NewPatientInput) => Promise<Patient>;
  update: (id: string, payload: UpdatePatientInput) => Promise<Patient>;
  remove: (id: string) => Promise<void>;
}
