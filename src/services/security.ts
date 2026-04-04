import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Advanced Security Service
 * Implements Root/Jailbreak detection for production-grade security
 */
export const SecurityService = {
  checkDeviceIntegrity: async (): Promise<{ isSecure: boolean; reason?: string }> => {
    // 1. Platform specific root checks
    const isRooted = await Device.isRootedExperimentalAsync();
    
    if (isRooted) {
      return { isSecure: false, reason: 'Device is rooted or jailbroken' };
    }

    // 2. Physical device check (bypass for dev/simulator based on project context)
    if (!Device.isDevice && !__DEV__) {
      return { isSecure: false, reason: 'Untrusted execution environment' };
    }

    return { isSecure: true };
  }
};
