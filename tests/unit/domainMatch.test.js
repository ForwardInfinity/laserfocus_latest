// tests/unit/domainMatch.test.js
// Unit tests for domainMatch utility function that checks if a URL matches a blocked domain

// Import the function to test (this will fail until we implement it)
const { domainMatch } = require('../../src/background/domainMatch');

describe('Domain Matching (FR-001, FR-002)', () => {
  it('should match exactly the same domain', () => {
    expect(domainMatch('example.com', 'example.com')).toBe(true);
  });
  
  it('should match subdomains of blocked domains', () => {
    expect(domainMatch('sub.example.com', 'example.com')).toBe(true);
    expect(domainMatch('sub.sub.example.com', 'example.com')).toBe(true);
  });
  
  it('should match domains case-insensitively', () => {
    expect(domainMatch('M.Facebook.com', 'facebook.com')).toBe(true);
    expect(domainMatch('EXAMPLE.com', 'example.com')).toBe(true);
  });
  
  it('should not match unrelated domains', () => {
    expect(domainMatch('otherdomain.com', 'example.com')).toBe(false);
    expect(domainMatch('examplecom', 'example.com')).toBe(false);
  });
  
  it('should handle domains with paths or protocols correctly', () => {
    expect(domainMatch('http://example.com/path', 'example.com')).toBe(true);
    expect(domainMatch('https://sub.example.com:8080', 'example.com')).toBe(true);
  });
}); 