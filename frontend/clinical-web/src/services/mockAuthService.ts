import { AuthSession, LoginInput, MockUserRecord } from '@/types/auth';

const MOCK_USERS: MockUserRecord[] = [
  {
    id: 'doctor-001',
    name: 'Dra. Ana Costa',
    role: 'DOCTOR',
    email: 'medico@test.com',
    crm: 'CRM12345',
    password: '123456',
  },
  {
    id: 'admin-001',
    name: 'Administrador HealthTrack',
    role: 'ADMIN',
    email: 'admin@test.com',
    password: '123456',
  },
];

const MOCK_NETWORK_DELAY_MS = 700;

const normalizeIdentifier = (identifier: string) => identifier.trim().toLowerCase();

const buildMockToken = (user: MockUserRecord) => {
  const tokenPayload = `${user.id}:${Date.now()}`;
  return btoa(tokenPayload);
};

export const mockAuthService = {
  async login({ identifier, password }: LoginInput): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

    const normalizedIdentifier = normalizeIdentifier(identifier);

    const user = MOCK_USERS.find((item) => {
      const emailMatches = item.email.toLowerCase() === normalizedIdentifier;
      const crmMatches = item.crm?.toLowerCase() === normalizedIdentifier;
      return emailMatches || crmMatches;
    });

    if (!user || user.password !== password) {
      throw new Error('Credenciais invalidas. Confira e-mail/CRM e senha.');
    }

    return {
      token: buildMockToken(user),
      role: user.role,
      name: user.name,
      email: user.email,
    };
  },
};
