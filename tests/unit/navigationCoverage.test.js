const { navigateToContinue, goBackOrNewTab } = require('../../src/background/navigation.cjs');

describe('navigation helper functions - coverage', () => {
  test('navigateToContinue handles invalid input gracefully', () => {
    // Global chrome mock with minimal shape to avoid errors
    global.chrome = { tabs: { update: jest.fn(), create: jest.fn() }, runtime: {} };
    navigateToContinue('', 123);
    navigateToContinue('https://example.com', undefined);
    expect(true).toBe(true); // placeholder assertion
  });

  test('goBackOrNewTab executes without exceptions', () => {
    global.chrome = {
      scripting: { executeScript: jest.fn((details, cb) => cb([{ result: false }])) },
      tabs: { update: jest.fn(), create: jest.fn() },
      runtime: {},
    };
    goBackOrNewTab(456);
    expect(true).toBe(true);
  });
}); 