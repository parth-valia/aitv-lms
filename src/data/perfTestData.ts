function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export type PerfItem = {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  avatarUrl: string;
  authorName: string;
  category: string;
  tags: string[];             // always exactly 3 entries — direct index access, no slice
  rating: number;
  ratingStr: string;          // rating.toFixed(1) — computed once, used in render
  reviewCount: number;
  reviewCountStr: string;     // fmt(reviewCount)  — computed once, used in render
  viewCount: number;
  viewCountStr: string;       // fmt(viewCount)    — computed once, used in render
  likeCount: number;
  likeCountStr: string;       // fmt(likeCount)    — computed once, used in render
  duration: string;
  level: string;
  price: string;
  isFree: boolean;            // price === 'Free'  — computed once, no string compare in render
  isFeatured: boolean;
};

const TITLES = [
  'Mastering React Native Performance at Scale',
  'Advanced TypeScript Patterns for Production Apps',
  'Building Real-Time Features with WebSockets',
  'State Management Deep Dive: Zustand vs Jotai',
  "Expo SDK 54: What's New and How to Migrate",
  'GPU-Accelerated Animations with Reanimated 4',
  'Offline-First Architecture with MMKV & WatermelonDB',
  'Secure Authentication Flows in Mobile Apps',
  'FlashList vs LegendList: Benchmark Analysis',
  'SwiftUI Interop with Expo Modules API',
  'Designing Accessible UIs for React Native',
  'CI/CD for Mobile: GitHub Actions Deep Dive',
  'OTA Updates Strategy with EAS Update',
  'Native Modules: Bridgeless Architecture',
  'App Store Optimization for LMS Products',
  'Kotlin Coroutines in React Native Modules',
  'TanStack Query v5: Advanced Data Fetching',
  'Expo Router v6: Nested Layouts & Modals',
  'Optimizing Bundle Size with Metro Transforms',
  'End-to-End Testing with Maestro',
];

const AUTHORS = [
  'Aria Chen', 'Jordan Patel', 'Lena Hoffmann', 'Marcus Webb',
  'Sofia Reyes', 'Tyler Nakamura', 'Priya Singh', 'Ethan Bosch',
  'Chloe Dupont', 'Samuel Okafor',
];

const CATEGORIES = [
  'React Native', 'TypeScript', 'Mobile Architecture', 'Performance',
  'Security', 'DevOps', 'UI/UX', 'Testing', 'Native Modules', 'Backend',
];

const ALL_TAGS = [
  'react-native', 'expo', 'typescript', 'performance', 'animation',
  'offline', 'auth', 'testing', 'ci-cd', 'native', 'ios', 'android',
  'zustand', 'reanimated', 'flashlist', 'eas', 'metro', 'hooks',
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const DESCRIPTIONS = [
  'Explore in-depth techniques to squeeze every frame out of your list renders, image pipelines, and JS thread workloads.',
  'Walk through production-proven TypeScript patterns—discriminated unions, branded types, and mapped types—that eliminate entire classes of bugs.',
  'Implement pub/sub channels, presence indicators, and conflict-free data structures for rock-solid real-time UX.',
  'Compare atomic vs slice-based state, selector memoisation, and devtools integration across the leading state libraries.',
  'Cover breaking changes, new config plugins, and the updated router API so your migration is painless and incremental.',
  'Leverage worklets, shared values, and the new layout animations API to build 120 fps interactions with zero JS overhead.',
  'Design a sync engine that keeps users productive with no signal and reconciles changes gracefully when connectivity returns.',
  'Implement PKCE flows, certificate pinning, biometric gating, and silent token refresh without shipping credentials.',
  'Run controlled benchmarks across 10 k-item datasets and learn which knobs move the needle for your specific workload.',
  'Call Swift and Objective-C APIs from your Expo module with full type safety and zero-copy data transfer.',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick(arr: any[], seed: number) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return arr[seed % arr.length];
}

function threeTags(seed: number): string[] {
  return [
    ALL_TAGS[seed % ALL_TAGS.length] ?? 'mobile',
    ALL_TAGS[(seed + 5) % ALL_TAGS.length] ?? 'expo',
    ALL_TAGS[(seed + 11) % ALL_TAGS.length] ?? 'react-native',
  ];
}

function ratingFor(seed: number): number {
  return Math.round(((seed % 15) / 15 + 3.5) * 10) / 10;
}

function priceFor(seed: number): string {
  const base = 19 + (seed % 8) * 10;
  return seed % 7 === 0 ? 'Free' : `$${base}.00`;
}

export const PERF_DATA: PerfItem[] = Array.from({ length: 4200 }, (_, i) => {
  const seed         = i + 1;
  const rating       = ratingFor(seed);
  const reviewCount  = 120 + (seed % 880);
  const viewCount    = 1000 + seed * 3;
  const likeCount    = 80 + (seed % 420);
  const price        = priceFor(seed);

  return {
    id:             `perf-${seed}`,
    index:          i,
    title:          `${pick(TITLES, seed)} #${seed}`,
    subtitle:       pick(CATEGORIES, seed),
    description:    pick(DESCRIPTIONS, seed),
    imageUrl:       `https://picsum.photos/seed/${seed}/800/450`,
    avatarUrl:      `https://i.pravatar.cc/80?img=${(seed % 70) + 1}`,
    authorName:     pick(AUTHORS, seed),
    category:       pick(CATEGORIES, seed),
    tags:           threeTags(seed),
    rating,
    ratingStr:      rating.toFixed(1),
    reviewCount,
    reviewCountStr: fmt(reviewCount),
    viewCount,
    viewCountStr:   fmt(viewCount),
    likeCount,
    likeCountStr:   fmt(likeCount),
    duration:       `${2 + (seed % 6)}h ${(seed % 4) * 15}m`,
    level:          pick(LEVELS, seed),
    price,
    isFree:         price === 'Free',
    isFeatured:     seed % 11 === 0,
  };
});
