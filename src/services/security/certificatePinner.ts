/**
 * Certificate Pinning Service
 *
 * Implements a two-layer defence against MITM attacks:
 *
 *  Layer 1 — Host allowlist
 *    Only requests to explicitly allowed domains are permitted. Any attempt
 *    to contact an unexpected host is blocked before the request is made.
 *
 *  Layer 2 — Public-Key hash validation (HPKP-style)
 *    The server is expected to echo its public-key fingerprint in the
 *    `X-Certificate-Fingerprint` response header. We compare the value
 *    against our compiled-in pin set. A mismatch hard-fails the request.
 *
 *  Production note:
 *    Full TLS-layer pinning (intercepting before the handshake) requires
 *    a native module. For bare-workflow / EAS builds you can add:
 *      - Android: network_security_config.xml with <pin-set>
 *      - iOS:     NSPinnedDomains in Info.plist  (iOS 14+)
 *    This JS layer acts as a defence-in-depth supplement, not a replacement
 *    for the native pinning mechanism above.
 */

/** SHA-256 public-key fingerprints for trusted hosts (base-64 encoded). */
const PIN_REGISTRY: Record<string, string[]> = {
  'api.freeapi.app': [
    // Primary pin — rotate when cert renews (add new pin BEFORE removing old)
    'sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // placeholder — replace with real fingerprint
    // Backup pin — keep at least one backup at all times
    'sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // placeholder
  ],
};

/**
 * Allowed hostnames. Requests to any other host are rejected in
 * production builds. In __DEV__ mode this check is informational only
 * (a console.warn is emitted instead of throwing).
 */
const ALLOWED_HOSTS = new Set(Object.keys(PIN_REGISTRY));

// ─── Utilities ────────────────────────────────────────────────────────────────

function extractHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const CertificatePinner = {
  /**
   * Validates the request URL against the host allowlist before sending.
   * Call this once per request, before `fetch()`.
   */
  validateRequestUrl(url: string): void {
    const host = extractHost(url);
    if (!host) return; // relative URLs are always local — skip

    if (!ALLOWED_HOSTS.has(host)) {
      const msg = `[CertPin] Request to unlisted host blocked: ${host}`;
      if (__DEV__) {
        console.warn(msg);
      } else {
        throw new Error(msg);
      }
    }
  },

  /**
   * Validates the `X-Certificate-Fingerprint` response header against the
   * compiled-in pin set for the request's host.
   *
   * @param url      - The URL that was fetched.
   * @param response - The Response object returned by `fetch()`.
   */
  validateResponse(url: string, response: Response): void {
    if (__DEV__) return; // skip in local development

    const host = extractHost(url);
    const pins = PIN_REGISTRY[host];
    if (!pins) return; // host not in registry — nothing to validate

    const serverPin = response.headers.get('X-Certificate-Fingerprint');

    // If the server sends a fingerprint we haven't pinned, reject it.
    if (serverPin && !pins.includes(serverPin)) {
      throw new Error(
        `[CertPin] Certificate mismatch for ${host}. ` +
          `Got: ${serverPin}. Expected one of: ${pins.join(', ')}`
      );
    }
  },

  /**
   * Returns the current pin set for a given host.
   * Useful for diagnostics / certificate rotation tooling.
   */
  getPinsForHost(host: string): string[] {
    return PIN_REGISTRY[host] ?? [];
  },

  /**
   * Returns all pinned hostnames.
   */
  getPinnedHosts(): string[] {
    return Array.from(ALLOWED_HOSTS);
  },
};
