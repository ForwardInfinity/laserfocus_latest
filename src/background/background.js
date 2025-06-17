/**
 * LaserFocus - Background Service Worker
 * Main entry point for Chrome Extension background processes
 * Will be populated in subsequent phases
 */

// LaserFocus - Background Service Worker (Phase 2)
// Registers redirect rules for blocked domains using chrome.declarativeNetRequest

import { blockedListToDnrRules } from './dnrRules.js';
import { navigateToContinue } from './navigation.js';
import { MSG_CONTINUE } from '../common/messages.js';

// TODO: replace with dynamic storage-driven list in later phases (P1)
const BLOCKED_DOMAINS = ['facebook.com'];
const OVERLAY_PATH = '/src/overlay/overlay.html';

// Generate the rules once at start-up
const RULES = blockedListToDnrRules(BLOCKED_DOMAINS, OVERLAY_PATH);

/**
 * Updates the dynamic rule set: removes existing rule IDs, then adds the new ones.
 */
function applyRedirectRules() {
  if (!chrome?.declarativeNetRequest?.updateDynamicRules) {
    // In unsupported contexts (e.g. Jest), bail early.
    return;
  }

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: RULES.map((r) => r.id),
    addRules: RULES,
  });
}

// Apply rules on service-worker load, install, and browser start-up
applyRedirectRules();
chrome.runtime.onInstalled.addListener(() => applyRedirectRules());
chrome.runtime.onStartup.addListener(() => applyRedirectRules());

// Handle navigation messages from the overlay
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === MSG_CONTINUE && message.targetUrl) {
    navigateToContinue(message.targetUrl, sender.tab.id);
    sendResponse({ success: true });
  }
}); 