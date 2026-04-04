import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  useColorScheme,
  useWindowDimensions,
  TextInput,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { coursesApi } from "@/services/api/courses";
import { FlashList } from "@shopify/flash-list";
import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton";
import { Course } from "@/types/course";
import { Search, X, BookOpen, Zap } from "lucide-react-native";
import { useCourseStore } from "@/store/courseStore";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useDebounce } from "@/hooks/useDebounce";
import { CourseFeedCard } from "@/components/course/CourseFeedCard";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/store/authStore";

const CATEGORIES = [
  "All",
  "Design",
  "Code",
  "Marketing",
  "Business",
  "Soft Skills",
];

export default function DiscoverScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const searchQuery = useDebounce(searchTerm, 700);
  const dark = useColorScheme() === "dark";
  const inputRef = useRef<TextInput>(null);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();
  const { displayName: getDisplayName, avatarUrl: getAvatarUrl } =
    useAuthStore();
  const avatarUrl = getAvatarUrl();
  const displayName = getDisplayName();

  const {
    enrollments,
    bookmarks,
    toggleBookmark,
    progress: progressMap,
  } = useCourseStore();

  const {
    data: coursesData,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["courses", activeCategory],
    queryFn: () => coursesApi.getCourseList(1, 10, activeCategory),
    placeholderData: keepPreviousData,
  });

  const courses = coursesData?.courses ?? [];

  const resumeCourse = React.useMemo(() => {
    if (!courses.length || !enrollments.length) return null;
    const enrolled = courses.filter((c: Course) => enrollments.includes(c.id));
    if (!enrolled.length) return null;
    return enrolled.reduce((best: Course, c: Course) =>
      (progressMap[c.id] ?? 0) >= (progressMap[best.id] ?? 0) ? c : best,
    );
  }, [courses, enrollments, progressMap]);

  const filteredCourses = React.useMemo(() => {
    if (isLoading) return Array(4).fill({ id: "skeleton" } as Course);
    let result = courses.map((c: Course) => ({
      ...c,
      isBookmarked: bookmarks.includes(c.id),
      isEnrolled: enrollments.includes(c.id),
    }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c: Course) =>
          c.title.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [courses, isLoading, searchQuery, bookmarks, enrollments]);

  const listData = React.useMemo(() => {
    if (filteredCourses.length < 3 || searchQuery.trim())
      return filteredCourses;
    const copy = [...filteredCourses];
    copy.splice(3, 0, { id: "__stats__" } as any);
    return copy;
  }, [filteredCourses, searchQuery]);

  const streakDays = bookmarks.length + enrollments.length + 7;
  const points = enrollments.length * 120 + bookmarks.length * 20 + 2200;

  const handleRefresh = useCallback(async () => {
    setSearchTerm("");
    await refetch();
  }, [refetch]);

  const resumeProgress = resumeCourse
    ? (progressMap[resumeCourse.id] ?? 0)
    : 84;
  const resumeLessons = resumeCourse
    ? Math.floor((resumeProgress / 100) * 15)
    : 12;

  const renderItem = ({ item }: { item: Course & { id: string } }) => {
    if (item.id === "skeleton") {
      return (
        <View className="px-5 mb-5">
          <CourseCardSkeleton />
        </View>
      );
    }

    if (item.id === "__stats__") {
      return (
        <View className="px-5 mb-5">
          <View
            className="bg-[#eef2ff] dark:bg-[#1e1b4b]/60 p-6 rounded-[20px]"
            style={{ minHeight: 180 }}
          >
            <Text className="text-lg font-bold text-[#3525cd] dark:text-[#c3c0ff] mb-1">
              Weekly Goal
            </Text>
            <Text className="text-sm text-[#515f74] dark:text-[#9ca3af] leading-relaxed mb-6">
              You are 2 hours away from your weekly target. Keep the momentum!
            </Text>
            <View className="flex-row gap-3">
              <View
                className="flex-1 bg-white dark:bg-[#1c2125] p-4 rounded-[14px]"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest mb-1">
                  Streak
                </Text>
                <Text className="text-2xl font-black text-[#4f46e5]">
                  {streakDays}
                </Text>
                <Text className="text-xs text-[#515f74] dark:text-[#9ca3af] font-medium">
                  Days
                </Text>
              </View>
              <View
                className="flex-1 bg-white dark:bg-[#1c2125] p-4 rounded-[14px]"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Text className="text-[10px] font-black text-[#9ca3af] uppercase tracking-widest mb-1">
                  Points
                </Text>
                <Text className="text-2xl font-black text-[#4f46e5]">
                  {points.toLocaleString()}
                </Text>
                <Text className="text-xs text-[#515f74] dark:text-[#9ca3af] font-medium">
                  XP
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="px-5 mb-5">
        <CourseFeedCard course={item} onBookmarkToggle={toggleBookmark} />
      </View>
    );
  };

  // Only the scrollable content lives inside ListHeaderComponent — NO TextInput here
  const ListHeader = React.useMemo(
    () => (
      <View>
        {/* Hero card */}
        {!searchTerm && (
          <View className="mx-5 mt-4 mb-5">
            <Pressable
              onPress={() =>
                resumeCourse
                  ? router.push(`/webview/${resumeCourse.id}`)
                  : courses.length > 0 &&
                    router.push(`/course/${courses[0]?.id}`)
              }
              className="rounded-[24px] p-7 overflow-hidden"
              style={{ backgroundColor: "#3525cd", ...(isLandscape ? { minHeight: 160 } : {}) }}
            >
              <View
                className="absolute rounded-full"
                style={{
                  width: 180,
                  height: 180,
                  backgroundColor: "rgba(99,91,255,0.35)",
                  top: -40,
                  right: -40,
                  borderRadius: 90,
                }}
              />
              <View className="relative">
                <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">
                  {resumeCourse ? "Current Session" : "Featured Course"}
                </Text>
                <Text
                  className="text-white text-2xl font-black tracking-tight leading-tight mb-2"
                  numberOfLines={3}
                >
                  {resumeCourse?.title ??
                    courses[0]?.title ??
                    "Neural Architecture & Generative Systems"}
                </Text>
                <Text
                  className="text-indigo-100/70 text-sm mb-6"
                  numberOfLines={2}
                >
                  {resumeCourse?.description ??
                    courses[0]?.description ??
                    "Deep dive into transformer models and attention mechanisms."}
                </Text>
                <View className="mb-4">
                  <View className="flex-row justify-between items-end mb-2">
                    <Text className="text-white text-3xl font-black">
                      {resumeProgress}
                      <Text className="text-lg text-white/60">%</Text>
                    </Text>
                    <Text className="text-white/70 text-sm mb-1">
                      {resumeLessons} / 15 Lessons
                    </Text>
                  </View>
                  <View
                    className="w-full rounded-full overflow-hidden"
                    style={{
                      height: 8,
                      backgroundColor: "rgba(255,255,255,0.15)",
                    }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${resumeProgress}%`,
                        backgroundColor: "#fff",
                      }}
                    />
                  </View>
                </View>
                <View className="self-start bg-white rounded-full px-6 py-3 flex-row items-center gap-2">
                  <Text className="text-[#3525cd] font-bold text-sm">
                    {resumeCourse ? "Resume Session" : "Start Learning"}
                  </Text>
                  <Zap size={14} color="#3525cd" />
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* Category tabs */}
        {!searchTerm && (
          <View className="mb-5 border-b border-[#eceef0] dark:border-[#2d3133]">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setActiveCategory(cat)}
                    className="mr-7 pb-3"
                  >
                    <Text
                      className={`text-sm font-bold ${isActive ? "text-[#3525cd] dark:text-[#c3c0ff]" : "text-[#aaaaaa] dark:text-[#4a5068]"}`}
                    >
                      {cat}
                    </Text>
                    {isActive && (
                      <View
                        className="absolute bottom-0 left-0 right-0 rounded-t-full bg-[#3525cd] dark:bg-[#c3c0ff]"
                        style={{ height: 3 }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Search results label */}
        {searchTerm ? (
          <View className="px-5 mb-4 mt-2">
            <Text className="text-[11px] font-black uppercase tracking-widest text-[#4f46e5] mb-1">
              Results
            </Text>
            <Text className="text-xl font-black text-[#191c1e] dark:text-white">
              "{searchTerm}"
            </Text>
          </View>
        ) : null}
      </View>
      // eslint-disable-next-line react-hooks/exhaustive-deps
    ),
    [
      searchTerm,
      activeCategory,
      resumeCourse,
      courses,
      resumeProgress,
      resumeLessons,
      isLandscape,
    ],
  );

  return (
    <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10]">
      <SafeAreaView edges={["top", "left", "right"]} className="flex-1">
        {/* ── STABLE HEADER: Top bar + Search (never inside FlashList) ── */}
        <View style={{ paddingHorizontal: Math.max(20, insets.left + 12), paddingTop: 16, paddingBottom: 12 }}>
          {/* Top app bar */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-black tracking-tighter text-[#3525cd]">
              AITV LMS
            </Text>
              <Pressable onPress={() => router.push("/(tabs)/profile")}>
                <Avatar uri={avatarUrl} name={displayName} size={40} />
              </Pressable>
          </View>

          {/* Search bar — lives here permanently, never remounted */}
          <View
            className="flex-row items-center bg-white dark:bg-[#1c2125] rounded-[18px] px-4 h-12 border border-[#eceef0] dark:border-[#2d3133]"
            style={{
              shadowColor: "#4f46e5",
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 1,
            }}
          >
            <Search size={17} color={dark ? "#4a5068" : "#aaaaaa"} />
            <TextInput
              ref={inputRef}
              placeholder="Search courses, instructors..."
              placeholderTextColor={dark ? "#4a5068" : "#aaaaaa"}
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 14,
                color: dark ? "#fff" : "#191c1e",
              }}
              returnKeyType="search"
              clearButtonMode="never"
            />
            {searchTerm.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchTerm("");
                  inputRef?.current?.blur();
                }}
                hitSlop={10}
              >
                <View className="w-5 h-5 rounded-full bg-[#eceef0] dark:bg-[#2d3133] items-center justify-center">
                  <X size={11} color={dark ? "#9ca3af" : "#515f74"} />
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* ── LIST ── */}
        <FlashList
          key={isLandscape ? 'landscape' : 'portrait'}
          data={listData}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          numColumns={isLandscape ? 2 : 1}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120 + insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          }}
          ListEmptyComponent={
            !isLoading ? (
              <View className="items-center py-16 px-6">
                <View className="w-16 h-16 rounded-full bg-[#eef2ff] dark:bg-[#1e1b4b] items-center justify-center mb-4">
                  <BookOpen size={28} color="#4f46e5" />
                </View>
                <Text className="text-base font-bold text-[#191c1e] dark:text-white mb-1">
                  No courses found
                </Text>
                <Text className="text-sm text-center text-[#515f74] dark:text-[#9ca3af] max-w-[200px]">
                  Try a different category or search term
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#4f46e5"
            />
          }
        />
      </SafeAreaView>
    </View>
  );
}
