import React from "react";
import { View, Text, Pressable, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { Bookmark, Clock } from "lucide-react-native";
import { Course } from "@/types/course";
import { router } from "expo-router";

interface CourseCardProps {
  course: Course;
  onBookmarkToggle: (id: string) => void;
}

const LEVEL_LABELS = ["Beginner", "Intermediate", "Advanced", "Specialist"];

export function CourseCard({ course, onBookmarkToggle }: CourseCardProps) {
  const dark = useColorScheme() === "dark";
  const level = LEVEL_LABELS[course.id.charCodeAt(course.id.length - 1) % LEVEL_LABELS.length];
  const durationHours = Math.floor((parseInt(course.id) % 6) + 2);
  const durationMins = (parseInt(course.id) % 4) * 15;

  return (
    <Pressable
      onPress={() => router.push(`/course/${course.id}`)}
      className="bg-white dark:bg-[#1c2125] rounded-[20px] overflow-hidden"
      style={{
        shadowColor: "#4f46e5",
        shadowOpacity: 0.04,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
        elevation: 3,
      }}
    >
      {/* Thumbnail */}
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
        {/* Instructor row */}
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

        {/* Footer: duration + level */}
        <View className="flex-row items-center justify-between pt-1">
          <View className="flex-row items-center gap-1.5">
            <Clock size={13} color="#4f46e5" />
            <Text className="text-[10px] font-black text-[#4f46e5] dark:text-[#c3c0ff] uppercase tracking-wider">
              {durationHours}h{durationMins > 0 ? ` ${durationMins}m` : ""}
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
  );
}
