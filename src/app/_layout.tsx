import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { notificationService } from '@/services/notifications/notificationService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

import './global.css'; // NativeWind v4 requires importing global CSS 

export default function RootLayout() {
  const { user, isHydrated, validateSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    validateSession();
    notificationService.requestPermissions().then((granted: boolean) => {
      if (granted) notificationService.resetInactivityTimer();
    });
  }, []);

  useEffect(() => {
    if (!isHydrated || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    const timeout = setTimeout(() => {
      if (!user && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [user, segments, isHydrated, navigationState?.key]);

  if (!isHydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <OfflineBanner />
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="preferences" options={{ headerShown: false }} />
          <Stack.Screen name="course/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="webview/[id]" options={{ presentation: 'fullScreenModal' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
