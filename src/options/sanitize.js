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

  let domain = raw.trim().toLowerCase();

  // Remove protocol
  domain = domain.replace(/^https?:\/\//, '');

  // Strip path & query
  domain = domain.replace(/\/.*$/, '');

  // Strip port if any
  domain = domain.replace(/:\d+$/, '');

  // Remove leading www.
  domain = domain.replace(/^www\./, '');

  return domain;
} 