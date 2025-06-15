/**
 * Unit tests for videoQueue (CommonJS wrapper).
 */

global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  runtime: {
    lastError: null,
  },
};

const {
  getNextVideo,
  getShuffledVideo,
  getVideoHistoryFromStorage,
  saveVideoHistoryToStorage,
} = require('../../src/overlay/videoQueue.cjs');

beforeEach(() => {
  chrome.storage.local.get.mockReset();
  chrome.storage.local.set.mockReset();
  chrome.storage.local.get.mockImplementation((key, cb) => cb({ videoHistory: [] }));
  chrome.storage.local.set.mockImplementation((data, cb) => cb && cb());
  chrome.runtime.lastError = null;
});

describe('Video Shuffle Queue', () => {
  test('guarantees at least 2 distinct videos in any 10 picks', async () => {
    let mockHistory = [];
    chrome.storage.local.get.mockImplementation((key, cb) => cb({ videoHistory: [...mockHistory] }));
    chrome.storage.local.set.mockImplementation((data, cb) => {
      mockHistory = data.videoHistory;
      cb && cb();
    });

    const picks = [];
    for (let i = 0; i < 20; i++) {
      picks.push(await getNextVideo());
    }

    for (let i = 0; i <= 10; i++) {
      const window = picks.slice(i, i + 10);
      if (window.length === 10) {
        expect(new Set(window).size).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test('maintains videoHistory with max length of 10', async () => {
    for (let i = 0; i < 15; i++) {
      await getNextVideo();
    }

    const calls = chrome.storage.local.set.mock.calls;
    const lastCall = calls[calls.length - 1];
    const savedHistory = lastCall[0].videoHistory;
    expect(savedHistory.length).toBeLessThanOrEqual(10);
  });

  test('handles storage errors gracefully', async () => {
    chrome.runtime.lastError = { message: 'Test error' };
    const video = await getNextVideo();
    expect(video).toBeTruthy();
  });

  test('getVideoHistoryFromStorage returns empty array on error', async () => {
    chrome.runtime.lastError = { message: 'Test error' };
    const history = await getVideoHistoryFromStorage();
    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(0);
  });

  test('saveVideoHistoryToStorage completes despite errors', async () => {
    chrome.runtime.lastError = { message: 'Test error' };
    await expect(saveVideoHistoryToStorage(['test.mp4'])).resolves.not.toThrow();
  });
}); 