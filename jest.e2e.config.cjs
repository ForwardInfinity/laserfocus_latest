module.exports = {
  // Use the jest-puppeteer preset
  preset: 'jest-puppeteer',
  
  // Override test environment to use puppeteer
  testEnvironment: 'jest-environment-puppeteer',

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/tests/e2e/**/*.e2e.test.js"],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ["/node_modules/"],
  
  // Use longer timeout for e2e tests
  testTimeout: 30000,

  // Don't transform anything, as we're running in a real browser
  transform: {},
}; 