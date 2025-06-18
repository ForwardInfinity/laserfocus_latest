/**
 * E2E Test – Go Back Button Flow (FR-010)
 *
 * Kịch bản:
 * 1. Mở overlay.html (file://) kèm param target.
 * 2. Giả lập video đã kết thúc → nút Go Back được enable.
 * 3. Stub chrome.runtime.sendMessage để bắt dữ liệu gửi ra.
 * 4. Click Go Back.
 * 5. Khẳng định message gửi đúng (action = laserfocus/goBack) và KHÔNG chứa targetUrl.
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Tăng timeout cho file test – tránh flake CI chậm
jest.setTimeout(60000);

describe('Go Back Button – Runtime Message', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--allow-file-access-from-files'],
    });

    page = await browser.newPage();

    // Đường dẫn overlay.html kèm target giả định
    const overlayPath = path.resolve(__dirname, '../../src/overlay/overlay.html');
    const targetParam = encodeURIComponent('https://www.youtube.com/');
    await page.goto(`file://${overlayPath}?target=${targetParam}`);

    // Đợi module Scripts load
    await page.waitForFunction(() => !!window.LaserFocusControls);

    // Stub sendMessage
    await page.evaluate(() => {
      if (!window.chrome) window.chrome = {};
      if (!window.chrome.runtime) window.chrome.runtime = {};

      window.__sentMessage = null;
      window.chrome.runtime.sendMessage = (msg) => {
        window.__sentMessage = msg;
      };
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('overlay sends correct runtime message when Go Back clicked', async () => {
    // Giả lập video ended để enable button
    await page.evaluate(() => {
      const video = document.getElementById('motivational-video');
      video.dispatchEvent(new Event('ended'));
    });

    // Chờ nút Go Back được enable
    await page.waitForFunction(() => {
      const btn = document.getElementById('go-back-button');
      return btn && !btn.hasAttribute('disabled');
    });

    // Click Go Back
    await page.evaluate(() => {
      document.getElementById('go-back-button').click();
    });

    // Chờ sendMessage thực thi
    await new Promise((r) => setTimeout(r, 100));

    const sentMessage = await page.evaluate(() => window.__sentMessage);

    expect(sentMessage).not.toBeNull();
    expect(sentMessage.action).toBe('laserfocus/goBack');
    expect(sentMessage.targetUrl).toBeUndefined();
  });
}); 