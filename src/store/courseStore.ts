// src/store/courseStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { storage } from '@/services/storage/mmkv';
import * as Haptics from 'expo-haptics';
import { notificationService } from '@/services/notifications/notificationService';

interface CourseStore {
  bookmarks: string[];
  enrollments: string[];
  progress: Record<string, number>;
  toggleBookmark: (courseId: string) => void;
  enroll: (courseId: string) => void;
  updateProgress: (courseId: string, value: number) => void;
  isBookmarked: (courseId: string) => boolean;
  isEnrolled: (courseId: string) => boolean;
  getProgress: (courseId: string) => number;
}

const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      enrollments: [],
      progress: {},
      toggleBookmark: (courseId) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        set((state) => {
          const isBookmarked = state.bookmarks.includes(courseId);
          const next = isBookmarked
            ? state.bookmarks.filter((id) => id !== courseId)
            : [...state.bookmarks, courseId];
          
          // Fire at every multiple of 5 (5, 10, 15 …)
          if (!isBookmarked && next.length >= 5 && next.length % 5 === 0) {
            notificationService.scheduleBookmarkMilestone(next.length);
          }
          
          return { bookmarks: next };
        });
      },
      enroll: (courseId) => {
        const current = get().enrollments;
        if (!current.includes(courseId)) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          set({ enrollments: [...current, courseId] });
        }
      },
      updateProgress: (courseId, value) => {
        set((state) => ({ progress: { ...state.progress, [courseId]: value } }));
      },
      isBookmarked: (courseId) => get().bookmarks.includes(courseId),
      isEnrolled: (courseId) => get().enrollments.includes(courseId),
      getProgress: (courseId) => get().progress[courseId] || 0,
    }),
    {
      name: 'course-store',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
