// src/services/storage/mmkv.ts
// Using AsyncStorage instead of MMKV for Expo Go compatibility.
// Swap back to react-native-mmkv when using a custom dev build.
import AsyncStorage from '@react-native-async-storage/async-storage';

// Synchronous-style wrapper using an in-memory cache backed by AsyncStorage
const memCache: Record<string, string> = {};

// Pre-load cache on startup (best-effort)
AsyncStorage.getAllKeys()
  .then((keys) => AsyncStorage.multiGet(keys as string[]))
  .then((pairs) => {
    pairs.forEach(([key, val]) => {
      if (key && val !== null) memCache[key] = val;
    });
  })
  .catch(() => {});

const persist = (key: string, value: string) => {
  AsyncStorage.setItem(key, value).catch(() => {});
};

export const storage = {
  getString: (key: string): string | undefined => memCache[key],
  getNumber: (key: string): number | undefined => {
    const v = memCache[key];
    return v !== undefined ? Number(v) : undefined;
  },
  getBoolean: (key: string): boolean | undefined => {
    const v = memCache[key];
    return v !== undefined ? v === 'true' : undefined;
  },
  set: (key: string, value: string | number | boolean) => {
    const str = String(value);
    memCache[key] = str;
    persist(key, str);
  },
  delete: (key: string) => {
    delete memCache[key];
    AsyncStorage.removeItem(key).catch(() => {});
  },
};

// Typed wrappers
export const appStorage = {
  bookmarks: {
    get: (): string[] => {
      const data = storage.getString('bookmarks');
      return data ? JSON.parse(data) : [];
    },
    set: (ids: string[]) => storage.set('bookmarks', JSON.stringify(ids)),
    add: (id: string) => {
      const current = appStorage.bookmarks.get();
      if (!current.includes(id)) appStorage.bookmarks.set([...current, id]);
    },
    remove: (id: string) => {
      const current = appStorage.bookmarks.get();
      appStorage.bookmarks.set(current.filter((i) => i !== id));
    },
  },
  enrollments: {
    get: (): string[] => {
      const data = storage.getString('enrollments');
      return data ? JSON.parse(data) : [];
    },
    set: (ids: string[]) => storage.set('enrollments', JSON.stringify(ids)),
    add: (id: string) => {
      const current = appStorage.enrollments.get();
      if (!current.includes(id)) appStorage.enrollments.set([...current, id]);
    },
  },
  lastAppOpen: {
    get: (): number | null => {
      const val = storage.getNumber('lastAppOpen');
      return val !== undefined ? val : null;
    },
    set: () => storage.set('lastAppOpen', Date.now()),
  },
};
