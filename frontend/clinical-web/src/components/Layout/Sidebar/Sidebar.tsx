'use client';

import type { ElementType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileSearch, LogOut, X, UserCog, Settings } from 'lucide-react';
import logo from '@/assets/logo.png';
import { UserRole } from '@/types/auth';
import styles from './sidebar.module.scss';

interface SidebarProps {
	role: UserRole;
	userName: string;
	onLogout: () => void;
	isOpen?: boolean;
	onClose?: () => void;
}

const roleItems: Record<UserRole, Array<{ label: string; href: string; icon: ElementType }>> = {
	ADMIN: [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboard },
		{ label: 'Cadastrar paciente', href: '/pacientes/cadastro', icon: Users },
		{ label: 'Gerenciar pacientes', href: '/pacientes/gerenciamento', icon: FileSearch },
		{ label: 'Controle de medicos', href: '/admin/medicos', icon: UserCog },
		{ label: 'Configurações', href: '/configuracoes/conta', icon: Settings },
	],
	DOCTOR: [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboard },
		{ label: 'Cadastrar paciente', href: '/pacientes/cadastro', icon: Users },
		{ label: 'Gerenciar pacientes', href: '/pacientes/gerenciamento', icon: FileSearch },
		{ label: 'Configurações', href: '/configuracoes/conta', icon: Settings },
	],
	PATIENT: [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboard },
	],
};

export const Sidebar = ({ role, onLogout, isOpen = false, onClose }: SidebarProps) => {
	const pathname = usePathname();

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}

		return pathname === href || pathname.startsWith(`${href}/`);
	};

	return (
		<aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.collapsed}`} aria-label="Menu lateral">
			<div className={styles.mobileHeader}>
				<strong>Menu</strong>
				<button type="button" className={styles.closeButton} aria-label="Fechar menu" onClick={onClose}>
					<X size={16} />
				</button>
			</div>

			<div className={styles.brandBlock}>
				<div className={styles.brandLogoFrame}>
					<Image src={logo} alt="HealthTrack AI" className={styles.brandLogo} priority />
				</div>
			</div>

			<nav className={styles.menu} aria-label="Menu principal">
				<ul>
					{roleItems[role].map((item) => (
						<li key={item.href}>
							<Link
								href={item.href}
								className={`${styles.menuLink} ${isActive(item.href) ? styles.active : ''}`}
								aria-label={item.label}
								title={!isOpen ? item.label : undefined}
							>
								<item.icon size={16} />
								<span>{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			<button type="button" className={styles.logoutButton} onClick={onLogout} aria-label="Sair" title={!isOpen ? 'Sair' : undefined}>
				<LogOut size={16} />
				<span>Sair</span>
			</button>
		</aside>
	);
};
