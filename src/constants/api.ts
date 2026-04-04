// src/constants/api.ts
// API endpoint constants — single source of truth for all API paths

export const API = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.freeapi.app/api/v1',
  TIMEOUT_MS: 10_000,
  MAX_RETRIES: 3,
  INITIAL_BACKOFF_MS: 500,
  endpoints: {
    auth: {
      login: '/users/login',
      register: '/users/register',
      logout: '/users/logout',
      currentUser: '/users/current-user',
      refreshToken: '/users/refresh-token',
      profile: '/users/self',
      forgotPassword: '/users/forgot-password',
      resetPassword: '/users/reset-password/',
      changePassword: '/users/change-password',
    },
    public: {
      randomProducts: '/public/randomproducts',
      randomUsers: '/public/randomusers',
    },
    social: {
      profile: '/social-media/profile/u/',
    },
  },
} as const;
