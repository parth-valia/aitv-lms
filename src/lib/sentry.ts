// src/lib/sentry.ts
import * as Sentry from '@sentry/react-native';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    debug: __DEV__,

    // Sample 100% of transactions in dev; lower this in production
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,

    // Adds IP address, cookies, user agent, etc. to events
    sendDefaultPii: true,

    // Structured log forwarding (Sentry Logs feature)
    enableLogs: false,

    // Session Replay — 10% of normal sessions, 100% on error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    integrations: [Sentry.mobileReplayIntegration()],
  });
};
