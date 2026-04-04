import { CertificatePinner } from '../src/services/security/certificatePinner';

// Simulate production mode so validateResponse checks actually run
const originalDev = global.__DEV__;
beforeAll(() => { (global as any).__DEV__ = false; });
afterAll(() => { (global as any).__DEV__ = originalDev; });

describe('CertificatePinner.validateRequestUrl', () => {
  it('does not throw for a pinned host', () => {
    expect(() =>
      CertificatePinner.validateRequestUrl('https://api.freeapi.app/api/v1/users')
    ).not.toThrow();
  });

  it('throws for an unlisted host in production', () => {
    expect(() =>
      CertificatePinner.validateRequestUrl('https://evil.example.com/steal')
    ).toThrow(/unlisted host/i);
  });

  it('does not throw for relative/empty URL (local path)', () => {
    expect(() => CertificatePinner.validateRequestUrl('')).not.toThrow();
  });
});

describe('CertificatePinner.validateResponse', () => {
  const makeResponse = (fingerprint: string | null) =>
    ({
      headers: { get: (h: string) => (h === 'X-Certificate-Fingerprint' ? fingerprint : null) },
    }) as unknown as Response;

  it('does not throw when no fingerprint header is present', () => {
    expect(() =>
      CertificatePinner.validateResponse(
        'https://api.freeapi.app/test',
        makeResponse(null)
      )
    ).not.toThrow();
  });

  it('throws when fingerprint header does not match any pin', () => {
    expect(() =>
      CertificatePinner.validateResponse(
        'https://api.freeapi.app/test',
        makeResponse('sha256/UNKNOWN_BAD_PIN===')
      )
    ).toThrow(/mismatch/i);
  });

  it('does not throw when fingerprint matches a known pin', () => {
    // Use the first placeholder pin from the registry
    const knownPin = CertificatePinner.getPinsForHost('api.freeapi.app')[0]!;
    expect(() =>
      CertificatePinner.validateResponse(
        'https://api.freeapi.app/test',
        makeResponse(knownPin)
      )
    ).not.toThrow();
  });

  it('does not throw for a host not in the registry', () => {
    expect(() =>
      CertificatePinner.validateResponse(
        'https://cdn.example.com/image.png',
        makeResponse('sha256/WHATEVER=')
      )
    ).not.toThrow();
  });
});

describe('CertificatePinner.getPinnedHosts', () => {
  it('includes api.freeapi.app', () => {
    expect(CertificatePinner.getPinnedHosts()).toContain('api.freeapi.app');
  });
});
