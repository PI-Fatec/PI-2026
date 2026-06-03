'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Layout/Sidebar/Sidebar';
import { Header } from '@/components/Layout/Header/Header';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { usePatients } from '@/hooks/usePatients';
import { useSidebarState } from '@/hooks/useSidebarState';
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

function getPercent(count: number, total: number) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

export default function Home() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const { patients, summary, isLoading, error } = usePatients();
  const [visiblePatients, setVisiblePatients] = useState(5);
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useSidebarState({ defaultOpen: false });

  const role = session?.role ?? 'DOCTOR';

  const displayedPatients = useMemo(
    () => patients.slice(0, visiblePatients),
    [patients, visiblePatients],
  );
  const hasMorePatients = visiblePatients < patients.length;
  const riskStats = useMemo(() => {
    const total = patients.length;
    const counts = {
      ALTO: patients.filter((patient) => patient.risco === 'ALTO').length,
      MEDIO: patients.filter((patient) => patient.risco === 'MEDIO').length,
      BAIXO: patients.filter((patient) => patient.risco === 'BAIXO').length,
    };
    const percentages = {
      ALTO: getPercent(counts.ALTO, total),
      MEDIO: getPercent(counts.MEDIO, total),
      BAIXO: getPercent(counts.BAIXO, total),
    };
    const averageProbability = total
      ? Math.round((patients.reduce((sum, patient) => sum + patient.probabilidadeRisco, 0) / total) * 100)
      : 0;
    const highestRiskPatient = patients.reduce<(typeof patients)[number] | null>((highest, patient) => {
      if (!highest || patient.probabilidadeRisco > highest.probabilidadeRisco) {
        return patient;
      }

      return highest;
    }, null);
    const lowEnd = percentages.BAIXO;
    const mediumEnd = percentages.BAIXO + percentages.MEDIO;

    return {
      total,
      counts,
      percentages,
      averageProbability,
      highestRiskPatient,
      ringBackground: total
        ? `conic-gradient(#8ace57 0 ${lowEnd}%, #f6a44d ${lowEnd}% ${mediumEnd}%, #ea6262 ${mediumEnd}% 100%)`
        : 'conic-gradient(#dbe4f1 0 100%)',
    };
  }, [patients]);

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
        onClose={closeSidebar}
      />

      {isSidebarOpen && <button type="button" className={styles.backdrop} aria-label="Fechar menu" onClick={closeSidebar} />}

      <main className={styles.main}>
        <Header
          userName={session?.name ?? 'Usuario'}
          role={role}
          isSidebarOpen={isSidebarOpen}
          onMenuClick={toggleSidebar}
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
              <h3>AI Predicted Risk</h3>
              <strong>
                {isLoading ? <Spinner size="md" className={styles.metricSpinner} /> : `${riskStats.averageProbability}%`}
              </strong>
              <p>{isLoading ? 'Carregando dados...' : 'Media de probabilidade na base'}</p>
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
              {isLoading ? (
                <span className={styles.loadingInline}>
                  <Spinner size="sm" />
                  Carregando distribuicao...
                </span>
              ) : riskStats.total === 0 ? (
                <p className={styles.placeholderText}>Nenhum paciente disponivel.</p>
              ) : (
                <>
                  <div className={styles.ring} style={{ background: riskStats.ringBackground }}>
                    <div>{riskStats.averageProbability}%</div>
                  </div>

                  <div className={styles.legendRow}>
                    <span><i style={{ background: '#ea6262' }} /> Alto</span>
                    <strong>{riskStats.counts.ALTO} ({riskStats.percentages.ALTO}%)</strong>
                  </div>
                  <div className={styles.legendRow}>
                    <span><i style={{ background: '#f6a44d' }} /> Medio</span>
                    <strong>{riskStats.counts.MEDIO} ({riskStats.percentages.MEDIO}%)</strong>
                  </div>
                  <div className={styles.legendRow}>
                    <span><i style={{ background: '#8ace57' }} /> Baixo</span>
                    <strong>{riskStats.counts.BAIXO} ({riskStats.percentages.BAIXO}%)</strong>
                  </div>

                  <div className={styles.insight}>
                    Pacientes com risco alto
                    <strong>{riskStats.counts.ALTO}</strong>
                    {riskStats.highestRiskPatient && (
                      <span>
                        Maior probabilidade: {riskStats.highestRiskPatient.nomeCompleto} (
                        {Math.round(riskStats.highestRiskPatient.probabilidadeRisco * 100)}%).
                      </span>
                    )}
                  </div>
                </>
              )}
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
