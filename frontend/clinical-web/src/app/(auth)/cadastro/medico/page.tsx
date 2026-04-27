'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
        <input className={styles.input} placeholder="Nome completo" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input className={styles.input} type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <div className={styles.row}>
          <input className={styles.input} placeholder="Telefone" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
          <input className={styles.input} placeholder="CRM" value={form.crm} onChange={(e) => setForm((p) => ({ ...p, crm: e.target.value }))} required />
        </div>
        <div className={styles.row}>
          <input className={styles.input} placeholder="Especialidade" value={form.especialidade} onChange={(e) => setForm((p) => ({ ...p, especialidade: e.target.value }))} />
          <input className={styles.input} placeholder="Clinica" value={form.clinica} onChange={(e) => setForm((p) => ({ ...p, clinica: e.target.value }))} />
        </div>
        <input className={styles.input} type="password" placeholder="Senha" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.submitButton} type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar medico'}
        </button>
      </form>

      <Link className={styles.backLink} href="/login">Voltar para login</Link>
    </div>
  );
}
