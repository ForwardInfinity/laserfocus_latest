/**
 * Unit Tests for Overlay Styles
 * Tests if the overlay container spans 100vw×100vh (FR-004)
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('Overlay Container', () => {
  let dom;
  let document;
  
  beforeAll(() => {
    // Load the HTML file
    const htmlPath = path.resolve(__dirname, '../../src/overlay/overlay.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Load the CSS file
    const cssPath = path.resolve(__dirname, '../../src/overlay/overlay.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    
    // Create a new JSDOM instance with the HTML
    dom = new JSDOM(html, {
      resources: 'usable',
      runScripts: 'dangerously',
    });
    
    document = dom.window.document;
    
    // Inject the CSS
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  });
  
  test('overlay container should exist', () => {
    const overlay = document.getElementById('laserfocus-overlay');
    expect(overlay).not.toBeNull();
  });
  
  test('overlay container should span full viewport (100vw × 100vh)', () => {
    const overlay = document.getElementById('laserfocus-overlay');
    
    // Get computed style
    const styles = dom.window.getComputedStyle(overlay);
    
    // Check dimensions
    expect(styles.width).toBe('100vw');
    expect(styles.height).toBe('100vh');
  });
  
  test('overlay should have position fixed to cover viewport', () => {
    const overlay = document.getElementById('laserfocus-overlay');
    const styles = dom.window.getComputedStyle(overlay);
    
    expect(styles.position).toBe('fixed');
    expect(styles.top).toBe('0px');
    expect(styles.left).toBe('0px');
  });

  test('overlay should have a high z-index to appear on top', () => {
    const cssPath = path.resolve(__dirname, '../../src/overlay/overlay.css');
    const css = fs.readFileSync(cssPath, 'utf8');
    
    // Find the z-index value from the CSS variable
    const zIndexMatch = css.match(/--overlay-z-index:\s*(\d+);/);
    expect(zIndexMatch).not.toBeNull();
    
    const zIndex = parseInt(zIndexMatch[1], 10);
    expect(zIndex).toBe(999999);
  });
}); 