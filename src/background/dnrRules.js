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

    // dNR urlFilter syntax: "||domain^" matches eTLD+1 and any sub-domain
    // See: https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/#url-filter-format
    return {
      id: index + 1, // IDs must be positive integers and unique per rule list
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          extensionPath: redirectPath,
        },
      },
      condition: {
        urlFilter: `||${domain}^`,
        resourceTypes: ['main_frame'],
      },
    };
  });
}

// CommonJS compatibility for Node-based Jest tests
// eslint-disable-next-line no-undef
if (typeof module !== 'undefined') {
  // eslint-disable-next-line no-undef
  module.exports = { blockedListToDnrRules };
} 