import React, { useEffect, useRef, useState } from "react";
import { View, Text, useColorScheme } from "react-native";

interface Props {
  listType: "FlashList" | "LegendList";
  itemCount: number;
}

interface Stats {
  fps: number;
  minFps: number;
  avgFps: number;
  sampleCount: number;
}

const useFPS = (): Stats => {
  const [stats, setStats] = useState<Stats>({
    fps: 60,
    minFps: 60,
    avgFps: 60,
    sampleCount: 0,
  });
  const frameCount = useRef(0);
  const lastTime = useRef(Date.now());
  const rafHandle = useRef<ReturnType<typeof requestAnimationFrame>>(0);
  const totalFps = useRef(0);
  const samples = useRef(0);
  const minFps = useRef(60);

  useEffect(() => {
    const tick = () => {
      frameCount.current++;
      const now = Date.now();
      const delta = now - lastTime.current;

      if (delta >= 500) {
        const current = Math.round((frameCount.current / delta) * 1000);
        totalFps.current += current;
        samples.current++;
        if (current < minFps.current) minFps.current = current;

        setStats({
          fps: current,
          minFps: minFps.current,
          avgFps: Math.round(totalFps.current / samples.current),
          sampleCount: samples.current,
        });

        frameCount.current = 0;
        lastTime.current = now;
      }

      rafHandle.current = requestAnimationFrame(tick);
    };

    rafHandle.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafHandle.current);
  }, []);

  return stats;
};

const fpsColor = (fps: number): string => {
  if (fps >= 55) return "#10b981"; // green
  if (fps >= 30) return "#f59e0b"; // yellow
  return "#ef4444"; // red
};

const Row = ({
  label,
  value,
  color,
  textColor,
  labelColor,
}: {
  label: string;
  value: string;
  color: string;
  textColor: string;
  labelColor: string;
}) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ color: labelColor, fontSize: 10, fontWeight: "600" }}>
        {label}
      </Text>
      <Text style={{ color, fontSize: 11, fontWeight: "800" }}>{value}</Text>
    </View>
  );
};

export const PerformanceMonitor = ({ listType, itemCount }: Props) => {
  const dark = useColorScheme() === "dark";
  const { fps, minFps, avgFps, sampleCount } = useFPS();

  const bgColor = dark ? "rgba(12,14,18,0.92)" : "rgba(255,255,255,0.94)";
  const textColor = dark ? "#e2e8f0" : "#191c1e";
  const labelColor = dark ? "#6b7280" : "#9ca3af";
  const borderColor = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <View
      style={{
        position: "absolute",
        bottom: 100,
        right: 16,
        backgroundColor: bgColor,
        borderRadius: 16,
        padding: 12,
        minWidth: 160,
        borderWidth: 1,
        borderColor,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        zIndex: 999,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            color: labelColor,
            fontSize: 9,
            fontWeight: "800",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Perf Monitor
        </Text>
        <View
          style={{
            backgroundColor: listType === "FlashList" ? "#eef2ff" : "#fdf2f8",
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontSize: 9,
              fontWeight: "800",
              color: listType === "FlashList" ? "#4f46e5" : "#9333ea",
            }}
          >
            {listType}
          </Text>
        </View>
      </View>

      {/* FPS — large display */}
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Text
          style={{
            color: fpsColor(fps),
            fontSize: 36,
            fontWeight: "900",
            lineHeight: 40,
          }}
        >
          {fps}
        </Text>
        <Text
          style={{
            color: labelColor,
            fontSize: 9,
            fontWeight: "700",
            letterSpacing: 0.5,
          }}
        >
          FPS (current)
        </Text>
      </View>

      {/* Secondary stats */}
      <View style={{ gap: 4 }}>
        <Row
          label="Avg FPS"
          value={`${avgFps}`}
          color={fpsColor(avgFps)}
          textColor={textColor}
          labelColor={labelColor}
        />
        <Row
          label="Min FPS"
          value={`${minFps}`}
          color={fpsColor(minFps)}
          textColor={textColor}
          labelColor={labelColor}
        />
        <Row
          label="Items"
          value={itemCount.toLocaleString()}
          color={textColor}
          textColor={textColor}
          labelColor={labelColor}
        />
        <Row
          label="Samples"
          value={`${sampleCount}`}
          color={textColor}
          textColor={textColor}
          labelColor={labelColor}
        />
      </View>
    </View>
  );
};
