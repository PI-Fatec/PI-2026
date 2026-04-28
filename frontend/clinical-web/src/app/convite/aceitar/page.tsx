'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { inviteApi } from '@/services/inviteApi';
import { useAuth } from '@/hooks/useAuth';
import styles from '@/styles/auth-form.module.scss';

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
  const [isSuccess, setIsSuccess] = useState(false);

  const inviteErrorInfo = useMemo(() => {
    const normalizedError = inviteError.toLowerCase();

    if (normalizedError.includes('expirado')) {
      return {
        title: 'Convite expirado',
        description: 'O prazo para usar este convite terminou. Solicite um novo link ao profissional responsavel.',
      };
    }

    if (normalizedError.includes('utilizado')) {
      return {
        title: 'Convite ja utilizado',
        description: 'Este convite ja foi usado anteriormente. Faca login com sua conta ou solicite suporte.',
      };
    }

    if (normalizedError.includes('nao encontrado')) {
      return {
        title: 'Convite invalido',
        description: 'Nao localizamos este convite. Verifique se o link esta completo.',
      };
    }

    return {
      title: 'Nao foi possivel validar o convite',
      description: inviteError,
    };
  }, [inviteError]);

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

      if (result.user.role === 'PATIENT') {
        setIsSuccess(true);
        return;
      }

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
    return (
      <div className={styles.wrapper}>
        <article className={styles.statusCard}>
          <h3 className={styles.statusTitle}>Validando convite...</h3>
          <p className={styles.statusDescription}>Aguarde enquanto confirmamos os dados de acesso.</p>
        </article>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className={styles.wrapper}>
        <article className={`${styles.statusCard} ${styles.statusCardError}`}>
          <h3 className={styles.statusTitle}>{inviteErrorInfo.title}</h3>
          <p className={styles.statusDescription}>{inviteErrorInfo.description}</p>
          <div className={styles.statusActions}>
            <Link href="/login" className={styles.statusPrimaryAction}>Ir para login</Link>
            <Link href="/cadastro/medico" className={styles.statusSecondaryAction}>Solicitar novo acesso</Link>
          </div>
        </article>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.wrapper}>
        <article className={styles.statusCard}>
          <div className={styles.successIconWrap}>
            <CheckCircle2 size={44} className={styles.successIcon} />
          </div>
          <h3 className={styles.statusTitle}>Cadastro concluido com sucesso</h3>
          <p className={styles.statusDescription}>
            Seu convite foi finalizado. Agora voce ja pode acessar sua conta no aplicativo ou no portal web.
          </p>
          <div className={styles.statusActions}>
            <Link href="/login" className={styles.statusPrimaryAction}>Ir para login</Link>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.formHeader}>
        <h2>Aceitar convite</h2>
        <p>Complete seu cadastro para ativar o acesso.</p>
        <p className={styles.readonlyEmail}>
          E-mail do convite: <strong>{email}</strong>
        </p>
      </div>

      <form onSubmit={onSubmit} className={styles.form}>
        <label className={styles.fieldGroup} htmlFor="name">
          Nome completo
          <input
            id="name"
            className={styles.input}
            placeholder="Digite seu nome"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </label>

        <label className={styles.fieldGroup} htmlFor="password">
          Senha
          <input
            id="password"
            className={styles.input}
            type="password"
            placeholder="Defina sua senha"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            required
          />
        </label>

        {role === 'DOCTOR' ? (
          <>
            <label className={styles.fieldGroup} htmlFor="telefone">
              Telefone
              <input
                id="telefone"
                className={styles.input}
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
              />
            </label>

            <label className={styles.fieldGroup} htmlFor="crm">
              CRM
              <input
                id="crm"
                className={styles.input}
                placeholder="CRM12345"
                value={form.crm}
                onChange={(e) => setForm((p) => ({ ...p, crm: e.target.value }))}
                required
              />
            </label>

            <div className={styles.row}>
              <label className={styles.fieldGroup} htmlFor="especialidade">
                Especialidade
                <input
                  id="especialidade"
                  className={styles.input}
                  placeholder="Ex: Cardiologia"
                  value={form.especialidade}
                  onChange={(e) => setForm((p) => ({ ...p, especialidade: e.target.value }))}
                />
              </label>

              <label className={styles.fieldGroup} htmlFor="clinica">
                Clinica
                <input
                  id="clinica"
                  className={styles.input}
                  placeholder="Nome da clinica"
                  value={form.clinica}
                  onChange={(e) => setForm((p) => ({ ...p, clinica: e.target.value }))}
                />
              </label>
            </div>
          </>
        ) : (
          <>
            <label className={styles.fieldGroup} htmlFor="cpf">
              CPF
              <input
                id="cpf"
                className={styles.input}
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) => setForm((p) => ({ ...p, cpf: e.target.value }))}
                required
              />
            </label>

            <div className={styles.row}>
              <label className={styles.fieldGroup} htmlFor="dataNascimento">
                Data de nascimento
                <input
                  id="dataNascimento"
                  className={styles.input}
                  type="date"
                  value={form.dataNascimento}
                  onChange={(e) => setForm((p) => ({ ...p, dataNascimento: e.target.value }))}
                  required
                />
              </label>

              <label className={styles.fieldGroup} htmlFor="sexo">
                Sexo
                <select
                  id="sexo"
                  className={styles.select}
                  value={form.sexo}
                  onChange={(e) => setForm((p) => ({ ...p, sexo: e.target.value }))}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </label>
            </div>
          </>
        )}

        {submitError && <p className={styles.error}>{submitError}</p>}

        <button className={styles.submitButton} type="submit" disabled={submitting}>
          {submitting ? 'Concluindo...' : 'Concluir cadastro'}
        </button>
      </form>
    </div>
  );
}
