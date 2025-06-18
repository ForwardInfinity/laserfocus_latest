/**
 * LaserFocus - Options Controller
 * Controls behavior of the options page
 * Will be populated in Phase 6
 */ 

/*
 * LaserFocus – Options Page Controller (Phase 6)
 * Implements FR-011 and partial FR-012: load & save block-list.
 */

// Domain sanitiser – loaded lazily for compatibility with both ESM (browser)
// and CommonJS (Jest) environments.
let sanitizeDomain;

function loadSanitizer() {
  if (sanitizeDomain) return Promise.resolve(sanitizeDomain);

  return new Promise((resolve, reject) => {
    try {
      // Jest/Node: use require if available
      // eslint-disable-next-line global-require, import/no-dynamic-require
      ({ sanitizeDomain } = require('./sanitize.js'));
      return resolve(sanitizeDomain);
    } catch (err) {
      // Browser/ESM: fall back to dynamic import
      import('./sanitize.js')
        .then((mod) => {
          sanitizeDomain = mod.sanitizeDomain;
          resolve(sanitizeDomain);
        })
        .catch(reject);
    }
  });
}

/**
 * Ensures code executes after DOMContentLoaded.
 */
function ready(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

/**
 * Initialise the options page: load current block list and attach handlers.
 * Exported for unit testing.
 * @returns {Promise<void>}
 */
async function init() {
  const textarea = document.getElementById('blocked-domains-textarea');
  const saveButton = document.getElementById('save-button');

  if (!textarea) {
    console.error('Options page initialisation failed: textarea not found');
    return;
  }

  // 1. Load existing domains (or defaults) from chrome.storage.sync
  const domains = await getBlockedDomainsFromStorage();
  textarea.value = domains.join('\n');

  // 2. Attach Save handler once
  if (saveButton && !saveButton.dataset.bound) {
    saveButton.addEventListener('click', () => handleSave(textarea));
    saveButton.dataset.bound = 'true';
  }
}

/**
 * Retrieves the blockedDomains array from chrome.storage.sync.
 * Falls back to default list if undefined.
 * @returns {Promise<string[]>}
 */
function getBlockedDomainsFromStorage() {
  return new Promise((resolve) => {
    // Use the `get` signature with a default value. This is cleaner and
    // correctly returns an empty array if 'blockedDomains' is not found,
    // which aligns with FR-014 (empty list is a valid state).
    chrome.storage.sync.get({ blockedDomains: [] }, (result) => {
      // The API guarantees result.blockedDomains will be an array.
      resolve(result.blockedDomains);
    });
  });
}

/**
 * Handles Save button click: sanitise input and persist to storage.
 * Partially satisfies FR-012 (full messaging to BG script added in later task).
 * @param {HTMLTextAreaElement} textarea
 */
async function handleSave(textarea) {
  const sanitizer = await loadSanitizer();

  const lines = textarea.value
    .split('\n')
    .map(sanitizer)
    .filter(Boolean);

  chrome.storage.sync.set({ blockedDomains: lines }, () => {
    // TODO (Phase 6 - C05): notify background to rebuild dNR rules.
  });
}

// Auto-init when DOM is ready.
ready(() => {
  // Ignore async errors; they will surface in console for dev.
  init();
});

// Expose for CommonJS (Jest)
if (typeof module !== 'undefined') {
  // eslint-disable-next-line no-undef
  module.exports = { init };
} 