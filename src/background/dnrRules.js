/**
 * Transforms an array of blocked domains into Chrome's declarativeNetRequest rules
 * 
 * @param {string[]} blockedDomains - Array of domains to block (e.g., ['facebook.com'])
 * @param {string} overlayPath - Path to the overlay HTML file
 * @param {boolean} addTargetParam - Whether to add the target parameter to the redirect URL
 * @returns {Array<chrome.declarativeNetRequest.Rule>} Array of dNR rules
 */
export function blockedListToDnrRules(blockedDomains = [], overlayPath = '/src/overlay/overlay.html', addTargetParam = true) {
  if (!Array.isArray(blockedDomains)) {
    throw new TypeError('blockedDomains must be an array');
  }

  /**
   * Escape a string to be used inside a RegExp.
   * @param {string} str
   * @returns {string}
   */
  function escapeRegex(str) {
    // From MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return blockedDomains.map((domain, index) => {
    if (typeof domain !== 'string' || domain.trim() === '') {
      throw new TypeError('Each blocked domain must be a non-empty string');
    }

    // Build a regex filter that captures the ENTIRE request URL (\0)
    // and matches the domain plus any sub-domain (case-insensitive)
    const escapedDomain = escapeRegex(domain.toLowerCase());
    const regexFilter = `^https?://([a-z0-9.-]*\\.)?${escapedDomain}.*`;

    // By using regexSubstitution we inject the full original URL as \0
    // into the overlay's query parameter. We purposefully **do not** encode
    // here because dNR cannot run JS; decoding/encoding will be handled
    // inside the overlay script.
    const regexSubstitution = addTargetParam ? `${overlayPath}?target=\\0` : overlayPath;
    const redirect = { regexSubstitution };

    return {
      id: index + 1, // IDs must be positive integers and unique per rule list
      priority: 1,
      action: {
        type: 'redirect',
        redirect,
      },
      condition: {
        regexFilter,
        resourceTypes: ['main_frame'],
      },
    };
  });
} 