const { blockedListToDnrRules } = require('../../src/background/dnrRules.cjs');

describe('URL Parameter in redirect (Phase 2)', () => {
  const overlayPath = '/src/overlay/overlay.html';
  
  it('should include ?target=\\0 in regexSubstitution', () => {
    const rules = blockedListToDnrRules(['facebook.com'], overlayPath);
    expect(rules[0].action.redirect.regexSubstitution).toContain('?target=\\0');
  });
}); 