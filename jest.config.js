export default {
  // Indicates whether the coverage information should be collected
  collectCoverage: false,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Use ES modules
  transform: {},
  
  // Environment for running tests
  testEnvironment: "jest-environment-puppeteer",
  
  // The glob patterns Jest uses to detect test files
  testMatch: ["**/tests/unit/**/*.test.js"],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ["/node_modules/", ".*\\.e2e\\.test\\.js$"],
}; 