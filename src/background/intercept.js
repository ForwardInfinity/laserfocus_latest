/**
 * LaserFocus - Intercept Logic
 * Functions to determine whether to intercept navigation requests
 */

// Import required functions from storage module
const { getBlockedDomains } = require('./storage');

/**
 * Determines if navigation interception should occur based on the block list
 * 
 * This function is a key gatekeeper for the extension's core functionality. It ensures
 * that when a user clears their block list completely, the extension's navigation
 * interception is fully disabled (FR-014). This allows users to temporarily disable
 * the extension without uninstalling it.
 * 
 * Edge cases:
 * - Empty array: Returns false (no interception)
 * - Storage error: Will propagate any errors from getBlockedDomains()
 * - Undefined/null return from storage: Function assumes valid array is always returned
 *   from getBlockedDomains (which has its own error handling)
 * 
 * @async
 * @returns {Promise<boolean>} True if interception should occur (block list has entries),
 *                            false if interception should be skipped (block list is empty)
 * 
 * @example
 * // Check if interception should occur before processing navigation
 * if (await shouldIntercept()) {
 *   // Apply interception rules
 * } else {
 *   // Skip interception logic
 * }
 */
async function shouldIntercept() {
  const blockedDomains = await getBlockedDomains();
  return blockedDomains.length > 0;
}

// Export for use in other modules and testing
module.exports = { shouldIntercept }; 