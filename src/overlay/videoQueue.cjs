/**
 * CommonJS wrapper of videoQueue for Node-based Jest tests.
 * Mirrors logic in videoQueue.js (ESM) to satisfy testing without requiring
 * experimental-vm-modules.
 * NOTE: Keep this file in sync with the ESM version.
 */

function getAvailableVideos() {
  return ['Goggins1.mp4', 'Goggins2.mp4'];
}

function getShuffledVideo(history = []) {
  const allVideos = getAvailableVideos();
  if (allVideos.length === 1) return allVideos[0];
  const [lastVideo] = history;
  const candidates = allVideos.filter((v) => v !== lastVideo);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getVideoHistoryFromStorage() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get('videoHistory', (result) => {
        if (chrome.runtime?.lastError) {
          resolve([]);
        } else {
          resolve(result.videoHistory || []);
        }
      });
    } catch {
      resolve([]);
    }
  });
}

function saveVideoHistoryToStorage(videoHistory) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ videoHistory }, () => resolve());
    } catch {
      resolve();
    }
  });
}

async function getNextVideo() {
  const history = await getVideoHistoryFromStorage();
  const next = getShuffledVideo(history);
  await saveVideoHistoryToStorage([next, ...history].slice(0, 10));
  return next;
}

module.exports = {
  getNextVideo,
  getAvailableVideos,
  getShuffledVideo,
  getVideoHistoryFromStorage,
  saveVideoHistoryToStorage,
}; 