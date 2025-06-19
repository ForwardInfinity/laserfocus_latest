/**
 * Sanitises a user-entered domain string to a lowercase eTLD+1 without
 * protocol, path, port, or leading www. (FR-011 / Phase 6 refactor)
 *
 * Example:
 *   "  https://WWW.Facebook.com/feed " ➜ "facebook.com"
 *
 * @param {string} raw Raw user input.
 * @returns {string} Sanitised domain or empty string if invalid/empty.
 */
export function sanitizeDomain(raw) {
  if (!raw || typeof raw !== 'string') return '';

  // Trim whitespace and force lowercase early
  let toSanitise = raw.trim().toLowerCase();

  // If the string already looks like a bare hostname, keep as-is for URL() parsing ease.
  // Prepend protocol when missing so that URL API works reliably.
  if (!/^[a-z]+:\/\//.test(toSanitise)) {
    toSanitise = `http://${toSanitise}`; // protocol placeholder – value will be discarded.
  }

  let hostname;
  try {
    hostname = new URL(toSanitise).hostname;
  } catch {
    return '';
  }

  // Remove leading www.
  hostname = hostname.replace(/^www\./, '');

  // Split hostname into labels
  const parts = hostname.split('.');
  if (parts.length === 0) return '';

  // List of common second-level TLDs that require retaining three labels for eTLD+1
  const secondLevelTlds = new Set([
    'co.uk', 'ac.uk', 'gov.uk', 'co.jp', 'ne.jp', 'or.jp', 'com.au', 'net.au', 'org.au',
    'com.br', 'net.br', 'com.cn', 'com.sg', 'com.in', 'co.in', 'co.kr', 'or.kr'
  ]);

  if (parts.length >= 3) {
    const lastTwo = parts.slice(-2).join('.');
    if (secondLevelTlds.has(lastTwo)) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }

  // Already eTLD+1 (e.g., facebook.com)
  return hostname;
}

// Expose for CommonJS (Jest)
if (typeof module !== 'undefined') {
  // eslint-disable-next-line no-undef
  module.exports = { sanitizeDomain };
} 