// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import * as Sentry from '@sentry/react-native';
import { ApiError } from '@/services/api/apiClient';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // 5 min
      gcTime: 30 * 60 * 1000,          // 30 min
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.statusCode < 500) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: 'always',
    },
    mutations: {
      onError: (error) => Sentry.captureException(error),
    },
  },
});
