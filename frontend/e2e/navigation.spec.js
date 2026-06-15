import { test, expect } from '@playwright/test';

test('navigation links work correctly', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: /dashboard/i });
  const href = await link.getAttribute('href');
  await page.goto(href);
  await expect(page).toHaveURL(/.*dashboard/);
});
