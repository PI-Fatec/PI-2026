'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, LayoutDashboard, Users, ActivitySquare, FileSearch, LogOut, X, UserCog } from 'lucide-react';
import { UserRole } from '@/types/auth';
import styles from './sidebar.module.scss';

interface SidebarProps {
	role: UserRole;
	userName: string;
	onLogout: () => void;
	isOpen?: boolean;
	onClose?: () => void;
}

const roleItems: Record<UserRole, Array<{ label: string; href: string; icon: React.ElementType }>> = {
	ADMIN: [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboard },
		{ label: 'Cadastrar paciente', href: '/pacientes/cadastro', icon: Users },
		{ label: 'Gerenciar pacientes', href: '/pacientes/gerenciamento', icon: FileSearch },
		{ label: 'Controle de medicos', href: '/admin/medicos', icon: UserCog },
		{ label: 'Relatorios IA', href: '/dashboard', icon: ActivitySquare },
	],
	DOCTOR: [
		{ label: 'Dashboard', href: '/', icon: LayoutDashboard },
		{ label: 'Cadastrar paciente', href: '/pacientes/cadastro', icon: Users },
		{ label: 'Gerenciar pacientes', href: '/pacientes/gerenciamento', icon: FileSearch },
		{ label: 'Alertas clinicos', href: '/dashboard', icon: ActivitySquare },
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
		<aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
			<div className={styles.mobileHeader}>
				<strong>Menu</strong>
				<button type="button" className={styles.closeButton} aria-label="Fechar menu" onClick={onClose}>
					<X size={16} />
				</button>
			</div>

			<div className={styles.brandBlock}>
				<div className={styles.logoBadge}>
					<ShieldCheck size={20} />
				</div>
				<div>
					<h1>HealthTrack AI</h1>
					<p>Clinical Intelligence</p>
				</div>
			</div>

		

			

			<nav className={styles.menu} aria-label="Menu principal">
				<ul>
					{roleItems[role].map((item) => (
						<li key={item.href}>
							<Link href={item.href} className={`${styles.menuLink} ${isActive(item.href) ? styles.active : ''}`}>
								<item.icon size={16} />
								<span>{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

		
			<button type="button" className={styles.logoutButton} onClick={onLogout}>
				<LogOut size={16} />
				Sair
			</button>
		</aside>
	);
};
