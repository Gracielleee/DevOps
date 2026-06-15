const nextJest = require("next/jest");

// This connects Jest to your Next.js project root so it understands your React components
const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleDirectories: ["node_modules", "<rootDir>/", "<rootDir>/src"],
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/e2e/"],
  reporters: [
    "default",
    [
      "jest-junit",
      { outputDirectory: "./test-results", outputName: "junit.xml" },
    ],
  ],
};

module.exports = createJestConfig(customJestConfig);
