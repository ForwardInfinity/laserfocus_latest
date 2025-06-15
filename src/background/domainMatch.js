/**
 * LaserFocus - Domain Matching Utility
 * Determines if a URL matches a blocked domain
 */

/**
 * Checks if a test URL matches a blocked domain
 * 
 * Determines if the given URL is either exactly the blocked domain
 * or a subdomain of the blocked domain. Matching is case-insensitive
 * and protocol-agnostic as required by FR-002.
 * 
 * This function properly handles:
 * - Subdomains (e.g., sub.example.com matches example.com) (FR-001)
 * - Case insensitivity (e.g., EXAMPLE.com matches example.com) (FR-002)
 * - URLs with protocols (e.g., http://example.com matches example.com)
 * - URLs with paths, query parameters, or ports
 * 
 * Edge cases:
 * - If URL parsing fails, falls back to string comparison
 * - Handles URLs without protocols by adding a dummy one for parsing
 * 
 * @param {string} testUrl - The URL or domain to check
 * @param {string} blockedDomain - The domain to match against
 * @returns {boolean} True if the test URL matches the blocked domain
 */
function domainMatch(testUrl, blockedDomain) {
  // Ensure lowercase comparison for case-insensitivity (FR-002)
  const blockedLower = blockedDomain.toLowerCase();
  
  try {
    // Handle URLs without protocol by adding a dummy one for URL API parsing
    let urlToParse = testUrl;
    if (!testUrl.includes('://')) {
      urlToParse = `http://${testUrl}`;
    }
    
    // Parse the URL to extract its hostname
    const url = new URL(urlToParse);
    const hostname = url.hostname.toLowerCase();
    
    // Exact match check
    if (hostname === blockedLower) {
      return true;
    }
    
    // Subdomain match check (ends with .blockedDomain)
    return hostname.endsWith(`.${blockedLower}`);
  } catch (error) {
    // If URL parsing fails, fall back to string comparison
    const testLower = testUrl.toLowerCase();
    
    // Remove protocol if it exists
    const cleanTestUrl = testLower.replace(/^https?:\/\//, '');
    
    // Remove path, query parameters, or port if they exist
    const domainPart = cleanTestUrl.split(/[\/\?:#]/)[0];
    
    // Exact match
    if (domainPart === blockedLower) {
      return true;
    }
    
    // Subdomain match
    return domainPart.endsWith(`.${blockedLower}`);
  }
}

// Export for use in other modules and testing
module.exports = { domainMatch }; 