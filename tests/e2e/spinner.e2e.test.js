/**
 * E2E Tests for Spinner Visibility
 * Tests if spinner is visible until video.readyState >= 3 (FR-005)
 */

const puppeteer = require('puppeteer');
const path = require('path');

describe('Spinner Visibility', () => {
  let browser;
  let page;

  beforeAll(async () => {
    // Launch browser
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox']
    });
    page = await browser.newPage();
    
    // Navigate to the overlay page directly
    const overlayPath = path.resolve(__dirname, '../../src/overlay/overlay.html');
    await page.goto('file://' + overlayPath);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('spinner should be visible initially', async () => {
    // Check if spinner exists and is visible
    const spinnerVisible = await page.evaluate(() => {
      const spinnerContainer = document.querySelector('.spinner-container');
      return spinnerContainer && !spinnerContainer.classList.contains('hidden');
    });
    
    expect(spinnerVisible).toBe(true);
  });

  test('spinner should hide when video triggers canplaythrough event', async () => {
    // Ensure the spinner is initially visible
    let isSpinnerVisible = await page.evaluate(() => {
      const spinnerContainer = document.querySelector('.spinner-container');
      return spinnerContainer && !spinnerContainer.classList.contains('hidden');
    });
    expect(isSpinnerVisible).toBe(true);
    
    // Dispatch the canplaythrough event on the video element
    await page.evaluate(() => {
      const video = document.getElementById('motivational-video');
      const event = new Event('canplaythrough');
      video.dispatchEvent(event);
    });

    // Wait for the 'hidden' class to be applied
    await page.waitForFunction(() => {
      const spinnerContainer = document.querySelector('.spinner-container');
      return spinnerContainer && spinnerContainer.classList.contains('hidden');
    });

    // Final check to confirm the spinner is hidden
    isSpinnerVisible = await page.evaluate(() => {
      const spinnerContainer = document.querySelector('.spinner-container');
      return spinnerContainer && !spinnerContainer.classList.contains('hidden');
    });
    expect(isSpinnerVisible).toBe(false);
  });
}); 