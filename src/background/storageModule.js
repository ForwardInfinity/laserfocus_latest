/**
 * ES Module wrapper for storage.js that exports the same functions
 * for use in the Chrome extension environment
 */

// Default list of domains to block on first installation
const DEFAULT_BLOCKED_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'twitter.com'
];

// Key used to store the blocklist in chrome.storage.sync
const STORAGE_KEY = 'blockedDomains';

/**
 * Retrieves the list of blocked domains from storage
 * Returns the default list if none exists
 * @returns {Promise<string[]>} Array of blocked domains
 */
export function getBlockedDomains() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      // If blockedDomains exists in storage and is an array, use it
      // Otherwise return the default list
      if (result && result[STORAGE_KEY] && Array.isArray(result[STORAGE_KEY])) {
        resolve(result[STORAGE_KEY]);
      } else {
        resolve(DEFAULT_BLOCKED_DOMAINS);
      }
    });
  });
}

/**
 * Saves the list of blocked domains to storage
 * @param {string[]} domains - Array of domains to block
 * @returns {Promise<void>}
 */
export function saveBlockedDomains(domains) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(domains)) {
      reject(new Error('Domains must be an array'));
      return;
    }

    chrome.storage.sync.set({ [STORAGE_KEY]: domains }, () => {
      // Check for chrome runtime error
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(`Failed to save domains: ${error.message}`));
      } else {
        resolve();
      }
    });
  });
}

export { DEFAULT_BLOCKED_DOMAINS, STORAGE_KEY }; 