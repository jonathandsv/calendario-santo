import { expect, test } from '@playwright/test';

test.describe('próximos dias', () => {
  test('três cartões clicáveis no computador, já no HTML', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Só no computador.');
    const resposta = await page.goto('/dia/10-06');
    const html = await resposta!.text();
    expect(html).toContain('Próximos dias');
    expect(html).toContain('Nossa Senhora do Rosário');

    const secao = page.getByRole('region', { name: 'Próximos dias' });
    await expect(secao.getByRole('link')).toHaveCount(3);
    await secao.getByRole('link', { name: /Santa Pelágia/ }).click();
    await expect(page).toHaveURL('/dia/10-08');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Santa Pelágia');
  });

  test('em 30/12 e 31/12 continuam em janeiro', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Só no computador.');
    await page.goto('/dia/12-31');
    const links = page.getByRole('region', { name: 'Próximos dias' }).getByRole('link');
    await expect(links.nth(0)).toHaveAttribute('href', '/dia/01-01');
    await expect(links.nth(2)).toHaveAttribute('href', '/dia/01-03');
    await page.goto('/dia/12-30');
    await expect(links.nth(1)).toHaveAttribute('href', '/dia/01-01');
  });

  test('não aparece no celular', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Só no celular.');
    await page.goto('/dia/10-06');
    await expect(page.getByRole('region', { name: 'Próximos dias' })).toBeHidden();
  });
});
