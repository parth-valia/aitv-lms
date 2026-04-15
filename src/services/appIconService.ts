// src/services/appIconService.ts
import * as AppIcon from 'expo-quick-actions/icon';
import { AppIconName } from '@/store/preferencesStore';

export const APP_ICONS: { name: AppIconName; label: string; image: number }[] = [
  { name: 'icon1', label: 'Style 1', image: require('@/assets/images/app-icons/icon_1.png') },
  { name: 'icon2', label: 'Style 2', image: require('@/assets/images/app-icons/icon_2.png') },
  { name: 'icon3', label: 'Style 3', image: require('@/assets/images/app-icons/icon_3.png') },
  { name: 'icon4', label: 'Style 4', image: require('@/assets/images/app-icons/icon_4.png') },
  { name: 'icon5', label: 'Style 5', image: require('@/assets/images/app-icons/icon_5.png') },
];

export const appIconService = {
  async getActiveIcon(): Promise<AppIconName> {
    try {
      if (!AppIcon.isSupported) return 'default';
      const current = await AppIcon.getIcon?.();
      if (!current) return 'default';
      return current as AppIconName;
    } catch {
      return 'default';
    }
  },

  async setIcon(iconName: AppIconName): Promise<boolean> {
    if (!AppIcon.isSupported) return false;
    try {
      const target = iconName === 'default' ? null : iconName;
      const result: unknown = await AppIcon.setIcon?.(target);
      if (result === false) return false;
      return true;
    } catch {
      return false;
    }
  },
};
