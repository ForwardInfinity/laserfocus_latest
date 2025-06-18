const { goBackOrNewTab } = require('../../src/background/navigation.cjs');

/**
 * Unit tests for goBackOrNewTab helper (FR-010)
 */

describe('goBackOrNewTab (unit)', () => {
  const NEW_TAB_URL = 'chrome://newtab';

  let originalChrome;

  beforeEach(() => {
    originalChrome = global.chrome;
    global.chrome = {
      runtime: {},
      scripting: {
        executeScript: jest
          .fn()
          .mockImplementationOnce((_details, callback) => callback && callback([{ result: true }]))
          .mockImplementation((_details, callback) => callback && callback()),
      },
      tabs: {
        update: jest.fn(),
        create: jest.fn(),
      },
    };
  });

  afterEach(() => {
    global.chrome = originalChrome;
    jest.resetAllMocks();
  });

  it('injects history.back when canGoBack=true', () => {
    const tabId = 111;
    goBackOrNewTab(tabId);

    expect(global.chrome.scripting.executeScript).toHaveBeenCalledTimes(2);

    const [probeCall, backCall] = global.chrome.scripting.executeScript.mock.calls;

    expect(probeCall[0].func.toString()).toMatch(/history\.length/);
    expect(backCall[0].func.toString()).toMatch(/history\.back/);

    expect(global.chrome.tabs.update).not.toHaveBeenCalled();
  });

  it('opens chrome://newtab when canGoBack=false', () => {
    const tabId = 222;
    delete global.chrome.scripting; // force update branch

    goBackOrNewTab(tabId);

    expect(global.chrome.tabs.update).toHaveBeenCalledTimes(1);
    const [[calledTabId, info]] = global.chrome.tabs.update.mock.calls;
    expect(calledTabId).toBe(tabId);
    expect(info.url).toBe(NEW_TAB_URL);
  });

  it('falls back to tabs.update when executeScript reports error', () => {
    const tabId = 333;
    // simulate lastError inside callback
    global.chrome.runtime.lastError = { message: 'failed' };
    global.chrome.scripting.executeScript.mockImplementation((_d, cb) => cb && cb());

    goBackOrNewTab(tabId);

    expect(global.chrome.tabs.update).toHaveBeenCalledWith(tabId, { url: NEW_TAB_URL });
  });

  it('falls back to tabs.update when tabId is undefined', () => {
    delete global.chrome.scripting;

    goBackOrNewTab(undefined);

    expect(global.chrome.tabs.create).toHaveBeenCalledWith({ url: NEW_TAB_URL });
  });
}); 