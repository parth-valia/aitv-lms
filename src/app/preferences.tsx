import React from "react";
import { View, Text, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ShieldCheck, Fingerprint } from "lucide-react-native";
import { usePreferencesStore } from "@/store/preferencesStore";
import { SecurityService } from "@/services/security";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";

export default function PreferencesScreen() {
  const { biometricsEnabled, setBiometricsEnabled } = usePreferencesStore();
  const router = useRouter();

  const [securityStatus, setSecurityStatus] = React.useState<
    "checking" | "secure" | "risky"
  >("checking");

  React.useEffect(() => {
    SecurityService.checkDeviceIntegrity().then((res) => {
      setSecurityStatus(res.isSecure ? "secure" : "risky");
    });
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          "Not Supported",
          "Your device does not support biometrics or they are not set up.",
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm Identity for AITV LMS",
      });

      if (result.success) {
        setBiometricsEnabled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setBiometricsEnabled(false);
    }
  };

  return (
    <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10]">
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-[#f2f4f6] dark:bg-[#1c2125] items-center justify-center"
          >
            <ChevronLeft size={22} color="#515f74" />
          </TouchableOpacity>
          <Text className="text-xl font-black text-[#191c1e] dark:text-white tracking-tight">
            Preferences
          </Text>
        </View>

        {/* Security & Access */}
        <View className="px-6 mt-4">
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4 px-1">
            Security & Access
          </Text>
          <View className="bg-white dark:bg-[#1c2125] rounded-2xl p-6 shadow-sm gap-6">
            {/* Device Integrity */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-xl items-center justify-center">
                  <ShieldCheck size={20} color="#16a34a" />
                </View>
                <View>
                  <Text className="text-[#191c1e] dark:text-white font-semibold text-base">
                    Device Integrity
                  </Text>
                  <Text className="text-[#9ca3af] text-xs font-medium mt-0.5">
                    {securityStatus === "checking"
                      ? "Checking..."
                      : securityStatus === "secure"
                        ? "Environment Secure"
                        : "Risk Detected"}
                  </Text>
                </View>
              </View>
              <View
                className={`px-3 py-1 rounded-full ${securityStatus === "secure" ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}
              >
                <Text
                  className={`text-[10px] font-black uppercase tracking-wider ${securityStatus === "secure" ? "text-green-600" : "text-red-600"}`}
                >
                  {securityStatus}
                </Text>
              </View>
            </View>

            {/* Biometric Unlock */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 bg-[#eef2ff] dark:bg-[#1e1b4b] rounded-xl items-center justify-center">
                  <Fingerprint size={20} color="#4f46e5" />
                </View>
                <View>
                  <Text className="text-[#191c1e] dark:text-white font-semibold text-base">
                    Biometric Unlock
                  </Text>
                  <Text className="text-[#9ca3af] text-xs font-medium mt-0.5">
                    Require FaceID / TouchID
                  </Text>
                </View>
              </View>
              <Switch
                value={biometricsEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: "#e2e8f0", true: "#4f46e5" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
