/* eslint-disable react/no-unescaped-entities */
import { BrainCircuit } from 'lucide-react';
import styles from './auth.module.scss';
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Acesso ao Portal | HealthTrack AI",
  description: "Insira suas credenciais médicas para acessar o painel de controle e monitoramento de pacientes.",
  robots: "noindex, nofollow", 
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.badge}> <BrainCircuit size={15} />
        <h4>Inteligencia clínica avançada</h4>
        </div>
        <h1>Transforme dados em <span>decisões precisas.</span></h1>
        <p>A plataforma HealthTrack AI utiliza redes neurais
profundas para auxiliar médicos na triagem e
monitoramento preventivo de pacientes em tempo
real.</p>
        
      </aside>

      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}