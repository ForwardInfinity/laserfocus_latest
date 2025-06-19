/**
 * LaserFocus - Background Service Worker
 * Main entry point for Chrome Extension background processes
 * Will be populated in subsequent phases
 */

// LaserFocus - Background Service Worker (Phase 2)
// Registers redirect rules for blocked domains using chrome.declarativeNetRequest

import { blockedListToDnrRules } from './dnrRules.js';
import { navigateToContinue, goBackOrNewTab } from './navigation.js';
import { MSG_CONTINUE, MSG_GO_BACK, MSG_UPDATE_RULES } from '../common/messages.js';
import { getBlockedDomains } from './storage.js';

// Overlay page path
const OVERLAY_PATH = '/src/overlay/overlay.html';

// Reference to the current rules for updating
let currentRules = [];

/**
 * Initializes the rule set based on stored domains
 */
async function initializeRules() {
  const blockedDomains = await getBlockedDomains();
  currentRules = blockedListToDnrRules(blockedDomains, OVERLAY_PATH);
  applyRedirectRules();
}

/**
 * Updates the dynamic rule set with new domains
 * @param {string[]} domains - Array of domains to block
 */
function updateBlockedDomains(domains) {
  // Preserve existing rule IDs for removal
  const previousRuleIds = currentRules.map((r) => r.id);

  // Generate the replacement rules from the new domain list
  const newRules = blockedListToDnrRules(domains, OVERLAY_PATH);

  // Update the reference *before* applying so that any subsequent call
  // reflects the latest state.
  currentRules = newRules;

  // If the DNR API is unavailable (e.g., Jest/Node), stop here.
  if (!chrome?.declarativeNetRequest?.updateDynamicRules) {
    return true;
  }

  // Atomically replace the ruleset: first remove old, then add new.
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: previousRuleIds,
    addRules: newRules,
  });

  return true;
}

/**
 * Updates the dynamic rule set: removes existing rule IDs, then adds the new ones.
 */
function applyRedirectRules() {
  if (!chrome?.declarativeNetRequest?.updateDynamicRules) {
    // In unsupported contexts (e.g. Jest), bail early.
    return;
  }

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: currentRules.map((r) => r.id),
    addRules: currentRules,
  });
}

// Initialize rules on service-worker load, install, and browser start-up
initializeRules();
chrome.runtime.onInstalled.addListener(() => initializeRules());
chrome.runtime.onStartup.addListener(() => initializeRules());

// Handle navigation messages from the overlay
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === MSG_CONTINUE && message.targetUrl) {
    navigateToContinue(message.targetUrl, sender.tab.id);
    sendResponse({ success: true });
    return true; // keep the message channel open for the async response
  }

  if (message.action === MSG_GO_BACK) {
    goBackOrNewTab(sender.tab?.id);
    sendResponse({ success: true });
    return true; // keep the message channel open for the async response
  }
  
  if (message.action === MSG_UPDATE_RULES) {
    const success = updateBlockedDomains(message.domains);
    sendResponse({ success, rulesUpdated: currentRules.length });
    return true; // keep the message channel open for the async response
  }
  
  return false;
}); 