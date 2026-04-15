import { ShieldCheck, Activity, Users, AlertTriangle, LogOut, UserRound, X } from 'lucide-react';
import { UserRole } from '@/types/auth';
import styles from './sidebar.module.scss';

interface SidebarProps {
	role: UserRole;
	userName: string;
	onLogout: () => void;
	isOpen?: boolean;
	onClose?: () => void;
}

const roleLabel: Record<UserRole, string> = {
	ADMIN: 'Administrador',
	DOCTOR: 'Medico',
};

const roleItems: Record<UserRole, string[]> = {
	ADMIN: ['Gerenciar usuarios', 'Monitorar sistema', 'Auditoria de acessos'],
	DOCTOR: ['Consultar pacientes', 'Analisar risco', 'Alertas clinicos'],
};

export const Sidebar = ({ role, userName, onLogout, isOpen = false, onClose }: SidebarProps) => {
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
						<li key={item}>
							<span>{item}</span>
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
