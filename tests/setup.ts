import '@testing-library/jest-native/extend-expect';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(() => undefined),
    getBoolean: jest.fn(() => false),
    delete: jest.fn(),
  })),
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(async () => 'mock-id'),
  cancelScheduledNotificationAsync: jest.fn(async () => {}),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => {}),
  setNotificationChannelAsync: jest.fn(async () => {}),
  AndroidImportance: { MAX: 5 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  isRootedExperimentalAsync: jest.fn(async () => false),
}));

// Mock @sentry/react-native
jest.mock('@sentry/react-native', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  init: jest.fn(),
}));

// Mock expo-network
jest.mock('expo-network', () => ({
  getNetworkStateAsync: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
  })),
}));

// Silence console.log in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
};
