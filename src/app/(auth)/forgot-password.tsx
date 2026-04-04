import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'expo-router';
import { authApi } from '@/services/api/auth';
import { Mail, ChevronLeft, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authApi.forgotPassword(data.email);
      Alert.alert(
        'Success',
        'If an account exists with that email, you will receive a reset link shortly.',
        [{ text: 'OK', onPress: () => router.push({ pathname: '/(auth)/reset-password', params: { email: data.email } }) }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong');
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
                Forgot Password?
              </Text>
              <Text className="text-[#595c5e] dark:text-[#9a9d9f] text-lg mb-10">
                Don't worry! It happens. Please enter the email associated with your account.
              </Text>

              <View className="space-y-6">
                <Input
                  control={control}
                  name="email"
                  label="Email Address"
                  placeholder="e.g. alex@example.com"
                  error={errors.email?.message}
                  leftIcon={<Mail size={20} color="#747779" />}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <View className="h-4" />

                <Button 
                  title="Send Reset Link" 
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  className="bg-[#4c49c9] rounded-xl h-14"
                  rightIcon={<ArrowRight size={20} color="white" />}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
