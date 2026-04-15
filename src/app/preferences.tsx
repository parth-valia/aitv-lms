import React from "react";
import {
  View,
  Text,
  Switch,
  Alert,
  TouchableOpacity,
  ScrollView,
  AppState,
  AppStateStatus,
  Linking,
  BackHandler,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ChevronLeft,
  ShieldCheck,
  Fingerprint,
  Bell,
  Palette,
  CheckCircle2,
} from "lucide-react-native";
import { usePreferencesStore, AppIconName } from "@/store/preferencesStore";
import { SecurityService } from "@/services/security";
import * as LocalAuthentication from "expo-local-authentication";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { notificationService } from "@/services/notifications/notificationService";
import { APP_ICONS, appIconService } from "@/services/appIconService";

export default function PreferencesScreen() {
  const {
    biometricsEnabled,
    setBiometricsEnabled,
    selectedAppIcon,
    setSelectedAppIcon,
  } = usePreferencesStore();

  const router = useRouter();

  const [securityStatus, setSecurityStatus] = React.useState<
    "checking" | "secure" | "risky"
  >("checking");
  const [systemNotifPermission, setSystemNotifPermission] = React.useState<
    "granted" | "denied" | "undetermined"
  >();
  const [iconChanging, setIconChanging] = React.useState(false);

  const refreshNotifPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setSystemNotifPermission(status);
  };

  React.useEffect(() => {
    SecurityService.checkDeviceIntegrity().then((res) => {
      setSecurityStatus(res.isSecure ? "secure" : "risky");
    });

    refreshNotifPermission();

    const sub = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") refreshNotifPermission();
      },
    );

    return () => sub.remove();
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

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      if (systemNotifPermission === "granted") {
        await notificationService.scheduleDailyReminder();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return;
      }

      const granted = await notificationService.requestPermissions();
      if (granted) {
        setSystemNotifPermission("granted");
        await notificationService.scheduleDailyReminder();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setSystemNotifPermission("denied");
        Alert.alert(
          "Notifications Blocked",
          "Please enable notifications in your device Settings to receive reminders.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
      }
    } else {
      Alert.alert(
        "Turn Off Notifications",
        "To disable notifications, turn them off in your device Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
    }
  };

  const handleIconSelect = async (iconName: AppIconName) => {
    if (iconName === selectedAppIcon || iconChanging) return;

    setIconChanging(true);
    Haptics.selectionAsync();

    const success = await appIconService.setIcon(iconName);
    if (success) {
      setSelectedAppIcon(iconName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      BackHandler.exitApp();
    } else {
      Alert.alert("Error", "Could not change the app icon. Please try again.");
    }
    setIconChanging(false);
  };

  const handleResetIcon = async () => {
    if (selectedAppIcon === "default" || iconChanging) return;
    setIconChanging(true);
    Haptics.selectionAsync();
    const success = await appIconService.setIcon("default");
    if (success) setSelectedAppIcon("default");
    setIconChanging(false);
  };

  const notifToggleValue = systemNotifPermission === "granted";

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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
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
          <View className="px-6 mt-6">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4 px-1">
              Notifications
            </Text>
            <View className="bg-white dark:bg-[#1c2125] rounded-2xl p-6 shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-4 flex-1">
                  <View className="w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-xl items-center justify-center">
                    <Bell size={20} color="#f97316" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#191c1e] dark:text-white font-semibold text-base">
                      Push Notifications
                    </Text>
                    <Text className="text-[#9ca3af] text-xs font-medium mt-0.5">
                      {systemNotifPermission === "denied"
                        ? "Blocked in device settings"
                        : notifToggleValue
                          ? "Reminders & course updates on"
                          : "Course reminders & milestones"}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifToggleValue}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: "#e2e8f0", true: "#f97316" }}
                  thumbColor="#ffffff"
                />
              </View>
            </View>
          </View>

          <View className="px-6 mt-6">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4 px-1">
              App Icon
            </Text>
            <View className="bg-white dark:bg-[#1c2125] rounded-2xl p-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-xl items-center justify-center">
                    <Palette size={20} color="#9333ea" />
                  </View>
                  <View>
                    <Text className="text-[#191c1e] dark:text-white font-semibold text-base">
                      Choose App Icon
                    </Text>
                    <Text className="text-[#9ca3af] text-xs font-medium mt-0.5">
                      Changes take effect on your home screen
                    </Text>
                  </View>
                </View>
                {selectedAppIcon !== "default" && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleResetIcon}
                    disabled={iconChanging}
                    className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] dark:bg-[#2d3133]"
                  >
                    <Text className="text-[11px] font-bold text-[#515f74] dark:text-[#9ca3af]">
                      Reset
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View className="flex-row flex-wrap gap-4">
                {APP_ICONS.map((icon) => {
                  const isSelected = selectedAppIcon === icon.name;
                  return (
                    <TouchableOpacity
                      key={icon.name}
                      activeOpacity={0.75}
                      onPress={() => handleIconSelect(icon.name)}
                      disabled={iconChanging}
                      className="items-center gap-2"
                    >
                      <View
                        className={`rounded-[18px] overflow-hidden ${
                          isSelected
                            ? "border-[3px] border-purple-500"
                            : "border-[2px] border-transparent"
                        }`}
                        style={{ width: 60, height: 60 }}
                      >
                        <Image
                          source={icon.image}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          recyclingKey={icon.name}
                        />
                        {isSelected && (
                          <View className="absolute bottom-0 right-0 bg-purple-500 rounded-tl-lg w-5 h-5 items-center justify-center">
                            <CheckCircle2 size={12} color="#ffffff" />
                          </View>
                        )}
                      </View>
                      <Text
                        className={`text-[10px] font-semibold ${
                          isSelected
                            ? "text-purple-500"
                            : "text-[#9ca3af] dark:text-[#6b7280]"
                        }`}
                      >
                        {icon.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
