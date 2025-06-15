/**
 * LaserFocus - Overlay Controller (ES Module)
 * Wires up video playback & UI spinner logic.
 */

import { getNextVideo } from './videoQueue.js';
import { LaserFocusUI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('motivational-video');
  const spinnerContainer = document.querySelector('.spinner-container');
  const clickToPlay = document.getElementById('click-to-play');
  const playButton = document.getElementById('play-button');

  getNextVideo()
    .then((file) => {
      video.src = `../../videos/${file}`;
      LaserFocusUI.setupSpinnerBehavior(video, spinnerContainer, clickToPlay, playButton);
    })
    .catch((err) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error getting next video:', err);
      }
      video.src = '../../videos/Goggins1.mp4';
      LaserFocusUI.setupSpinnerBehavior(video, spinnerContainer, clickToPlay, playButton);
    });
}); 