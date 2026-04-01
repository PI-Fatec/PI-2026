'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, ArrowRight, Eye, EyeOff, IdCard } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from './login.module.scss';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Aqui entrará sua lógica de autenticação com a API
    setTimeout(() => setIsLoading(false), 2000); 
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
          <input type="checkbox" id="remember" />
          <label htmlFor="remember">Manter sessão ativa por 12 horas</label>
        </div>

        <Button type="submit" variant='primary' icon={ArrowRight} isLoading={isLoading}>
          Entrar no Painel
        </Button>
      </form>

      <footer className={styles.footer}>
        <div className={styles.footerRow}>
          <p>Ainda não tem acesso?</p>
          <Link href="/cadastro" className={styles.btnSecondary}>Solicitar Credenciamento</Link>
        </div>
        
        
      </footer>
    </div>
  );
}