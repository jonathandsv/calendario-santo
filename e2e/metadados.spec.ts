import { expect, test } from '@playwright/test';

test.describe('título e compartilhamento', () => {
  test('título, descrição, canônica e Open Graph vêm no HTML pré-renderizado', async ({ request }) => {
    const html = await (await request.get('/dia/10-06')).text();
    expect(html).toContain('<title>São Bruno — 6 de outubro | Santo do Dia</title>');
    expect(html).toMatch(/<meta name="description" content="Professor em Reims que recusou ser bispo[^"]*">/);
    expect(html).toMatch(/<link rel="canonical" href="https?:\/\/[^"]+\/dia\/10-06">/);
    expect(html).toMatch(/<meta property="og:title" content="São Bruno — 6 de outubro \| Santo do Dia">/);
    expect(html).toMatch(/<meta property="og:description" content="Professor em Reims[^"]*">/);
    expect(html).toMatch(/<meta property="og:url" content="https?:\/\/[^"]+\/dia\/10-06">/);
    expect(html).toContain('<meta property="og:locale" content="pt_BR">');
  });

  test('o título acompanha a troca de dia no navegador', async ({ page }) => {
    await page.goto('/dia/12-24');
    await expect(page).toHaveTitle(/ — 24 de dezembro \| Santo do Dia$/);
    await page.goto('/dia/12-25');
    await expect(page).toHaveTitle('Natal do Senhor — 25 de dezembro | Santo do Dia');
  });

  test('a página 404 não é indexada', async ({ request }) => {
    const html = await (await request.get('/dia/13-40')).text();
    expect(html).toContain('<meta name="robots" content="noindex">');
  });
});
