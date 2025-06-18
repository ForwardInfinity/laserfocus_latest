/**
 * LaserFocus - Controls Manager (ES Module)
 * Handles button state management and event binding for decision flow.
 */

import { MSG_CONTINUE, MSG_GO_BACK } from '../common/messages.js';

/**
 * Extract the target URL from the query parameters
 * @returns {string|null} The decoded target URL or null if not found
 */
function getTargetUrl() {
  // We cannot trust URLSearchParams because the *value* itself may contain
  // un-escaped ampersands (e.g. the original URL has its own query string).
  // Instead, locate the first occurrence of "target=" and take everything
  // until the next '&' (if any) or the end of the search string.

  const search = window.location.search;
  // Early exit if no "?target=" fragment is present.
  if (!search.includes('target=')) return null;

  // Use RegExp with non-greedy capture to pull the exact value.
  const match = search.match(/[?&]target=([^&]+)/);
  if (!match || !match[1]) return null;

  const rawValue = match[1];

  try {
    return decodeURIComponent(rawValue);
  } catch (_err) {
    // The value might already be decoded; return as-is.
    return rawValue;
  }
}

/**
 * Manages the decision buttons state and event handlers
 */
export const Controls = {
  /**
   * Setup all button state management and event listeners
   * @param {HTMLVideoElement} videoElement - The video element to bind 'ended' event to
   * @param {HTMLButtonElement} continueButton - The Continue button element
   * @param {HTMLButtonElement} goBackButton - The Go Back button element
   */
  setupDecisionButtons(videoElement, continueButton, goBackButton) {
    // Initially buttons should be disabled
    this.disableButtons(continueButton, goBackButton);

    // Enable buttons when video ends
    videoElement.addEventListener('ended', () => {
      Controls.enableButtons(continueButton, goBackButton);
    });

    // For testing purposes, dispatch a custom event when buttons are enabled
    videoElement.addEventListener('ended', () => {
      const event = new CustomEvent('buttons-enabled');
      document.dispatchEvent(event);
    });

    // Attach click event handlers
    this.attachButtonHandlers(continueButton, goBackButton);
  },

  /**
   * Disables the decision buttons
   */
  disableButtons(continueButton, goBackButton) {
    if (continueButton) continueButton.setAttribute('disabled', '');
    if (goBackButton) goBackButton.setAttribute('disabled', '');
  },

  /**
   * Enables the decision buttons
   */
  enableButtons(continueButton, goBackButton) {
    if (continueButton) continueButton.removeAttribute('disabled');
    if (goBackButton) goBackButton.removeAttribute('disabled');
  },

  /**
   * Attaches event handlers to the decision buttons
   */
  attachButtonHandlers(continueButton, goBackButton) {
    if (continueButton) {
      continueButton.addEventListener('click', () => {
        const targetUrl = getTargetUrl();
        if (targetUrl) {
          // Send message to the background script to navigate to the target URL
          chrome.runtime.sendMessage({
            action: MSG_CONTINUE,
            targetUrl
          });
        }
      });
    }

    if (goBackButton) {
      goBackButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({
          action: MSG_GO_BACK,
        });
      });
    }
  }
};

// Make Controls accessible via window object for dev/testing
if (typeof window !== 'undefined') {
  window.LaserFocusControls = Controls;
} 