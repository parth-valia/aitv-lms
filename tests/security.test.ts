import * as Device from 'expo-device';
import { SecurityService } from '../src/services/security';

describe('SecurityService — device integrity', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns isSecure: true on a clean device', async () => {
    (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValueOnce(false);
    const result = await SecurityService.checkDeviceIntegrity();
    expect(result.isSecure).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('returns isSecure: false on a rooted device', async () => {
    (Device.isRootedExperimentalAsync as jest.Mock).mockResolvedValueOnce(true);
    const result = await SecurityService.checkDeviceIntegrity();
    expect(result.isSecure).toBe(false);
    expect(result.reason).toMatch(/rooted|jailbroken/i);
  });
});
