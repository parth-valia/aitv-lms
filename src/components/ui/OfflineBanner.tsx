import React from 'react';
import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetwork } from '@/hooks/useNetwork';

export const OfflineBanner = () => {
  const { isConnected } = useNetwork();

  if (isConnected) return null;

  return (
    <View className="bg-red-500 py-1 px-4 flex-row items-center justify-center">
      <WifiOff size={14} color="white" />
      <Text className="text-white text-xs font-bold ml-2">
        Offline Mode - Some features may be limited
      </Text>
    </View>
  );
};
