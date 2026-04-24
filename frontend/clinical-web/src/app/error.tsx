'use client'; // Componentes de erro no Next.js devem ser Client Components

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './page.module.scss';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro capturado pelo Next.js:', error);
  }, [error]);

  return (
    <div className={styles.container}>
      <AlertTriangle size={64} className={styles.icon} color="#d93025" />
      <h2 className={styles.subtitle}>Ops! Tivemos um problema.</h2>
      <p className={styles.description}>
        Ocorreu um erro inesperado e não conseguimos processar sua solicitação no momento. Por favor, tente novamente.
      </p>
      <button
        className={styles.button}
        style={{ border: 'none', cursor: 'pointer' }}
        onClick={
          () => reset()
        }
      >
        Tentar novamente
      </button>
    </div>
  );
}
