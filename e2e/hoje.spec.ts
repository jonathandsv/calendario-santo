import { expect, test } from '@playwright/test';
import { hojeNoNavegador } from './apoio';

test.describe('botão Hoje', () => {
  test('leva à data atual depois de navegar', async ({ page }) => {
    await page.goto('/dia/02-29');
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'Hoje', exact: true }).click();
    await expect(page).toHaveURL(`/dia/${await hojeNoNavegador(page)}`);
    await expect(page.locator('app-faixa [aria-current="date"]')).toBeVisible();
  });

  test('sem JavaScript, aponta para / (que leva a hoje)', async ({ browser }) => {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.goto('/dia/10-06');
    await expect(page.getByRole('link', { name: 'Hoje', exact: true })).toHaveAttribute('href', '/');
    await page.close();
  });
});
