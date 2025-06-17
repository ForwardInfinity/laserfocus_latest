/**
 * LaserFocus - Video Queue Manager (ES Module)
 * Implements shuffle-queue algorithm per SRS 4.3 / FR-007.
 * Guarantees at least two distinct videos in any 10 consecutive interceptions
 * and persists `videoHistory` (length ≤ 10) to chrome.storage.local.
 */

/**
 * Returns an array of bundled video filenames.
 * TODO: Replace hard-coded list with build-time generated manifest when
 * packaging phase (P8) introduces an asset index.
 * @returns {string[]} video file names
 */
export function getAvailableVideos() {
  return ['Goggins1.mp4', 'Goggins2.mp4'];
}

/**
 * Pure function – choose a video ensuring it differs from the most recent pick.
 * @param {string[]} history Recent history (newest first)
 * @returns {string} selected video
 */
export function getShuffledVideo(history = []) {
  const allVideos = getAvailableVideos();

  // If only one asset bundled, return it – requirement FR-007 would be
  // impossible to satisfy, but we still need graceful behaviour.
  if (allVideos.length === 1) return allVideos[0];

  // Filter to avoid immediate repetition of the last video.
  const [lastVideo] = history;
  const candidates = allVideos.filter((v) => v !== lastVideo);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Async helper – read stored history; resolves to [] on any failure.
 * @returns {Promise<string[]>}
 */
export async function getVideoHistoryFromStorage() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get('videoHistory', (result) => {
        if (chrome.runtime?.lastError) {
          if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
            console.error('Error retrieving video history:', chrome.runtime.lastError);
          }
          resolve([]);
        } else {
          resolve(result.videoHistory || []);
        }
      });
    } catch (error) {
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
        console.error('Exception retrieving video history:', error);
      }
      resolve([]);
    }
  });
}

/**
 * Persist trimmed history (max length 10) – fire-and-forget.
 * @param {string[]} videoHistory history to save
 * @returns {Promise<void>}
 */
export async function saveVideoHistoryToStorage(videoHistory) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ videoHistory }, () => {
        if (chrome.runtime?.lastError && (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production')) {
          console.error('Error saving video history:', chrome.runtime.lastError);
        }
        resolve();
      });
    } catch (error) {
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
        console.error('Exception saving video history:', error);
      }
      resolve();
    }
  });
}

/**
 * Public orchestrator – returns next video and updates persisted history.
 * @returns {Promise<string>} selected video filename
 */
export async function getNextVideo() {
  try {
    const history = await getVideoHistoryFromStorage();
    const nextVideo = getShuffledVideo(history);

    // Prepend & trim to length ≤ 10 then persist.
    await saveVideoHistoryToStorage([nextVideo, ...history].slice(0, 10));
    return nextVideo;
  } catch (err) {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
      console.error('Error in getNextVideo()', err);
    }
    // Return first available asset as safe fallback.
    return getAvailableVideos()[0];
  }
}

// CommonJS interoperability for Jest (Node) which still uses require()
// Safe because typeof check avoids ReferenceError in pure ESM contexts
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getNextVideo,
    getAvailableVideos,
    getShuffledVideo,
    getVideoHistoryFromStorage,
    saveVideoHistoryToStorage,
  };
} 