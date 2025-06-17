/**
 * CommonJS wrapper for blockedListToDnrRules to support Jest unit tests.
 * Duplicates logic from the ES module to avoid requiring experimental VM modules.
 * 
 * @param {string[]} blockedDomains - Array of domains to block (e.g., ['facebook.com'])
 * @param {string} overlayPath - Path to the overlay HTML file
 * @param {boolean} addTargetParam - Whether to add the target parameter to the redirect URL
 * @returns {Array<Object>} Array of dNR rules
 */
function blockedListToDnrRules(blockedDomains = [], overlayPath = '/src/overlay/overlay.html', addTargetParam = true) {
  if (!Array.isArray(blockedDomains)) {
    throw new TypeError('blockedDomains must be an array');
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  return blockedDomains.map((domain, index) => {
    if (typeof domain !== 'string' || domain.trim() === '') {
      throw new TypeError('Each blocked domain must be a non-empty string');
    }

    const escapedDomain = escapeRegex(domain.toLowerCase());
    const regexFilter = `^https?://([a-z0-9.-]*\\.)?${escapedDomain}.*`;
    const regexSubstitution = addTargetParam ? `${overlayPath}?target=\\0` : overlayPath;
    const redirect = { regexSubstitution };

    return {
      id: index + 1,
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

module.exports = { blockedListToDnrRules }; 