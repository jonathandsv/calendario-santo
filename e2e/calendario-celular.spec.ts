import { expect, Page, test } from '@playwright/test';

test.describe('calendário no celular', () => {
  test.skip(({ isMobile }) => !isMobile, 'Painel só existe no celular.');

  const painel = (page: Page) => page.getByRole('dialog', { name: 'Escolher dia do mês' });
  const botaoMes = (page: Page) => page.locator('.botao-mes');
  const icone = (page: Page) => page.getByRole('button', { name: 'Abrir calendário' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
  });

  test('abre pelo nome do mês e fecha pelo botão, devolvendo o foco', async ({ page }) => {
    await expect(painel(page)).toBeHidden();
    await expect(page.getByRole('complementary', { name: 'Calendário do mês' })).toBeHidden();
    await botaoMes(page).click();
    await expect(painel(page)).toBeVisible();
    await expect(painel(page).locator('[aria-current="date"]')).toHaveText('6');

    await painel(page).getByRole('button', { name: 'Fechar calendário' }).click();
    await expect(painel(page)).toBeHidden();
    await expect(botaoMes(page)).toBeFocused();
  });

  test('abre pelo ícone e fecha com Esc', async ({ page }) => {
    await icone(page).click();
    await expect(painel(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(painel(page)).toBeHidden();
    await expect(icone(page)).toBeFocused();
  });

  test('fecha ao tocar no fundo escurecido', async ({ page }) => {
    await icone(page).click();
    await expect(painel(page)).toBeVisible();
    await page.mouse.click(200, 40);
    await expect(painel(page)).toBeHidden();
  });

  test('escolher um dia navega e fecha o painel', async ({ page }) => {
    await icone(page).click();
    await painel(page).getByRole('link', { name: /, 20 de outubro$/ }).click();
    await expect(page).toHaveURL('/dia/10-20');
    await expect(painel(page)).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Santa Maria Bertilla Boscardin');
  });

  test('o foco fica preso no painel enquanto aberto', async ({ page }) => {
    await icone(page).click();
    for (const tecla of [...Array(8).fill('Tab'), ...Array(8).fill('Shift+Tab')]) {
      await page.keyboard.press(tecla);
      const dentro = await page.evaluate(() => !!document.activeElement?.closest('dialog'));
      expect(dentro, tecla).toBe(true);
    }
  });

  test('"Hoje" no painel leva à data atual e fecha o calendário', async ({ page }) => {
    await icone(page).click();
    await painel(page).getByRole('link', { name: 'Hoje' }).click();
    await expect(painel(page)).toBeHidden();
    const hoje = await page.evaluate(() => {
      const d = new Date();
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    await expect(page).toHaveURL(`/dia/${hoje}`);
  });
});
