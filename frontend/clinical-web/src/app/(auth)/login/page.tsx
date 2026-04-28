'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Eye, EyeOff, IdCard } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Toast } from '@/components/ui/Toast/Toast';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import  logo  from '@/assets/logo.png';
import styles from './login.module.scss';



export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
        remember: false,
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
          <Image src={logo} alt="HealthTrack AI" />
         
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

        

        {errorMessage && <p className={styles.submitError}>{errorMessage}</p>}

        <Button type="submit" variant='primary' icon={ArrowRight} isLoading={isLoading}>
          Entrar no Painel
        </Button>
      </form>

      <footer className={styles.footer}>
        <div className={styles.footerRow}>
          <p>Ainda não tem acesso?</p>
          <Link href="/cadastro/medico" className={styles.btnSecondary}>Solicitar Credenciamento</Link>
        </div>
        
        
      </footer>

      <Toast
        isOpen={Boolean(errorMessage)}
        variant="error"
        position="top-right"
        title="Falha no login"
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />
    </div>
  );
}
