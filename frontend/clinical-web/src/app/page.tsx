'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Layout/Sidebar/Sidebar';
import { Header } from '@/components/Layout/Header/Header';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { usePatients } from '@/hooks/usePatients';
import styles from './home.module.scss';

const riskLabel = {
  ALTO: 'Risco Alto',
  MEDIO: 'Risco Medio',
  BAIXO: 'Risco Baixo',
} as const;

const riskClassByLevel = {
  ALTO: styles.riskHigh,
  MEDIO: styles.riskMedium,
  BAIXO: styles.riskLow,
} as const;

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '--';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Data indisponivel';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Home() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const { patients, summary, isLoading, error } = usePatients();
  const [visiblePatients, setVisiblePatients] = useState(5);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = session?.role ?? 'DOCTOR';

  const displayedPatients = useMemo(
    () => patients.slice(0, visiblePatients),
    [patients, visiblePatients],
  );
  const hasMorePatients = visiblePatients < patients.length;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleLoadMorePatients = () => {
    setVisiblePatients((current) => Math.min(current + 5, patients.length));
  };

  const handleGoToPatientRegistration = () => {
    router.push('/pacientes/cadastro');
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
        <Header
          userName={session?.name ?? 'Usuario'}
          role={role}
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <div className={styles.contentArea}>
          <section className={styles.metricsGrid}>
            <article className={styles.card}>
              <h3>Total de Pacientes</h3>
              <strong>{isLoading ? <Spinner size="md" className={styles.metricSpinner} /> : summary.total}</strong>
              <p>{isLoading ? 'Carregando dados...' : 'Base atualizada pela API'}</p>
            </article>

            <article className={styles.card}>
              <h3>Pacientes Ativos</h3>
              <strong>{isLoading ? <Spinner size="md" className={styles.metricSpinner} /> : summary.ativos}</strong>
              <p>{isLoading ? 'Carregando dados...' : 'Status ativo no cadastro'}</p>
            </article>

            <article className={`${styles.card} ${styles.warnCard}`}>
              <h3>Alertas de Risco Alto</h3>
              <strong>{isLoading ? <Spinner size="md" className={styles.metricSpinner} /> : summary.altoRisco}</strong>
              <p>{isLoading ? 'Carregando dados...' : 'Pacientes com risco ALTO'}</p>
            </article>

            <article className={`${styles.card} ${styles.aiCard}`}>
              <h3>AI System Status</h3>
              <strong>Indisponivel</strong>
              <p>Sem endpoint dedicado no momento</p>
            </article>
          </section>

          <section className={styles.contentGrid}>
            <article className={styles.panel}>
              <header className={styles.patientsHeader}>
                <h2>Pacientes Recentes</h2>
                <button type="button" onClick={handleGoToPatientRegistration}>Adicionar Paciente</button>
              </header>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>Ultima Atualizacao</th>
                    <th>Risco AI</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className={styles.tableState}>
                        <span className={styles.loadingInline}>
                          <Spinner size="sm" />
                          Carregando pacientes...
                        </span>
                      </td>
                    </tr>
                  ) : displayedPatients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.tableState}>Nenhum paciente disponivel.</td>
                    </tr>
                  ) : (
                    displayedPatients.map((patient) => (
                      <tr key={patient.id}>
                        <td>
                          <div className={styles.nameCell}>
                            <span>{getInitials(patient.nomeCompleto)}</span>
                            <strong>{patient.nomeCompleto}</strong>
                          </div>
                        </td>
                        <td>{patient.cpf}</td>
                        <td>{formatUpdatedAt(patient.atualizadoEm)}</td>
                        <td>
                          <span className={`${styles.riskTag} ${riskClassByLevel[patient.risco]}`}>
                            {riskLabel[patient.risco]}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className={styles.patientsFooter}>
                {hasMorePatients && (
                  <button
                    type="button"
                    className={styles.loadMoreButton}
                    onClick={handleLoadMorePatients}
                  >
                    Carregar mais pacientes
                  </button>
                )}
                {error && <p className={styles.errorText}>{error}</p>}
              </div>
            </article>

            <aside className={`${styles.panel} ${styles.sidePanel}`}>
              <h3>AI Predicted Risk</h3>
              <p className={styles.placeholderText}>Dados indisponiveis no momento.</p>

              <div className={styles.placeholderBox}>
                O painel de distribuicao de risco sera exibido aqui quando o endpoint de analytics estiver disponivel.
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
