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

  return blockedDomains.map((domain, index) => {
    if (typeof domain !== 'string' || domain.trim() === '') {
      throw new TypeError('Each blocked domain must be a non-empty string');
    }

    // Construct the redirect path, adding the target parameter if enabled
    let redirectPath = overlayPath;
    if (addTargetParam) {
      try {
        // Create a sample URL since we don't know the exact URL at rule creation time
        const sampleTargetUrl = `https://${domain}`;
        
        // Chrome has a limit on URL length - ensure we're under it
        // Max extension resource URL is typically 2MB, but we'll be conservative
        const encodedUrl = encodeURIComponent(sampleTargetUrl);
        if (encodedUrl.length > 2000) {
          console.warn(`Encoded URL for ${domain} exceeds recommended length`);
        }
        
        redirectPath = `${overlayPath}?target=${encodedUrl}`;
      } catch (e) {
        console.error(`Error encoding URL for ${domain}:`, e);
        // Still redirect, but without the target param if encoding fails
      }
    }

    return {
      id: index + 1,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: redirectPath },
      },
      condition: {
        urlFilter: `||${domain}^`,
        resourceTypes: ['main_frame'],
      },
    };
  });
}

module.exports = { blockedListToDnrRules }; 