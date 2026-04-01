import styles from './page.module.scss';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p className={styles.loadingText}>Carregando...</p>
    </div>
  );
}
