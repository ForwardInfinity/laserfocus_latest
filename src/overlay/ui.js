/**
 * LaserFocus - UI Utilities (ES Module)
 * Exports a LaserFocusUI object while also attaching it to window for
 * runtime access inside the overlay HTML.
 */

export const LaserFocusUI = {
  /**
   * Shows the spinner by removing the 'hidden' class from the spinner container
   */
  showSpinner(container) {
    container?.classList.remove('hidden');
  },

  /**
   * Hides the spinner by adding the 'hidden' class
   */
  hideSpinner(container) {
    container?.classList.add('hidden');
  },

  /**
   * Displays the click-to-play overlay when autoplay fails.
   */
  showClickToPlay(el) {
    if (el) el.style.display = 'flex';
  },

  /**
   * Hides the click-to-play overlay.
   */
  hideClickToPlay(el) {
    if (el) el.style.display = 'none';
  },

  /**
   * Wires up spinner + click-to-play behaviour for a <video> element.
   */
  setupSpinnerBehavior(video, spinnerContainer, clickToPlayEl, playBtn) {
    this.showSpinner(spinnerContainer);

    video.addEventListener('canplaythrough', () => {
      this.hideSpinner(spinnerContainer);
    });

    video.addEventListener('error', () => {
      this.showClickToPlay(clickToPlayEl);
    });

    video.addEventListener('pause', () => {
      if (video.readyState < 3) this.showSpinner(spinnerContainer);
    });

    playBtn?.addEventListener('click', () => {
      video.play()
        .then(() => this.hideClickToPlay(clickToPlayEl))
        .catch((e) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to play video:', e);
          }
        });
    });

    // safety timeout – if video still not ready after 5s, show fallback
    setTimeout(() => {
      if (video.readyState < 3) this.showClickToPlay(clickToPlayEl);
    }, 5000);
  },
};

if (typeof window !== 'undefined') {
  window.LaserFocusUI = LaserFocusUI;
} 