// src/lib/sentry.ts
import * as Sentry from '@sentry/react-native';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    debug: __DEV__,
    enableNative: !__DEV__,
  });
};
