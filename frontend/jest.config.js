const nextJest = require('next/jest');

// This connects Jest to your Next.js project root so it understands your React components
const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  reporters: [
    'default',
    ['jest-junit', { outputDirectory: './test-results', outputName: 'junit.xml' }]
  ]
};

module.exports = createJestConfig(customJestConfig);