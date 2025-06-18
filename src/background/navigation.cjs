// LaserFocus - Navigation Handler (CommonJS shim for Jest & Node < ESM)
// This file duplicates the logic in navigation.js but using CommonJS syntax
// so that Jest (which runs in CJS context by default) can require it without
// experimental flags.

/**
 * Navigate to the specified URL
 * @param {string} url - The URL to navigate to
 * @param {number} tabId - The tab ID to navigate
 */
function navigateToContinue(url, tabId) {
  if (typeof url !== 'string' || url.trim() === '') {
    return;
  }
  try {
    if (typeof tabId === 'number' && global.chrome?.tabs?.update) {
      global.chrome.tabs.update(tabId, { url }, () => {
        if (global.chrome.runtime?.lastError) {
          global.chrome.tabs?.create && global.chrome.tabs.create({ url });
        }
      });
      return;
    }
    if (global.chrome?.tabs?.create) {
      global.chrome.tabs.create({ url });
    }
  } catch (_err) {
    // Silent in test shim
  }
}

/**
 * goBackOrNewTab – mirrors implementation in ESM module
 */
function goBackOrNewTab(tabId) {
  const NEW_TAB_URL = 'chrome://newtab';
  const openNewTab = () => {
    if (global.chrome?.tabs?.update && typeof tabId === 'number') {
      global.chrome.tabs.update(tabId, { url: NEW_TAB_URL });
    } else if (global.chrome?.tabs?.create) {
      global.chrome.tabs.create({ url: NEW_TAB_URL });
    }
  };

  try {
    if (global.chrome?.scripting?.executeScript && typeof tabId === 'number') {
      global.chrome.scripting.executeScript(
        { target: { tabId }, func: () => history.length >= 2 },
        (results) => {
          const canGoBack = Array.isArray(results) && results[0]?.result;
          if (canGoBack) {
            global.chrome.scripting.executeScript({
              target: { tabId },
              func: () => { try { history.back(); } catch (_e) {} },
            }, () => {
              if (global.chrome.runtime?.lastError) openNewTab();
            });
          } else {
            openNewTab();
          }
        }
      );
      return;
    }

    openNewTab();
  } catch (_err) {
    /* silent */
  }
}

module.exports = { navigateToContinue, goBackOrNewTab }; 