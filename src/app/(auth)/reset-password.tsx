import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authApi } from '@/services/api/auth';
import { Lock, Key, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await authApi.resetPassword(data.token, data.newPassword);
      Alert.alert(
        'Success',
        'Your password has been reset successfully. Please login with your new password.',
        [{ text: 'Login', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error) {
      Alert.alert('Reset Failed', error instanceof Error ? error.message : 'Invalid or expired token');
    }
  };

  return (
    <View className="flex-1 bg-[#f5f7f9] dark:bg-[#0b0f10]">
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 pt-6">
              <Button
                variant="ghost"
                onPress={() => router.back()}
                className="w-10 h-10 bg-white dark:bg-[#1c2125] rounded-full items-center justify-center shadow-sm mb-8 p-0"
                leftIcon={<ChevronLeft size={24} color="#2c2f31" />}
              />

              <Text className="text-3xl font-extrabold text-[#2c2f31] dark:text-[#f4f1ff] tracking-tight mb-4">
                Reset Password
              </Text>
              <Text className="text-[#595c5e] dark:text-[#9a9d9f] text-lg mb-8">
                Enter the reset token sent to {email || 'your email'} and your new password.
              </Text>

              <View className="space-y-6">
                <Input
                  control={control}
                  name="token"
                  label="Reset Token"
                  placeholder="Paste token from email"
                  error={errors.token?.message}
                  leftIcon={<Key size={20} color="#747779" />}
                  autoCapitalize="none"
                />

                <Input
                  control={control}
                  name="newPassword"
                  label="New Password"
                  placeholder="••••••••"
                  error={errors.newPassword?.message}
                  leftIcon={<Lock size={20} color="#747779" />}
                  isPassword
                />

                <Input
                  control={control}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="••••••••"
                  error={errors.confirmPassword?.message}
                  leftIcon={<Lock size={20} color="#747779" />}
                  isPassword
                />

                <View className="h-4" />

                <Button 
                  title="Reset Password" 
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  className="bg-[#4c49c9] rounded-xl h-14"
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
