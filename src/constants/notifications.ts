// src/constants/notifications.ts
// Notification content and configuration constants

export const NOTIFICATION_CHANNEL = {
  id: 'lms-reminders',
  name: 'LMS Reminders',
  description: 'Course reminders and learning milestones',
} as const;

export const BOOKMARK_MILESTONE_THRESHOLD = 5;

export const INACTIVITY_REMINDER_ID = 'inactivity_reminder';
export const INACTIVITY_SECONDS = 24 * 60 * 60; // 24 hours

export const NOTIFICATION_CONTENT = {
  bookmarkMilestone: (count: number) => ({
    title: '🎯 Learning Goals!',
    body: `You've bookmarked ${count} courses. Ready to start learning?`,
  }),
  inactivityReminder: {
    title: '📚 Miss your courses?',
    body: 'Pick up where you left off — your courses are waiting.',
  },
  backOnline: {
    title: '✅ Back Online',
    body: 'Your connection has been restored.',
  },
} as const;
