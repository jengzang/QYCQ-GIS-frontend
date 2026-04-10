import { expect, test } from '@playwright/test';

test('map page renders the primary GIS workspace shell', async ({ page }) => {
  await page.goto('/map');

  await expect(page.getByRole('heading', { name: '村庄地图' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '村庄检索' })).toBeVisible();
});
