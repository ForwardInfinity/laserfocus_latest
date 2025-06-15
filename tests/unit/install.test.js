// tests/unit/install.test.js

// Mock storage.js functions first
jest.mock('../../src/background/storage', () => ({
  seedDefaultBlockList: jest.fn().mockResolvedValue(undefined),
  STORAGE_KEY: 'blockedDomains'
}));

// Import the functions we need to test
const { setupInstallListener } = require('../../src/background/install');
const { seedDefaultBlockList, STORAGE_KEY } = require('../../src/background/storage');

describe('Extension Installation', () => {
  // Mock Chrome API
  global.chrome = {
    runtime: {
      onInstalled: {
        addListener: jest.fn()
      }
    },
    storage: {
      sync: {
        get: jest.fn(),
        set: jest.fn()
      }
    }
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should register an onInstalled listener', () => {
    // Act: Set up the install listener
    setupInstallListener();
    
    // Assert: Should attach a listener to chrome.runtime.onInstalled
    expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should seed defaults only if undefined when extension is installed', () => {
    // Arrange: Capture the listener function
    setupInstallListener();
    const listener = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
    
    // Act: Simulate onInstalled event with reason="install"
    listener({ reason: 'install' });
    
    // Assert: seedDefaultBlockList should be called
    expect(seedDefaultBlockList).toHaveBeenCalled();
  });

  it('should not seed defaults when extension is updated', () => {
    // Arrange: Capture the listener function
    setupInstallListener();
    const listener = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
    
    // Act: Simulate onInstalled event with reason="update"
    listener({ reason: 'update' });
    
    // Assert: seedDefaultBlockList should not be called
    expect(seedDefaultBlockList).not.toHaveBeenCalled();
  });
}); 