import { expect, test } from '@playwright/test';
import { vigiarConsole } from './apoio';

test.describe('ficha do santo', () => {
  test('dia e mês vêm no HTML; o dia da semana aparece depois da hidratação', async ({ page }) => {
    const console = vigiarConsole(page);
    const resposta = await page.goto('/dia/10-06');
    const html = await resposta!.text();
    expect(html).toMatch(/class="data"[^>]*>(<!---->)?\s*<span[^>]*>6 de outubro<\/span>/);
    expect(html).not.toMatch(/Terça-feira|class="semana"/);

    const semana = await page.evaluate(() =>
      new Date(new Date().getFullYear(), 9, 6).toLocaleDateString('pt-BR', { weekday: 'long' }),
    );
    await expect(page.locator('app-ficha .data')).toHaveText(new RegExp(`^${semana}, 6 de outubro$`, 'i'));
    expect(console).toEqual([]);
  });

  test('mostra grau, obs e "Saiba mais"', async ({ page }) => {
    await page.goto('/dia/10-06');
    await expect(page.locator('app-ficha .grau')).toHaveText('Memória facultativa');
    const link = page.getByRole('link', { name: /Saiba mais/ });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Bruno_of_Cologne');

    await page.goto('/dia/08-15');
    await expect(page.locator('app-ficha .obs')).not.toBeEmpty();
  });

  test('sem etiqueta quando o grau é nulo', async ({ page }) => {
    await page.goto('/dia/02-29');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Santo Osvaldo de Worcester');
    await expect(page.locator('app-ficha .grau')).toHaveCount(0);
  });
});

test.describe('origem e datas', () => {
  test('aparece em 10-06 com "Colônia, Alemanha"', async ({ page }) => {
    const resposta = await page.goto('/dia/10-06');
    expect(await resposta!.text()).toContain('Colônia, Alemanha');
    const bloco = page.locator('app-ficha dl');
    await expect(bloco).toContainText('Colônia, Alemanha');
    await expect(bloco).toContainText('c. 1030');
    await expect(bloco).toContainText('6 de outubro de 1101');
  });

  test('não aparece em 12-25 (celebração)', async ({ page }) => {
    await page.goto('/dia/12-25');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Natal do Senhor');
    await expect(page.locator('app-ficha dl')).toHaveCount(0);
  });

  test('em 02-06 mostra "Dados de São Paulo Miki"', async ({ page }) => {
    await page.goto('/dia/02-06');
    await expect(page.locator('app-ficha .referentes')).toHaveText('Dados de São Paulo Miki');
  });
});
