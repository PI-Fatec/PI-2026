import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Aceitar Convite | Healtrack AI',
  description: 'Complete seu cadastro para ativar o acesso ao Healtrack AI.',
};

export default function AceitarConviteLayout({ children }: { children: ReactNode }) {
  return children;
}
