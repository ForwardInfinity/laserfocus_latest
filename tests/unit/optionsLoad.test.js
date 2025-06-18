const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Import constants for storage key and defaults
const {
  DEFAULT_BLOCKED_DOMAINS,
  STORAGE_KEY
} = require('../../src/background/storage');

/**
 * Unit test for Phase 6 – P6-T-01
 * Verifies that the Options page loads the existing blockedDomains list
 * from chrome.storage.sync and populates the textarea accordingly (FR-011).
 *
 * THE TEST IS EXPECTED TO FAIL initially (red phase).
 */
describe('Options Page – Load behaviour', () => {
  let dom;
  let document;

  // Mock list returned by chrome.storage.sync
  const mockedDomains = ['facebook.com', 'twitter.com'];

  beforeEach(() => {
    // Provide a minimal mock implementation of the Chrome storage API
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn()
        }
      }
    };

    // `chrome.storage.sync.get` should invoke the callback with our mock list
    chrome.storage.sync.get.mockImplementation((key, callback) => {
      callback({ [STORAGE_KEY]: mockedDomains });
    });

    // Load the current options.html markup into JSDOM
    const htmlPath = path.resolve(__dirname, '../../src/options/options.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable'
    });

    document = dom.window.document;

    // Expose DOM globals for the module under test
    global.window = dom.window;
    global.document = document;
  });

  it('should populate the textarea with domains from storage on page load', async () => {
    // Require the CommonJS module after DOM is ready so it can attach listeners
    const optionsModule = require('../../src/options/options.js');

    // init is expected to be async (returns Promise)
    if (typeof optionsModule.init === 'function') {
      await optionsModule.init();
    }

    // Allow pending micro–tasks to flush
    await new Promise(setImmediate);

    const textarea = document.getElementById('blocked-domains-textarea');

    // The element must exist and contain the expected newline-delimited list
    expect(textarea).not.toBeNull();
    expect(textarea.value).toBe(mockedDomains.join('\n'));
  });
}); 