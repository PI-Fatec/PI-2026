'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, Eye, Trash2 } from 'lucide-react';
import { Header } from '@/components/Layout/Header/Header';
import { Sidebar } from '@/components/Layout/Sidebar/Sidebar';
import { AlertDialog } from '@/components/ui/AlertDialog/AlertDialog';
import { SideSheet } from '@/components/ui/SideSheet/SideSheet';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { usePatients } from '@/hooks/usePatients';
import { HealthOverallStatus, Patient } from '@/types/patient';
import { maskPhone } from '@/utils/masks';
import styles from './gerenciamento.module.scss';

const riskClass: Record<Patient['risco'], string> = {
  ALTO: styles.riskHigh,
  MEDIO: styles.riskMedium,
  BAIXO: styles.riskLow,
};

const skeletonRows = Array.from({ length: 6 }, (_, index) => `skeleton-row-${index}`);

const calculateImc = (alturaCm: number, pesoKg: number) => {
  if (!alturaCm || !pesoKg) {
    return 0;
  }

  const alturaM = alturaCm / 100;
  return Number((pesoKg / (alturaM * alturaM)).toFixed(1));
};

export default function GerenciamentoPacientesPage() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const {
    patients,
    filters,
    summary,
    isLoading,
    isSaving,
    error,
    setFilters,
    resetFilters,
    updatePatient,
    removePatient,
  } = usePatients();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'details' | 'edit' | null>(null);
  const [sheetPatient, setSheetPatient] = useState<Patient | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Patient | null>(null);
  const [hasTriedEditSubmit, setHasTriedEditSubmit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const role = session?.role ?? 'DOCTOR';

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const closeSheet = () => {
    setSheetMode(null);
    setSheetPatient(null);
    setHasTriedEditSubmit(false);
    setEditError(null);
  };

  const openDetails = (patient: Patient) => {
    setSheetPatient(patient);
    setSheetMode('details');
  };

  const openEdit = (patient: Patient) => {
    setSheetPatient({ ...patient });
    setSheetMode('edit');
    setHasTriedEditSubmit(false);
    setEditError(null);
  };

  const isEditFieldInvalid = (field: 'nomeCompleto' | 'email') =>
    hasTriedEditSubmit && !String(sheetPatient?.[field] ?? '').trim();

  const handleDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    await removePatient(pendingDelete.id);

    if (sheetPatient?.id === pendingDelete.id) {
      closeSheet();
    }

    setPendingDelete(null);
  };

  const handleSaveEdit = async () => {
    if (!sheetPatient) {
      return;
    }

    setHasTriedEditSubmit(true);

    if (!sheetPatient.nomeCompleto.trim() || !sheetPatient.email.trim()) {
      setEditError('Preencha nome e e-mail para salvar a edicao.');
      return;
    }

    setEditError(null);

    await updatePatient(sheetPatient.id, {
      nomeCompleto: sheetPatient.nomeCompleto,
      telefone: sheetPatient.telefone,
      email: sheetPatient.email,
      status: sheetPatient.status,
      consumoAlcoolDoses: sheetPatient.consumoAlcoolDoses,
      estadoGeralSaude: sheetPatient.estadoGeralSaude,
      fumante: sheetPatient.fumante,
      atividadeFisica: sheetPatient.atividadeFisica,
      historicoAvc: sheetPatient.historicoAvc,
      diabetes: sheetPatient.diabetes,
      glicemiaMgDl: sheetPatient.glicemiaMgDl,
      pressaoSistolica: sheetPatient.pressaoSistolica,
      pressaoDiastolica: sheetPatient.pressaoDiastolica,
      alturaCm: sheetPatient.alturaCm,
      pesoKg: sheetPatient.pesoKg,
      imc: sheetPatient.imc,
    });

    closeSheet();
  };

  const updateEditField = <K extends keyof Patient>(field: K, value: Patient[K]) => {
    setSheetPatient((current) => {
      if (!current) {
        return current;
      }

      const next = {
        ...current,
        [field]: value,
      };

      if (field === 'alturaCm' || field === 'pesoKg') {
        next.imc = calculateImc(next.alturaCm, next.pesoKg);
      }

      return next;
    });
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
          <div>
            <h1>Gerenciamento de Pacientes</h1>
            <p>Busque, filtre e gerencie o historico clinico com suporte preditivo.</p>
          </div>
          <button type="button" onClick={() => router.push('/pacientes/cadastro')}>Novo Paciente</button>
        </section>

        <section className={styles.metrics}>
          <article>
            <span>Total listados</span>
            <strong>{isLoading ? <Skeleton width={70} height={28} /> : summary.total}</strong>
          </article>
          <article>
            <span>Pacientes ativos</span>
            <strong>{isLoading ? <Skeleton width={70} height={28} /> : summary.ativos}</strong>
          </article>
          <article>
            <span>Alto risco</span>
            <strong>{isLoading ? <Skeleton width={70} height={28} /> : summary.altoRisco}</strong>
          </article>
        </section>

        <section className={styles.filtersCard}>
          <label>
            Busca
            <input
              value={filters.busca ?? ''}
              onChange={(event) => setFilters({ busca: event.target.value })}
              placeholder="Nome, CPF ou e-mail"
            />
          </label>

          <label>
            Risco
            <select value={filters.risco ?? 'TODOS'} onChange={(event) => setFilters({ risco: event.target.value as typeof filters.risco })}>
              <option value="TODOS">Todos</option>
              <option value="ALTO">Alto</option>
              <option value="MEDIO">Medio</option>
              <option value="BAIXO">Baixo</option>
            </select>
          </label>

          <label>
            Status
            <select value={filters.status ?? 'TODOS'} onChange={(event) => setFilters({ status: event.target.value as typeof filters.status })}>
              <option value="TODOS">Todos</option>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </label>

          <label>
            Data inicio
            <input type="date" value={filters.dataInicio ?? ''} onChange={(event) => setFilters({ dataInicio: event.target.value })} />
          </label>

          <label>
            Data fim
            <input type="date" value={filters.dataFim ?? ''} onChange={(event) => setFilters({ dataFim: event.target.value })} />
          </label>

          <button type="button" className={styles.clearButton} onClick={resetFilters}>
            Limpar filtros
          </button>
        </section>

        <section className={styles.tableCard}>
          {isLoading ? (
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Risco</th>
                    <th>Status</th>
                    <th>Atualizado em</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {skeletonRows.map((rowId) => (
                    <tr key={rowId}>
                      <td>
                        <div className={styles.skeletonNameCell}>
                          <Skeleton width="75%" height={14} />
                        </div>
                      </td>
                      <td><Skeleton width={110} height={14} /></td>
                      <td><Skeleton width={62} height={22} /></td>
                      <td><Skeleton width={62} height={22} /></td>
                      <td><Skeleton width={90} height={14} /></td>
                      <td>
                        <div className={styles.skeletonActions}>
                          <Skeleton type="circle" width={24} height={24} />
                          <Skeleton type="circle" width={24} height={24} />
                          <Skeleton type="circle" width={24} height={24} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : patients.length === 0 ? (
            <p className={styles.loading}>Nenhum paciente encontrado para os filtros selecionados.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Risco</th>
                    <th>Status</th>
                    <th>Atualizado em</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.nomeCompleto}</td>
                      <td>{patient.cpf}</td>
                      <td>
                        <span className={`${styles.riskTag} ${riskClass[patient.risco]}`}>{patient.risco}</span>
                      </td>
                      <td>{patient.status}</td>
                      <td>{new Date(patient.atualizadoEm).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <div className={styles.actions}>
                          <button type="button" onClick={() => openDetails(patient)} aria-label="Detalhes">
                            <Eye size={16} />
                          </button>
                          <button type="button" onClick={() => openEdit(patient)} aria-label="Editar">
                            <Edit3 size={16} />
                          </button>
                          <button type="button" onClick={() => setPendingDelete(patient)} aria-label="Excluir">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}
        </section>
      </main>

      <SideSheet
        isOpen={Boolean(sheetMode && sheetPatient)}
        title={sheetMode === 'edit' ? 'Edicao Rapida' : 'Detalhes do Paciente'}
        subtitle={sheetPatient?.nomeCompleto}
        onClose={closeSheet}
      >
        {sheetMode === 'details' && sheetPatient && (
          <div className={styles.sheetDetails}>
            <p><strong>CPF:</strong> {sheetPatient.cpf}</p>
            <p><strong>Idade:</strong> {Math.max(0, new Date().getFullYear() - new Date(sheetPatient.dataNascimento).getFullYear())} anos</p>
            <p><strong>Risco:</strong> {sheetPatient.risco} ({Math.round(sheetPatient.probabilidadeRisco * 100)}%)</p>
            <p><strong>Biometria:</strong> IMC {sheetPatient.imc} | PA {sheetPatient.pressaoSistolica}/{sheetPatient.pressaoDiastolica}</p>
            <p><strong>Preditores:</strong> Fumante {sheetPatient.fumante ? 'Sim' : 'Nao'} | Diabetes {sheetPatient.diabetes ? 'Sim' : 'Nao'}</p>
            <p><strong>Estado geral:</strong> {sheetPatient.estadoGeralSaude}</p>
          </div>
        )}

        {sheetMode === 'edit' && sheetPatient && (
          <div className={styles.sheetEditGrid}>
            <label>
              Nome
              <input
                className={isEditFieldInvalid('nomeCompleto') ? styles.invalidInput : ''}
                value={sheetPatient.nomeCompleto}
                onChange={(event) => updateEditField('nomeCompleto', event.target.value)}
                required
              />
            </label>

            <label>
              Telefone
              <input
                value={sheetPatient.telefone}
                onChange={(event) => updateEditField('telefone', maskPhone(event.target.value))}
              />
            </label>

            <label>
              E-mail
              <input
                className={isEditFieldInvalid('email') ? styles.invalidInput : ''}
                value={sheetPatient.email}
                onChange={(event) => updateEditField('email', event.target.value)}
                required
              />
            </label>

            <label>
              Status
              <select
                value={sheetPatient.status}
                onChange={(event) => updateEditField('status', event.target.value as Patient['status'])}
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </label>

            <label>
              Altura (cm)
              <input
                type="number"
                min={80}
                value={sheetPatient.alturaCm}
                onChange={(event) => updateEditField('alturaCm', Number(event.target.value))}
              />
            </label>

            <label>
              Peso (kg)
              <input
                type="number"
                min={20}
                value={sheetPatient.pesoKg}
                onChange={(event) => updateEditField('pesoKg', Number(event.target.value))}
              />
            </label>

            <label>
              IMC (auto)
              <input value={sheetPatient.imc.toFixed(1)} readOnly />
            </label>

            <label>
              Consumo alcool (doses)
              <input
                type="number"
                min={0}
                value={sheetPatient.consumoAlcoolDoses}
                onChange={(event) => updateEditField('consumoAlcoolDoses', Number(event.target.value))}
              />
            </label>

            <label>
              Estado geral
              <select
                value={sheetPatient.estadoGeralSaude}
                onChange={(event) => updateEditField('estadoGeralSaude', event.target.value as HealthOverallStatus)}
              >
                <option value="MUITO_BOM">Muito bom</option>
                <option value="BOM">Bom</option>
                <option value="ATENCAO">Atencao</option>
                <option value="CRITICO">Critico</option>
              </select>
            </label>

            <label>
              Fumante
              <select
                value={sheetPatient.fumante ? 'SIM' : 'NAO'}
                onChange={(event) => updateEditField('fumante', event.target.value === 'SIM')}
              >
                <option value="SIM">Sim</option>
                <option value="NAO">Nao</option>
              </select>
            </label>

            <label>
              Atividade fisica
              <select
                value={sheetPatient.atividadeFisica ? 'SIM' : 'NAO'}
                onChange={(event) => updateEditField('atividadeFisica', event.target.value === 'SIM')}
              >
                <option value="SIM">Sim</option>
                <option value="NAO">Nao</option>
              </select>
            </label>

            <label>
              Historico de AVC
              <select
                value={sheetPatient.historicoAvc ? 'SIM' : 'NAO'}
                onChange={(event) => updateEditField('historicoAvc', event.target.value === 'SIM')}
              >
                <option value="SIM">Sim</option>
                <option value="NAO">Nao</option>
              </select>
            </label>

            <label>
              Diabetes
              <select
                value={sheetPatient.diabetes ? 'SIM' : 'NAO'}
                onChange={(event) => updateEditField('diabetes', event.target.value === 'SIM')}
              >
                <option value="SIM">Sim</option>
                <option value="NAO">Nao</option>
              </select>
            </label>

            <div className={styles.sheetActions}>
              {editError && <p className={styles.editFeedbackError}>{editError}</p>}
              <button type="button" onClick={closeSheet}>Cancelar</button>
              <button type="button" className={styles.saveEditButton} onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
              </button>
            </div>
          </div>
        )}
      </SideSheet>

      <AlertDialog
        isOpen={Boolean(pendingDelete)}
        title="Excluir paciente"
        description={`Voce esta prestes a excluir o paciente ${pendingDelete?.nomeCompleto ?? ''}. Esta acao nao pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isSaving}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
