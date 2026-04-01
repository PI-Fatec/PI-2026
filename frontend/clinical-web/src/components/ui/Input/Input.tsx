import { LucideIcon } from 'lucide-react';
import styles from './Input.module.scss';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input = ({ label, icon: Icon, error, ...props }: InputProps) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      
      <div className={`${styles.inputWrapper} ${error ? styles.hasError : ''}`}>
        {Icon && <Icon size={20} className={styles.icon} />}
        
        <input 
          className={styles.inputField} 
          {...props} 
        />
      </div>

      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};