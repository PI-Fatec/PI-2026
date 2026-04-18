import { X } from 'lucide-react';
import styles from './SideSheet.module.scss';

interface SideSheetProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const SideSheet = ({ isOpen, title, subtitle, onClose, children }: SideSheetProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.wrapper} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className={styles.overlay} aria-label="Fechar painel" onClick={onClose} />

      <aside className={styles.sheet}>
        <header>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>

          <button type="button" onClick={onClose} aria-label="Fechar painel">
            <X size={18} />
          </button>
        </header>

        <div className={styles.content}>{children}</div>
      </aside>
    </div>
  );
};
