// src/components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends TouchableOpacityProps {
  title?: string;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  textClassName?: string;
}

export function Button({
  title,
  loading,
  variant = 'primary',
  size = 'md',
  className = '',
  textClassName = '',
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return 'bg-transparent border border-[#4c49c9]';
      case 'secondary':
        return 'bg-[#eef1f3]';
      case 'ghost':
        return 'bg-transparent';
      case 'link':
        return 'bg-transparent p-0 h-auto';
      default:
        return 'bg-[#4c49c9]';
    }
  };

  const getTextColor = () => {
    if (disabled) return 'text-[#abadaf]';
    switch (variant) {
      case 'outline':
      case 'ghost':
      case 'link':
        return 'text-[#4c49c9]';
      case 'secondary':
        return 'text-[#2c2f31]';
      default:
        return 'text-white';
    }
  };

  const getSizeStyles = () => {
    if (variant === 'link') return '';
    switch (size) {
      case 'sm':
        return 'h-10 px-4 rounded-lg';
      case 'lg':
        return 'h-14 px-8 rounded-2xl';
      case 'xl':
        return 'h-16 px-10 rounded-3xl';
      default:
        return 'h-12 px-6 rounded-xl';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
      case 'xl':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <TouchableOpacity
      className={`flex-row justify-center items-center relative overflow-hidden ${getSizeStyles()} ${getVariantStyles()} ${
        disabled || loading ? 'opacity-70' : ''
      } ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#4c49c9' : '#ffffff'} />
      ) : (
        <>
          {leftIcon && (
            <View className={title ? 'mr-3' : ''}>
              {leftIcon}
            </View>
          )}
          
          {title && (
            <Text className={`font-bold tracking-wide ${getTextColor()} ${/\btext-(xs|sm|base|lg|xl|2xl|\d)/i.test(textClassName) ? '' : getFontSize()} ${textClassName}`}>
              {title}
            </Text>
          )}
          
          {rightIcon && (
            <View className={title ? 'ml-3' : ''}>
              {rightIcon}
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
