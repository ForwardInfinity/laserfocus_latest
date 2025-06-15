/**
 * LaserFocus - UI Utilities
 * UI helper functions for overlay components
 */

// Making these functions globally available to avoid ES module issues in testing
window.LaserFocusUI = {
  /**
   * Shows the spinner by removing the 'hidden' class from the spinner container
   * @param {HTMLElement} spinnerContainer - The spinner container element
   */
  showSpinner(spinnerContainer) {
    if (spinnerContainer) {
      spinnerContainer.classList.remove('hidden');
    }
  },

  /**
   * Hides the spinner by adding the 'hidden' class to the spinner container
   * @param {HTMLElement} spinnerContainer - The spinner container element
   */
  hideSpinner(spinnerContainer) {
    if (spinnerContainer) {
      spinnerContainer.classList.add('hidden');
    }
  },

  /**
   * Shows the click-to-play fallback UI when autoplay fails
   * @param {HTMLElement} clickToPlayElement - The click-to-play element
   */
  showClickToPlay(clickToPlayElement) {
    if (clickToPlayElement) {
      clickToPlayElement.style.display = 'flex';
    }
  },

  /**
   * Hides the click-to-play fallback UI
   * @param {HTMLElement} clickToPlayElement - The click-to-play element
   */
  hideClickToPlay(clickToPlayElement) {
    if (clickToPlayElement) {
      clickToPlayElement.style.display = 'none';
    }
  },

  /**
   * Sets up the spinner behavior for a video element
   * @param {HTMLVideoElement} video - The video element
   * @param {HTMLElement} spinnerContainer - The spinner container element
   * @param {HTMLElement} clickToPlayElement - The click-to-play element
   * @param {HTMLElement} playButton - The play button element
   */
  setupSpinnerBehavior(video, spinnerContainer, clickToPlayElement, playButton) {
    // Initialize: show spinner initially
    this.showSpinner(spinnerContainer);
    
    // Event listener for when video can play through
    video.addEventListener('canplaythrough', () => {
      this.hideSpinner(spinnerContainer);
    });
    
    // Event listener for play errors (autoplay might be blocked)
    video.addEventListener('error', () => {
      this.showClickToPlay(clickToPlayElement);
    });
    
    // Event listener for when video play is prevented
    video.addEventListener('pause', () => {
      if (video.readyState < 3) {
        this.showSpinner(spinnerContainer);
      }
    });
    
    // Handle click-to-play button
    if (playButton) {
      playButton.addEventListener('click', () => {
        video.play().then(() => {
          this.hideClickToPlay(clickToPlayElement);
        }).catch(error => {
          console.error('Failed to play video:', error);
        });
      });
    }
    
    // If video fails to load after a timeout, show error
    setTimeout(() => {
      if (video.readyState < 3) {
        this.showClickToPlay(clickToPlayElement);
      }
    }, 5000);
  }
}; 