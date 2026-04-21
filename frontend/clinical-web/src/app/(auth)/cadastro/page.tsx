'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, Lock, ArrowRight, Eye, EyeOff, IdCard, Mail, User, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from './cadastro.module.scss';

type RegisterFormData = {
  fullName: string;
  email: string;
  phone: string;
  crm: string;
  password: string;
  confirmPassword: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const defaultFormData: RegisterFormData = {
  fullName: '',
  email: '',
  phone: '',
  crm: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>(defaultFormData);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterFormData | 'acceptTerms', string>>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));

    setErrorMessage('');
    setSuccessMessage('');
  };

  const validateForm = () => {
    const validationErrors: Partial<Record<keyof RegisterFormData | 'acceptTerms', string>> = {};

    if (formData.fullName.trim().length < 3) {
      validationErrors.fullName = 'Informe nome completo com pelo menos 3 caracteres.';
    }

    if (!EMAIL_PATTERN.test(formData.email.trim())) {
      validationErrors.email = 'Informe um e-mail valido.';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      validationErrors.phone = 'Informe telefone com DDD.';
    }

    if (formData.password.length < 8) {
      validationErrors.password = 'A senha deve ter no minimo 8 caracteres.';
    }

    if (!/\d/.test(formData.password)) {
      validationErrors.password = 'A senha deve conter ao menos 1 numero.';
    }

    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'A confirmacao de senha nao confere.';
    }

    if (!acceptTerms) {
      validationErrors.acceptTerms = 'Voce precisa aceitar os termos para continuar.';
    }

    setFieldErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      setErrorMessage('Revise os campos obrigatorios para concluir o cadastro.');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      setSuccessMessage('Cadastro enviado com sucesso. Nossa equipe validara seu acesso e retornara por e-mail.');
      setFormData(defaultFormData);
      setAcceptTerms(false);
      setFieldErrors({});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel concluir o cadastro.');
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
        <h2>Solicitar credenciamento</h2>
        <p>Preencha os dados abaixo para criar sua conta no portal clinico.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Nome completo"
          placeholder="Digite seu nome e sobrenome"
          icon={User}
          value={formData.fullName}
          onChange={(event) => updateField('fullName', event.target.value)}
          error={fieldErrors.fullName}
          required
        />

        <Input 
          label="E-mail profissional"
          type="email"
          placeholder="nome@clinica.com"
          icon={Mail}
          value={formData.email}
          onChange={(event) => updateField('email', event.target.value)}
          error={fieldErrors.email}
          required 
        />

        <div className={styles.rowInputs}>
          <Input
            label="Telefone"
            type="tel"
            placeholder="(11) 99999-9999"
            icon={Phone}
            value={formData.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            error={fieldErrors.phone}
            required
          />

          <Input
            label="CRM (opcional)"
            placeholder="CRM12345"
            icon={IdCard}
            value={formData.crm}
            onChange={(event) => updateField('crm', event.target.value)}
          />
        </div>

        <div className={styles.passwordWrapper}>
          <Input 
            label="Senha" 
            type={showPassword ? 'text' : 'password'} 
            placeholder="Minimo de 8 caracteres" 
            icon={Lock} 
            value={formData.password}
            onChange={(event) => updateField('password', event.target.value)}
            error={fieldErrors.password}
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

        <div className={styles.passwordWrapper}>
          <Input
            label="Confirmar senha"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repita sua senha"
            icon={Lock}
            value={formData.confirmPassword}
            onChange={(event) => updateField('confirmPassword', event.target.value)}
            error={fieldErrors.confirmPassword}
            required
          />
          <button
            type="button"
            className={styles.togglePassword}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label="Exibir ou ocultar confirmacao da senha"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="terms"
            checked={acceptTerms}
            onChange={(event) => {
              setAcceptTerms(event.target.checked);
              setFieldErrors((previous) => ({
                ...previous,
                acceptTerms: undefined,
              }));
            }}
          />
          <label htmlFor="terms">Aceito os termos de uso e a politica de privacidade.</label>
        </div>

        {fieldErrors.acceptTerms && <p className={styles.submitError}>{fieldErrors.acceptTerms}</p>}
        {errorMessage && <p className={styles.submitError}>{errorMessage}</p>}
        {successMessage && <p className={styles.submitSuccess}>{successMessage}</p>}

        <Button type="submit" variant='primary' icon={ArrowRight} isLoading={isLoading}>
          Solicitar cadastro
        </Button>
      </form>

      <footer className={styles.footer}>
        <div className={styles.footerRow}>
          <p>Ja possui cadastro aprovado?</p>
          <Link href="/login" className={styles.btnSecondary}>Fazer login</Link>
        </div>
      </footer>
    </div>
  );
}