export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface MockUserRecord {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  crm?: string;
  password: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
  remember: boolean;
}

export interface RegisterInput {
  role: Exclude<UserRole, 'ADMIN'>;
  name: string;
  email: string;
  password: string;
  telefone?: string;
  crm?: string;
  especialidade?: string;
  clinica?: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: 'Masculino' | 'Feminino' | 'Outro';
  alturaCm?: number;
  pesoKg?: number;
  imc?: number;
  pressaoSistolica?: number;
  pressaoDiastolica?: number;
  glicemiaMgDl?: number;
  fumante?: boolean;
  atividadeFisica?: boolean;
  historicoAvc?: boolean;
  diabetes?: boolean;
  consumoAlcoolDoses?: number;
  estadoGeralSaude?: 'MUITO_BOM' | 'BOM' | 'ATENCAO' | 'CRITICO';
  status?: 'ATIVO' | 'INATIVO';
}

export interface AuthSession {
  token: string;
  role: UserRole;
  name: string;
  email: string;
}

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  ADMIN: '/',
  DOCTOR: '/',
  PATIENT: '/',
};
