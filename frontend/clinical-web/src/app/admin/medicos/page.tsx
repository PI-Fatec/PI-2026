'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, ShieldAlert, Stethoscope, Trash2 } from 'lucide-react';
import { Header } from '@/components/Layout/Header/Header';
import { Sidebar } from '@/components/Layout/Sidebar/Sidebar';
import { AlertDialog } from '@/components/ui/AlertDialog/AlertDialog';
import { Modal } from '@/components/ui/Modal/Modal';
import Skeleton from '@/components/ui/Skeleton/Skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useDoctors } from '@/hooks/useDoctors';
import { Doctor, NewDoctorInput } from '@/types/doctor';
import { maskPhone, normalizeCrm } from '@/utils/masks';
import styles from './medicos.module.scss';

const initialDoctorForm: NewDoctorInput = {
  nome: '',
  email: '',
  telefone: '',
  crm: '',
  especialidade: '',
  clinica: '',
  status: 'ATIVO',
};

const skeletonRows = Array.from({ length: 6 }, (_, index) => `doctor-skeleton-${index}`);

export default function AdminMedicosPage() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const {
    doctors,
    filters,
    summary,
    isLoading,
    isSaving,
    error,
    createDoctor,
    updateDoctor,
    removeDoctor,
    setFilters,
    resetFilters,
  } = useDoctors();

  const [doctorForm, setDoctorForm] = useState<NewDoctorInput>(initialDoctorForm);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Doctor | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  const role = session?.role ?? 'DOCTOR';

  const clinicOptions = useMemo(
    () => Array.from(new Set(doctors.map((doctor) => doctor.clinica))).sort((a, b) => a.localeCompare(b)),
    [doctors],
  );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const clearForm = () => {
    setDoctorForm(initialDoctorForm);
    setEditingDoctor(null);
    setHasTriedSubmit(false);
    setFeedback(null);
  };

  const closeDoctorModal = () => {
    setIsDoctorModalOpen(false);
    clearForm();
  };

  const openCreateModal = () => {
    clearForm();
    setIsDoctorModalOpen(true);
  };

  const isRequiredDoctorFieldInvalid = (field: 'nome' | 'email' | 'crm' | 'especialidade' | 'clinica') =>
    hasTriedSubmit && !doctorForm[field].trim();

  const validateDoctorForm = () => {
    if (!doctorForm.nome || !doctorForm.email || !doctorForm.crm || !doctorForm.especialidade || !doctorForm.clinica) {
      return 'Preencha nome, e-mail, CRM, especialidade e clinica.';
    }

    return null;
  };

  const handleCreateOrUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);
    setHasTriedSubmit(true);

    const validation = validateDoctorForm();

    if (validation) {
      setFeedback(validation);
      return;
    }

    try {
      if (editingDoctor) {
        await updateDoctor(editingDoctor.id, doctorForm);
        setFeedback('Medico atualizado com sucesso.');
      } else {
        await createDoctor(doctorForm);
        setFeedback('Convite enviado ao medico com sucesso.');
      }

      closeDoctorModal();
    } catch {
      setFeedback(null);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorForm({
      nome: doctor.nome,
      email: doctor.email,
      telefone: doctor.telefone,
      crm: doctor.crm,
      especialidade: doctor.especialidade,
      clinica: doctor.clinica,
      status: doctor.status,
    });
    setFeedback(null);
    setHasTriedSubmit(false);
    setIsDoctorModalOpen(true);
  };

  const handleRemove = async () => {
    if (!pendingDelete) {
      return;
    }

    await removeDoctor(pendingDelete.id);

    if (editingDoctor?.id === pendingDelete.id) {
      clearForm();
    }

    setPendingDelete(null);
  };

  if (role !== 'ADMIN') {
    return (
      <div className={styles.forbiddenShell}>
        <article className={styles.forbiddenCard}>
          <ShieldAlert size={26} />
          <h1>Acesso restrito</h1>
          <p>Somente administradores podem controlar o cadastro de medicos.</p>
          <button type="button" onClick={() => router.push('/')}>Voltar para dashboard</button>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <Sidebar
        role={role}
        userName={session?.name ?? 'Administrador'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && <button type="button" className={styles.backdrop} aria-label="Fechar menu" onClick={() => setIsSidebarOpen(false)} />}

      <main className={styles.main}>
        <Header userName={session?.name ?? 'Administrador'} role={role} onMenuClick={() => setIsSidebarOpen(true)} onLogout={handleLogout} />

        <section className={styles.pageHeader}>
          <h1>Controle Administrativo de Medicos</h1>
          <p>Cadastre novos profissionais, edite dados e mantenha o quadro clinico atualizado.</p>
        </section>

        <section className={styles.metrics}>
          <article>
            <span>Total de medicos</span>
            <strong>{isLoading ? <Skeleton width={70} height={28} /> : summary.total}</strong>
          </article>
          <article>
            <span>Ativos</span>
            <strong>{isLoading ? <Skeleton width={70} height={28} /> : summary.ativos}</strong>
          </article>
          <article>
            <span>Clinicas atendidas</span>
            <strong>{isLoading ? <Skeleton width={70} height={28} /> : summary.clinicas}</strong>
          </article>
        </section>

        <section className={styles.contentGrid}>
          <article className={styles.tableCard}>
            <div className={styles.filtersRow}>
              <label>
                Busca
                <input
                  value={filters.busca ?? ''}
                  onChange={(event) => setFilters({ busca: event.target.value })}
                  placeholder="Nome, CRM ou e-mail"
                />
              </label>

              <label>
                Status
                <select
                  value={filters.status ?? 'TODOS'}
                  onChange={(event) => setFilters({ status: event.target.value as typeof filters.status })}
                >
                  <option value="TODOS">Todos</option>
                  <option value="ATIVO">Ativos</option>
                  <option value="INATIVO">Inativos</option>
                </select>
              </label>

              <label>
                Clinica
                <select
                  value={filters.clinica ?? ''}
                  onChange={(event) => setFilters({ clinica: event.target.value })}
                >
                  <option value="">Todas</option>
                  {clinicOptions.map((clinic) => (
                    <option key={clinic} value={clinic}>{clinic}</option>
                  ))}
                </select>
              </label>

              <button type="button" className={styles.primaryButton} onClick={openCreateModal}>
                <Stethoscope size={16} />
                Cadastrar medico
              </button>

              <button type="button" className={styles.ghostButton} onClick={resetFilters}>Limpar</button>
            </div>

            {isLoading ? (
              <div className={styles.tableWrapper}>
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>CRM</th>
                      <th>Especialidade</th>
                      <th>Clinica</th>
                      <th>Status</th>
                      <th>Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skeletonRows.map((rowId) => (
                      <tr key={rowId}>
                        <td>
                          <div className={styles.skeletonNameCell}>
                            <Skeleton width="72%" height={14} />
                            <Skeleton width="58%" height={12} />
                          </div>
                        </td>
                        <td><Skeleton width={88} height={14} /></td>
                        <td><Skeleton width={120} height={14} /></td>
                        <td><Skeleton width={120} height={14} /></td>
                        <td><Skeleton width={62} height={22} /></td>
                        <td>
                          <div className={styles.skeletonActions}>
                            <Skeleton type="circle" width={24} height={24} />
                            <Skeleton type="circle" width={24} height={24} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : doctors.length === 0 ? (
              <p className={styles.stateText}>Nenhum medico encontrado para os filtros aplicados.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>CRM</th>
                      <th>Especialidade</th>
                      <th>Clinica</th>
                      <th>Status</th>
                      <th>Acoes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor) => (
                      <tr key={doctor.id}>
                        <td>
                          <div className={styles.nameCell}>
                            <strong>{doctor.nome}</strong>
                            <span>{doctor.email}</span>
                          </div>
                        </td>
                        <td>{doctor.crm}</td>
                        <td>{doctor.especialidade}</td>
                        <td>{doctor.clinica}</td>
                        <td>
                          <span className={`${styles.statusTag} ${doctor.status === 'ATIVO' ? styles.statusActive : styles.statusInactive}`}>
                            {doctor.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.rowActions}>
                            <button type="button" onClick={() => handleEdit(doctor)} aria-label="Editar medico">
                              <Edit3 size={15} />
                            </button>
                            <button type="button" onClick={() => setPendingDelete(doctor)} aria-label="Excluir medico">
                              <Trash2 size={15} />
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
          </article>
        </section>
      </main>

      <Modal
        isOpen={isDoctorModalOpen}
        title={editingDoctor ? 'Editar Medico' : 'Cadastrar Novo Medico'}
        onClose={closeDoctorModal}
      >
        <form onSubmit={handleCreateOrUpdate}>
          <div className={styles.formGrid}>
            <label>
              Nome completo
              <input
                className={isRequiredDoctorFieldInvalid('nome') ? styles.invalidInput : ''}
                value={doctorForm.nome}
                onChange={(event) => setDoctorForm((current) => ({ ...current, nome: event.target.value }))}
                required
              />
            </label>

            <label>
              E-mail
              <input
                className={isRequiredDoctorFieldInvalid('email') ? styles.invalidInput : ''}
                type="email"
                value={doctorForm.email}
                onChange={(event) => setDoctorForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </label>

            <label>
              Telefone
              <input
                value={doctorForm.telefone}
                onChange={(event) => setDoctorForm((current) => ({ ...current, telefone: maskPhone(event.target.value) }))}
                placeholder="(00) 00000-0000"
              />
            </label>

            <label>
              CRM
              <input
                className={isRequiredDoctorFieldInvalid('crm') ? styles.invalidInput : ''}
                value={doctorForm.crm}
                onChange={(event) => setDoctorForm((current) => ({ ...current, crm: normalizeCrm(event.target.value) }))}
                placeholder="CRM12345"
                required
              />
            </label>

            <label>
              Especialidade
              <input
                className={isRequiredDoctorFieldInvalid('especialidade') ? styles.invalidInput : ''}
                value={doctorForm.especialidade}
                onChange={(event) => setDoctorForm((current) => ({ ...current, especialidade: event.target.value }))}
                required
              />
            </label>

            <label>
              Clinica
              <input
                className={isRequiredDoctorFieldInvalid('clinica') ? styles.invalidInput : ''}
                value={doctorForm.clinica}
                onChange={(event) => setDoctorForm((current) => ({ ...current, clinica: event.target.value }))}
                required
              />
            </label>

            <label>
              Status
              <select
                value={doctorForm.status}
                onChange={(event) => setDoctorForm((current) => ({ ...current, status: event.target.value as NewDoctorInput['status'] }))}
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </label>
          </div>

          {feedback && <p className={styles.feedback}>{feedback}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.formActions}>
            <button type="button" className={styles.ghostButton} onClick={closeDoctorModal}>
              Cancelar
            </button>
            <button type="submit" className={styles.primaryButton} disabled={isSaving}>
              <Stethoscope size={16} />
              {isSaving ? 'Salvando...' : editingDoctor ? 'Salvar alteracoes' : 'Cadastrar medico'}
            </button>
          </div>
        </form>
      </Modal>

      <AlertDialog
        isOpen={Boolean(pendingDelete)}
        title="Excluir medico"
        description={`Voce esta prestes a excluir ${pendingDelete?.nome ?? ''}. Esta acao nao pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        isLoading={isSaving}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleRemove}
      />
    </div>
  );
}
