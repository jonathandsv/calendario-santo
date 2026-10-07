import { expect, test } from '@playwright/test';
import { vigiarConsole } from './apoio';

test.describe('calendário mensal', () => {
  test.skip(({ isMobile }) => isMobile, 'No celular o calendário fica num painel (US-11).');

  test('a grade só existe depois da hidratação, com espaço reservado', async ({ browser }) => {
    const semJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
    await semJs.goto('/dia/10-06');
    await expect(semJs.locator('app-calendario table')).toHaveCount(0);
    const alturaSemJs = (await semJs.locator('app-calendario .grade').boundingBox())!.height;
    await semJs.close();

    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const console = vigiarConsole(page);
    await page.goto('/dia/10-06');
    await expect(page.locator('app-calendario table')).toBeVisible();
    expect((await page.locator('app-calendario .grade').boundingBox())!.height).toBe(alturaSemJs);
    expect(console).toEqual([]);
    await page.close();
  });

  test('selecionar um dia navega para ele; setas de mês funcionam', async ({ page }) => {
    await page.goto('/dia/10-06');
    const cal = page.getByRole('complementary', { name: 'Calendário do mês' });
    await expect(cal.locator('[aria-current="date"]')).toHaveText('6');

    await cal.getByRole('button', { name: 'Próximo mês' }).click();
    await expect(cal.getByRole('heading')).toContainText('Novembro');
    await cal.getByRole('link', { name: /, 2 de novembro$/ }).click();
    await expect(page).toHaveURL('/dia/11-02');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Comemoração de Todos os Fiéis Defuntos');
  });

  test('fevereiro segue o ano corrente', async ({ page }) => {
    await page.goto('/dia/02-10');
    const bissexto = await page.evaluate(() => new Date(new Date().getFullYear(), 1, 29).getDate() === 29);
    await expect(page.locator('app-calendario a.dia')).toHaveCount(bissexto ? 29 : 28);
  });

  test('teclado: setas movem o foco e Enter seleciona', async ({ page }) => {
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
    await page.locator('app-calendario [aria-current="date"]').focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('app-calendario [data-dia="10-14"]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/dia/10-14');
  });
});
