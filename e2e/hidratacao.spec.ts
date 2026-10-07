import { expect, test } from '@playwright/test';
import { vigiarConsole } from './apoio';

test.describe('hidratação limpa', () => {
  for (const dia of ['10-06', '02-29', '12-31']) {
    test(`abrir ${dia} não gera aviso de hidratação no console`, async ({ page }) => {
      const console = vigiarConsole(page);
      await page.goto(`/dia/${dia}`);
      await page.waitForLoadState('networkidle');
      // Espera a hidratação terminar: o dia da semana só aparece depois dela.
      await expect(page.locator('app-ficha .data')).toContainText(',');
      const hidratacao = await page.evaluate(() => {
        const raiz = document.querySelector('app-root');
        return raiz?.hasAttribute('ngh') ?? false;
      });
      expect(hidratacao).toBe(false);
      expect(console.filter((m) => /hydrat|NG0[5-9]\d\d|mismatch/i.test(m))).toEqual([]);
      expect(console).toEqual([]);
    });
  }
});
