// src/store/uiStore.ts
import { create } from 'zustand';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIStore {
  isOffline: boolean;
  setOffline: (value: boolean) => void;
  activeToast: Toast | null;
  showToast: (toast: Toast) => void;
  dismissToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isOffline: false,
  setOffline: (value) => set({ isOffline: value }),
  activeToast: null,
  showToast: (toast) => set({ activeToast: toast }),
  dismissToast: () => set({ activeToast: null }),
}));
