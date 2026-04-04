// src/stores/preferencesStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '@/services/storage/mmkv';

type ThemeMode = 'system' | 'light' | 'dark';

interface PreferencesStore {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
      notificationsEnabled: true,
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
    }),
    {
      name: 'preferences-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
