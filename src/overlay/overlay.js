/**
 * LaserFocus - Overlay Controller (ES Module)
 * Wires up video playback & UI spinner logic.
 */

import { getNextVideo } from './videoQueue.js';
import { LaserFocusUI } from './ui.js';
import { Controls } from './controls.js';

// Provide a minimal stub of the Chrome Extension APIs when running the HTML
// directly via the file:// protocol (typical for Jest-Puppeteer e2e tests).
// This prevents ReferenceError crashes inside helper modules that expect the
// global `chrome` object. The stub covers only the members accessed in
// overlay-side code (storage.local & runtime).
if (typeof chrome === 'undefined') {
  /* eslint-disable no-underscore-dangle, no-restricted-globals */
  // @ts-ignore – make TS/ESLint happy even though we are declaring global
  window.chrome = {
    storage: {
      local: {
        get: (_key, callback) => callback({}),
        set: (_obj, callback) => callback && callback(),
      },
    },
    runtime: {},
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('motivational-video');
  const spinnerContainer = document.querySelector('.spinner-container');
  const clickToPlay = document.getElementById('click-to-play');
  const playButton = document.getElementById('play-button');
  const continueButton = document.getElementById('continue-button');
  const goBackButton = document.getElementById('go-back-button');

  // Setup decision buttons using the Controls module
  Controls.setupDecisionButtons(video, continueButton, goBackButton);

  getNextVideo()
    .then((file) => {
      video.src = `../../videos/${file}`;
      LaserFocusUI.setupSpinnerBehavior(video, spinnerContainer, clickToPlay, playButton);
    })
    .catch((err) => {
      // Guard against undefined `process` in Chrome runtime (MV3 service worker / overlay context)
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
        console.error('Error getting next video:', err);
      }
      video.src = '../../videos/Goggins1.mp4';
      LaserFocusUI.setupSpinnerBehavior(video, spinnerContainer, clickToPlay, playButton);
    });
}); 