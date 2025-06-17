const { blockedListToDnrRules } = require('../../src/background/dnrRules.cjs');

describe('dnrRules builder (Phase 2)', () => {
  const overlayPath = '/src/overlay/overlay.html';

  it('should generate a rule per domain with sequential IDs', () => {
    const rules = blockedListToDnrRules(['facebook.com', 'twitter.com'], overlayPath);
    expect(rules).toHaveLength(2);
    expect(rules[0].id).toBe(1);
    expect(rules[1].id).toBe(2);
  });

  it('should embed the correct domain in the regexFilter pattern', () => {
    const rules = blockedListToDnrRules(['example.com'], overlayPath);
    expect(rules[0].condition.regexFilter).toContain('example\\.com');
  });

  it('should include the overlay path in the regexSubstitution', () => {
    const rules = blockedListToDnrRules(['facebook.com'], overlayPath);
    expect(rules[0].action.redirect.regexSubstitution).toContain(overlayPath);
  });
  
  it('should allow disabling the target parameter', () => {
    const rules = blockedListToDnrRules(['facebook.com'], overlayPath, false);
    expect(rules[0].action.redirect.regexSubstitution).toBe(overlayPath);
  });
}); 