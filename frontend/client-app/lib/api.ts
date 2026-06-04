import Constants from 'expo-constants';

function normalizeApiBaseUrl(baseUrl: string) {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, '');

  if (trimmedBaseUrl.startsWith('//')) {
    return `https:${trimmedBaseUrl}`;
  }

  if (!/^https?:\/\//i.test(trimmedBaseUrl)) {
    return `https://${trimmedBaseUrl}`;
  }

  return trimmedBaseUrl;
}

function resolveApiBaseUrl() {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envBaseUrl) {
    return normalizeApiBaseUrl(envBaseUrl);
  }

  const expoConfigHostUri = (Constants.expoConfig as { hostUri?: string } | null)?.hostUri;
  const expoGoDebuggerHost = (Constants as unknown as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;
  const host = expoConfigHostUri || expoGoDebuggerHost;
  const hostIp = host?.split(':')[0];

  if (hostIp) {
    return `http://${hostIp}:3000`;
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveApiBaseUrl();

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: Method;
  token?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const query = options.query
    ? `?${new URLSearchParams(
        Object.entries(options.query)
          .filter(([, value]) => value !== undefined && value !== '')
          .map(([key, value]) => [key, String(value)])
      ).toString()}`
    : '';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 12000);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}${query}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Tempo esgotado ao conectar em ${API_BASE_URL}. Verifique se o backend esta rodando.`);
    }

    throw new Error(`Nao foi possivel conectar em ${API_BASE_URL}. Verifique a URL da API.`);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || 'Erro na comunicação com servidor.');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
