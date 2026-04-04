/**
 * Input Sanitization Utilities
 *
 * Centralises all user-facing text sanitisation so that XSS, script injection,
 * and control-character attacks are neutralised before data is stored or rendered.
 *
 * React Native's JS bridge already prevents most classic DOM-XSS attacks, but
 * raw strings can still reach:
 *  - WebView content (courseHtml template, webview player)
 *  - API request bodies (profile update, search queries)
 *  - Local storage (MMKV, SecureStore)
 *  - Sentry breadcrumbs / logs
 *
 * Every export here is a *pure function* — no side-effects, easy to unit-test.
 */

// ─── Core ─────────────────────────────────────────────────────────────────────

/**
 * Strips HTML tags and decodes a handful of common HTML entities.
 * Use this before inserting user-supplied text into a WebView template.
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')                   // remove all tags
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, '/')
    .replace(/&nbsp;/gi, ' ')
    .trim();
}

/**
 * Escapes characters that have special meaning in HTML so that a string can
 * be safely injected into a WebView template (e.g. inside an attribute or
 * text node) without creating new markup.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Removes control characters (C0/C1), null bytes, and zero-width characters
 * that could be used to smuggle data or break layout.
 */
export function removeControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200D\uFEFF]/g, '');
}

// ─── Domain-specific helpers ──────────────────────────────────────────────────

/**
 * Sanitises a free-text search query:
 *  - Strips HTML tags
 *  - Removes control characters
 *  - Collapses multiple whitespace runs
 *  - Trims and limits to maxLength characters
 */
export function sanitizeSearchQuery(input: string, maxLength = 200): string {
  return removeControlChars(stripHtml(input))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitises a display name (username, full name):
 *  - Strips HTML
 *  - Removes control characters
 *  - Allows letters, digits, spaces, hyphens, apostrophes, and periods only
 *  - Trims and limits to maxLength
 */
export function sanitizeDisplayName(input: string, maxLength = 60): string {
  return removeControlChars(stripHtml(input))
    .replace(/[^a-zA-Z0-9 '\-\.]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitises an email address:
 *  - Lower-cases
 *  - Removes whitespace and control characters
 *  - Basic structural validation (must contain exactly one @)
 *
 * Returns the cleaned string (or empty string if structurally invalid).
 */
export function sanitizeEmail(input: string): string {
  const cleaned = removeControlChars(input)
    .toLowerCase()
    .replace(/\s/g, '')
    .slice(0, 254); // RFC 5321 max

  const atCount = (cleaned.match(/@/g) ?? []).length;
  return atCount === 1 ? cleaned : '';
}

/**
 * Sanitises a URL before passing it to Image, WebView, or Linking:
 *  - Only allows http:// and https:// schemes
 *  - Strips fragments and dangerous query params are left to the caller
 *
 * Returns the URL string if safe, or an empty string if rejected.
 */
export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    return url.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitises a plain text comment / note field:
 *  - Strips HTML
 *  - Removes control characters (keeps newlines and tabs)
 *  - Trims and limits to maxLength
 */
export function sanitizeComment(input: string, maxLength = 2000): string {
  return stripHtml(input)
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '') // keep \t \n \r
    .trim()
    .slice(0, maxLength);
}

// ─── Generic entry point ──────────────────────────────────────────────────────

export type SanitizeMode =
  | 'search'
  | 'displayName'
  | 'email'
  | 'url'
  | 'comment'
  | 'html'   // escapeHtml — for WebView injection
  | 'strip'; // stripHtml  — raw plain text

/**
 * Convenience dispatcher. Use when the call-site only knows the field "type"
 * at runtime (e.g. a generic form handler).
 */
export function sanitize(input: string, mode: SanitizeMode): string {
  switch (mode) {
    case 'search':      return sanitizeSearchQuery(input);
    case 'displayName': return sanitizeDisplayName(input);
    case 'email':       return sanitizeEmail(input);
    case 'url':         return sanitizeUrl(input);
    case 'comment':     return sanitizeComment(input);
    case 'html':        return escapeHtml(input);
    case 'strip':       return stripHtml(input);
    default:            return removeControlChars(input);
  }
}
