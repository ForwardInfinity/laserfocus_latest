/**
 * E2E Test – Continue Button Flow (FR-003, FR-009)
 *
 * Kịch bản:
 * 1. Mở trực tiếp overlay.html với query `target` trỏ tới https://www.facebook.com/
 * 2. Giả lập video đã kết thúc bằng cách dispatch sự kiện `ended`.
 * 3. Stub `chrome.runtime.sendMessage` để ghi nhận message phía overlay gửi đi.
 * 4. Click nút Continue.
 * 5. Khẳng định message gửi đúng định dạng và chứa URL gốc.
 *
 * Lưu ý: Chúng ta KHÔNG thể kiểm tra chrome.tabs.update trong môi trường file://,
 * nhưng việc gửi message chính xác là bước then chốt của luồng Continue.
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Continue Button – Runtime Message', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files'] });
    page = await browser.newPage();

    // Tạo đường dẫn file:// tới overlay.html kèm tham số target
    const overlayPath = path.resolve(__dirname, '../../src/overlay/overlay.html');
    const targetParam = encodeURIComponent('https://www.facebook.com/');
    await page.goto(`file://${overlayPath}?target=${targetParam}`);

    // Đảm bảo script module đã tải (yêu cầu flag --allow-file-access-from-files)
    await page.waitForFunction(() => !!window.LaserFocusControls);

    // Stub sendMessage để bắt nội dung
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

  test('overlay sends correct runtime message when Continue clicked', async () => {
    // Đảm bảo nút Continue tồn tại & đang disabled
    const isDisabledInitially = await page.evaluate(() => {
      const btn = document.getElementById('continue-button');
      return btn?.hasAttribute('disabled');
    });
    expect(isDisabledInitially).toBe(true);

    // Giả lập video đã kết thúc và chờ overlay tự enable nút
    await page.evaluate(() => {
      const video = document.getElementById('motivational-video');
      video.dispatchEvent(new Event('ended'));
    });

    // Chờ cho đến khi thuộc tính disabled được gỡ bỏ bởi overlay logic
    await page.waitForFunction(() => {
      const btn = document.getElementById('continue-button');
      return btn && !btn.hasAttribute('disabled');
    });

    // Click nút Continue
    await page.evaluate(() => {
      document.getElementById('continue-button').click();
    });

    // Đợi một nhịp event loop để sendMessage thực thi
    await new Promise(r => setTimeout(r, 100));

    // Lấy message đã gửi
    const sentMessage = await page.evaluate(() => window.__sentMessage);

    expect(sentMessage).not.toBeNull();
    expect(sentMessage.action).toBe('laserfocus/continue');
    expect(sentMessage.targetUrl).toBe('https://www.facebook.com/');
  });
}); 