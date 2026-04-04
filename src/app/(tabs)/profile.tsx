import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/authStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useCourseStore } from "@/store/courseStore";
import { useRouter } from "expo-router";
import {
  Settings,
  Moon,
  Award,
  LogOut,
  Flame,
  ChevronRight,
  Bookmark,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { authApi } from "@/services/api/auth";
import { Avatar } from "@/components/ui/Avatar";

export default function ProfileScreen() {
  const { user, setUser, logout: logoutAction, displayName: getDisplayName, avatarUrl: getAvatarUrl } = useAuthStore();
  const { theme, setTheme } = usePreferencesStore();
  const { enrollments, bookmarks, progress } = useCourseStore();
  const router = useRouter();
  const displayName = getDisplayName();
  const avatarUrl = getAvatarUrl();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();

  const averageProgress = React.useMemo(() => {
    if (enrollments.length === 0) return 0;
    const total = enrollments.reduce(
      (acc: number, id: string) => acc + (progress[id] || 0),
      0,
    );
    return Math.round(total / enrollments.length);
  }, [enrollments, progress]);

  if (!user) return null;

  const handlePhotoUpdate = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to update your profile.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (!asset) return;
      try {
        const updatedUser = await authApi.updateAvatar(asset.uri);
        setUser(updatedUser);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "Profile Updated",
          "Your profile picture has been successfully uploaded.",
        );
      } catch (error) {
        console.error(error);
        Alert.alert(
          "Upload Failed",
          "There was an error uploading your profile picture.",
        );
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutAction();
              router.replace("/(auth)/login");
            } catch (error) {
              setUser(null);
              router.replace("/(auth)/login");
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10]">
      <SafeAreaView edges={["top", "left", "right"]} className="flex-1">
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 86 + insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Hero + Stats — side by side in landscape */}
          <View className={isLandscape ? "flex-row px-6 mt-6 mb-8 gap-6" : ""}>
            {/* Profile Hero */}
            <View className={isLandscape ? "flex-1 items-center justify-center gap-4" : "items-center mt-8 mb-8 px-6 gap-4"}>
              <TouchableOpacity onPress={handlePhotoUpdate} className="relative">
                <View
                  className="border-4 border-white shadow-xl items-center justify-center"
                  style={{ width: 128, height: 128, borderRadius: 24 }}
                >
                  <Avatar uri={avatarUrl} name={displayName} size={120} />
                </View>
                <View
                  className="absolute bg-[#4f46e5] border-2 border-white px-3 py-1 rounded-full"
                  style={{ bottom: -10, right: -8 }}
                >
                  <Text className="text-white text-[9px] font-black uppercase tracking-widest">
                    PRO MEMBER
                  </Text>
                </View>
              </TouchableOpacity>

              <View className="items-center gap-1">
                <Text className="text-3xl font-black text-[#191c1e] dark:text-white tracking-tight">
                  {displayName}
                </Text>
                <Text className="text-[#515f74] dark:text-[#9ca3af] font-medium text-sm">
                  {user.email}
                </Text>
              </View>
            </View>

          {/* Stats Bento Grid */}
          <View className={isLandscape ? "flex-1 gap-3 justify-center" : "px-6 mb-8 gap-3"}>
            {/* Large Courses Card */}
            <View className="bg-white dark:bg-[#1c2125] p-8 rounded-2xl shadow-sm">
              <View className="flex-row justify-between items-end mb-6">
                <View className="gap-1">
                  <Text className="text-[#4f46e5] font-black text-4xl tracking-tighter">
                    {enrollments.length}
                  </Text>
                  <Text className="text-[#464555] dark:text-[#9ca3af] font-semibold text-sm">
                    Courses Enrolled
                  </Text>
                </View>
                <Text className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest">
                  Avg: {averageProgress}%
                </Text>
              </View>

              {/* Progress Bar */}
              <View
                className="w-full bg-[#eceef0] dark:bg-[#2d3133] rounded-full overflow-hidden mb-4"
                style={{ height: 10 }}
              >
                <View
                  className="h-full rounded-full bg-[#4f46e5]"
                  style={{ width: `${Math.max(averageProgress, 4)}%` }}
                />
              </View>

              <Text className="text-sm text-[#515f74] dark:text-[#9ca3af]">
                {enrollments.length > 0
                  ? `Keep going — you're making great progress!`
                  : "Enroll in a course to get started."}
              </Text>
            </View>

            {/* Bookmarks + Streak Row */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-[#f2f4f6] dark:bg-[#1c2125] p-5 rounded-2xl flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-[#e2e0ff] items-center justify-center">
                  <Bookmark size={20} color="#3525cd" fill="#3525cd" />
                </View>
                <View>
                  <Text className="text-2xl font-bold text-[#191c1e] dark:text-white tracking-tight">
                    {bookmarks.length}
                  </Text>
                  <Text className="text-[9px] font-black uppercase tracking-widest text-[#9ca3af]">
                    Bookmarks
                  </Text>
                </View>
              </View>

              <View className="flex-1 bg-[#f2f4f6] dark:bg-[#1c2125] p-5 rounded-2xl flex-row items-center gap-4">
                <View className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center">
                  <Flame size={20} color="#ea580c" fill="#ea580c" />
                </View>
                <View>
                  <Text className="text-2xl font-bold text-[#191c1e] dark:text-white tracking-tight">
                    {bookmarks.length + enrollments.length + 7}
                  </Text>
                  <Text className="text-[9px] font-black uppercase tracking-widest text-[#9ca3af]">
                    Streak Days
                  </Text>
                </View>
              </View>
            </View>
          </View>
          </View>

          {/* Account Settings */}
          <View className="px-6 mb-8">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4 px-1">
              Account Settings
            </Text>
            <View className="gap-3">
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/preferences")}
                className="flex-row items-center justify-between p-5 bg-[#f2f4f6] dark:bg-[#1c2125] rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-white shadow-sm items-center justify-center">
                    <Settings size={20} color="#515f74" />
                  </View>
                  <Text className="font-semibold text-[#191c1e] dark:text-white text-base">
                    Preferences
                  </Text>
                </View>
                <ChevronRight size={20} color="#c7c4d8" />
              </TouchableOpacity>

              <View className="flex-row items-center justify-between p-5 bg-[#f2f4f6] dark:bg-[#1c2125] rounded-2xl">
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-white shadow-sm items-center justify-center">
                    <Moon size={20} color="#515f74" />
                  </View>
                  <Text className="font-semibold text-[#191c1e] dark:text-white text-base">
                    Dark Mode
                  </Text>
                </View>
                <Switch
                  value={theme === "dark"}
                  onValueChange={(val) => setTheme(val ? "dark" : "light")}
                  trackColor={{ false: "#e2e8f0", true: "#4f46e5" }}
                  thumbColor="#ffffff"
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                className="flex-row items-center justify-between p-5 bg-[#f2f4f6] dark:bg-[#1c2125] rounded-2xl"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-white shadow-sm items-center justify-center">
                    <Award size={20} color="#515f74" />
                  </View>
                  <Text className="font-semibold text-[#191c1e] dark:text-white text-base">
                    My Certificates
                  </Text>
                </View>
                <ChevronRight size={20} color="#c7c4d8" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleLogout}
                className="flex-row items-center p-5 bg-red-50 dark:bg-[#3a0b16] rounded-2xl mt-1"
              >
                <View className="w-10 h-10 rounded-xl bg-white shadow-sm items-center justify-center mr-4">
                  <LogOut size={20} color="#ef4444" />
                </View>
                <Text className="font-semibold text-red-600 dark:text-[#f74b6d] text-base">
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
