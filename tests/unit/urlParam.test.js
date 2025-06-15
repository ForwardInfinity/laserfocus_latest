const { blockedListToDnrRules } = require('../../src/background/dnrRules.cjs');

describe('URL Parameter in redirect (Phase 2)', () => {
  const overlayPath = '/src/overlay/overlay.html';
  
  it('should include the original URL as a target parameter', () => {
    const rules = blockedListToDnrRules(['facebook.com'], overlayPath);
    
    // This test should fail because the target parameter is not yet implemented
    expect(rules[0].action.redirect.extensionPath).toContain('?target=');
  });
  
  it('should properly encode the URL parameter', () => {
    const rules = blockedListToDnrRules(['example.com/path with spaces'], overlayPath);
    
    // Verify that spaces and special characters are encoded
    expect(rules[0].action.redirect.extensionPath).toContain('https%3A%2F%2Fexample.com%2Fpath%20with%20spaces');
  });
}); 