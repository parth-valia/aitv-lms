import {
  stripHtml,
  escapeHtml,
  sanitizeSearchQuery,
  sanitizeDisplayName,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeComment,
  sanitize,
} from '../src/utils/sanitize';

describe('stripHtml', () => {
  it('removes basic tags', () => {
    expect(stripHtml('<b>hello</b>')).toBe('hello');
  });

  it('removes script tags', () => {
    expect(stripHtml('<script>alert(1)</script>text')).toBe('alert(1)text');
  });

  it('decodes common HTML entities', () => {
    expect(stripHtml('&lt;div&gt;')).toBe('<div>');
    expect(stripHtml('&amp;')).toBe('&');
  });

  it('returns plain text unchanged', () => {
    expect(stripHtml('hello world')).toBe('hello world');
  });
});

describe('escapeHtml', () => {
  it('escapes < > & " \'', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('is idempotent on safe strings', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('sanitizeSearchQuery', () => {
  it('strips HTML from search input', () => {
    expect(sanitizeSearchQuery('<img src=x onerror=alert(1)>react')).toBe(
      'react'
    );
  });

  it('collapses extra whitespace', () => {
    expect(sanitizeSearchQuery('  react   native  ')).toBe('react native');
  });

  it('truncates to maxLength', () => {
    expect(sanitizeSearchQuery('a'.repeat(300), 200)).toHaveLength(200);
  });

  it('removes control characters', () => {
    expect(sanitizeSearchQuery('hello\x00world')).toBe('helloworld');
  });
});

describe('sanitizeDisplayName', () => {
  it('allows letters, digits, hyphens, apostrophes, periods', () => {
    expect(sanitizeDisplayName("O'Brien Jr.")).toBe("O'Brien Jr.");
  });

  it('strips HTML', () => {
    expect(sanitizeDisplayName('<script>alert(1)</script>Alice')).toBe('Alice');
  });

  it('removes special characters beyond the allowlist', () => {
    expect(sanitizeDisplayName('Alice@#$%')).toBe('Alice');
  });

  it('truncates to 60 chars by default', () => {
    expect(sanitizeDisplayName('a'.repeat(80))).toHaveLength(60);
  });
});

describe('sanitizeEmail', () => {
  it('lower-cases the address', () => {
    expect(sanitizeEmail('Alice@Example.COM')).toBe('alice@example.com');
  });

  it('strips whitespace', () => {
    expect(sanitizeEmail('  alice @example.com  ')).toBe('alice@example.com');
  });

  it('returns empty string for double-@ addresses', () => {
    expect(sanitizeEmail('a@@b.com')).toBe('');
  });

  it('returns empty string when @ is missing', () => {
    expect(sanitizeEmail('notanemail')).toBe('');
  });
});

describe('sanitizeUrl', () => {
  it('accepts https URLs', () => {
    expect(sanitizeUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('accepts http URLs', () => {
    expect(sanitizeUrl('http://example.com/')).toBe('http://example.com/');
  });

  it('rejects javascript: scheme', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('rejects data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('returns empty string for malformed URL', () => {
    expect(sanitizeUrl('not a url')).toBe('');
  });
});

describe('sanitizeComment', () => {
  it('strips HTML tags', () => {
    expect(sanitizeComment('<p>Great course!</p>')).toBe('Great course!');
  });

  it('preserves newlines', () => {
    expect(sanitizeComment('line1\nline2')).toBe('line1\nline2');
  });

  it('truncates to 2000 chars by default', () => {
    expect(sanitizeComment('a'.repeat(2500))).toHaveLength(2000);
  });
});

describe('sanitize dispatcher', () => {
  it('routes "search" mode correctly', () => {
    expect(sanitize('<b>react</b>', 'search')).toBe('react');
  });

  it('routes "email" mode correctly', () => {
    expect(sanitize('Test@Example.COM', 'email')).toBe('test@example.com');
  });

  it('routes "html" mode to escapeHtml', () => {
    expect(sanitize('<b>', 'html')).toBe('&lt;b&gt;');
  });

  it('routes "strip" mode to stripHtml', () => {
    expect(sanitize('<b>hi</b>', 'strip')).toBe('hi');
  });
});
