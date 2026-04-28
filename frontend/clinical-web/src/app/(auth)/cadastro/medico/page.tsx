'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, KeyRound, Mail, Phone, Stethoscope, UserRound } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Toast } from '@/components/ui/Toast/Toast';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/authApi';
import styles from '@/styles/auth-form.module.scss';

export default function CadastroMedicoPage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    telefone: '',
    crm: '',
    especialidade: '',
    clinica: '',
    password: '',
  });

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      const session = await authApi.registerSelf({
        role: 'DOCTOR',
        name: form.name,
        email: form.email,
        telefone: form.telefone,
        crm: form.crm,
        especialidade: form.especialidade,
        clinica: form.clinica,
        password: form.password,
      });

      setSession(session);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar medico.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.formHeader}>
        <h2>Cadastro de Medico</h2>
        <p>Crie sua conta e acesse o portal clinico.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Nome completo"
          placeholder="Nome completo"
          icon={UserRound}
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
        />
        <Input
          label="E-mail"
          type="email"
          placeholder="E-mail"
          icon={Mail}
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          required
        />
        <div className={styles.row}>
          <Input
            label="Telefone"
            placeholder="Telefone"
            icon={Phone}
            value={form.telefone}
            onChange={(e) => setForm((p) => ({ ...p, telefone: formatPhone(e.target.value) }))}
          />
          <Input
            label="CRM"
            placeholder="CRM"
            icon={Stethoscope}
            value={form.crm}
            onChange={(e) => setForm((p) => ({ ...p, crm: e.target.value }))}
            required
          />
        </div>
        <div className={styles.row}>
          <Input
            label="Especialidade"
            placeholder="Especialidade"
            icon={Stethoscope}
            value={form.especialidade}
            onChange={(e) => setForm((p) => ({ ...p, especialidade: e.target.value }))}
          />
          <Input
            label="Clinica"
            placeholder="Clinica"
            icon={Building2}
            value={form.clinica}
            onChange={(e) => setForm((p) => ({ ...p, clinica: e.target.value }))}
          />
        </div>
        <Input
          label="Senha"
          type="password"
          placeholder="Senha"
          icon={KeyRound}
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          required
        />

        <button className={styles.submitButton} type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar medico'}
        </button>
      </form>

      <Link className={styles.backLink} href="/login">Voltar para login</Link>

      <Toast
        isOpen={Boolean(error)}
        variant="error"
        position="top-right"
        title="Falha no cadastro"
        message={error}
        onClose={() => setError('')}
      />
    </div>
  );
}
