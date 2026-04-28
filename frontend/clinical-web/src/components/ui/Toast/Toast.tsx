'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import styles from './Toast.module.scss';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface ToastProps {
  message: string;
  title?: string;
  variant?: ToastVariant;
  position?: ToastPosition;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const iconByVariant = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
} as const;

export function Toast({
  message,
  title,
  variant = 'info',
  position = 'top-right',
  isOpen,
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!isOpen || duration <= 0) return;

    const timeout = window.setTimeout(() => {
      onClose();
    }, duration);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [duration, isOpen, onClose]);

  const Icon = iconByVariant[variant];

  return (
    <div className={`${styles.container} ${styles[position]} ${isOpen ? styles.open : styles.closed}`} role="status" aria-live="polite">
      <div className={`${styles.toast} ${styles[variant]}`}>
        <div className={styles.content}>
          <Icon size={18} className={styles.icon} />
          <div className={styles.texts}>
            {title && <strong className={styles.title}>{title}</strong>}
            <p className={styles.message}>{message}</p>
          </div>
        </div>

        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fechar notificacao"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
