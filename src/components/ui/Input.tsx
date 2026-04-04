// src/components/ui/Input.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from "react-native";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps<T extends FieldValues> extends TextInputProps {
  label?: string;
  name?: Path<T>;
  control?: Control<T>;
  error?: string | undefined;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export function Input<T extends FieldValues>({
  label,
  name,
  control,
  error,
  leftIcon,
  rightIcon,
  isPassword,
  className,
  ...props
}: InputProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // The raw base UI for the input field
  const renderBaseInput = (
    value: string | undefined,
    onChange: ((value: string) => void) | undefined,
    onBlur: (() => void) | undefined
  ) => (
    <View
      className={`h-14 bg-[#eef1f3] rounded-xl px-4 flex-row items-center border-[1.5px] ${
        error
          ? "border-red-500 bg-white"
          : isFocused
          ? "border-[#9695ff] bg-white"
          : "border-transparent"
      } ${className || ""}`}
    >
      {leftIcon && <View className="mr-3">{leftIcon}</View>}
      <TextInput
        className="flex-1 h-full text-[#2c2f31] font-medium"
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          if (onBlur) onBlur();
        }}
        onChangeText={(text) => {
          if (onChange) onChange(text);
          if (props.onChangeText) props.onChangeText(text);
        }}
        value={value ?? props.value}
        placeholderTextColor="#747779"
        autoCapitalize="none"
        secureTextEntry={isPassword && !isPasswordVisible}
        {...props}
      />
      {isPassword ? (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          className="flex-row items-center ml-2"
        >
          {isPasswordVisible ? (
            <EyeOff size={20} color={isFocused ? '#4c49c9' : '#747779'} />
          ) : (
            <Eye size={20} color={isFocused ? '#4c49c9' : '#747779'} />
          )}
        </TouchableOpacity>
      ) : (
        rightIcon && (
          <View className="flex-row items-center ml-2">{rightIcon}</View>
        )
      )}
    </View>
  );

  return (
    <View className="mb-4">
      {label && (
        <View className="px-1 mb-2">
          <Text className="text-[11px] font-bold uppercase tracking-wider text-[#595c5e]">
            {label}
          </Text>
        </View>
      )}
      
      {control && name ? (
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, onBlur, value } }) => 
            renderBaseInput(value, onChange, onBlur)
          }
        />
      ) : (
        renderBaseInput(undefined, undefined, undefined)
      )}
      
      {error && <Text className="text-red-500 text-xs mt-1 ml-1 font-medium">{error}</Text>}
    </View>
  );
}
