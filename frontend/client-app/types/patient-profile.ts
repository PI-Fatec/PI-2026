export type Sex = 'Masculino' | 'Feminino' | 'Outro';

export type HealthOverallStatus = 'MUITO_BOM' | 'BOM' | 'ATENCAO' | 'CRITICO';

export type RiskLevel = 'ALTO' | 'MEDIO' | 'BAIXO';

export type PatientProfile = {
  id: string;
  cpf: string;
  dataNascimento: string | null;
  sexo: Sex;
  telefone: string;
  alturaCm: number;
  pesoKg: number;
  imc: number;
  pressaoSistolica: number;
  pressaoDiastolica: number;
  glicemiaMgDl: number;
  fumante: boolean;
  colesterolAlto: boolean;
  atividadeFisica: boolean;
  historicoAvc: boolean;
  doencaCardiaca: boolean;
  consomeFrutas: boolean;
  consomeVegetais: boolean;
  dificuldadeCaminhar: boolean;
  consumoAlcoolDoses: number;
  estadoGeralSaude: HealthOverallStatus;
  risco: RiskLevel;
  probabilidadeRisco: number;
  status: 'ATIVO' | 'INATIVO';
};

export type PatientAccount = {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT';
  patientProfile: PatientProfile | null;
};

export type UpdatePatientProfileInput = Partial<
  Pick<
    PatientProfile,
    | 'cpf'
    | 'dataNascimento'
    | 'sexo'
    | 'telefone'
    | 'alturaCm'
    | 'pesoKg'
    | 'imc'
    | 'pressaoSistolica'
    | 'pressaoDiastolica'
    | 'glicemiaMgDl'
    | 'fumante'
    | 'colesterolAlto'
    | 'atividadeFisica'
    | 'historicoAvc'
    | 'doencaCardiaca'
    | 'consomeFrutas'
    | 'consomeVegetais'
    | 'dificuldadeCaminhar'
    | 'consumoAlcoolDoses'
    | 'estadoGeralSaude'
  >
>;
