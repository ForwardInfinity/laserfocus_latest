/**
 * LaserFocus - Focus Trap Module (ES Module)
 * Implements keyboard navigation management for accessibility
 * 
 * Keyboard Shortcuts:
 * - Tab: Navigate forward through focusable elements
 * - Shift+Tab: Navigate backward through focusable elements
 * - Enter/Space: Activate buttons and controls
 * - Escape: Trigger "Go Back" action
 */

import { MSG_GO_BACK } from '../common/messages.js';

/**
 * Finds all focusable elements within a container
 * @param {HTMLElement} container - The container to search within
 * @returns {Array<HTMLElement>} Array of focusable elements
 */
export function getFocusableElements(container) {
  // Query selectors for elements that can receive focus
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'a[href]',
    'area[href]',
    '[tabindex]:not([tabindex="-1"])',
    'video[controls]',
    'audio[controls]',
    '[contenteditable]:not([contenteditable="false"])'
  ];

  const elements = container.querySelectorAll(focusableSelectors.join(','));
  return Array.from(elements);
}

/**
 * Focus trap implementation for the overlay
 */
export const FocusTrap = {
  /**
   * The container element to trap focus within
   * @type {HTMLElement}
   */
  container: null,

  /**
   * List of focusable elements within the container
   * @type {Array<HTMLElement>}
   */
  focusableElements: [],

  /**
   * The element that had focus before the trap was activated
   * @type {HTMLElement}
   */
  previouslyFocused: null,

  /**
   * Finds all focusable elements within a container
   * Reference to the exported function for easier access
   */
  getFocusableElements,

  /**
   * Activates the focus trap for a container
   * @param {HTMLElement} container - The container to trap focus within
   * @param {HTMLElement} [initialFocus] - Optional element to receive initial focus, defaults to the first focusable element
   */
  activate(container, initialFocus = null) {
    this.container = container;
    this.focusableElements = getFocusableElements(container);
    this.previouslyFocused = document.activeElement;

    // If we didn't find any enabled, focusable elements (e.g. buttons are disabled),
    // fall back to the container itself. Ensure it can receive focus via tabindex="-1".
    if (this.focusableElements.length === 0) {
      if (!container.hasAttribute('tabindex')) {
        container.setAttribute('tabindex', '-1');
      }
      this.focusableElements = [container];
    }

    // Always attach the keydown listener so that once elements become focusable later
    // (after video end), the trap continues to work.
    document.addEventListener('keydown', this.handleKeyDown);

    // Set initial focus
    const elementToFocus = initialFocus || this.focusableElements[0];
    setTimeout(() => {
      elementToFocus.focus();
    }, 0);
  },

  /**
   * Deactivates the focus trap
   */
  deactivate() {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      this.previouslyFocused.focus();
    }
    
    this.container = null;
    this.focusableElements = [];
    this.previouslyFocused = null;
  },

  /**
   * Handles keydown events for tab navigation and escape
   * @param {KeyboardEvent} event - The keydown event
   */
  handleKeyDown(event) {
    // Reference the object correctly within the event handler
    const self = FocusTrap;
    
    // If the container is gone or no focusable elements, do nothing
    if (!self.container || !self.focusableElements.length) return;

    const { key, shiftKey } = event;
    
    // Handle Escape key
    if (key === 'Escape') {
      event.preventDefault();
      chrome.runtime.sendMessage({ action: MSG_GO_BACK });
      return;
    }
    
    // Handle Tab key for cycling through elements
    if (key === 'Tab') {
      if (self.focusableElements.length === 1) {
        // If only one focusable element, keep focus on it
        event.preventDefault();
        self.focusableElements[0].focus();
        return;
      }

      // Get the current focus position
      const currentFocus = document.activeElement;
      const currentIndex = self.focusableElements.indexOf(currentFocus);
      
      // If focus is outside our elements, reset it to first/last element
      if (currentIndex === -1) {
        event.preventDefault();
        self.focusableElements[0].focus();
        return;
      }
      
      // Calculate the next focus index
      let nextIndex;
      if (shiftKey) {
        // Moving backward with Shift+Tab
        nextIndex = currentIndex <= 0 ? self.focusableElements.length - 1 : currentIndex - 1;
      } else {
        // Moving forward with Tab
        nextIndex = currentIndex >= self.focusableElements.length - 1 ? 0 : currentIndex + 1;
      }
      
      event.preventDefault();
      self.focusableElements[nextIndex].focus();
    }
  },

  /**
   * Recalculate the list of focusable elements (e.g. after buttons become enabled)
   */
  refresh() {
    if (!this.container) return;
    this.focusableElements = getFocusableElements(this.container);
    // Ensure there is at least one focusable element
    if (this.focusableElements.length === 0) {
      if (!this.container.hasAttribute('tabindex')) {
        this.container.setAttribute('tabindex', '-1');
      }
      this.focusableElements = [this.container];
    }
  }
};

// Make FocusTrap accessible via window object for testing
if (typeof window !== 'undefined') {
  window.FocusTrap = FocusTrap;
} 