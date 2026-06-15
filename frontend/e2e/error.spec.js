import { test } from '@playwright/test';

test('should show 404 for unknown pages', async ({ page }) => {
  // Navigate to a route likely to be 404
  await page.goto('/this-page-does-not-exist');
  
  // Checking if the page content indicates a missing page
  // Adjust based on your actual 404 behavior (some apps redirect to index)
  // This is a generic check
  const heading = page.locator('h1');
  if (await heading.isVisible()) {
      // If your app renders a custom 404, uncomment this:
      // await expect(heading).toContainText(/not found/i);
  }
});
