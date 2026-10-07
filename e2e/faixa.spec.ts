import { expect, test } from '@playwright/test';
import { diaNaFaixa, vigiarConsole } from './apoio';

const faixa = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Dias próximos' });

test.describe('faixa de dias', () => {
  test('números vêm no HTML; dias da semana só depois da hidratação, sem deslocar o layout', async ({ browser }) => {
    const semJs = await browser.newPage({ javaScriptEnabled: false });
    await semJs.goto('/dia/10-06');
    const selecionadoSemJs = semJs.locator('app-faixa [aria-current="date"]');
    await expect(selecionadoSemJs).toHaveText('6');
    await expect(semJs.locator('app-faixa a[href="/dia/10-07"]')).toHaveCount(1);
    const alturaSemJs = (await semJs.locator('app-faixa').boundingBox())!.height;
    const caixaSemJs = (await selecionadoSemJs.boundingBox())!;
    await semJs.close();

    const page = await browser.newPage();
    const console = vigiarConsole(page);
    await page.goto('/dia/10-06');
    const selecionado = page.locator('app-faixa [aria-current="date"]');
    await expect(selecionado.locator('.semana')).not.toBeEmpty();
    expect((await page.locator('app-faixa').boundingBox())!.height).toBe(alturaSemJs);
    const caixa = (await selecionado.boundingBox())!;
    expect(Math.abs(caixa.x - caixaSemJs.x)).toBeLessThan(2);
    expect(console).toEqual([]);
    await page.close();
  });

  test('o dia selecionado fica centralizado, também sem JavaScript', async ({ browser }) => {
    for (const javaScriptEnabled of [false, true]) {
      const page = await browser.newPage({ javaScriptEnabled });
      await page.goto('/dia/10-06');
      const nav = (await faixa(page).boundingBox())!;
      const sel = (await page.locator('app-faixa [aria-current="date"]').boundingBox())!;
      expect(Math.abs(sel.x + sel.width / 2 - (nav.x + nav.width / 2))).toBeLessThan(3);
      await page.close();
    }
  });

  test('mostra cerca de 7 dias no celular e 11 no computador', async ({ page }, info) => {
    await page.goto('/dia/10-06');
    const nav = (await faixa(page).boundingBox())!;
    const largura = (await page.locator('app-faixa li').first().boundingBox())!.width;
    const porTela = Math.round(nav.width / largura);
    expect(porTela).toBeGreaterThanOrEqual(info.project.name === 'celular' ? 6 : 10);
    expect(porTela).toBeLessThanOrEqual(info.project.name === 'celular' ? 8 : 12);
  });

  test('tocar num dia troca a ficha e o centraliza na faixa', async ({ page }) => {
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
    await diaNaFaixa(page, '8 de outubro').click();
    await expect(page).toHaveURL('/dia/10-08');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Santa Pelágia');
    await expect(page.locator('app-faixa [aria-current="date"] .numero')).toHaveText('8');
    await expect(async () => {
      const nav = (await faixa(page).boundingBox())!;
      const sel = (await page.locator('app-faixa [aria-current="date"]').boundingBox())!;
      expect(Math.abs(sel.x + sel.width / 2 - (nav.x + nav.width / 2))).toBeLessThan(3);
    }).toPass();
  });

  test('setas do teclado mudam o dia quando a faixa tem foco', async ({ page }) => {
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
    await page.locator('app-faixa [aria-current="date"]').focus();
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL('/dia/10-07');
    await expect(page.locator('app-faixa [aria-current="date"]')).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(page).toHaveURL('/dia/10-05');
  });

  test('atravessa a virada de mês e de ano', async ({ page }) => {
    await page.goto('/dia/12-31');
    await expect(diaNaFaixa(page, '1 de janeiro')).toHaveAttribute('href', '/dia/01-01');
    await expect(diaNaFaixa(page, '30 de dezembro')).toHaveAttribute('href', '/dia/12-30');
    await page.goto('/dia/01-01');
    await expect(diaNaFaixa(page, '31 de dezembro')).toHaveAttribute('href', '/dia/12-31');
  });
});
