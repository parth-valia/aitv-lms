// src/store/preferencesStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '@/services/storage/mmkv';
import { Appearance, ColorSchemeName } from 'react-native';

interface PreferencesStore {
  theme: 'light' | 'dark' | 'system';
  biometricsEnabled: boolean;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setBiometricsEnabled: (enabled: boolean) => void;
}

const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'system',
      biometricsEnabled: false,
      setTheme: (theme) => {
        set({ theme });
        if (theme !== 'system') {
          Appearance.setColorScheme(theme);
        } else {
          Appearance.setColorScheme(null); // resets to system
        }
      },
      setBiometricsEnabled: (biometricsEnabled) => {
        set({ biometricsEnabled });
      },
    }),
    {
      name: 'preferences-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
