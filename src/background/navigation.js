/**
 * LaserFocus - Navigation Handler (ES Module)
 * Handles navigation messages from the overlay
 */

/**
 * Navigate to the specified URL
 * @param {string} url - The URL to navigate to
 * @param {number} tabId - The tab ID to navigate
 */
export function navigateToContinue(url, tabId) {
  // Guard: valid non-empty string URL
  if (typeof url !== 'string' || url.trim() === '') {
    return;
  }

  try {
    // Prefer updating the existing tab when we have a valid numeric ID
    if (typeof tabId === 'number' && chrome?.tabs?.update) {
      chrome.tabs.update(tabId, { url }, () => {
        // In MV3 callbacks, runtime errors surface via chrome.runtime.lastError
        if (chrome.runtime?.lastError) {
          // Fallback: open a new tab if update fails (e.g., tab no longer exists)
          if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
            console.warn('tabs.update failed – opening new tab instead:', chrome.runtime.lastError.message);
          }
          chrome.tabs?.create && chrome.tabs.create({ url });
        }
      });
      return;
    }

    // Fallback when tabId is absent – open in a fresh tab
    if (chrome?.tabs?.create) {
      chrome.tabs.create({ url });
    }
  } catch (err) {
    // Defensive: log unexpected exceptions but avoid crashing service worker
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      console.error('navigateToContinue threw an exception', err);
    }
  }
} 