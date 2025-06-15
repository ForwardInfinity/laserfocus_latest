/**
 * LaserFocus - Installation Handler
 * Handles first-time installation events and sets up default values
 */

// Import needed functions from storage.js
// Note: seedDefaultBlockList will be implemented in P1-R-06
const { seedDefaultBlockList } = require('./storage');

/**
 * Sets up the listener for chrome.runtime.onInstalled events
 * This function is exported for testing
 */
function setupInstallListener() {
  chrome.runtime.onInstalled.addListener((details) => {
    // Only seed defaults on first installation
    if (details.reason === 'install') {
      // Call the seeding function, which will be implemented in storage.js
      seedDefaultBlockList();
    }
  });
}

// In production environment, execute the setup function immediately
// In test environment, chrome object will be mocked before calling this function
// Check if we're not in a Jest test environment before executing
if (typeof jest === 'undefined') {
  setupInstallListener();
}

// Export for testing
module.exports = { setupInstallListener }; 