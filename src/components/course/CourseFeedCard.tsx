import React, { useCallback, useRef } from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { Bookmark, Clock } from "lucide-react-native";
import { Course } from "@/types/course";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

interface CourseFeedCardProps {
  course: Course;
  onBookmarkToggle: (id: string) => void;
}

const LEVEL_LABELS = ["Beginner", "Intermediate", "Advanced", "Specialist"];
const SWIPE_THRESHOLD = 72;

export function CourseFeedCard({
  course,
  onBookmarkToggle,
}: CourseFeedCardProps) {
  const dark = useColorScheme() === "dark";
  const level =
    LEVEL_LABELS[
      course.id.charCodeAt(course.id.length - 1) % LEVEL_LABELS.length
    ];
  const durationHours = Math.floor((parseInt(course.id) % 6) + 2);
  const durationMins = (parseInt(course.id) % 4) * 15;

  const translateX = useSharedValue(0);
  const bookmarkScale = useSharedValue(1);
  // Tracks whether the current gesture crossed the swipe threshold.
  // Checked synchronously in onPress to block navigation after a swipe-bookmark.
  const swipeTriggeredRef = useRef(false);

  const triggerBookmark = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onBookmarkToggle(course.id);
  }, [course.id, onBookmarkToggle]);

  const setSwipeTriggered = useCallback((value: boolean) => {
    swipeTriggeredRef.current = value;
  }, []);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      translateX.value = Math.min(0, e.translationX);
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        runOnJS(setSwipeTriggered)(true);
        bookmarkScale.value = withSpring(1.4, {}, () => {
          bookmarkScale.value = withSpring(1);
        });
        runOnJS(triggerBookmark)();
      }
      translateX.value = withSpring(0, { damping: 50, stiffness: 200 });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const revealStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, -20, 0],
      [1, 0.4, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const bookmarkIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bookmarkScale.value }],
  }));

  return (
    <View style={{ position: "relative" }}>
      {/* Swipe-reveal bookmark hint */}
      <Animated.View
        style={[
          revealStyle,
          {
            position: "absolute",
            right: 16,
            top: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            width: 56,
          },
        ]}
      >
        <View className="w-12 h-12 rounded-full items-center justify-center bg-[#4f46e5]">
          <Animated.View style={bookmarkIconStyle}>
            <Bookmark
              size={20}
              color="#fff"
              fill={course.isBookmarked ? "#fff" : "transparent"}
            />
          </Animated.View>
        </View>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            cardStyle,
            {
              backgroundColor: dark ? "#1c2125" : "#ffffff",
              borderRadius: 20,
              overflow: "hidden",
              shadowColor: "#4f46e5",
              shadowOpacity: 0.04,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 10 },
              elevation: 3,
            },
          ]}
        >
          {/* Thumbnail */}
          <Pressable
            onPress={() => {
              if (swipeTriggeredRef.current) {
                swipeTriggeredRef.current = false;
                return;
              }
              router.push(`/course/${course.id}`);
            }}
          >
            <View style={{ aspectRatio: 16 / 9 }} className="relative">
              <Image
                source={{ uri: course.thumbnail }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={300}
              />
              <Pressable
                onPress={() => onBookmarkToggle(course.id)}
                hitSlop={8}
                className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
              >
                <Bookmark
                  size={16}
                  color={course.isBookmarked ? "#4f46e5" : "#fff"}
                  fill={course.isBookmarked ? "#4f46e5" : "transparent"}
                />
              </Pressable>
            </View>

            {/* Body */}
            <View className="p-4 gap-3">
              {/* Instructor */}
              <View className="flex-row items-center gap-2">
                <Image
                  source={{ uri: course.instructor.avatar }}
                  style={{ width: 28, height: 28, borderRadius: 14 }}
                  contentFit="cover"
                />
                <Text
                  className="text-sm font-semibold text-[#515f74] dark:text-[#9ca3af]"
                  numberOfLines={1}
                >
                  {course.instructor.name}
                </Text>
              </View>

              {/* Title + description */}
              <View>
                <Text
                  className="text-[1.35rem] font-bold tracking-tight text-[#191c1e] dark:text-white leading-tight"
                  numberOfLines={2}
                >
                  {course.title}
                </Text>
                <Text
                  className="text-[#515f74] dark:text-[#9ca3af] text-sm mt-1.5 leading-relaxed"
                  numberOfLines={2}
                >
                  {course.description}
                </Text>
              </View>

              {/* Footer */}
              <View className="flex-row items-center justify-between pt-1">
                <View className="flex-row items-center gap-1.5">
                  <Clock size={13} color="#4f46e5" />
                  <Text className="text-[10px] font-black text-[#4f46e5] dark:text-[#c3c0ff] uppercase tracking-wider">
                    {durationHours}h
                    {durationMins > 0 ? ` ${durationMins}m` : ""}
                  </Text>
                </View>
                <View className="bg-[#eceef0] dark:bg-[#2d3133] px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-bold text-[#515f74] dark:text-[#9ca3af]">
                    {level}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
