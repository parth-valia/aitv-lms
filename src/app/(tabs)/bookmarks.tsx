import React, { useMemo } from "react";
import { View, Text, ActivityIndicator, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useCourseStore } from "@/store/courseStore";
import { CourseFeedCard } from "@/components/course/CourseFeedCard";
import { Course } from "@/types/course";
import { FlashList } from "@shopify/flash-list";
import { Plus } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "@/services/api/courses";
import { useRouter } from "expo-router";

export default function BookmarksScreen() {
  const bookmarks = useCourseStore((state) => state.bookmarks);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();

  const { data: allCoursesResponse, isLoading } = useQuery({
    queryKey: ["courses", "all"],
    queryFn: () => coursesApi.getCourseList(1, 100),
  });

  const savedCourses = useMemo(() => {
    if (!allCoursesResponse?.courses) return [];
    return allCoursesResponse.courses
      .filter((course: Course) => bookmarks.includes(course.id))
      .map((course: Course) => ({ ...course, isBookmarked: true }));
  }, [allCoursesResponse, bookmarks]);

  const renderItem = ({ item }: { item: Course }) => (
    <View className="mb-5">
      <CourseFeedCard course={item} onBookmarkToggle={toggleBookmark} />
    </View>
  );

  const ExploreCard = (
    <Pressable
      onPress={() => router.push("/(tabs)")}
      className="border-2 border-dashed border-[#c3c0ff] dark:border-[#2d2b5e] rounded-2xl flex-col items-center justify-center py-14 px-6"
    >
      <View className="w-16 h-16 rounded-full bg-[#eef2ff] dark:bg-[#1e1b4b] items-center justify-center mb-5">
        <Plus size={28} color="#4f46e5" />
      </View>
      <Text className="text-base font-bold text-[#191c1e] dark:text-white mb-1.5">
        Explore More Courses
      </Text>
      <Text className="text-sm text-[#515f74] dark:text-[#9ca3af] text-center max-w-[180px]">
        Find something new to add to your collection
      </Text>
    </Pressable>
  );

  return (
    <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10]">
      <SafeAreaView edges={["top", "left", "right"]} className="flex-1">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : (
          <FlashList
            key={isLandscape ? 'landscape' : 'portrait'}
            data={savedCourses}
            keyExtractor={(item: Course) => item.id}
            renderItem={renderItem}
            numColumns={isLandscape ? 2 : 1}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: Math.max(24, insets.left + 12),
              paddingBottom: 120 + insets.bottom,
            }}
            ListHeaderComponent={
              <View className="pt-6 pb-10">
                {/* Editorial Header */}
                <Text className="text-[11px] font-black tracking-[0.12em] text-[#4f46e5] uppercase mb-2">
                  Your Collection
                </Text>
                <Text className="text-[2.75rem] leading-[1.1] font-black tracking-tighter text-[#191c1e] dark:text-white mb-4">
                  Saved Courses
                </Text>
                <Text className="text-[#515f74] dark:text-[#9ca3af] text-base leading-relaxed">
                  Continue your learning journey with your curated selection of
                  masterclasses and workshops.
                </Text>
              </View>
            }
            ListFooterComponent={<View className="mt-2">{ExploreCard}</View>}
            ListEmptyComponent={
              <View className="mb-5">
                <Text className="text-[#9ca3af] text-sm text-center mb-6">
                  No saved courses yet — start exploring!
                </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}
