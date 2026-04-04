// src/services/storage/secureStore.ts
import * as SecureStore from 'expo-secure-store';
import { AuthTokens } from '@/types/auth';

const KEYS = {
  ACCESS_TOKEN: 'aitv_access_token',
  REFRESH_TOKEN: 'aitv_refresh_token',
  TOKEN_EXPIRY: 'aitv_token_expiry',
  BIOMETRIC_ENABLED: 'aitv_biometric',
} as const;

export const secureStorage = {
  async saveTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, tokens.accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, tokens.refreshToken),
      SecureStore.setItemAsync(KEYS.TOKEN_EXPIRY, tokens.expiresAt.toString()),
    ]);
  },

  async getTokens(): Promise<AuthTokens | null> {
    const [accessToken, refreshToken, expiryStr] = await Promise.all([
      SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(KEYS.TOKEN_EXPIRY),
    ]);

    if (!accessToken || !refreshToken || !expiryStr) return null;

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiryStr, 10),
    };
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(KEYS.TOKEN_EXPIRY),
    ]);
  },

  async isTokenExpired(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens) return true;
    return Date.now() >= tokens.expiresAt;
  },
};
