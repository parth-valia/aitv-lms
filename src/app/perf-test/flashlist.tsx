// src/app/perf-test/flashlist.tsx
import { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList, ListRenderItemInfo } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { ChevronLeft, Gauge } from "lucide-react-native";
import { PERF_DATA, PerfItem } from "@/data/perfTestData";
import { PerfListItem } from "@/components/perf/PerfListItem";
import { PerformanceMonitor } from "@/components/perf/PerformanceMonitor";

const DRAW_DISTANCE = Platform.OS === "android" ? 3000 : 500;

const MAX_RECYCLE_POOL = 24;

const keyExtractor = (item: PerfItem) => item.id;
const renderItem = ({ item }: ListRenderItemInfo<PerfItem>) => (
  <PerfListItem item={item} />
);
const getItemType = () => "course";

const DARK_T = StyleSheet.create({
  root: { backgroundColor: "#0b0f10" },
  iconBtn: { backgroundColor: "#1c2125" },
  title: { color: "#ffffff" },
  sub: { color: "#6b7280" },
});

const LIGHT_T = StyleSheet.create({
  root: { backgroundColor: "#f7f9fb" },
  iconBtn: { backgroundColor: "#f2f4f6" },
  title: { color: "#191c1e" },
  sub: { color: "#9ca3af" },
});

export default function FlashListPerfScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const [showMonitor, setShowMonitor] = useState(true);

  const theme = isDark ? DARK_T : LIGHT_T;
  const iconColor = isDark ? "#9ca3af" : "#515f74";

  const goBack = useCallback(() => router.back(), [router]);
  const toggleMonitor = useCallback(() => setShowMonitor((v) => !v), []);

  return (
    <View style={[styles.root, theme.root]}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={goBack} style={[styles.iconBtn, theme.iconBtn]}>
            <ChevronLeft size={22} color={iconColor} />
          </Pressable>

          <View style={styles.titleBlock}>
            <Text style={[styles.title, theme.title]}>FlashList Benchmark</Text>
            <Text style={[styles.sub, theme.sub]}>
              {PERF_DATA.length.toLocaleString()} items · @shopify/flash-list
            </Text>
          </View>

          <Pressable
            onPress={toggleMonitor}
            style={[
              styles.iconBtn,
              {
                backgroundColor: showMonitor
                  ? "#4f46e5"
                  : isDark
                    ? "#1c2125"
                    : "#f2f4f6",
              },
            ]}
          >
            <Gauge size={20} color={showMonitor ? "#fff" : iconColor} />
          </Pressable>
        </View>

        <FlashList
          data={PERF_DATA}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemType={getItemType}
          drawDistance={DRAW_DISTANCE}
          maxItemsInRecyclePool={MAX_RECYCLE_POOL}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
        />

        {showMonitor && (
          <PerformanceMonitor
            listType="FlashList"
            itemCount={PERF_DATA.length}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  titleBlock: { flex: 1 },
  title: { fontSize: 18, fontWeight: "900", letterSpacing: -0.5 },
  sub: { fontSize: 12, fontWeight: "600" },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
