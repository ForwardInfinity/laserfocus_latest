/**
 * LaserFocus - Controls Manager (ES Module)
 * Handles button state management and event binding for decision flow.
 */

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
      this.enableButtons(continueButton, goBackButton);
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
   * These are stubs for now, to be implemented in later tasks
   */
  attachButtonHandlers(continueButton, goBackButton) {
    if (continueButton) {
      continueButton.addEventListener('click', () => {
        // Will be implemented in task P5-C-05 
        console.debug('Continue clicked');
      });
    }

    if (goBackButton) {
      goBackButton.addEventListener('click', () => {
        // Will be implemented in task P5-C-08
        console.debug('Go Back clicked');
      });
    }
  }
};

// Make Controls accessible via window object for dev/testing
if (typeof window !== 'undefined') {
  window.LaserFocusControls = Controls;
} 