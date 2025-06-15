// tests/unit/storage.test.js
// Using CommonJS syntax for Jest
const { getBlockedDomains, saveBlockedDomains, DEFAULT_BLOCKED_DOMAINS, STORAGE_KEY } = require('../../src/background/storage');

describe('Storage Module', () => {
  // Mock chrome.storage.sync and chrome.runtime API
  global.chrome = {
    storage: {
      sync: {
        get: jest.fn(),
        set: jest.fn()
      }
    },
    runtime: {
      lastError: null
    }
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Reset runtime error
    chrome.runtime.lastError = null;
  });

  describe('getBlockedDomains', () => {
    it('should return seeded default domains when storage is empty', async () => {
      // Arrange: Set up chrome.storage.sync.get to simulate empty storage
      chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({});
      });
      
      // Act: Call the function under test
      const result = await getBlockedDomains();
      
      // Assert: Should return default domains and call storage API
      expect(result).toEqual(DEFAULT_BLOCKED_DOMAINS);
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        STORAGE_KEY, 
        expect.any(Function)
      );
    });

    it('should return domains from storage when they exist', async () => {
      // Arrange: Set up chrome.storage.sync.get to return stored domains
      const storedDomains = ['example.com', 'test.com'];
      chrome.storage.sync.get.mockImplementation((key, callback) => {
        callback({ [STORAGE_KEY]: storedDomains });
      });
      
      // Act: Call the function under test
      const result = await getBlockedDomains();
      
      // Assert: Should return stored domains
      expect(result).toEqual(storedDomains);
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        STORAGE_KEY, 
        expect.any(Function)
      );
    });
  });

  describe('saveBlockedDomains', () => {
    it('should save domains to storage', async () => {
      // Arrange: Set up mock
      chrome.storage.sync.set.mockImplementation((data, callback) => {
        callback();
      });
      
      // Act: Call the function under test
      const domainsToSave = ['domain1.com', 'domain2.com'];
      await saveBlockedDomains(domainsToSave);
      
      // Assert: Should call storage API with correct data
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        { [STORAGE_KEY]: domainsToSave }, 
        expect.any(Function)
      );
    });

    it('should reject if domains is not an array', async () => {
      // Act & Assert: Should reject with error
      await expect(saveBlockedDomains('not-an-array')).rejects.toThrow('Domains must be an array');
      expect(chrome.storage.sync.set).not.toHaveBeenCalled();
    });

    it('should reject if chrome.runtime has an error', async () => {
      // Arrange: Set up error in chrome runtime
      const errorMessage = 'Storage error';
      chrome.storage.sync.set.mockImplementation((data, callback) => {
        chrome.runtime.lastError = { message: errorMessage };
        callback();
      });
      
      // Act & Assert: Should reject with error
      await expect(saveBlockedDomains(['domain.com'])).rejects.toThrow(`Failed to save domains: ${errorMessage}`);
    });
  });
}); 