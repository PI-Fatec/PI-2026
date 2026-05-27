import { apiRequest } from '@/services/apiClient';
import { AccountProfile, UpdateAccountInput, UpdateAccountResult } from '@/types/account';

type AccountUpdateResponse = {
  account: AccountProfile;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: AccountProfile['role'];
  };
};

export const accountApi = {
  getMe(token: string) {
    return apiRequest<AccountProfile>('/api/account/me', { token });
  },

  async updateMe(payload: UpdateAccountInput, token: string): Promise<UpdateAccountResult> {
    const response = await apiRequest<AccountUpdateResponse>('/api/account/me', {
      method: 'PUT',
      token,
      body: payload,
    });

    return {
      account: response.account,
      session: {
        token: response.token,
        role: response.user.role,
        name: response.user.name,
        email: response.user.email,
      },
    };
  },
};
