import { LucideIcon } from 'lucide-react';
import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  isLoading, 
  ...props 
}: ButtonProps) => {
  return (
    <button 
      className={`${styles.button} ${styles[variant]}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className={styles.loader}></span> 
      ) : (
        <>
          {children}
          {Icon && <Icon size={20} className={styles.icon} />}
        </>
      )}
    </button>
  );
};