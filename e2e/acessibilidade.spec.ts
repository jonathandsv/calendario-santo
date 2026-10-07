import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

/** Violações graves (sérias ou críticas) das regras WCAG 2.x A/AA e boas práticas. */
async function violacoes(page: Page) {
  const resultado = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  return resultado.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')})`);
}

test.describe('acessibilidade', () => {
  for (const dia of ['10-06', '12-25', '02-06']) {
    test(`sem violações graves em /dia/${dia}`, async ({ page }) => {
      await page.goto(`/dia/${dia}`);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('app-ficha .data')).toContainText(',');
      expect(await violacoes(page)).toEqual([]);
    });
  }

  test('sem violações graves com o painel do calendário aberto', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Painel só no celular.');
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Abrir calendário' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await violacoes(page)).toEqual([]);
  });

  test('sem violações graves na 404 e no início', async ({ page }) => {
    await page.goto('/dia/13-40');
    expect(await violacoes(page)).toEqual([]);
  });
});

test.describe('áreas de toque e foco', () => {
  for (const largura of [360, 412, 1280]) {
    test(`controles com ao menos 44px em ${largura}px`, async ({ page }) => {
      await page.setViewportSize({ width: largura, height: 900 });
      await page.goto('/dia/10-06');
      await page.waitForLoadState('networkidle');
      await expect(page.locator('app-ficha .data')).toContainText(',');
      if (largura < 1024) await page.getByRole('button', { name: 'Abrir calendário' }).click();

      const pequenos = await page.evaluate(() => {
        const visivel = (el: Element) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
        };
        const escopo = document.querySelector('dialog[open]') ?? document;
        return [...escopo.querySelectorAll('a[href], button')]
          .filter(visivel)
          .map((el) => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ r }) => r.width < 43.5 || r.height < 43.5)
          .map(({ el, r }) => `${el.textContent?.trim() || el.getAttribute('aria-label')} (${Math.round(r.width)}×${Math.round(r.height)})`);
      });
      expect(pequenos).toEqual([]);
    });
  }

  test('o foco é visível ao navegar com Tab', async ({ page }) => {
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const contorno = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        const estilo = getComputedStyle(el);
        return { largura: parseFloat(estilo.outlineWidth), estilo: estilo.outlineStyle };
      });
      expect(contorno.estilo).not.toBe('none');
      expect(contorno.largura).toBeGreaterThanOrEqual(2);
    }
  });
});
