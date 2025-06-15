import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  // Override test match patterns to focus on e2e tests
  testMatch: ["**/tests/e2e/**/*.e2e.test.js"],
  
  // Don't ignore e2e tests
  testPathIgnorePatterns: ["/node_modules/"],
  
  // Use longer timeout for e2e tests
  testTimeout: 30000,
}; 