const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  testIgnore: ['**/__tests__/**', '**/.next/**', '**/node_modules/**'],
  reporter: [
    ['github'],
    ['html', { open: 'never' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  
});