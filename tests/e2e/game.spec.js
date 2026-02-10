import { test, expect } from '@playwright/test';

test('can play a PvP winning round and score updates', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Cell 1').click();
  await page.getByLabel('Cell 4').click();
  await page.getByLabel('Cell 2').click();
  await page.getByLabel('Cell 5').click();
  await page.getByLabel('Cell 3').click();

  await expect(page.getByText('Player X wins!')).toBeVisible();
  await expect(page.locator('#scoreX')).toHaveText('1');
});

test('AI mode responds after player move', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Game mode').selectOption('ai');
  await page.getByLabel('Cell 5').click();

  await expect
    .poll(async () => {
      return page.locator('.cell.o').count();
    })
    .toBeGreaterThan(0);
});

test('theme selection persists via localStorage', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Theme selector').selectOption('neon');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'neon');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'neon');
});
