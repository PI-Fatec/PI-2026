'use client';

import Link from 'next/link';
import styles from './cadastro.module.scss';

export default function CadastroEntryPage() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.formHeader}>
        <h2>Solicitar credenciamento</h2>
        <p>Crie seu acesso medico ao portal clinico.</p>
      </div>

      <div className={styles.form}>
        <Link href="/cadastro/medico" className={styles.btnSecondary}>Cadastro de Medico</Link>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerRow}>
          <p>Ja possui conta?</p>
          <Link href="/login" className={styles.btnSecondary}>Fazer login</Link>
        </div>
      </footer>
    </div>
  );
}
