import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/services/api/courses";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Play,
  CheckCircle2,
  Lock,
  Download,
} from "lucide-react-native";
import { Course } from "@/types/course";
import { useCourseStore } from "@/store/courseStore";
import { useVideoPlayer, VideoView } from "expo-video";
import { Image } from "expo-image";

const COURSE_VIDEO_URL =
  "https://avtshare01.rz.tu-ilmenau.de/avt-vqdb-uhd-1/test_1/segments/bigbuck_bunny_8bit_750kbps_360p_60.0fps_hevc.mp4";

const MOCK_LESSONS = [
  { id: "1", title: "Foundation Principles",  duration: "12 mins", locked: false, completed: true  },
  { id: "2", title: "Advanced Patterns",      duration: "18 mins", locked: false, completed: false, active: true },
  { id: "3", title: "The Glass Surface",       duration: "25 mins", locked: true,  completed: false },
  { id: "4", title: "Mastering Shadows",       duration: "18 mins", locked: true,  completed: false },
  { id: "5", title: "Color Theory Deep Dive",  duration: "22 mins", locked: true,  completed: false },
  { id: "6", title: "Typography Systems",      duration: "30 mins", locked: true,  completed: false },
  { id: "7", title: "Final Project",           duration: "45 mins", locked: true,  completed: false },
];

const LEARNING_OBJECTIVES = [
  "Define boundaries using tonal shifts",
  "Implement Glassmorphism overlays",
  "Master editorial typography scales",
  "Apply spatial design principles",
  "Build production-ready components",
];

type TabId = "content" | "curriculum";

export default function WebviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const dark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabId>("content");
  const [playing, setPlaying] = useState(false);
  const { progress: progressMap } = useCourseStore();

  // expo-video player — always initialised (hooks must not be conditional)
  const player = useVideoPlayer(COURSE_VIDEO_URL, (p) => {
    p.loop = true;
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", id],
    queryFn: async (): Promise<Course | null> => {
      const queries = queryClient.getQueriesData({ queryKey: ["courses"] });
      for (const [, data] of queries) {
        const listData = data as any;
        if (listData?.courses) {
          const found = listData.courses.find(
            (c: Course) => String(c.id) === String(id)
          );
          if (found) return found;
        }
      }
      return coursesApi.getCourseById(id as string);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10] items-center justify-center" style={{ paddingTop: insets.top }}>
        <View className="w-14 h-14 rounded-full items-center justify-center mb-3" style={{ backgroundColor: "rgba(79,70,229,0.1)" }}>
          <Play size={26} color="#4f46e5" />
        </View>
        <Text className="text-sm font-bold text-[#515f74] dark:text-[#9ca3af]">Synchronizing content…</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10] items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-xl font-black text-[#191c1e] dark:text-white mb-2">Content Unavailable</Text>
        <Text className="text-[#515f74] dark:text-[#9ca3af] text-center mb-8">We couldn't load this lesson. Please try again.</Text>
        <Pressable onPress={() => router.back()} className="bg-[#4f46e5] px-8 py-4 rounded-full">
          <Text className="text-white font-black text-sm uppercase tracking-widest">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const courseProgress = progressMap[course.id] ?? 0;
  const completedCount = MOCK_LESSONS.filter((l) => l.completed).length;
  const donePercent = courseProgress > 0 ? courseProgress : completedCount * 14;
  const playerHeight = Math.min(Math.round((width / 16) * 9), Math.round(height * 0.55));

  return (
    <View className="flex-1 bg-[#f7f9fb] dark:bg-[#0b0f10]">
      {/* ── TOP APP BAR ── */}
      <View
        className="bg-white/80 dark:bg-[#0b0f10]/90 border-b border-[#eceef0]/60 dark:border-[#2d3133]"
        style={{
          paddingTop: insets.top,
          shadowColor: "#4f46e5",
          shadowOpacity: 0.06,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 10 },
        }}
      >
        <View className="flex-row items-center justify-between px-5 py-3">
          <View className="flex-row items-center gap-3 flex-1">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: dark ? "rgba(255,255,255,0.06)" : "rgba(79,70,229,0.06)" }}
            >
              <ChevronLeft size={22} color={dark ? "#c3c0ff" : "#4f46e5"} />
            </Pressable>
            <Text className="text-lg font-semibold tracking-tight text-[#4f46e5] dark:text-[#c3c0ff]" numberOfLines={1}>
              {course.title}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row px-5">
          {(["content", "curriculum"] as TabId[]).map((tab) => (
            <Pressable key={tab} onPress={() => setActiveTab(tab)} className="mr-8 pb-3 relative">
              <Text
                className={`text-sm font-bold capitalize ${
                  activeTab === tab
                    ? "text-[#4f46e5] dark:text-[#c3c0ff]"
                    : "text-[#aaaaaa] dark:text-[#4a5068]"
                }`}
              >
                {tab}
              </Text>
              {activeTab === tab && (
                <View
                  className="absolute bottom-0 left-0 right-0 rounded-t-full bg-[#4f46e5] dark:bg-[#c3c0ff]"
                  style={{ height: 3 }}
                />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* ── CONTENT TAB ── */}
      {activeTab === "content" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }}>

          {/* ── Video Player ── */}
          <View style={{ height: playerHeight, backgroundColor: "#000" }}>
            {playing ? (
              <VideoView
                player={player}
                style={{ width: "100%", height: "100%" }}
                allowsFullscreen
                allowsPictureInPicture
                contentFit="contain"
              />
            ) : (
              <>
                <Image
                  source={{ uri: course.thumbnail }}
                  style={{ width: "100%", height: "100%", opacity: 0.85 }}
                  contentFit="cover"
                />
                {/* Dark scrim */}
                <View
                  style={{
                    position: "absolute", inset: 0,
                    backgroundColor: "rgba(0,0,0,0.3)",
                  }}
                />
                {/* Play button */}
                <View style={{ position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" }}>
                  <Pressable
                    onPress={() => {
                      setPlaying(true);
                      player.play();
                    }}
                    style={{
                      width: 72, height: 72, borderRadius: 36,
                      backgroundColor: "rgba(53,37,205,0.92)",
                      alignItems: "center", justifyContent: "center",
                      shadowColor: "#3525cd",
                      shadowOpacity: 0.5,
                      shadowRadius: 24,
                      shadowOffset: { width: 0, height: 8 },
                      elevation: 12,
                    }}
                  >
                    <Play size={30} color="#fff" fill="#fff" />
                  </Pressable>
                </View>
              </>
            )}
          </View>

          {/* Course Metadata */}
          <View className="px-5 pt-6 pb-4 gap-2">
            <View className="flex-row items-center gap-3">
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: dark ? "rgba(79,70,229,0.2)" : "#eef2ff" }}
              >
                <Text
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: dark ? "#c3c0ff" : "#4338ca" }}
                >
                  Module 04
                </Text>
              </View>
              <Text className="text-sm font-medium text-[#9ca3af]">• 45 Minutes</Text>
            </View>
            <Text
              className="text-[1.75rem] font-bold tracking-tight text-[#191c1e] dark:text-white leading-tight"
              style={{ fontWeight: "700" }}
            >
              {course.title}
            </Text>
          </View>

          {/* Bento Grid — side by side */}
          <View className="px-5 pb-4 flex-row gap-4">
            {/* Description card */}
            <View
              className="flex-1 bg-white dark:bg-[#1c2125] rounded-[20px] p-5 gap-3"
              style={{
                shadowColor: "#4f46e5",
                shadowOpacity: 0.06,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 10 },
                elevation: 3,
              }}
            >
              <Text className="text-base font-bold text-[#191c1e] dark:text-white">
                Module Description
              </Text>
              <Text
                className="text-sm leading-relaxed text-[#515f74] dark:text-[#9ca3af]"
                numberOfLines={7}
              >
                {course.description}
              </Text>
            </View>

            {/* Learning Objectives card */}
            <View
              className="flex-1 rounded-[20px] p-5 gap-4"
              style={{
                backgroundColor: dark ? "rgba(79,70,229,0.13)" : "rgba(238,242,255,0.7)",
                borderWidth: 1,
                borderColor: dark ? "rgba(99,91,255,0.2)" : "rgba(165,180,252,0.5)",
              }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: dark ? "#c3c0ff" : "#312e81" }}
              >
                Learning Objectives
              </Text>
              <View className="gap-3">
                {LEARNING_OBJECTIVES.slice(0, 4).map((obj, i) => (
                  <View key={i} className="flex-row items-start gap-2">
                    <CheckCircle2 size={16} color="#4f46e5" style={{ marginTop: 2 }} />
                    <Text
                      className="flex-1 text-xs font-medium leading-relaxed"
                      style={{ color: dark ? "#a5b4fc" : "#3730a3" }}
                    >
                      {obj}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* ── CURRICULUM TAB ── */}
      {activeTab === "curriculum" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }}>
          <View
            className="mx-5 mt-5 mb-3 bg-white dark:bg-[#1c2125] rounded-[20px] p-5"
            style={{
              shadowColor: "#4f46e5",
              shadowOpacity: 0.05,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 2,
              borderWidth: 1,
              borderColor: dark ? "rgba(255,255,255,0.04)" : "#fff",
            }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-lg font-bold text-[#191c1e] dark:text-white">
                Course Curriculum
              </Text>
              <Text className="text-sm font-bold text-[#4f46e5] dark:text-[#c3c0ff]">
                {donePercent}% Done
              </Text>
            </View>

            {/* Lesson list */}
            <View className="gap-1.5">
              {MOCK_LESSONS.map((lesson, index) => {
                const isCompleted = lesson.completed;
                const isActive = !!lesson.active;

                return (
                  <Pressable
                    key={lesson.id}
                    disabled={lesson.locked}
                    onPress={() => !lesson.locked && setActiveTab("content")}
                    className={`flex-row items-center gap-3 p-3.5 rounded-[14px] ${
                      isActive ? "bg-[#eef2ff] dark:bg-[#2d2b5e]" : ""
                    } ${lesson.locked ? "opacity-60" : ""}`}
                    style={
                      isActive
                        ? { borderWidth: 1, borderColor: dark ? "rgba(99,91,255,0.25)" : "rgba(165,180,252,0.5)" }
                        : undefined
                    }
                  >
                    <View
                      className={`w-10 h-10 rounded-full items-center justify-center shrink-0 ${
                        isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-900/25"
                          : isActive
                          ? "bg-[#4f46e5]"
                          : "bg-[#f2f4f6] dark:bg-[#2d3133]"
                      }`}
                      style={isActive ? { shadowColor: "#4f46e5", shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 } : undefined}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={20} color="#22c55e" />
                      ) : lesson.locked ? (
                        <Lock size={15} color={dark ? "#4a5068" : "#9ca3af"} />
                      ) : isActive ? (
                        <Play size={16} color="#fff" fill="#fff" />
                      ) : (
                        <Text className="text-xs font-black text-[#515f74] dark:text-[#9ca3af]">
                          {String(index + 1).padStart(2, "0")}
                        </Text>
                      )}
                    </View>

                    <View className="flex-1">
                      <Text
                        className={`text-sm font-bold ${
                          isCompleted
                            ? "line-through text-[#9ca3af] dark:text-[#4a5068]"
                            : isActive
                            ? "text-[#312e81] dark:text-[#c3c0ff]"
                            : "text-[#374151] dark:text-white"
                        }`}
                        numberOfLines={1}
                      >
                        {`${String(index + 1).padStart(2, "0")}. ${lesson.title}`}
                      </Text>
                      <Text
                        className={`text-[10px] mt-0.5 ${
                          isActive
                            ? "font-black uppercase tracking-tight text-[#4f46e5] dark:text-[#c3c0ff]"
                            : "font-medium text-[#9ca3af] dark:text-[#4a5068]"
                        }`}
                      >
                        {isActive ? "Current Lesson" : `${lesson.duration} • Video`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            {/* Download Resources */}
            <Pressable
              className="w-full mt-7 bg-[#4f46e5] py-4 rounded-full items-center"
              style={{
                shadowColor: "#4f46e5",
                shadowOpacity: 0.35,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
              }}
            >
              <View className="flex-row items-center gap-2">
                <Download size={18} color="#fff" />
                <Text className="text-white font-bold text-sm">Download Resources</Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
