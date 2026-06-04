import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Configuracoes de Conta | Healtrack AI',
  description: 'Atualize os dados da sua conta e perfil.',
};

export default function ConfiguracaoContaLayout({ children }: { children: ReactNode }) {
  return children;
}
