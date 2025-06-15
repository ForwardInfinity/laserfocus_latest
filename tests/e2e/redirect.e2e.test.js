const puppeteer = require('puppeteer');
const path = require('path');

// Increase default timeout for potentially slow CI environments
jest.setTimeout(30000);

/**
 * Returns the absolute path to the root of the extension (current workspace).
 */
function getExtensionPath() {
  return path.resolve(process.cwd());
}

describe('Redirection (Phase 2 – P2-T-04)', () => {
  let browser;
  let page;

  beforeAll(async () => {
    const extensionPath = getExtensionPath();

    browser = await puppeteer.launch({
      headless: false, // Extensions are disabled in headless mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
      ],
      // Puppeteer v24 allows using Chrome stable channel; keep default
    });

    page = await browser.newPage();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('should redirect navigation to overlay before DOM load', async () => {
    // Wait a moment for the extension's service worker to register rules
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.goto('https://facebook.com', { waitUntil: 'domcontentloaded' });
    const finalUrl = page.url();

    // The URL should be redirected to our overlay
    expect(finalUrl).toMatch(/src\/overlay\/overlay\.html/);
    
    // The host of the final URL should be chrome-extension://, not facebook.com
    const finalUrlObj = new URL(finalUrl);
    expect(finalUrlObj.protocol).toBe('chrome-extension:');
  });
  
  it('should include the original URL as a target parameter', async () => {
    // Wait a moment for the extension's service worker to register rules
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await page.goto('https://facebook.com', { waitUntil: 'domcontentloaded' });
    const finalUrl = page.url();
    
    // Check that the target parameter exists
    expect(finalUrl).toMatch(/\?target=/);
    
    // Check that the encoded URL includes the original domain
    const encodedPart = finalUrl.split('target=')[1];
    const decodedUrl = decodeURIComponent(encodedPart);
    expect(decodedUrl).toContain('facebook.com');
  });
}); 