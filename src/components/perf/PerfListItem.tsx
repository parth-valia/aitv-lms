// src/components/perf/PerfListItem.tsx
import { memo } from "react";
import {
  View,
  Text,
  Platform,
  StyleSheet,
  useColorScheme,
  ViewStyle,
} from "react-native";
import { Image } from "expo-image";
import { Star, Eye, ThumbsUp, Clock } from "lucide-react-native";
import type { PerfItem } from "@/data/perfTestData";

export const PERF_ITEM_ESTIMATED_HEIGHT = 482;

const DARK = {
  primary: "#ffffff",
  secondary: "#9ca3af",
  accent: "#c3c0ff",
  cardBg: "#1c2125",
  border: "#2d3133",
  tagBg: "#2d3133",
  freeBg: "#064e3b",
  freeText: "#34d399",
  paidBg: "#1e1b4b",
  paidText: "#c3c0ff",
} as const;

const LIGHT = {
  primary: "#191c1e",
  secondary: "#515f74",
  accent: "#4f46e5",
  cardBg: "#ffffff",
  border: "#f0f2f4",
  tagBg: "#eceef0",
  freeBg: "#d1fae5",
  freeText: "#059669",
  paidBg: "#eef2ff",
  paidText: "#4f46e5",
} as const;

const StarRating = memo(function StarRating({
  rating,
  color,
}: {
  rating: number;
  color: string;
}) {
  const full = Math.floor(rating);
  const t = color;
  return (
    <View style={styles.starRow}>
      <Star size={12} color={t} fill={full >= 1 ? t : "transparent"} />
      <Star size={12} color={t} fill={full >= 2 ? t : "transparent"} />
      <Star size={12} color={t} fill={full >= 3 ? t : "transparent"} />
      <Star size={12} color={t} fill={full >= 4 ? t : "transparent"} />
      <Star size={12} color={t} fill={full >= 5 ? t : "transparent"} />
    </View>
  );
});

export interface PerfListItemProps {
  item: PerfItem;
}

function PerfListItemInner({ item }: PerfListItemProps) {
  const isDark = useColorScheme() === "dark";
  const s = isDark ? STYLES.dark : STYLES.light;
  const accent = isDark ? DARK.accent : LIGHT.accent;
  const secondary = isDark ? DARK.secondary : LIGHT.secondary;

  return (
    <View style={s.card}>
      {/* transition={0} — skips animated fade, saves one compositing layer per item */}
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={0}
        recyclingKey={item.id}
        allowDownscaling
      />

      {item.isFeatured && (
        <View style={s.badge}>
          <Text style={styles.badgeText}>FEATURED</Text>
        </View>
      )}

      <View style={styles.body}>
        {/* Author row */}
        <View style={styles.authorRow}>
          <Image
            source={{ uri: item.avatarUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={0}
            recyclingKey={`av-${item.id}`}
            allowDownscaling
          />
          <View style={styles.authorMeta}>
            <Text style={s.authorName} numberOfLines={1}>
              {item.authorName}
            </Text>
            <Text style={s.authorCat}>{item.category}</Text>
          </View>
          {/* isFree is a boolean pre-computed in data — no string comparison here */}
          <View style={item.isFree ? s.priceFreeBg : s.pricePaidBg}>
            <Text style={item.isFree ? s.priceFreeTx : s.pricePaidTx}>
              {item.price}
            </Text>
          </View>
        </View>

        <Text style={s.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={s.desc} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Tags — always exactly 3 entries; direct index avoids slice + map */}
        <View style={styles.tagsRow}>
          <View style={s.tag}>
            <Text style={s.tagText}>#{item.tags[0]}</Text>
          </View>
          <View style={s.tag}>
            <Text style={s.tagText}>#{item.tags[1]}</Text>
          </View>
          <View style={s.tag}>
            <Text style={s.tagText}>#{item.tags[2]}</Text>
          </View>
        </View>

        {/* ratingStr / reviewCountStr are pre-formatted in data — no toFixed() in render */}
        <View style={styles.ratingRow}>
          <StarRating rating={item.rating} color={accent} />
          <Text style={s.ratingNum}>{item.ratingStr}</Text>
          <Text style={s.reviewCount}>({item.reviewCountStr})</Text>
          <View style={styles.flex1} />
          <View style={s.levelBadge}>
            <Text style={s.levelText}>{item.level}</Text>
          </View>
        </View>

        {/* viewCountStr / likeCountStr / duration are pre-formatted in data */}
        <View style={s.statsRow}>
          <View style={styles.statCell}>
            <Eye size={13} color={secondary} />
            <Text style={s.statText}>{item.viewCountStr}</Text>
          </View>
          <View style={styles.statCell}>
            <ThumbsUp size={13} color={secondary} />
            <Text style={s.statText}>{item.likeCountStr}</Text>
          </View>
          <View style={styles.statCell}>
            <Clock size={13} color={secondary} />
            <Text style={s.statText}>{item.duration}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", aspectRatio: 16 / 9 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  body: { padding: 14, gap: 10 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15 },
  authorMeta: { flex: 1 },
  tagsRow: { flexDirection: "row", gap: 6 },
  starRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  flex1: { flex: 1 },
  statCell: { flexDirection: "row", alignItems: "center", gap: 4 },
});

const IOS_SHADOW: ViewStyle | undefined = Platform.select({
  ios: {
    shadowColor: "#4f46e5",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
});

const BASE_CARD: ViewStyle = {
  borderRadius: 20,
  overflow: "hidden",
  marginHorizontal: 16,
  marginBottom: 16,
  borderWidth: 1,
  elevation: Platform.OS === "android" ? 3 : 0,
  ...IOS_SHADOW,
};

const BASE_BADGE = {
  position: "absolute" as const,
  top: 10,
  left: 10,
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 3,
};

const BASE_PILL = {
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 3,
} as const;
const BASE_LABEL = { fontSize: 10, fontWeight: "600" as const };

const STYLES = {
  dark: StyleSheet.create({
    card: {
      ...BASE_CARD,
      backgroundColor: DARK.cardBg,
      borderColor: DARK.border,
    },
    badge: { ...BASE_BADGE, backgroundColor: DARK.accent },
    authorName: { fontSize: 13, fontWeight: "700", color: DARK.primary },
    authorCat: { fontSize: 11, color: DARK.secondary },
    title: {
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 20,
      color: DARK.primary,
    },
    desc: { fontSize: 13, lineHeight: 18, color: DARK.secondary },
    tag: { ...BASE_PILL, backgroundColor: DARK.tagBg },
    tagText: { ...BASE_LABEL, color: DARK.secondary },
    ratingNum: { fontSize: 12, fontWeight: "700", color: DARK.accent },
    reviewCount: { fontSize: 12, color: DARK.secondary },
    levelBadge: { ...BASE_PILL, backgroundColor: DARK.tagBg },
    levelText: { ...BASE_LABEL, color: DARK.secondary },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: DARK.border,
    },
    statText: { fontSize: 11, fontWeight: "600", color: DARK.secondary },
    priceFreeBg: { ...BASE_PILL, backgroundColor: DARK.freeBg },
    pricePaidBg: { ...BASE_PILL, backgroundColor: DARK.paidBg },
    priceFreeTx: { fontSize: 11, fontWeight: "700", color: DARK.freeText },
    pricePaidTx: { fontSize: 11, fontWeight: "700", color: DARK.paidText },
  }),
  light: StyleSheet.create({
    card: {
      ...BASE_CARD,
      backgroundColor: LIGHT.cardBg,
      borderColor: LIGHT.border,
    },
    badge: { ...BASE_BADGE, backgroundColor: LIGHT.accent },
    authorName: { fontSize: 13, fontWeight: "700", color: LIGHT.primary },
    authorCat: { fontSize: 11, color: LIGHT.secondary },
    title: {
      fontSize: 15,
      fontWeight: "800",
      lineHeight: 20,
      color: LIGHT.primary,
    },
    desc: { fontSize: 13, lineHeight: 18, color: LIGHT.secondary },
    tag: { ...BASE_PILL, backgroundColor: LIGHT.tagBg },
    tagText: { ...BASE_LABEL, color: LIGHT.secondary },
    ratingNum: { fontSize: 12, fontWeight: "700", color: LIGHT.accent },
    reviewCount: { fontSize: 12, color: LIGHT.secondary },
    levelBadge: { ...BASE_PILL, backgroundColor: LIGHT.tagBg },
    levelText: { ...BASE_LABEL, color: LIGHT.secondary },
    statsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: LIGHT.border,
    },
    statText: { fontSize: 11, fontWeight: "600", color: LIGHT.secondary },
    priceFreeBg: { ...BASE_PILL, backgroundColor: LIGHT.freeBg },
    pricePaidBg: { ...BASE_PILL, backgroundColor: LIGHT.paidBg },
    priceFreeTx: { fontSize: 11, fontWeight: "700", color: LIGHT.freeText },
    pricePaidTx: { fontSize: 11, fontWeight: "700", color: LIGHT.paidText },
  }),
};

export const PerfListItem = memo(PerfListItemInner);
