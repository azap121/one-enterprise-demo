import { expect, test } from '@playwright/test';

test('gallery landing page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Datasite Design Prototypes' })).toBeVisible();
});
