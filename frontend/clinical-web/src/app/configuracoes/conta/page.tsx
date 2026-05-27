'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, UserRound } from 'lucide-react';
import { Header } from '@/components/Layout/Header/Header';
import { Sidebar } from '@/components/Layout/Sidebar/Sidebar';
import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useSidebarState } from '@/hooks/useSidebarState';
import { accountApi } from '@/services/accountApi';
import { AccountProfile, UpdateAccountInput } from '@/types/account';
import { maskPhone } from '@/utils/masks';
import styles from './conta.module.scss';

type AccountForm = UpdateAccountInput;

const initialForm: AccountForm = {
  name: '',
  email: '',
  telefone: '',
  crm: '',
  especialidade: '',
  clinica: '',
};

export default function ConfiguracaoContaPage() {
  const router = useRouter();
  const { session, logout, setSession } = useAuth();
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [form, setForm] = useState<AccountForm>(initialForm);
  const { isSidebarOpen, closeSidebar, toggleSidebar } = useSidebarState({ defaultOpen: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const role = session?.role ?? 'DOCTOR';

  useEffect(() => {
    const loadAccount = async () => {
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const loadedAccount = await accountApi.getMe(session.token);
        setAccount(loadedAccount);
        setForm({
          name: loadedAccount.name,
          email: loadedAccount.email,
          telefone: loadedAccount.doctorProfile?.telefone ?? '',
          crm: loadedAccount.doctorProfile?.crm ?? '',
          especialidade: loadedAccount.doctorProfile?.especialidade ?? '',
          clinica: loadedAccount.doctorProfile?.clinica ?? '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Nao foi possivel carregar sua conta.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadAccount();
  }, [session?.token]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const updateField = <K extends keyof AccountForm>(field: K, value: AccountForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!session?.token) {
      setError('Sessao expirada. Faca login novamente.');
      return;
    }

    if (!form.name.trim() || !form.email.trim()) {
      setError('Nome e e-mail sao obrigatorios.');
      return;
    }

    if (account?.role === 'DOCTOR' && !String(form.crm || '').trim()) {
      setError('CRM nao pode ficar vazio.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const result = await accountApi.updateMe(
        {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          ...(account?.role === 'DOCTOR'
            ? {
                telefone: form.telefone,
                crm: form.crm,
                especialidade: form.especialidade,
                clinica: form.clinica,
              }
            : {}),
        },
        session.token,
      );

      setAccount(result.account);
      setSession(result.session);
      setSuccess('Conta atualizada com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nao foi possivel atualizar sua conta.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.shell}>
      <Sidebar
        role={role}
        userName={session?.name ?? 'Usuario'}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      {isSidebarOpen && <button type="button" className={styles.backdrop} aria-label="Fechar menu" onClick={closeSidebar} />}

      <main className={styles.main}>
        <Header
          userName={session?.name ?? 'Usuario'}
          role={role}
          isSidebarOpen={isSidebarOpen}
          onMenuClick={toggleSidebar}
          onLogout={handleLogout}
        />

        <section className={styles.pageHeader}>
          <div>
            <span>
              <UserRound size={16} />
              Configuracoes
            </span>
            <h1>Conta</h1>
            <p>Atualize os dados exibidos no portal clinico.</p>
          </div>
        </section>

        <section className={styles.formPanel}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <Spinner size="md" />
              <span>Carregando dados da conta...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.sectionHeader}>
                <h2>Dados de acesso</h2>
                <p>Essas informacoes atualizam a sessao atual depois de salvar.</p>
              </div>

              <div className={styles.formGrid}>
                <label>
                  Nome
                  <input value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
                </label>

                <label>
                  E-mail
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    required
                  />
                </label>
              </div>

              {account?.role === 'DOCTOR' && (
                <>
                  <div className={styles.sectionHeader}>
                    <h2>Perfil medico</h2>
                    <p>Dados profissionais exibidos no cadastro da clinica.</p>
                  </div>

                  <div className={styles.formGrid}>
                    <label>
                      Telefone
                      <input value={form.telefone} onChange={(event) => updateField('telefone', maskPhone(event.target.value))} />
                    </label>

                    <label>
                      CRM
                      <input value={form.crm} onChange={(event) => updateField('crm', event.target.value.toUpperCase())} required />
                    </label>

                    <label>
                      Especialidade
                      <input value={form.especialidade} onChange={(event) => updateField('especialidade', event.target.value)} />
                    </label>

                    <label>
                      Clinica
                      <input value={form.clinica} onChange={(event) => updateField('clinica', event.target.value)} />
                    </label>
                  </div>
                </>
              )}

              {error && <p className={styles.feedbackError}>{error}</p>}
              {success && <p className={styles.feedbackSuccess}>{success}</p>}

              <footer className={styles.actions}>
                <button type="submit" disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar alteracoes'}
                  <Save size={16} />
                </button>
              </footer>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
