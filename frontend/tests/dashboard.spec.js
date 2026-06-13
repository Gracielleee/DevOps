import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test('should display the welcome message for logged-in users', async ({ page }) => {
    // This test assumes a logged-in state. In a real scenario, you'd set up authentication
    // e.g., by mocking the API or directly setting local storage with a valid token.
    // For now, we navigate directly and assert elements that should be present post-login.
    // This test will likely fail if a login is required to access the dashboard.

    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    // Assert that the main welcome heading is visible
    await expect(page.locator('h1', { hasText: 'Welcome Back!' })).toBeVisible();

    // Assert that the "Recent Learning Activity Logs" section is visible
    await expect(page.locator('h3', { hasText: 'Recent Learning Activity Logs' })).toBeVisible();
  });
});