module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  clearMocks: true,
  testTimeout: 10000,
  collectCoverageFrom: ['server.js', 'database.js'],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text-summary', 'cobertura', 'json-summary'],
};
