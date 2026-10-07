import { expect, test } from '@playwright/test';

test.describe('layout responsivo', () => {
  test('sem rolagem horizontal da página entre 320px e 1920px', async ({ page }) => {
    for (const largura of [320, 375, 414, 768, 1023, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width: largura, height: 900 });
      for (const dia of ['10-06', '11-02', '02-06']) {
        await page.goto(`/dia/${dia}`);
        await page.waitForLoadState('networkidle');
        const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(sobra, `${largura}px em ${dia}`).toBeLessThanOrEqual(0);
      }
    }
  });

  test('a partir de 1024px: calendário fixo à direita e imagem ao lado do texto', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/dia/10-06');
    const calendario = page.getByRole('complementary', { name: 'Calendário do mês' });
    await expect(calendario).toBeVisible();
    await expect(page.getByRole('button', { name: 'Abrir calendário' })).toBeHidden();

    const ficha = (await page.locator('app-ficha').boundingBox())!;
    const cal = (await calendario.boundingBox())!;
    expect(cal.x).toBeGreaterThan(ficha.x + ficha.width - 1);

    const foto = (await page.locator('app-ficha .foto').boundingBox())!;
    const nome = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
    expect(nome.x).toBeGreaterThan(foto.x + foto.width - 1);
    expect(Math.abs(nome.y - foto.y)).toBeLessThan(80);

    const conteudo = (await page.locator('.conteudo').boundingBox())!;
    expect(conteudo.width).toBeLessThanOrEqual(1180);

    // Fixo: continua visível depois de rolar a página.
    await page.mouse.wheel(0, 600);
    await expect(calendario).toBeInViewport();
  });

  test('até 1023px: uma coluna, sem a coluna do calendário', async ({ page }) => {
    await page.setViewportSize({ width: 1023, height: 900 });
    await page.goto('/dia/10-06');
    await expect(page.getByRole('complementary', { name: 'Calendário do mês' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Abrir calendário' })).toBeVisible();
    const foto = (await page.locator('app-ficha .foto').boundingBox())!;
    const nome = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
    expect(nome.y).toBeGreaterThan(foto.y + foto.height - 1);
  });
});
