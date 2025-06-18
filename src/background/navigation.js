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

/**
 * Navigates back in history if possible; otherwise opens a new-tab page.
 * This fulfils FR-010 behaviour for the Go Back decision.
 *
 * @param {number} tabId – Current tab ID provided by sender.tab.id
 */
export function goBackOrNewTab(tabId) {
  const NEW_TAB_URL = 'chrome://newtab';

  const openNewTab = () => {
    if (chrome?.tabs?.update && typeof tabId === 'number') {
      chrome.tabs.update(tabId, { url: NEW_TAB_URL });
    } else {
      chrome?.tabs?.create && chrome.tabs.create({ url: NEW_TAB_URL });
    }
  };

  try {
    // Determine history length inside the target tab, if possible
    if (chrome?.scripting?.executeScript && typeof tabId === 'number') {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          func: () => history.length >= 2,
        },
        (results) => {
          const canGoBack = Array.isArray(results) && results[0]?.result;
          if (canGoBack) {
            chrome.scripting.executeScript({
              target: { tabId },
              func: () => {
                try { history.back(); } catch (_e) {}
              },
            }, () => {
              if (chrome.runtime?.lastError) openNewTab();
            });
          } else {
            openNewTab();
          }
        }
      );
      return;
    }

    // Fallback when executeScript unavailable
    openNewTab();
  } catch (err) {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      console.error('goBackOrNewTab exception', err);
    }
  }
}

// Provide CommonJS compatibility for Jest (which runs in CJS context)
if (typeof module !== 'undefined') {
  module.exports = { navigateToContinue, goBackOrNewTab };
} 