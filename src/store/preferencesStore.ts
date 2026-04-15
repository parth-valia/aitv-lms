import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '@/services/storage/mmkv';
import { Appearance } from 'react-native';

/** 'default' resets to the original app icon; others match the plugin config keys. */
export type AppIconName = 'default' | 'icon1' | 'icon2' | 'icon3' | 'icon4' | 'icon5';

interface PreferencesStore {
  theme: 'light' | 'dark' | 'system';
  biometricsEnabled: boolean;
  selectedAppIcon: AppIconName;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setSelectedAppIcon: (icon: AppIconName) => void;
}

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.delete(name),
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'system',
      biometricsEnabled: false,
      selectedAppIcon: 'default',
      setTheme: (theme) => {
        set({ theme });
        Appearance.setColorScheme(theme === 'system' ? null : theme);
      },
      setBiometricsEnabled: (biometricsEnabled) => set({ biometricsEnabled }),
      setSelectedAppIcon: (selectedAppIcon) => set({ selectedAppIcon }),
    }),
    {
      name: 'preferences-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
