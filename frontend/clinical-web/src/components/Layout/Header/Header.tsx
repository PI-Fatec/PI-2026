'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, Menu, Search, SlidersHorizontal, LogOut, UserRound } from 'lucide-react';
import { UserRole } from '@/types/auth';
import styles from './Header.module.scss';

interface HeaderProps {
  userName: string;
  role: UserRole;
  onMenuClick?: () => void;
  onLogout?: () => void;
}

const roleLabel: Record<UserRole, string> = {
  ADMIN: 'Administrador do Sistema',
  DOCTOR: 'Neurologista Clinica',
  PATIENT: 'Cliente',
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? '')
    .join('');

export const Header = ({ userName, role, onMenuClick, onLogout }: HeaderProps) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

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

        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            type="button"
            className={styles.profile}
            onClick={() => setIsProfileMenuOpen((current) => !current)}
            aria-haspopup="menu"
            aria-expanded={isProfileMenuOpen}
          >
            <div>
              <strong>{userName}</strong>
              <span>{roleLabel[role]}</span>
            </div>
            <div className={styles.avatar} aria-hidden="true">
              {getInitials(userName) || 'DR'}
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className={styles.profileMenu} role="menu" aria-label="Menu de perfil">
              <button type="button" role="menuitem" onClick={() => setIsProfileMenuOpen(false)}>
                <UserRound size={15} />
                Meu perfil
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  onLogout?.();
                }}
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
