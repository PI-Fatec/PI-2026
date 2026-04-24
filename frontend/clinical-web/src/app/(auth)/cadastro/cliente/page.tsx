'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/authApi';

export default function CadastroClientePage() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    cpf: '',
    telefone: '',
    dataNascimento: '',
    sexo: 'Outro' as 'Masculino' | 'Feminino' | 'Outro',
    password: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      setIsLoading(true);
      const session = await authApi.registerSelf({
        role: 'PATIENT',
        name: form.name,
        email: form.email,
        cpf: form.cpf,
        telefone: form.telefone,
        dataNascimento: form.dataNascimento,
        sexo: form.sexo,
        password: form.password,
      });

      setSession(session);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar cliente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>
      <h1>Cadastro de Cliente</h1>
      <p>Crie sua conta e complete seus dados de saude.</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input placeholder="Nome completo" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm((p) => ({ ...p, cpf: e.target.value }))} required />
        <input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
        <input type="date" value={form.dataNascimento} onChange={(e) => setForm((p) => ({ ...p, dataNascimento: e.target.value }))} required />
        <select value={form.sexo} onChange={(e) => setForm((p) => ({ ...p, sexo: e.target.value as 'Masculino' | 'Feminino' | 'Outro' }))}>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Outro">Outro</option>
        </select>
        <input type="password" placeholder="Senha" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />

        {error && <p style={{ color: '#dc2626' }}>{error}</p>}

        <button type="submit" disabled={isLoading}>{isLoading ? 'Cadastrando...' : 'Cadastrar cliente'}</button>
      </form>

      <p style={{ marginTop: 16 }}>
        <Link href="/login">Voltar para login</Link>
      </p>
    </main>
  );
}
