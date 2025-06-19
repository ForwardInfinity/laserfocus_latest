export default {
  // Indicates whether the coverage information should be collected
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // No ESM experimental flags – tests use CommonJS by default
  
  // Use ES modules
  transform: {},
  
  // Environment for running tests
  testEnvironment: "node",
  
  // The glob patterns Jest uses to detect test files
  testMatch: ["**/tests/unit/**/*.test.[jt]s", "**/tests/unit/**/*.test.mjs"],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ["/node_modules/", ".*\\.e2e\\.test\\.js$"],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
}; 