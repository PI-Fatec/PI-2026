import Link from 'next/link';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import styles from './page.module.scss';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <ShieldAlert size={64} className={styles.icon} />
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.subtitle}>Página não encontrada</h2>
      <p className={styles.description}>
        O recurso que você está tentando acessar não existe ou foi movido.
      </p>
      <Link href="/" className={styles.button}>
      <ArrowLeft size={16} style={{ marginRight: '8px' }} />
        Voltar para o Início
      </Link>
    </div>
  );
}