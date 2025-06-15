/**
 * LaserFocus - Overlay Controller
 * Controls behavior of the overlay UI
 * Will be populated in Phase 3
 */ 

document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('motivational-video');
  const spinnerContainer = document.querySelector('.spinner-container');
  const clickToPlay = document.getElementById('click-to-play');
  const playButton = document.getElementById('play-button');
  
  // For testing purposes, use a placeholder video source
  // In Phase 4, this will be replaced with getNextVideo() implementation
  video.src = '../../videos/placeholder.mp4';
  
  // Set up spinner behavior using the LaserFocusUI utility
  if (window.LaserFocusUI) {
    window.LaserFocusUI.setupSpinnerBehavior(video, spinnerContainer, clickToPlay, playButton);
  } else {
    console.error('LaserFocusUI not found. Make sure ui.js is loaded first.');
  }
}); 