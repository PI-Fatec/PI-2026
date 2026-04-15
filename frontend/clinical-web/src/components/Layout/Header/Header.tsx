import { Bell, Menu, Search, SlidersHorizontal } from 'lucide-react';
import { UserRole } from '@/types/auth';
import styles from './Header.module.scss';

interface HeaderProps {
  userName: string;
  role: UserRole;
  onMenuClick?: () => void;
}

const roleLabel: Record<UserRole, string> = {
  ADMIN: 'Administrador do Sistema',
  DOCTOR: 'Neurologista Clinica',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('');

export const Header = ({ userName, role, onMenuClick }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <button type="button" className={styles.menuButton} aria-label="Abrir menu" onClick={onMenuClick}>
        <Menu size={20} />
      </button>

      <label className={styles.searchField} aria-label="Pesquisar paciente ou prontuario">
        <Search size={18} />
        <input type="text" placeholder="Pesquisar paciente ou prontuario..." />
      </label>

      <div className={styles.actions}>
        <button type="button" className={styles.iconButton} aria-label="Notificacoes">
          <Bell size={17} />
          <span className={styles.dot} />
        </button>

        <button type="button" className={styles.iconButton} aria-label="Filtros">
          <SlidersHorizontal size={17} />
        </button>

        <div className={styles.profile}>
          <div>
            <strong>{userName}</strong>
            <span>{roleLabel[role]}</span>
          </div>
          <div className={styles.avatar} aria-hidden="true">
            {getInitials(userName) || 'DR'}
          </div>
        </div>
      </div>
    </header>
  );
};
