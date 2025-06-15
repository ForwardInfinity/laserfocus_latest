// tests/unit/interceptSkip.test.js
// Unit tests for the shouldIntercept function which determines whether to skip interception

// Mock the storage module before importing the function to test
jest.mock('../../src/background/storage', () => ({
  getBlockedDomains: jest.fn()
}));

// Import the storage module and the function to test (this will fail until we implement it)
const { getBlockedDomains } = require('../../src/background/storage');
const { shouldIntercept } = require('../../src/background/intercept');

describe('Intercept Skip Logic (FR-014)', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });
  
  it('should return false when the block list is empty', async () => {
    // Arrange: Set up an empty block list
    getBlockedDomains.mockResolvedValue([]);
    
    // Act: Call the function under test
    const result = await shouldIntercept();
    
    // Assert: Function should return false when block list is empty
    expect(result).toBe(false);
    expect(getBlockedDomains).toHaveBeenCalled();
  });
  
  it('should return true when the block list is not empty', async () => {
    // Arrange: Set up a non-empty block list
    getBlockedDomains.mockResolvedValue(['example.com']);
    
    // Act: Call the function under test
    const result = await shouldIntercept();
    
    // Assert: Function should return true when block list is not empty
    expect(result).toBe(true);
    expect(getBlockedDomains).toHaveBeenCalled();
  });
}); 