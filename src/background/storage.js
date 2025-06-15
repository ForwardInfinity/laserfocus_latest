/**
 * Default list of domains to block on first installation
 */
const DEFAULT_BLOCKED_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'tiktok.com',
  'youtube.com',
  'twitter.com'
];

/**
 * Key used to store the blocklist in chrome.storage.sync
 */
const STORAGE_KEY = 'blockedDomains';

/**
 * Retrieves the list of blocked domains from storage
 * Returns the default list if none exists
 * @returns {Promise<string[]>} Array of blocked domains
 */
function getBlockedDomains() {
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
function saveBlockedDomains(domains) {
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

/**
 * Seeds the default block list if it doesn't already exist in storage
 * This function is called during first installation (FR-013)
 * @returns {Promise<void>}
 */
function seedDefaultBlockList() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(STORAGE_KEY, async (result) => {
      // Only seed if the blockedDomains key doesn't exist in storage
      if (!result || !result[STORAGE_KEY]) {
        try {
          await saveBlockedDomains(DEFAULT_BLOCKED_DOMAINS);
          console.log('Default block list seeded successfully');
        } catch (error) {
          console.error('Failed to seed default block list:', error);
        }
      }
      resolve();
    });
  });
}

// For CommonJS compatibility with Jest tests
module.exports = { 
  getBlockedDomains, 
  saveBlockedDomains, 
  seedDefaultBlockList,
  DEFAULT_BLOCKED_DOMAINS,
  STORAGE_KEY
}; 