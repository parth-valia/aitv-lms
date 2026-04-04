// src/components/ui/Badge.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
}

const VARIANT_STYLES = {
  primary: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
  neutral: {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-600 dark:text-slate-400',
  },
} as const;

export function Badge({ label, variant = 'primary', size = 'sm' }: BadgeProps) {
  const styles = VARIANT_STYLES[variant];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSize = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <View className={`${styles.bg} ${sizeClass} rounded-md self-start`}>
      <Text
        className={`${styles.text} ${textSize} font-bold uppercase tracking-wider`}
      >
        {label}
      </Text>
    </View>
  );
}
