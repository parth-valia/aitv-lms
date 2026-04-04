// src/components/ui/Avatar.tsx
import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function Avatar({
  uri,
  name = "",
  size = 48,
  className = "",
}: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.36);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 6 }}
        className={className}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 6,
      }}
      className={`bg-brand-500 items-center justify-center ${className}`}
    >
      <Text
        style={{ fontSize, lineHeight: fontSize * 1.2 }}
        className="text-white font-bold"
      >
        {initials || "?"}
      </Text>
    </View>
  );
}
