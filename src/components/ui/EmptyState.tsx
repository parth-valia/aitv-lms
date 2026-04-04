// src/components/ui/EmptyState.tsx
import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <View className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
        {icon}
      </View>
      <Text className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
        {title}
      </Text>
      <Text className="text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-6">
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="outline" />
      )}
    </View>
  );
}
