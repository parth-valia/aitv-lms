// src/services/api/apiClient.ts
import * as Network from 'expo-network';
import * as Sentry from '@sentry/react-native';
import { secureStorage } from '../storage/secureStore';
import { API } from '@/constants/api';
import { CertificatePinner } from '../security/certificatePinner';

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'TIMEOUT';

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: ApiErrorCode
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// --- Token refresh queue ---
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string): void {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function handleTokenRefresh(): Promise<string> {
  const tokens = await secureStorage.getTokens();
  if (!tokens?.refreshToken) {
    throw new ApiError(401, 'No refresh token available', 'AUTH_ERROR');
  }

  const response = await fetch(`${API.BASE_URL}${API.endpoints.auth.refreshToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });

  if (!response.ok) {
    await secureStorage.clearTokens();
    throw new ApiError(401, 'Session expired', 'AUTH_ERROR');
  }

  const result: unknown = await response.json();
  // Type-guard the response shape
  const data = (result as { data: { accessToken: string; refreshToken: string } }).data;
  const newTokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + 3_600_000,
  };

  await secureStorage.saveTokens(newTokens);
  return newTokens.accessToken;
}

/**
 * Production-grade API client with:
 * - Bearer token injection from SecureStore
 * - 401 → token refresh → retry original request
 * - Exponential backoff retry for network/5xx errors (max 3 attempts)
 * - 10s request timeout
 * - All errors logged to Sentry
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = API.MAX_RETRIES,
  backoff: number = API.INITIAL_BACKOFF_MS
): Promise<T> {
  // 1. Offline check
  const networkState = await Network.getNetworkStateAsync();
  if (!networkState.isConnected || !networkState.isInternetReachable) {
    throw new ApiError(0, 'No internet connection', 'NETWORK_ERROR');
  }

  // 2. Attach auth header
  const tokens = await secureStorage.getTokens();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(tokens?.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
    ...(retries < API.MAX_RETRIES ? { 'X-Retry-Count': String(API.MAX_RETRIES - retries) } : {}),
    ...(options.headers ?? {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API.BASE_URL}${endpoint}`;

  // Certificate pinning — block requests to unlisted hosts
  CertificatePinner.validateRequestUrl(url);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT_MS);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Certificate pinning — validate fingerprint header in production
    CertificatePinner.validateResponse(url, response);

    // 3. Handle 401 — token refresh
    if (
      response.status === 401 &&
      !endpoint.includes('login') &&
      !endpoint.includes('refresh-token')
    ) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await handleTokenRefresh();
          isRefreshing = false;
          onRefreshed(newToken);
        } catch (refreshError) {
          isRefreshing = false;
          Sentry.captureException(refreshError);
          throw refreshError;
        }
      }

      // Queue this request until token is refreshed
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh((token) => resolve(token));
      });

      return apiClient<T>(endpoint, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
      });
    }

    // 4. Handle 5xx — retry with exponential backoff
    if (!response.ok) {
      if (response.status >= 500 && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return apiClient<T>(endpoint, options, retries - 1, backoff * 2);
      }

      const errorData: { message?: string } = await response.json().catch(() => ({}));
      const apiError = new ApiError(
        response.status,
        errorData.message ?? response.statusText,
        response.status === 404
          ? 'NOT_FOUND'
          : response.status >= 400 && response.status < 500
            ? 'VALIDATION_ERROR'
            : 'SERVER_ERROR'
      );
      Sentry.captureException(apiError);
      throw apiError;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;

    const err = error as { name?: string; message?: string };
    if (err.name === 'AbortError') {
      const timeoutError = new ApiError(408, 'Request timeout', 'TIMEOUT');
      Sentry.captureException(timeoutError);
      throw timeoutError;
    }

    // Network error with retry
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return apiClient<T>(endpoint, options, retries - 1, backoff * 2);
    }

    const networkError = new ApiError(
      500,
      err.message ?? 'Unknown error',
      'NETWORK_ERROR'
    );
    Sentry.captureException(networkError);
    throw networkError;
  }
}
