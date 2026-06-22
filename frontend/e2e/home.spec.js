import { test, expect } from '@playwright/test';

test('has title and main heading', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle', timeout: 60000 }); // Increased timeout to 60 seconds
  await page.waitForSelector('h1', { state: 'visible', timeout: 30000 }); // Explicitly wait for the h1 to be visible

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/BrainBytes/);

  // Expect the h1 element to contain "BrainBytes AI Tutor"
  await expect(page.locator('h1', { hasText: 'BrainBytes AI Tutor' })).toBeVisible();
});