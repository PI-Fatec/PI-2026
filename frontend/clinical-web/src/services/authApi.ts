import { AuthSession, LoginInput, RegisterInput } from '@/types/auth';
import { apiRequest } from '@/services/apiClient';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: AuthSession['role'];
  };
};

export const authApi = {
  async login(payload: LoginInput): Promise<AuthSession> {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: payload,
    });

    return {
      token: response.token,
      role: response.user.role,
      name: response.user.name,
      email: response.user.email,
    };
  },

  async registerSelf(payload: RegisterInput): Promise<AuthSession> {
    const response = await apiRequest<AuthResponse>('/api/auth/register/self', {
      method: 'POST',
      body: payload,
    });

    return {
      token: response.token,
      role: response.user.role,
      name: response.user.name,
      email: response.user.email,
    };
  },
};
