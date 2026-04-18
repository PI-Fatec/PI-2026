import styles from './AlertDialog.module.scss';

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const AlertDialog = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  onConfirm,
  onClose,
}: AlertDialogProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.dialog}>
        <h2>{title}</h2>
        <p>{description}</p>

        <footer>
          <button type="button" className={styles.cancelButton} onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button>
          <button type="button" className={styles.confirmButton} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processando...' : confirmText}
          </button>
        </footer>
      </div>
    </div>
  );
};
