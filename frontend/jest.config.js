const nextJest = require('next/jest');

// This connects Jest to your Next.js project root so it understands your React components
const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  // Added '/tests/' here so Jest ignores the Playwright browser tests folder completely
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/tests/'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'junit.xml' }]
  ]
};

module.exports = createJestConfig(customJestConfig);