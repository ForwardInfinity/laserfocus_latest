/**
 * E2E Responsive Layout Tests (P7-T-04)
 * Verifies overlay container fully covers viewport at min and max supported widths (NFR-006, US-008).
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Responsive Overlay Layout', () => {
  let browser;
  let page;
  const viewports = [
    { width: 320, height: 720, label: 'mobile-min' },
    { width: 2560, height: 1440, label: 'desktop-max' }
  ];

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    page = await browser.newPage();
    const overlayPath = path.resolve(__dirname, '../../src/overlay/overlay.html');
    await page.goto('file://' + overlayPath);
  });

  afterAll(async () => {
    await browser.close();
  });

  for (const vp of viewports) {
    test(`overlay should fill viewport at ${vp.label} (${vp.width}×${vp.height})`, async () => {
      await page.setViewport({ width: vp.width, height: vp.height });
      // wait a tick for resize observers / layout
      await new Promise(r => setTimeout(r, 100));

      const result = await page.evaluate(() => {
        const ov = document.getElementById('laserfocus-overlay');
        return {
          overlayW: ov.clientWidth,
          overlayH: ov.clientHeight,
          windowW: window.innerWidth,
          windowH: window.innerHeight,
          scrollW: document.body.scrollWidth,
          scrollH: document.body.scrollHeight
        };
      });

      // Assertions – these intentionally fail before responsive CSS is implemented
      expect(result.overlayW).toBe(result.windowW);
      expect(result.overlayH).toBe(result.windowH);
      expect(result.scrollW).toBe(result.windowW);
    });
  }
}); 