/**
 * Script to validate video distribution from the shuffle queue algorithm
 */

// Define mocking functions
function createMockFn() {
  const fn = function(...args) {
    fn.calls.push(args);
    return fn.implementation?.(...args);
  };
  fn.calls = [];
  fn.implementation = null;
  fn.mockImplementation = function(impl) { fn.implementation = impl; return fn; };
  return fn;
}

// Set up mocks
globalThis.chrome = {
  storage: {
    local: {
      get: createMockFn(),
      set: createMockFn()
    }
  },
  runtime: {
    lastError: null
  }
};

// Mock implementation that simulates real storage
let mockHistory = [];
chrome.storage.local.get.mockImplementation((key, callback) => {
  callback({ videoHistory: [...mockHistory] });
});

chrome.storage.local.set.mockImplementation((data, callback) => {
  mockHistory = data.videoHistory;
  if (callback) callback();
});

// Import the functions directly to avoid module resolution issues
function getAvailableVideos() {
  // Same implementation as in videoQueue.js
  return ['Goggins1.mp4', 'Goggins2.mp4'];
}

function getShuffledVideo(history) {
  const allVideos = getAvailableVideos();
  
  // If we only have one video, return it
  if (allVideos.length === 1) {
    return allVideos[0];
  }
  
  // If history is empty or undefined, return a random video
  if (!history || history.length === 0) {
    const randomIndex = Math.floor(Math.random() * allVideos.length);
    return allVideos[randomIndex];
  }
  
  // Get the most recent video
  const lastVideo = history[0];
  
  // Filter out the last video to ensure variety
  const availableVideos = allVideos.filter(video => video !== lastVideo);
  
  // Select a random video from the filtered list
  const randomIndex = Math.floor(Math.random() * availableVideos.length);
  return availableVideos[randomIndex];
}

async function getNextVideo() {
  // Retrieve video history from storage
  return new Promise((resolve) => {
    chrome.storage.local.get('videoHistory', (result) => {
      const videoHistory = result.videoHistory || [];
      
      // Get a new video using the shuffle algorithm
      const nextVideo = getShuffledVideo(videoHistory);
      
      // Update history (newest first)
      videoHistory.unshift(nextVideo);
      
      // Limit history to 10 items
      const trimmedHistory = videoHistory.slice(0, 10);
      
      // Save updated history
      chrome.storage.local.set({ videoHistory: trimmedHistory }, () => {
        // Return the selected video
        resolve(nextVideo);
      });
    });
  });
}

// Run simulation
async function runSimulation(numPicks) {
  const picks = [];
  
  console.log('Running video selection simulation...');
  for (let i = 0; i < numPicks; i++) {
    const video = await getNextVideo();
    picks.push(video);
    console.log(`Pick ${i + 1}: ${video}`);
  }
  
  console.log('\nAnalyzing distribution...');
  const uniqueVideos = new Set(picks);
  console.log(`Total unique videos used: ${uniqueVideos.size}`);
  
  // Analyze windows of 10 consecutive picks
  for (let i = 0; i <= numPicks - 10; i += 10) {
    const window = picks.slice(i, i + 10);
    const unique = new Set(window);
    console.log(`Window ${i + 1}-${i + 10}: ${unique.size} unique videos`);
  }
  
  return picks;
}

// Run 30 picks
runSimulation(30).catch(console.error); 