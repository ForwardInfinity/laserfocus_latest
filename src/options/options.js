/**
 * LaserFocus - Options Controller
 * Controls behavior of the options page
 * Will be populated in Phase 6
 */ 

/*
 * LaserFocus – Options Page Controller (Phase 6)
 * Implements FR-011 and partial FR-012: load & save block-list.
 */

// Import message constants
import { MSG_UPDATE_RULES } from '../common/messages.js';

// Domain sanitiser – loaded lazily for compatibility with both ESM (browser)
// and CommonJS (Jest) environments.
let sanitizeDomain;

/**
 * Debounce utility to prevent multiple rapid executions
 * @param {Function} func - function to debounce
 * @param {number} wait - milliseconds to wait
 * @returns {Function} - debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Shows a toast notification with the given message
 * @param {string} message - Message to display
 * @param {number} duration - Duration to show in ms
 */
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.className = 'show';
  
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, duration);
}

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
    const debouncedSave = debounce(() => handleSave(textarea), 300);
    saveButton.addEventListener('click', debouncedSave);
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
 * Implements FR-012 with messaging to BG script to rebuild dNR rules (FR-019).
 * @param {HTMLTextAreaElement} textarea
 */
async function handleSave(textarea) {
  const sanitizer = await loadSanitizer();
  const saveButton = document.getElementById('save-button');
  
  // Disable button during save
  if (saveButton) saveButton.disabled = true;

  const lines = textarea.value
    .split('\n')
    .map(sanitizer)
    .filter(Boolean);

  chrome.storage.sync.set({ blockedDomains: lines }, () => {
    // Notify background to rebuild dNR rules
    chrome.runtime.sendMessage({
      action: MSG_UPDATE_RULES,
      domains: lines
    }, (response) => {
      // Re-enable button
      if (saveButton) saveButton.disabled = false;
      
      if (response && response.success) {
        const count = response.rulesUpdated || lines.length;
        showToast(`Block list updated successfully! (${count} domains)`);
      } else {
        showToast('Could not update block list. Please try again.');
      }
    });
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
  module.exports = { init, showToast, debounce };
} 