import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  Image,
  useWindowDimensions,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, Link } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  Fingerprint,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePreferencesStore } from "@/store/preferencesStore";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeInRight,
} from "react-native-reanimated";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const validateSession = useAuthStore((state) => state.validateSession);
  const { biometricsEnabled } = usePreferencesStore();

  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleBiometricLogin = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert("Error", "Biometrics not available on this device.");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Sign in to AITV LMS",
      fallbackLabel: "Use Password",
    });

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      try {
        await validateSession();
        router.replace("/(tabs)");
      } catch (error) {
        Alert.alert(
          "Session Expired",
          "Please log in with your email and password once more.",
        );
      }
    }
  };

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        await login(data);
        router.replace("/(tabs)");
      } catch (error) {
        Alert.alert(
          "Login Failed",
          error instanceof Error ? error.message : "Invalid credentials",
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
              paddingVertical: isLandscape ? 16 : 48,
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
                  AITV LMS
                </Text>
                <Text className="text-[#595c5e] font-medium text-[15px]">
                  Empowering the next generation.
                </Text>
              </View>
            </Animated.View>

            {/* Login Card */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={isLandscape ? { flex: 1 } : undefined}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 w-full mb-8"
            >
              <Input
                control={control}
                name="email"
                label="Email Address"
                placeholder="name@company.com"
                keyboardType="email-address"
                error={errors.email?.message}
                leftIcon={<Mail size={20} color="#747779" />}
              />

              <View className="mb-2">
                <View className="flex-row items-center justify-between px-1 absolute z-10 w-full">
                  {/* Invisible spacer since Input defines its own label, we just want to float the Forgot Password button aligned to it */}
                  <View />
                  <Link href="/(auth)/forgot-password" asChild>
                    <TouchableOpacity>
                      <Text className="text-[11px] font-bold uppercase tracking-wider text-[#4c49c9]">
                        Forgot?
                      </Text>
                    </TouchableOpacity>
                  </Link>
                </View>
                <Input
                  control={control}
                  name="password"
                  label="Password"
                  placeholder="••••••••"
                  isPassword
                  error={errors.password?.message}
                  leftIcon={<Lock size={20} color="#747779" />}
                />
              </View>

              {/* Primary CTA */}
              <View className="mb-6">
                <Button
                  title="Sign In"
                  onPress={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  rightIcon={<ArrowRight size={22} color="#ffffff" />}
                />
              </View>

              {biometricsEnabled && (
                <Button
                  variant="secondary"
                  onPress={handleBiometricLogin}
                  className="mb-6"
                  leftIcon={<Fingerprint size={20} color="#4c49c9" />}
                  title="Log in with Biometrics"
                  textClassName="text-sm"
                />
              )}
            </Animated.View>

            {/* Footer Links */}
            <Animated.View
              entering={FadeIn.delay(300)}
              className="items-center space-y-6"
            >
              <View className="flex-row items-center justify-center py-2">
                <Text className="text-[#595c5e] text-sm">
                  Don't have an account?{" "}
                </Text>
                <Button
                  variant="link"
                  onPress={() => router.push("/(auth)/register")}
                  title="Create Account"
                  textClassName="text-[#4c49c9] font-bold text-sm ml-1 underline"
                />
              </View>

              <View className="flex-row items-center justify-center gap-5 pt-4">
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
