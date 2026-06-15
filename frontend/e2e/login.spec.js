import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('should show error messages for invalid credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click the login button
    await page.click('button[type="submit"]');

    // Expect to see an error message (assuming a toast or inline error)
    await expect(page.getByText('Login failed:')).toBeVisible();
  });
});
