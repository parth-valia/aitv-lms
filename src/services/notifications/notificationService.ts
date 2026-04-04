// src/services/notifications/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { storage } from '../storage/mmkv';

// Configure how notifications behave when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function hasPermission(): Promise<boolean> {
  // On simulator Device.isDevice is false — still allow for dev testing
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;

    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted' && Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4c49c9',
      });
    }

    return finalStatus === 'granted';
  },

  /**
   * Fires when bookmarks reach a milestone (5, 10, 15 …).
   * Each milestone fires exactly once across all sessions.
   */
  async scheduleBookmarkMilestone(bookmarkCount: number): Promise<void> {
    const granted = await hasPermission();
    if (!granted) return;

    // Milestones: every multiple of 5
    const milestone = Math.floor(bookmarkCount / 5) * 5;
    if (milestone < 5) return;

    const milestoneKey = `bookmark_milestone_${milestone}_notified`;
    if (storage.getBoolean(milestoneKey)) return; // already shown for this milestone

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You're on a roll! 🎯",
        body: `You've saved ${milestone} courses. Time to start one?`,
        data: { type: 'BOOKMARK_MILESTONE', count: milestone },
        sound: true,
      },
      trigger: null, // immediate
    });

    storage.set(milestoneKey, true);
  },

  /**
   * Schedules a repeating 24 h inactivity reminder.
   * Cancels any previous one first to avoid duplicates.
   */
  async scheduleDailyReminder(): Promise<void> {
    const granted = await hasPermission();
    if (!granted) return;

    // Cancel previous so we get a fresh 24 h window from now
    await Notifications.cancelScheduledNotificationAsync('inactivity_reminder').catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: 'inactivity_reminder',
      content: {
        title: '📚 Time to grow today?',
        body: "You haven't opened Lumina in a while. Your courses are waiting!",
        data: { type: 'INACTIVITY_REMINDER' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 24 * 60 * 60,
        repeats: true,
      },
    });
  },

  /** Call on every app open to reset the inactivity window. */
  async resetInactivityTimer(): Promise<void> {
    const granted = await hasPermission();
    if (!granted) return;
    await this.scheduleDailyReminder();
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
