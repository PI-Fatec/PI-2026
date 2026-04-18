import { X } from 'lucide-react';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, title, onClose, children }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className={styles.backdrop} aria-label="Fechar modal" onClick={onClose} />

      <section className={styles.modal}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar modal">
            <X size={18} />
          </button>
        </header>

        <div className={styles.content}>{children}</div>
      </section>
    </div>
  );
};
