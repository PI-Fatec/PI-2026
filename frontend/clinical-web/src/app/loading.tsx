import styles from './page.module.scss';

export default function Loading() {
  return (
    <div className={styles.loadingOverlay} role="status" aria-label="Carregando">
      <div className={styles.loadingPanel}>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
}
