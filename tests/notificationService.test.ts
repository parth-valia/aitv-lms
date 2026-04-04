import * as Notifications from 'expo-notifications';
import { notificationService } from '../src/services/notifications/notificationService';

describe('notificationService — permissions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns true when permission is already granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    const result = await notificationService.requestPermissions();
    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permission when not yet granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'undetermined' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'granted' });
    const result = await notificationService.requestPermissions();
    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('returns false when permission is denied', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    const result = await notificationService.requestPermissions();
    expect(result).toBe(false);
  });
});

describe('notificationService — bookmark milestone', () => {
  beforeEach(() => jest.clearAllMocks());

  it('schedules an immediate notification at milestone 5', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    await notificationService.scheduleBookmarkMilestone(5);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: null })
    );
  });

  it('schedules at milestone 10', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    await notificationService.scheduleBookmarkMilestone(10);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it('does not schedule if count is below 5', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    await notificationService.scheduleBookmarkMilestone(3);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('does not schedule when permissions denied', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    await notificationService.scheduleBookmarkMilestone(5);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('notificationService — inactivity reminder', () => {
  beforeEach(() => jest.clearAllMocks());

  it('schedules a repeating 24h notification', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    await notificationService.scheduleDailyReminder();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'inactivity_reminder',
        trigger: expect.objectContaining({ seconds: 86400, repeats: true }),
      })
    );
  });

  it('cancels previous reminder before scheduling new one', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    await notificationService.scheduleDailyReminder();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('inactivity_reminder');
  });
});
