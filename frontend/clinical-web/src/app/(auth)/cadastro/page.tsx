'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, ArrowRight, Eye, EyeOff, IdCard } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import styles from './cadastro.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Preencha identificacao e senha para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      await login({
        identifier,
        password,
        remember: rememberSession,
      });

      router.replace('/');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <Shield className={styles.shieldIcon} size={24} color="#fff" strokeWidth={2.5}/>
          </div>
          <div>
            <h1>HealthTrack AI</h1>
            <span>CLINICAL INTELLIGENCE</span>
          </div>
        </div>
      </header>

      <div className={styles.formHeader}>
        <h2>Bem-vindo ao Portal</h2>
        <p>Insira suas credenciais médicas para acessar o painel de controle.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input 
          label="CRM / E-mail" 
          placeholder="Digite seu CRM ou e-mail" 
          icon={IdCard} 
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          error={errorMessage ? ' ' : undefined}
          required 
        />

        <div className={styles.passwordWrapper}>
          <Link href="/recuperar-senha" className={styles.forgotLink}>
            Esqueceu a senha?
          </Link>
          <Input 
            label="Senha" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="••••••••" 
            icon={Lock} 
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={errorMessage ? ' ' : undefined}
            required 
          />
          <button 
            type="button" 
            className={styles.togglePassword}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="remember"
            checked={rememberSession}
            onChange={(event) => setRememberSession(event.target.checked)}
          />
          <label htmlFor="remember">Manter sessão ativa por 12 horas</label>
        </div>

        {errorMessage && <p className={styles.submitError}>{errorMessage}</p>}

        <div className={styles.mockCredentials}>
          <p>Modo mock para testes:</p>
          <span>Medico: medico@test.com ou CRM12345 / 123456</span>
          <span>Administrador: admin@test.com / 123456</span>
        </div>

        <Button type="submit" variant='primary' icon={ArrowRight} isLoading={isLoading}>
          Entrar no Painel
        </Button>
      </form>

      <footer className={styles.footer}>
        <div className={styles.footerRow}>
          <p>Ja possui Cadastro?</p>
          <Link href="/login" className={styles.btnSecondary}>Fazer Login</Link>
        </div>
        
        
      </footer>
    </div>
  );
}