// src/components/ui/Skeleton.tsx
import React, { useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

/**
 * Animated skeleton placeholder using Reanimated v3.
 * Uses opacity pulse animation (no LinearGradient dependency needed).
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  className = '',
  style,
  ...props
}: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: '#e2e8f0',
        },
        animatedStyle,
        style,
      ]}
      className={className}
      {...props}
    />
  );
}
