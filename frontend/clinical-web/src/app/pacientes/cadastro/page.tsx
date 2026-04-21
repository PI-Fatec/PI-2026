'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, Rocket, CircleCheck } from 'lucide-react';
import { Header } from '@/components/Layout/Header/Header';
import { Sidebar } from '@/components/Layout/Sidebar/Sidebar';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { Wizard } from '@/components/ui/Wizard/Wizard';
import logo from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { usePatients } from '@/hooks/usePatients';
import { HealthOverallStatus, NewPatientInput } from '@/types/patient';
import { maskCpf, maskPhone } from '@/utils/masks';
import styles from './cadastro.module.scss';

const wizardSteps = [
  { id: 'dados', label: 'Dados' },
  { id: 'biometria', label: 'Biometria' },
  { id: 'preditores', label: 'Preditores Clinicos' },
];

const initialForm: NewPatientInput = {
  nomeCompleto: '',
  cpf: '',
  dataNascimento: '',
  sexo: 'Masculino',
  telefone: '',
  email: '',
  alturaCm: 170,
  pesoKg: 70,
  imc: 24.2,
  pressaoSistolica: 120,
  pressaoDiastolica: 80,
  glicemiaMgDl: 96,
  fumante: false,
  atividadeFisica: true,
  historicoAvc: false,
  diabetes: false,
  consumoAlcoolDoses: 0,
  estadoGeralSaude: 'BOM',
  status: 'ATIVO',
};

const calculateImc = (alturaCm: number, pesoKg: number) => {
  if (!alturaCm || !pesoKg) {
    return 0;
  }

  const alturaM = alturaCm / 100;
  return Number((pesoKg / (alturaM * alturaM)).toFixed(1));
};

export default function CadastroPacientePage() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const { createPatient, isSaving, error } = usePatients();

  const [form, setForm] = useState<NewPatientInput>(initialForm);
  const [stepIndex, setStepIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasTriedCurrentStep, setHasTriedCurrentStep] = useState(false);

  const role = session?.role ?? 'DOCTOR';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const imcValue = useMemo(() => calculateImc(form.alturaCm, form.pesoKg), [form.alturaCm, form.pesoKg]);

  const updateNumberField = (field: 'alturaCm' | 'pesoKg' | 'pressaoSistolica' | 'pressaoDiastolica' | 'glicemiaMgDl' | 'consumoAlcoolDoses') =>
    (value: string) => {
      const numericValue = Number(value);

      setForm((current) => {
        const next = {
          ...current,
          [field]: Number.isNaN(numericValue) ? 0 : numericValue,
        };

        next.imc = calculateImc(next.alturaCm, next.pesoKg);

        return next;
      });
    };

  const validateStep = (targetStep: number) => {
    if (targetStep === 0) {
      if (!form.nomeCompleto || !form.cpf || !form.dataNascimento || !form.email) {
        return 'Preencha os campos obrigatorios de dados pessoais.';
      }
    }

    if (targetStep === 1) {
      if (!form.alturaCm || !form.pesoKg || !form.pressaoSistolica || !form.pressaoDiastolica || !form.glicemiaMgDl) {
        return 'Informe os dados biometricos para seguir.';
      }
    }

    return null;
  };

  const getStepMissingFields = (targetStep: number): Array<keyof NewPatientInput> => {
    if (targetStep === 0) {
      return (['nomeCompleto', 'cpf', 'dataNascimento', 'email'] as Array<keyof NewPatientInput>).filter((field) => !String(form[field]).trim());
    }

    if (targetStep === 1) {
      return (['alturaCm', 'pesoKg', 'pressaoSistolica', 'pressaoDiastolica', 'glicemiaMgDl'] as Array<keyof NewPatientInput>).filter(
        (field) => Number(form[field]) <= 0,
      );
    }

    return [];
  };

  const isInvalidField = (field: keyof NewPatientInput) => hasTriedCurrentStep && getStepMissingFields(stepIndex).includes(field);

  const updateMaskedField = (field: 'cpf' | 'telefone', value: string) => {
    const nextValue = field === 'cpf' ? maskCpf(value) : maskPhone(value);
    setForm((current) => ({ ...current, [field]: nextValue }));
  };

  const handleStepChange = (targetStep: number) => {
    if (targetStep === stepIndex) {
      return;
    }

    if (targetStep > stepIndex) {
      for (let index = 0; index < targetStep; index += 1) {
        const validationError = validateStep(index);

        if (validationError) {
          setHasTriedCurrentStep(true);
          setStepError(validationError);
          return;
        }
      }
    }

    setHasTriedCurrentStep(false);
    setStepError(null);
    setStepIndex(targetStep);
  };

  const canNavigateToStep = (targetStep: number) => targetStep <= stepIndex + 1;

  const goNext = () => {
    const nextStep = Math.min(stepIndex + 1, wizardSteps.length - 1);
    const validationError = validateStep(stepIndex);

    if (validationError) {
      setHasTriedCurrentStep(true);
      setStepError(validationError);
      return;
    }

    setHasTriedCurrentStep(false);
    setStepError(null);
    setStepIndex(nextStep);
  };

  const goBack = () => {
    setHasTriedCurrentStep(false);
    setStepError(null);
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateStep(stepIndex);

    if (validationError) {
      setHasTriedCurrentStep(true);
      setStepError(validationError);
      return;
    }

    try {
      await createPatient({
        ...form,
        imc: imcValue,
      });

      setSuccessMessage('Paciente salvo com sucesso. Redirecionando para gerenciamento...');
      setHasTriedCurrentStep(false);
      setStepError(null);
      setTimeout(() => router.push('/pacientes/gerenciamento'), 900);
    } catch {
      setSuccessMessage(null);
    }
  };

  return (
    <div className={styles.shell}>
      <Sidebar
        role={role}
        userName={session?.name ?? 'Usuario'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && <button type="button" className={styles.backdrop} aria-label="Fechar menu" onClick={() => setIsSidebarOpen(false)} />}

      <main className={styles.main}>
        <Header userName={session?.name ?? 'Ricardo Silva'} role={role} onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogout} />

        <section className={styles.pageHeader}>
          <div className={styles.logoWrap}>
            <Image src={logo} alt="HealthTrack AI" priority />
          </div>
          <h1>Novo Paciente</h1>
          <p>Siga o assistente para gerar a analise preditiva por IA.</p>
        </section>

        <section className={styles.formCard}>
          <div className={styles.wizardRow}>
            <Wizard
              steps={wizardSteps}
              currentStepIndex={stepIndex}
              onStepChange={handleStepChange}
              canNavigateToStep={canNavigateToStep}
            />
            <span className={styles.aiBadge}>
              <Sparkles size={14} />
              AI INSIGHT ENGINE ACTIVE
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            {stepIndex === 0 && (
              <div className={styles.stepGrid}>
                <label>
                  Nome completo
                  <input
                    className={isInvalidField('nomeCompleto') ? styles.invalidInput : ''}
                    value={form.nomeCompleto}
                    onChange={(event) => setForm((current) => ({ ...current, nomeCompleto: event.target.value }))}
                    required
                  />
                </label>

                <label>
                  CPF
                  <input
                    className={isInvalidField('cpf') ? styles.invalidInput : ''}
                    value={form.cpf}
                    onChange={(event) => updateMaskedField('cpf', event.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </label>

                <label>
                  Data de nascimento
                  <input
                    className={isInvalidField('dataNascimento') ? styles.invalidInput : ''}
                    type="date"
                    value={form.dataNascimento}
                    onChange={(event) => setForm((current) => ({ ...current, dataNascimento: event.target.value }))}
                    required
                  />
                </label>

                <label>
                  Sexo
                  <select value={form.sexo} onChange={(event) => setForm((current) => ({ ...current, sexo: event.target.value as NewPatientInput['sexo'] }))}>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </label>

                <label>
                  Telefone
                  <input
                    value={form.telefone}
                    onChange={(event) => updateMaskedField('telefone', event.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </label>

                <label>
                  E-mail
                  <input
                    className={isInvalidField('email') ? styles.invalidInput : ''}
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    required
                  />
                </label>
              </div>
            )}

            {stepIndex === 1 && (
              <div className={styles.stepGrid}>
                <label>
                  Altura (cm)
                  <input
                    className={isInvalidField('alturaCm') ? styles.invalidInput : ''}
                    type="number"
                    min={80}
                    value={form.alturaCm}
                    onChange={(event) => updateNumberField('alturaCm')(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Peso (kg)
                  <input
                    className={isInvalidField('pesoKg') ? styles.invalidInput : ''}
                    type="number"
                    min={20}
                    value={form.pesoKg}
                    onChange={(event) => updateNumberField('pesoKg')(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Pressao sistolica
                  <input
                    className={isInvalidField('pressaoSistolica') ? styles.invalidInput : ''}
                    type="number"
                    min={60}
                    value={form.pressaoSistolica}
                    onChange={(event) => updateNumberField('pressaoSistolica')(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Pressao diastolica
                  <input
                    className={isInvalidField('pressaoDiastolica') ? styles.invalidInput : ''}
                    type="number"
                    min={40}
                    value={form.pressaoDiastolica}
                    onChange={(event) => updateNumberField('pressaoDiastolica')(event.target.value)}
                    required
                  />
                </label>

                <label>
                  Glicemia (mg/dL)
                  <input
                    className={isInvalidField('glicemiaMgDl') ? styles.invalidInput : ''}
                    type="number"
                    min={40}
                    value={form.glicemiaMgDl}
                    onChange={(event) => updateNumberField('glicemiaMgDl')(event.target.value)}
                    required
                  />
                </label>

                <div className={styles.metricCard}>
                  <span>IMC calculado</span>
                  <strong>{imcValue.toFixed(1)}</strong>
                </div>
              </div>
            )}

            {stepIndex === 2 && (
              <div className={styles.predictorsContent}>
                <article className={styles.cdcCard}>
                  <div className={styles.cdcIcon}>?</div>
                  <div>
                    <h3>Modulo de Preditores CDC (AI)</h3>
                    <p>Estes campos alimentam o modelo de risco cardiovascular e metabolico. A precisao dos dados impacta diretamente na acuracia da predicao.</p>
                  </div>
                </article>

                <div className={styles.toggleGrid}>
                  <Toggle
                    id="fumante"
                    label="Fumante?"
                    hint="Uso de tabaco nos ultimos 30 dias"
                    checked={form.fumante}
                    onChange={(value) => setForm((current) => ({ ...current, fumante: value }))}
                  />

                  <Toggle
                    id="atividadeFisica"
                    label="Atividade Fisica?"
                    hint="Minimo 150min por semana"
                    checked={form.atividadeFisica}
                    onChange={(value) => setForm((current) => ({ ...current, atividadeFisica: value }))}
                  />

                  <Toggle
                    id="historicoAvc"
                    label="Historico de AVC?"
                    hint="Diagnostico previo de AVC"
                    checked={form.historicoAvc}
                    onChange={(value) => setForm((current) => ({ ...current, historicoAvc: value }))}
                  />

                  <Toggle
                    id="diabetes"
                    label="Diabetes?"
                    hint="Pre-diabetes ou diabetes confirmada"
                    checked={form.diabetes}
                    onChange={(value) => setForm((current) => ({ ...current, diabetes: value }))}
                  />
                </div>

                <div className={styles.predictionInputsRow}>
                  <label>
                    Consumo de Alcool
                    <input
                      type="number"
                      min={0}
                      value={form.consumoAlcoolDoses}
                      onChange={(event) => updateNumberField('consumoAlcoolDoses')(event.target.value)}
                      placeholder="Doses por semana"
                    />
                    <small>Doses por semana</small>
                  </label>

                  <label>
                    Estado Geral de Saude
                    <select
                      value={form.estadoGeralSaude}
                      onChange={(event) => setForm((current) => ({ ...current, estadoGeralSaude: event.target.value as HealthOverallStatus }))}
                    >
                      <option value="MUITO_BOM">Muito bom</option>
                      <option value="BOM">Bom</option>
                      <option value="ATENCAO">Atencao</option>
                      <option value="CRITICO">Critico</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {stepError && <p className={styles.feedbackError}>{stepError}</p>}
            {error && <p className={styles.feedbackError}>{error}</p>}
            {successMessage && (
              <p className={styles.feedbackSuccess}>
                <CircleCheck size={16} />
                {successMessage}
              </p>
            )}

            <footer className={styles.actionsRow}>
              <button type="button" onClick={goBack} disabled={stepIndex === 0 || isSaving}>
                Voltar
              </button>

              <div className={styles.actionRight}>
                {stepIndex < wizardSteps.length - 1 && (
                  <button type="button" onClick={goNext}>
                    Proximo
                  </button>
                )}

                {stepIndex === wizardSteps.length - 1 && (
                  <button type="submit" className={styles.saveButton} disabled={isSaving}>
                    {isSaving ? 'Salvando...' : 'Salvar'}
                    <Rocket size={16} />
                  </button>
                )}
              </div>
            </footer>
          </form>
        </section>

     
      </main>
    </div>
  );
}
