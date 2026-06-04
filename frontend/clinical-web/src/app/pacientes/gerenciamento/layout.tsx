import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Gerenciamento de Pacientes | Healtrack AI',
  description: 'Gerencie o historico clinico dos pacientes e obtenha insights preditivos.',
};

export default function GerenciamentoPacientesLayout({ children }: { children: ReactNode }) {
  return children;
}
