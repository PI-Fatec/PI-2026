'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

const mobileDeepLinkBase = process.env.NEXT_PUBLIC_MOBILE_DEEP_LINK_BASE || 'clientapp://invite';

function buildDeepLink(token: string) {
  const separator = mobileDeepLinkBase.includes('?') ? '&' : '?';
  return `${mobileDeepLinkBase}${separator}token=${encodeURIComponent(token)}`;
}

export default function OpenInviteInAppPage() {
  const searchParams = useSearchParams();

  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);

  const deepLinkUrl = useMemo(() => {
    if (!token) return '';
    return buildDeepLink(token);
  }, [token]);

  const webFallbackUrl = useMemo(() => {
    if (!token) return '/convite/aceitar';
    return `/convite/aceitar?token=${encodeURIComponent(token)}`;
  }, [token]);

  useEffect(() => {
    if (!deepLinkUrl) return;

    window.location.href = deepLinkUrl;
  }, [deepLinkUrl]);

  if (!token) {
    return (
      <main style={{ maxWidth: 560, margin: '48px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Token de convite nao informado</h1>
        <p style={{ marginBottom: 16, color: '#465a7a' }}>
          Verifique se o link do convite esta completo e tente novamente.
        </p>
        <Link href="/login">Ir para login</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 560, margin: '48px auto', padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>Abrindo convite no app...</h1>
      <p style={{ marginBottom: 16, color: '#465a7a' }}>
        Se o app nao abrir automaticamente, toque em &quot;Abrir no app&quot;.
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a
          href={deepLinkUrl}
          style={{ background: '#0f172a', color: '#fff', borderRadius: 8, padding: '10px 14px', textDecoration: 'none', fontWeight: 600 }}
        >
          Abrir no app
        </a>
        <Link
          href={webFallbackUrl}
          style={{ background: '#1d4ed8', color: '#fff', borderRadius: 8, padding: '10px 14px', textDecoration: 'none', fontWeight: 600 }}
        >
          Continuar no portal web
        </Link>
      </div>

      <p style={{ marginTop: 12, color: '#60779b', fontSize: 13 }}>
        Em alguns celulares, o navegador pode exigir toque manual por seguranca.
      </p>
    </main>
  );
}

