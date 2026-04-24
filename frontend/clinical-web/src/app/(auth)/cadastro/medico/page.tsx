'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/authApi';

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
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>
      <h1>Cadastro de Medico</h1>
      <p>Crie sua conta de acesso ao portal.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input placeholder="Nome completo" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
        <input placeholder="CRM" value={form.crm} onChange={(e) => setForm((p) => ({ ...p, crm: e.target.value }))} required />
        <input placeholder="Especialidade" value={form.especialidade} onChange={(e) => setForm((p) => ({ ...p, especialidade: e.target.value }))} />
        <input placeholder="Clinica" value={form.clinica} onChange={(e) => setForm((p) => ({ ...p, clinica: e.target.value }))} />
        <input type="password" placeholder="Senha" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />

        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        <button type="submit" disabled={isLoading}>{isLoading ? 'Cadastrando...' : 'Cadastrar medico'}</button>
      </form>

      <p style={{ marginTop: 16 }}>
        <Link href="/login">Voltar para login</Link>
      </p>
    </main>
  );
}
