import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-slate-900 px-6">
      <Text className="text-6xl font-extrabold text-brand-600 mb-4">404</Text>
      <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Page Not Found
      </Text>
      <Text className="text-slate-500 dark:text-slate-400 text-center mb-8">
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Button
        title="Go Home"
        onPress={() => router.replace('/(tabs)')}
        className="w-full"
      />
    </View>
  );
}
