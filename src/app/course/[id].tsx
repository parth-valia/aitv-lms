import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/services/api/courses";
import { useCourseStore } from "@/store/courseStore";
import { Course } from "@/types/course";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Star,
  Users,
  PlayCircle,
  Lock,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Bookmark,
  CheckCircle,
  Share2,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Button } from "@/components/ui/Button";

const MOCK_MODULES = [
  {
    id: "1",
    title: "Foundations of Neural Networks",
    subtitle: "8 lessons • 4h 20m",
    active: false,
    lessons: [],
  },
  {
    id: "2",
    title: "Backpropagation Deep Dive",
    subtitle: "6 lessons • 3h 15m",
    active: false,
    lessons: [],
  },
  {
    id: "3",
    title: "Computer Vision Architectures",
    subtitle: "In Progress • 12 lessons",
    active: true,
    lessons: [
      { id: "3a", title: "Introduction to CNNs", duration: "15:30", locked: false },
      { id: "3b", title: "Pooling and Striding Techniques", duration: "22:15", locked: false },
      { id: "3c", title: "Advanced ResNet Implementations", duration: "34:10", locked: true },
    ],
  },
];

const FEATURES = [
  "Lifetime access to all modules",
  "Premium digital certification",
  "1-on-1 monthly mentorship call",
  "Source code & project files",
];

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const enrollCourse = useCourseStore((state) => state.enroll);
  const toggleBookmark = useCourseStore((state) => state.toggleBookmark);
  const isBookmarked = useCourseStore((state) => state.isBookmarked(id as string));
  const isEnrolled = useCourseStore((state) => state.isEnrolled(id as string));
  const queryClient = useQueryClient();

  const [expandedModule, setExpandedModule] = React.useState<string | null>("3");
  const { height } = useWindowDimensions();
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const headerBg    = dark ? "rgba(18, 20, 36, 0.90)" : "rgba(255, 255, 255, 0.82)";
  const headerBorder= dark ? "rgba(255,255,255,0.07)"  : "rgba(79, 70, 229, 0.06)";
  const iconColor   = dark ? "#c3c0ff" : "#4f46e5";
  const actionColor = dark ? "#9ca3af" : "#515f74";

  const { data: course, isLoading, isError } = useQuery<Course | null>({
    queryKey: ["course", id],
    queryFn: async () => {
      const allQueries = queryClient.getQueryCache().getAll();
      for (const query of allQueries) {
        const data = query.state.data as any;
        if (!data) continue;
        if (Array.isArray(data)) {
          const found = data.find((c: any) => c && String(c.id) === String(id));
          if (found) return found as Course;
        }
        if (data?.courses && Array.isArray(data.courses)) {
          const found = data.courses.find((c: any) => c && String(c.id) === String(id));
          if (found) return found as Course;
        }
        if (data?.pages && Array.isArray(data.pages)) {
          for (const page of data.pages) {
            if (page?.courses) {
              const found = page.courses.find((c: any) => c && String(c.id) === String(id));
              if (found) return found as Course;
            }
          }
        }
      }
      // Cache miss — fetch the specific product directly by ID
      return coursesApi.getCourseById(id as string);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const handleEnroll = () => {
    if (!course) return;
    enrollCourse(course.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Enrolled!", "You now have lifetime access to this course.");
  };

  const handleBookmark = () => {
    if (!course) return;
    toggleBookmark(course.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10] items-center justify-center">
        <Text className="text-[#515f74] dark:text-[#9ca3af]">Loading course...</Text>
      </View>
    );
  }

  if (isError || !course) {
    return (
      <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10] items-center justify-center px-6">
        <Text className="text-xl font-bold text-[#191c1e] dark:text-white mb-2 text-center">
          Course Not Found
        </Text>
        <Text className="text-[#515f74] dark:text-[#9ca3af] mb-6 text-center">
          This course may have been moved or is currently unavailable.
        </Text>
        <Button title="Go Back" onPress={() => router.back()} className="w-full bg-[#4f46e5] rounded-2xl h-14" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10]">
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Hero ── */}
        <View style={{ height: Math.min(350, height * 0.5) }}>
          <Image
            source={{ uri: course.thumbnail }}
            style={{ position: "absolute", width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          {/* Dark scrim */}
          <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.38)" }} />

          {/* Top controls */}
          <SafeAreaView edges={["top"]}>
            <View className="flex-row justify-between items-center px-5 pt-5">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.back()}
                className="w-11 h-11 bg-white/20 rounded-full items-center justify-center border border-white/20"
              >
                <ChevronLeft size={22} color="#ffffff" />
              </TouchableOpacity>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.8}
                  className="w-11 h-11 bg-white/20 rounded-full items-center justify-center border border-white/20"
                >
                  <Share2 size={18} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleBookmark}
                  className="w-11 h-11 bg-white/20 rounded-full items-center justify-center border border-white/20"
                >
                  <Bookmark
                    size={18}
                    color="#ffffff"
                    fill={isBookmarked ? "#ffffff" : "transparent"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>

          {/* Hero bottom content */}
          <View className="absolute bottom-11 left-6 right-6">
            <View className="flex-row items-center bg-white/90 self-start px-4 py-1.5 rounded-full mb-4">
              <Star size={13} color="#f59e0b" fill="#f59e0b" />
              <Text className="text-[10px] font-black uppercase tracking-widest text-[#464555] ml-1.5">
                Bestseller
              </Text>
            </View>
            <Text className="text-white font-black text-[1.75rem] leading-tight tracking-tight" numberOfLines={3}>
              {course.title}
            </Text>
          </View>
        </View>

        {/* ── Main Content ── */}
        <View className="bg-[#f7f9fb] dark:bg-[#0b0f10] rounded-t-[2rem] -mt-8 px-6 pt-8">

          {/* Instructor & Stats card */}
          <View className="bg-white dark:bg-[#1c2125] rounded-2xl p-5 mb-8 flex-row flex-wrap items-center gap-5 shadow-sm">
            <View className="flex-row items-center gap-3 flex-1">
              <Image
                source={{ uri: course.instructor.avatar }}
                style={{ width: 52, height: 52, borderRadius: 26 }}
                contentFit="cover"
              />
              <View>
                <Text className="text-[10px] font-black uppercase tracking-widest text-[#4f46e5] mb-0.5">
                  Lead Instructor
                </Text>
                <Text className="text-[#191c1e] dark:text-white font-bold text-base">
                  {course.instructor.name}
                </Text>
              </View>
            </View>
            <View className="flex-row gap-6">
              <View>
                <Text className="text-[9px] font-black uppercase tracking-widest text-[#9ca3af] mb-1">
                  Students
                </Text>
                <View className="flex-row items-center gap-1">
                  <Users size={13} color="#4f46e5" />
                  <Text className="font-bold text-[#191c1e] dark:text-white text-sm">
                    {course.enrolledCount?.toLocaleString() ?? "0"}
                  </Text>
                </View>
              </View>
              <View>
                <Text className="text-[9px] font-black uppercase tracking-widest text-[#9ca3af] mb-1">
                  Rating
                </Text>
                <View className="flex-row items-center gap-1">
                  <Star size={13} color="#f59e0b" fill="#f59e0b" />
                  <Text className="font-bold text-[#191c1e] dark:text-white text-sm">
                    {course.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* About */}
          <View className="mb-8">
            <Text className="text-2xl font-black text-[#191c1e] dark:text-white tracking-tight mb-3">
              About this Course
            </Text>
            <Text className="text-[#515f74] dark:text-[#9ca3af] text-base leading-relaxed">
              {course.description ||
                "Dive deep into the world of Artificial Intelligence. This course provides an editorial-level deep dive into neural architectures, from basic perceptrons to state-of-the-art transformers."}
            </Text>
          </View>

          {/* Curriculum */}
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-2xl font-black text-[#191c1e] dark:text-white tracking-tight">
                Curriculum
              </Text>
              <Text className="text-sm font-bold text-[#4f46e5]">
                4 Modules • 32 Lessons
              </Text>
            </View>

            <View className="gap-3">
              {MOCK_MODULES.map((mod) => {
                const isOpen = expandedModule === mod.id;
                return (
                  <View
                    key={mod.id}
                    className={`rounded-2xl overflow-hidden ${
                      mod.active
                        ? "border-2 border-[#4f46e5]/20 bg-white dark:bg-[#1c2125]"
                        : "bg-[#f2f4f6] dark:bg-[#1c2125]"
                    }`}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setExpandedModule(isOpen ? null : mod.id)}
                      className="flex-row items-center p-5 gap-4"
                    >
                      <View
                        className={`w-12 h-12 rounded-2xl items-center justify-center ${
                          mod.active ? "bg-[#4f46e5]" : "bg-[#eef2ff] dark:bg-[#2d2b5e]"
                        }`}
                      >
                        <PlayCircle
                          size={22}
                          color={mod.active ? "#ffffff" : "#4f46e5"}
                          fill={mod.active ? "#ffffff" : "transparent"}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-[#191c1e] dark:text-white text-base leading-snug">
                          {mod.title}
                        </Text>
                        <Text
                          className={`text-sm font-semibold mt-0.5 ${
                            mod.active ? "text-[#4f46e5]" : "text-[#9ca3af]"
                          }`}
                        >
                          {mod.subtitle}
                        </Text>
                      </View>
                      {isOpen ? (
                        <ChevronUp size={20} color="#9ca3af" />
                      ) : (
                        <ChevronDown size={20} color="#9ca3af" />
                      )}
                    </TouchableOpacity>

                    {/* Expanded lessons */}
                    {isOpen && mod.lessons.length > 0 && (
                      <View className="px-5 pb-5 gap-3">
                        <View className="h-px bg-[#e0e3e5] dark:bg-[#2d3133] mb-1" />
                        {mod.lessons.map((lesson) => (
                          <View
                            key={lesson.id}
                            className="flex-row items-center gap-3 pl-4"
                          >
                            {lesson.locked ? (
                              <Lock size={18} color="#9ca3af" />
                            ) : (
                              <PlayCircle size={18} color="#4f46e5" fill="#4f46e5" />
                            )}
                            <Text
                              className={`flex-1 text-sm font-medium ${
                                lesson.locked
                                  ? "text-[#9ca3af]"
                                  : "text-[#464555] dark:text-[#c7c4d8]"
                              }`}
                            >
                              {lesson.title}
                            </Text>
                            <Text className="text-[11px] font-black font-mono text-[#9ca3af]">
                              {lesson.duration}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* What's Included */}
          <View className="bg-white dark:bg-[#1c2125] rounded-2xl p-6 mb-4 shadow-sm">
            <Text className="text-[10px] font-black uppercase tracking-[0.15em] text-[#4f46e5] mb-1">
              Premium Package
            </Text>
            <Text className="text-xl font-black text-[#191c1e] dark:text-white tracking-tight mb-5">
              Full Course Access
            </Text>
            <View className="gap-3">
              {FEATURES.map((feature, i) => (
                <View key={i} className="flex-row items-center gap-3">
                  <CheckCircle size={18} color="#10b981" fill="transparent" />
                  <Text className="text-sm font-medium text-[#464555] dark:text-[#c7c4d8]">
                    {feature}
                  </Text>
                </View>
              ))}
            </View>
            <View className="h-px bg-[#f2f4f6] dark:bg-[#2d3133] my-5" />
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-[9px] font-black uppercase tracking-widest text-[#9ca3af]">
                  Total Investment
                </Text>
                <Text className="text-2xl font-black text-[#191c1e] dark:text-white">
                  ${String(course.price)}
                </Text>
              </View>
              <View className="items-end">
                <View className="bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full mb-1">
                  <Text className="text-green-600 dark:text-green-400 text-[10px] font-black">
                    Save 40%
                  </Text>
                </View>
                <Text className="text-[#9ca3af] text-sm line-through">
                  ${Math.round(Number(course.price) * 1.67)}
                </Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* ── Sticky Bottom Bar ── */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-[#0b0f10]/95 border-t border-[#eceef0] dark:border-[#1c2125] px-6 pt-4 pb-8 flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-black text-[#191c1e] dark:text-white">
            ${String(course.price)}
          </Text>
          <Text className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-widest">
            Lifetime Access
          </Text>
        </View>
        {isEnrolled ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push(`/webview/${course.id}`)}
            className="bg-[#4f46e5] px-8 py-4 rounded-full"
          >
            <Text className="text-white font-black text-sm tracking-wide">
              Continue Learning
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleEnroll}
            className="bg-[#4f46e5] px-8 py-4 rounded-full"
            style={{
              shadowColor: "#4f46e5",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <Text className="text-white font-black text-sm tracking-wide">
              Enroll Now
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
