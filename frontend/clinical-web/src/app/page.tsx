

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Layout/Sidebar/Sidebar';
import { Header } from '@/components/Layout/Header/Header';
import { useAuth } from '@/hooks/useAuth';
import styles from './home.module.scss';

const recentPatients = [
  { id: '1', initials: 'AM', name: 'Ana Maria Silveira', cpf: '123.***.***-45', updatedAt: 'Hoje, 10:24', risk: 'high' as const },
  { id: '2', initials: 'JP', name: 'Joao Pedro Santos', cpf: '987.***.***-10', updatedAt: 'Ontem, 16:45', risk: 'low' as const },
  { id: '3', initials: 'CL', name: 'Carla Lemos', cpf: '554.***.***-91', updatedAt: '24 Out, 11:20', risk: 'medium' as const },
  { id: '4', initials: 'RB', name: 'Roberto Barbosa', cpf: '332.***.***-08', updatedAt: '23 Out, 09:15', risk: 'low' as const },
  { id: '5', initials: 'ML', name: 'Marcos Lima', cpf: '882.***.***-73', updatedAt: '22 Out, 08:12', risk: 'high' as const },
  { id: '6', initials: 'TS', name: 'Tania Souza', cpf: '444.***.***-15', updatedAt: '21 Out, 14:05', risk: 'medium' as const },
  { id: '7', initials: 'EC', name: 'Eduardo Costa', cpf: '215.***.***-62', updatedAt: '20 Out, 17:32', risk: 'low' as const },
  { id: '8', initials: 'FN', name: 'Fernanda Nunes', cpf: '119.***.***-24', updatedAt: '19 Out, 09:41', risk: 'medium' as const },
  { id: '9', initials: 'AV', name: 'Alberto Vieira', cpf: '761.***.***-88', updatedAt: '18 Out, 10:18', risk: 'high' as const },
  { id: '10', initials: 'PR', name: 'Paula Rocha', cpf: '935.***.***-44', updatedAt: '17 Out, 13:57', risk: 'low' as const },
];

const riskLabel = {
  high: 'High Risk',
  medium: 'Medium Risk',
  low: 'Low Risk',
} as const;

const riskClassByLevel = {
  high: styles.riskHigh,
  medium: styles.riskMedium,
  low: styles.riskLow,
} as const;

export default function Home() {
  const router = useRouter();
  const { session, logout } = useAuth();
  const [visiblePatients, setVisiblePatients] = useState(4);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const role = session?.role ?? 'DOCTOR';
  const displayedPatients = recentPatients.slice(0, visiblePatients);
  const hasMorePatients = visiblePatients < recentPatients.length;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleLoadMorePatients = () => {
    setVisiblePatients((current) => Math.min(current + 4, recentPatients.length));
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
          userName={session?.name ?? 'Ricardo Silva'}
          role={role}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <div className={styles.contentArea}>
          <section className={styles.metricsGrid}>
            <article className={styles.card}>
              <h3>Total de Pacientes</h3>
              <strong>1,284</strong>
              <p>+12% este mes</p>
            </article>

            <article className={styles.card}>
              <h3>Consultas Hoje</h3>
              <strong>18</strong>
              <p>4 pendentes de triagem</p>
            </article>

            <article className={`${styles.card} ${styles.warnCard}`}>
              <h3>Alertas de Risco Alto</h3>
              <strong>07</strong>
              <p>Acao imediata recomendada</p>
            </article>

            <article className={`${styles.card} ${styles.aiCard}`}>
              <h3>AI System Status</h3>
              <small>Active</small>
              <strong>99.4%</strong>
              <p>Predicao otimizada</p>
            </article>
          </section>

          <section className={styles.contentGrid}>
            <article className={styles.panel}>
              <header className={styles.patientsHeader}>
                <h2>Pacientes Recentes</h2>
                <button type="button">Adicionar Paciente</button>
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
                  {displayedPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className={styles.nameCell}>
                          <span>{patient.initials}</span>
                          <strong>{patient.name}</strong>
                        </div>
                      </td>
                      <td>{patient.cpf}</td>
                      <td>{patient.updatedAt}</td>
                      <td>
                        <span className={`${styles.riskTag} ${riskClassByLevel[patient.risk]}`}>
                          {riskLabel[patient.risk]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className={styles.patientsFooter}>
                <button
                  type="button"
                  className={styles.loadMoreButton}
                  onClick={handleLoadMorePatients}
                  disabled={!hasMorePatients}
                >
                  {hasMorePatients ? 'Carregar mais pacientes' : 'Todos os pacientes carregados'}
                </button>
              </div>
            </article>

            <aside className={`${styles.panel} ${styles.sidePanel}`}>
              <h3>AI Predicted Risk</h3>

              <div className={styles.ring}>
                <div>1284</div>
              </div>

              <div className={styles.legendRow}>
                <span><i style={{ background: '#8ace57' }} />Baixo Risco</span>
                <b>65%</b>
              </div>
              <div className={styles.legendRow}>
                <span><i style={{ background: '#f6a44d' }} />Medio Risco</span>
                <b>25%</b>
              </div>
              <div className={styles.legendRow}>
                <span><i style={{ background: '#ea6262' }} />Alto Risco</span>
                <b>10%</b>
              </div>

              <div className={styles.insight}>
                AI INSIGHT
                <strong>Alto risco cresceu 4% nas ultimas 24h.</strong>
                Verifique a fila de triagem prioritaria.
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}