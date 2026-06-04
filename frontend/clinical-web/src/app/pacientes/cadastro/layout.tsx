import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Cadastro de Paciente | Healtrack AI',
  description: 'Cadastre um novo paciente e obtenha insights preditivos para o seu cuidado.',
};

export default function CadastroPacienteLayout({ children }: { children: ReactNode }) {
  return children;
}
