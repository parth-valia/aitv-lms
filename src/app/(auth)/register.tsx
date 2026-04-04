import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, Link } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/services/api/auth";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const registerSchema = z.object({
  name: z.string().min(2, "Full Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { control, handleSubmit, watch, setError, clearErrors, formState } =
    useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
      defaultValues: { name: "", username: "", email: "", password: "" },
    });

  const { errors, isSubmitting } = formState;
  const usernameValue = watch("username");

  useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) {
      setUsernameStatus("idle");
      clearErrors("username");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(usernameValue)) {
      setUsernameStatus("idle");
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus("checking");
      try {
        const isAvailable = await authApi.checkUsernameAvailability(
          usernameValue.toLowerCase(),
        );
        if (isAvailable) {
          setUsernameStatus("available");
          clearErrors("username");
        } else {
          setUsernameStatus("taken");
          setError("username", {
            type: "manual",
            message: "Username is already taken",
          });
        }
      } catch (error) {
        setUsernameStatus("idle");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [usernameValue, setError, clearErrors]);

  const getUsernameRightIcon = () => {
    if (usernameStatus === "checking")
      return <Loader2 size={18} color="#4c49c9" className="animate-spin" />;
    if (usernameStatus === "available")
      return <CheckCircle2 size={18} color="#10b981" />;
    if (usernameStatus === "taken")
      return <XCircle size={18} color="#ef4444" />;
    return null;
  };

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        await authApi.register({
          username: data.username.toLowerCase(),
          email: data.email,
          password: data.password,
          role: "USER",
        });
        await login({
          email: data.email,
          password: data.password,
        });
        router.replace("/(tabs)");
      } catch (error) {
        Alert.alert(
          "Registration Failed",
          error instanceof Error ? error.message : "An error occurred",
        );
      }
    },
    [login, router],
  );

  return (
    <View className="flex-1 bg-[#f5f7f9]">
      {/* Decorative Extra Large Typography */}
      <View className="absolute top-20 left-4 opacity-5 pointer-events-none">
        <Text className="text-[140px] font-black tracking-tighter leading-none text-[#2c2f31]">
          AI
        </Text>
      </View>
      <View className="absolute bottom-10 right-4 opacity-5 pointer-events-none">
        <Text className="text-[120px] font-black tracking-tighter leading-none text-[#2c2f31]">
          TV
        </Text>
      </View>

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingVertical: isLandscape ? 16 : 40,
              justifyContent: "center",
              flexDirection: isLandscape ? "row" : "column",
              alignItems: isLandscape ? "center" : "stretch",
              gap: isLandscape ? 24 : 0,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Branding Header */}
            <Animated.View
              entering={FadeInDown.delay(100)}
              style={isLandscape ? { flex: 1, alignItems: "center", justifyContent: "center" } : undefined}
              className={isLandscape ? "" : "items-center mb-10 space-y-4"}
            >
              <View className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-slate-50 items-center justify-center mb-2">
                <GraduationCap size={44} color="#4c49c9" strokeWidth={1.5} />
              </View>
              <View className="items-center">
                <Text className="text-[36px] font-black tracking-tight text-[#4c49c9] mb-1">
                  Create Account
                </Text>
                <Text className="text-[#595c5e] font-medium text-[15px]">
                  Join the next generation of learners.
                </Text>
              </View>
            </Animated.View>

            {/* Register Card */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={isLandscape ? { flex: 1 } : undefined}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 w-full mb-8"
            >
              <Input
                control={control}
                name="name"
                label="Full Name"
                placeholder="Alex Rivera"
                error={errors.name?.message}
                leftIcon={<User size={20} color="#747779" />}
              />

              <Input
                control={control}
                name="username"
                label="Username"
                placeholder="arivera_24"
                error={errors.username?.message}
                leftIcon={<User size={20} color="#747779" />}
                rightIcon={getUsernameRightIcon()}
                autoCapitalize="none"
              />

              <Input
                control={control}
                name="email"
                label="Email Address"
                placeholder="name@company.com"
                keyboardType="email-address"
                error={errors.email?.message}
                leftIcon={<Mail size={20} color="#747779" />}
              />

              <Input
                control={control}
                name="password"
                label="Password"
                placeholder="••••••••"
                isPassword
                error={errors.password?.message}
                leftIcon={<Lock size={20} color="#747779" />}
              />

              {/* Primary CTA */}
              <View className="mb-2 mt-4">
                <Button
                  title="Sign Up"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  rightIcon={<ArrowRight size={22} color="#ffffff" />}
                />
              </View>
            </Animated.View>

            {/* Footer */}
            <Animated.View entering={FadeIn.delay(300)} className="flex-row items-center justify-center py-2 mb-6">
              <Text className="text-[#595c5e] text-sm">Already have an account? </Text>
              <Button
                variant="link"
                onPress={() => router.push("/(auth)/login")}
                title="Sign In"
                textClassName="text-[#4c49c9] font-bold text-sm underline"
              />
            </Animated.View>

            <Animated.View
              entering={FadeIn.delay(300)}
              className="items-center space-y-6"
            >
              <View className="flex-row items-center justify-center gap-5">
                <TouchableOpacity>
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-[#747779]">
                    Privacy
                  </Text>
                </TouchableOpacity>
                <View className="w-1 h-1 rounded-full bg-[#abadaf]" />
                <TouchableOpacity>
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-[#747779]">
                    Terms
                  </Text>
                </TouchableOpacity>
                <View className="w-1 h-1 rounded-full bg-[#abadaf]" />
                <TouchableOpacity>
                  <Text className="text-[10px] font-bold uppercase tracking-widest text-[#747779]">
                    Help
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
