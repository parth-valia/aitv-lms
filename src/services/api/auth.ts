// src/services/api/auth.ts
import { apiClient } from './apiClient';
import { AuthResponseSchema } from './schemas';
import { secureStorage } from '../storage/secureStore';
import { AuthUser, LoginForm } from '@/types/auth';
import { API } from '@/constants/api';

interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

interface LoginResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

interface ApiMessageResponse {
  statusCode: number;
  message: string;
  success: boolean;
}

export const authApi = {
  login: async (credentials: LoginForm): Promise<LoginResult> => {
    const response = await apiClient<unknown>(API.endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    const validated = AuthResponseSchema.parse(response);
    const { user, accessToken, refreshToken } = validated.data;
    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar?.url ?? null,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    };
  },

  register: async (data: RegisterInput): Promise<ApiMessageResponse> => {
    return apiClient<ApiMessageResponse>(API.endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getProfile: async (): Promise<AuthUser> => {
    const response = await apiClient<{ data: { _id: string; username: string; email: string; avatar?: { url: string } | null; createdAt: string } }>(
      API.endpoints.auth.profile
    );
    const raw = response.data;
    return {
      id: raw._id,
      username: raw.username,
      email: raw.email,
      avatar: raw.avatar?.url ?? null,
      createdAt: raw.createdAt,
    };
  },

  logout: async (): Promise<void> => {
    await apiClient<ApiMessageResponse>(API.endpoints.auth.logout, {
      method: 'POST',
    });
  },

  forgotPassword: async (email: string): Promise<ApiMessageResponse> => {
    return apiClient<ApiMessageResponse>(API.endpoints.auth.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<ApiMessageResponse> => {
    return apiClient<ApiMessageResponse>(`${API.endpoints.auth.resetPassword}${token}`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient<{ data: AuthUser }>(API.endpoints.auth.currentUser);
    return response.data;
  },

  updateAvatar: async (imageUri: string): Promise<AuthUser> => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    const type = match ? `image/${match[1]}` : `image`;

    // @ts-ignore - React Native FormData is slightly different
    formData.append('avatar', {
      uri: imageUri,
      name: filename || 'avatar.jpg',
      type,
    });

    const response = await apiClient<{ data: AuthUser }>('/users/avatar', {
      method: 'PATCH',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  checkUsernameAvailability: async (username: string): Promise<boolean> => {
    try {
      await apiClient(`${API.endpoints.social.profile}${username}`, {
        method: 'GET',
      });
      // If 200, it exists
      return false;
    } catch (error) {
      // If 404, it's available. Assuming our apiClient throws for 4xx/5xx.
      return true;
    }
  },
};
