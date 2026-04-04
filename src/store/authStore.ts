// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/services/storage/mmkv';
import { StateStorage } from 'zustand/middleware';
import { AuthUser, LoginForm } from '@/types/auth';
import { authApi } from '@/services/api/auth';
import { secureStorage } from '@/services/storage/secureStore';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setIsHydrated: (val: boolean) => void;
  login: (credentials: LoginForm) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  validateSession: () => Promise<void>;
  // Computed helpers — use these everywhere instead of casting user
  displayName: () => string;
  avatarUrl: () => string;
}

const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      setIsHydrated: (val) => set({ isHydrated: val }),
      login: async (credentials) => {
        const { user, accessToken, refreshToken } = await authApi.login(credentials);
        await secureStorage.saveTokens({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + 3600000,
        });
        set({ user, isAuthenticated: true });
      },
      logout: async () => {
        try {
          await authApi.logout();
        } catch (e) {
          // Ignore logout error
        }
        await secureStorage.clearTokens();
        set({ user: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      displayName: () => {
        const u = useAuthStore.getState().user;
        if (!u) return 'User';
        return u.username || u.email?.split('@')[0] || 'User';
      },
      avatarUrl: () => {
        const u = useAuthStore.getState().user;
        const url = u?.avatar?.url;
        if (url && url.startsWith('http')) return url;
        const name = useAuthStore.getState().displayName();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f46e5&color=fff&size=200`;
      },
      validateSession: async () => {
        try {
          const tokens = await secureStorage.getTokens();
          if (!tokens?.accessToken) throw new Error('No token');
          
          const user = await authApi.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.log('Session validation failed:', error);
          await secureStorage.clearTokens();
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ isHydrated: true });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setIsHydrated(true);
      },
    }
  )
);
