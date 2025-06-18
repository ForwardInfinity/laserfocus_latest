/**
 * E2E Tests for Button State Management
 * Tests if Continue & Go Back buttons are disabled until video.ended (FR-008)
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Tăng timeout cho toàn file test (CI chậm)
jest.setTimeout(60000);

describe('Button State Management', () => {
  let browser;
  let page;

  beforeAll(async () => {
    // Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--allow-file-access-from-files']
    });
    page = await browser.newPage();
    
    // Navigate to the overlay page directly
    const overlayPath = path.resolve(__dirname, '../../src/overlay/overlay.html');
    await page.goto('file://' + overlayPath);
    
    // Chờ overlay scripts tải xong để Controls có mặt
    await page.waitForFunction(() => !!window.LaserFocusControls);

    // KHÔNG inject fallback. Chúng ta chờ sự kiện 'buttons-enabled'
    // (được dispatch trong Controls) để biết nút đã được enable.
    await page.evaluate(() => {
      window.__buttonsReady = false;
      document.addEventListener('buttons-enabled', () => { window.__buttonsReady = true; });
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('buttons should exist and be disabled initially', async () => {
    // Check if buttons exist and are disabled
    const buttonsState = await page.evaluate(() => {
      const continueButton = document.getElementById('continue-button');
      const goBackButton = document.getElementById('go-back-button');
      
      return {
        continueExists: !!continueButton,
        continueDisabled: continueButton?.hasAttribute('disabled'),
        goBackExists: !!goBackButton,
        goBackDisabled: goBackButton?.hasAttribute('disabled')
      };
    });
    
    expect(buttonsState.continueExists).toBe(true);
    expect(buttonsState.continueDisabled).toBe(true);
    expect(buttonsState.goBackExists).toBe(true);
    expect(buttonsState.goBackDisabled).toBe(true);
  });

  test('buttons should be enabled when video ends', async () => {
    // First verify buttons are disabled initially
    let buttonState = await page.evaluate(() => {
      const continueButton = document.getElementById('continue-button');
      const goBackButton = document.getElementById('go-back-button');
      
      return {
        continueDisabled: continueButton?.hasAttribute('disabled'),
        goBackDisabled: goBackButton?.hasAttribute('disabled')
      };
    });
    
    expect(buttonState.continueDisabled).toBe(true);
    expect(buttonState.goBackDisabled).toBe(true);
    
    // Kích hoạt sự kiện video kết thúc
    await page.evaluate(() => {
      document.getElementById('motivational-video')
              .dispatchEvent(new Event('ended'));
    });

    // Chờ đến khi overlay phát sự kiện buttons-enabled hoặc thuộc tính disabled bị gỡ
    await page.waitForFunction(() => window.__buttonsReady === true);

    // Kiểm tra state cuối cùng
    buttonState = await page.evaluate(() => ({
      continueDisabled: document.getElementById('continue-button').hasAttribute('disabled'),
      goBackDisabled: document.getElementById('go-back-button').hasAttribute('disabled'),
    }));

    expect(buttonState.continueDisabled).toBe(false);
    expect(buttonState.goBackDisabled).toBe(false);
  });
}); 