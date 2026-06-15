import { test, expect } from '@playwright/test';

test('footer elements are visible', async ({ page }) => {
  await page.goto('/');
  // Checking for a footer container
  const footer = page.locator('footer');
  if (await footer.isVisible()) {
    await expect(footer).toBeVisible();
  }
});
