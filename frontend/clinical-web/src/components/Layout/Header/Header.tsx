'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, LogOut, UserRound, PanelLeftClose, PanelLeftOpen, Moon, Sun } from 'lucide-react';
import { usePortalTheme } from '@/hooks/usePortalTheme';
import { UserRole } from '@/types/auth';
import styles from './Header.module.scss';

interface HeaderProps {
  userName: string;
  role: UserRole;
  onMenuClick?: () => void;
  onLogout?: () => void;
  isSidebarOpen?: boolean;
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

export const Header = ({ userName, role, onMenuClick, onLogout, isSidebarOpen = false }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = usePortalTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState('Usuario');
  const profileRef = useRef<HTMLDivElement | null>(null);
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const ThemeIcon = theme === 'dark' ? Sun : Moon;
  const currentSearch = pathname === '/pacientes/gerenciamento' ? searchParams.get('busca') ?? '' : '';

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

  useEffect(() => {
    setDisplayName(userName || 'Usuario');
  }, [userName]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const query = String(formData.get('busca') ?? '').trim();
    router.push(query ? `/pacientes/gerenciamento?busca=${encodeURIComponent(query)}` : '/pacientes/gerenciamento');
  };

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuButton}
        aria-label={isSidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        aria-expanded={isSidebarOpen}
        onClick={onMenuClick}
      >
        <SidebarIcon size={20} />
      </button>

      <form
        key={`${pathname}-${currentSearch}`}
        className={styles.searchField}
        aria-label="Pesquisar paciente ou prontuario"
        onSubmit={handleSearchSubmit}
      >
        <button type="submit" className={styles.searchButton} aria-label="Buscar paciente">
          <Search size={18} />
        </button>
        <input
          type="search"
          name="busca"
          defaultValue={currentSearch}
          placeholder="Pesquisar paciente ou prontuario..."
        />
      </form>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.iconButton}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          onClick={toggleTheme}
        >
          <ThemeIcon size={17} />
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
              <strong>{displayName}</strong>
              <span>{roleLabel[role]}</span>
            </div>
            <div className={styles.avatar} aria-hidden="true">
              {getInitials(displayName) || 'DR'}
            </div>
          </button>

          {isProfileMenuOpen && (
            <div className={styles.profileMenu} role="menu" aria-label="Menu de perfil">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  router.push('/configuracoes/conta');
                }}
              >
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
