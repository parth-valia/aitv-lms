import { Tabs } from "expo-router";
import { Platform, View, useColorScheme, useWindowDimensions } from "react-native";
import { Home, Bookmark, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
    const { bottom, left: insetsLeft, right: insetsRight } = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 24 : 24 + bottom,
          left: isLandscape ? Math.max(20, insetsLeft + 12) : 20,
          right: isLandscape ? Math.max(20, insetsRight + 12) : 20,
          borderRadius: 32,
          backgroundColor: dark ? 'rgba(18, 20, 30, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          height: 64,
          elevation: 10,
          shadowColor: '#4f46e5',
          shadowOpacity: dark ? 0.25 : 0.1,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
          borderTopWidth: 1,
          borderTopColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
          paddingBottom: 0,
          marginHorizontal: 24,
        },
        tabBarItemStyle: {
          paddingVertical: 12,
        },
        tabBarActiveTintColor: dark ? "#c3c0ff" : "#3525cd",
        tabBarInactiveTintColor: dark ? "#4a5068" : "#777587",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, focused }) => (
            <View className={`px-4 py-2 rounded-[16px] ${focused ? (dark ? 'bg-[#2d2b5e]' : 'bg-[#e2dfff]/60') : ''}`}>
              <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: "Bookmarks",
          tabBarIcon: ({ color, focused }) => (
            <View className={`px-4 py-2 rounded-[16px] ${focused ? (dark ? 'bg-[#2d2b5e]' : 'bg-[#e2dfff]/60') : ''}`}>
              <Bookmark color={color} size={24} strokeWidth={focused ? 2.5 : 2} fill={focused ? color : 'transparent'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View className={`px-4 py-2 rounded-[16px] ${focused ? (dark ? 'bg-[#2d2b5e]' : 'bg-[#e2dfff]/60') : ''}`}>
              <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
