/**
 * End-to-end test for Phase 6 – P6-T-04
 * Tests that clicking 'Save' in the options page persists domains
 * and rebuilds dNR rules without requiring an extension reload (FR-011, FR-012, FR-019).
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Options Page - Save and Update Rules', () => {
  // The test domain we'll use
  const TEST_DOMAIN = 'example.com';
  
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
    page = await browser.newPage();

    // Expose required mock functions first
    await page.evaluateOnNewDocument(() => {
      // Mock required Chrome APIs
      if (!window.chrome) window.chrome = {};
      if (!window.chrome.storage) window.chrome.storage = {};
      if (!window.chrome.storage.sync) window.chrome.storage.sync = {};
      if (!window.chrome.runtime) window.chrome.runtime = {};

      // Mock data storage
      window.__storedData = { blockedDomains: [] };

      // Mock storage API
      window.chrome.storage.sync.get = (key, callback) => {
        if (typeof key === 'string') {
          callback({ [key]: window.__storedData[key] || [] });
        } else if (typeof key === 'object') {
          const result = {};
          for (const k in key) {
            result[k] = window.__storedData[k] || key[k];
          }
          callback(result);
        } else {
          callback(window.__storedData);
        }
      };

      window.chrome.storage.sync.set = (data, callback) => {
        Object.assign(window.__storedData, data);
        if (callback) callback();
      };

      // Mock runtime messaging
      window.__sentMessage = null;
      window.chrome.runtime.sendMessage = (msg, callback) => {
        window.__sentMessage = msg;
        // Simulate successful response
        if (callback) {
          callback({ 
            success: true, 
            rulesUpdated: msg.domains ? msg.domains.length : 0 
          });
        }
        return true;
      };
    });

    // Create file:// path to options.html
    const optionsPath = path.resolve(__dirname, '../../src/options/options.html');
    await page.goto(`file://${optionsPath}`);
    
    // Wait for the options page to be fully loaded
    await page.waitForSelector('#blocked-domains-textarea');
    
    // Wait a bit to allow scripts inside options.html to initialise
    await page.waitForFunction(() => !!document.getElementById('save-button'));
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should save domains via real UI and send message to update rules', async () => {
    // Ensure the textarea is present and clear any content
    await page.waitForSelector('#blocked-domains-textarea');
    await page.evaluate(() => {
      const textarea = document.getElementById('blocked-domains-textarea');
      textarea.value = '';
    });

    // Type the test domain
    await page.type('#blocked-domains-textarea', TEST_DOMAIN);

    // Click the Save button
    await page.click('#save-button');

    // Wait for the debounce + async storage & messaging until toast appears
    await page.waitForFunction(() => {
      const toast = document.getElementById('toast');
      return toast && toast.className.includes('show');
    }, { timeout: 2000 });

    // Check that the runtime message was sent from the real handler
    const sentMessage = await page.evaluate(() => window.__sentMessage);

    expect(sentMessage).not.toBeNull();
    expect(sentMessage.action).toBe('laserfocus/updateRules');
    expect(sentMessage.domains).toContain(TEST_DOMAIN);

    // Toast should be visible
    const toastVisible = await page.evaluate(() => {
      const toast = document.getElementById('toast');
      return toast && toast.className.includes('show');
    });

    expect(toastVisible).toBe(true);
  });
}); 