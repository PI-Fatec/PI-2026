'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { inviteApi } from '@/services/inviteApi';
import { useAuth } from '@/hooks/useAuth';

export default function AceitarConvitePage() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useAuth();

  const token = useMemo(() => params.get('token') || '', [params]);

  const [loadingInvite, setLoadingInvite] = useState(true);
  const [inviteError, setInviteError] = useState('');
  const [role, setRole] = useState<'DOCTOR' | 'PATIENT'>('PATIENT');
  const [email, setEmail] = useState('');

  const [form, setForm] = useState({
    name: '',
    password: '',
    telefone: '',
    crm: '',
    especialidade: '',
    clinica: '',
    cpf: '',
    dataNascimento: '',
    sexo: 'Outro',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!token) {
      setInviteError('Token de convite nao informado.');
      setLoadingInvite(false);
      return;
    }

    const load = async () => {
      try {
        setLoadingInvite(true);
        const invite = await inviteApi.validate(token);
        setRole(invite.role);
        setEmail(invite.email);
      } catch (err) {
        setInviteError(err instanceof Error ? err.message : 'Falha ao validar convite.');
      } finally {
        setLoadingInvite(false);
      }
    };

    void load();
  }, [token]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError('');

    try {
      setSubmitting(true);
      const result = await inviteApi.accept({
        token,
        role,
        email,
        name: form.name,
        password: form.password,
        telefone: form.telefone,
        crm: form.crm,
        especialidade: form.especialidade,
        clinica: form.clinica,
        cpf: form.cpf,
        dataNascimento: form.dataNascimento,
        sexo: form.sexo as 'Masculino' | 'Feminino' | 'Outro',
      });

      setSession({
        token: result.token,
        role: result.user.role,
        name: result.user.name,
        email: result.user.email,
      });

      router.replace('/');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Falha ao aceitar convite.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInvite) {
    return <main style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>Validando convite...</main>;
  }

  if (inviteError) {
    return <main style={{ maxWidth: 560, margin: '40px auto', padding: 24, color: '#dc2626' }}>{inviteError}</main>;
  }

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>
      <h1>Aceitar convite</h1>
      <p>E-mail do convite: <strong>{email}</strong></p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <input placeholder="Nome" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input type="password" placeholder="Defina sua senha" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />

        {role === 'DOCTOR' ? (
          <>
            <input placeholder="Telefone" value={form.telefone} onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))} />
            <input placeholder="CRM" value={form.crm} onChange={(e) => setForm((p) => ({ ...p, crm: e.target.value }))} required />
            <input placeholder="Especialidade" value={form.especialidade} onChange={(e) => setForm((p) => ({ ...p, especialidade: e.target.value }))} />
            <input placeholder="Clinica" value={form.clinica} onChange={(e) => setForm((p) => ({ ...p, clinica: e.target.value }))} />
          </>
        ) : (
          <>
            <input placeholder="CPF" value={form.cpf} onChange={(e) => setForm((p) => ({ ...p, cpf: e.target.value }))} required />
            <input type="date" value={form.dataNascimento} onChange={(e) => setForm((p) => ({ ...p, dataNascimento: e.target.value }))} required />
            <select value={form.sexo} onChange={(e) => setForm((p) => ({ ...p, sexo: e.target.value }))}>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </>
        )}

        {submitError && <p style={{ color: '#dc2626' }}>{submitError}</p>}

        <button type="submit" disabled={submitting}>{submitting ? 'Concluindo...' : 'Concluir cadastro'}</button>
      </form>
    </main>
  );
}
