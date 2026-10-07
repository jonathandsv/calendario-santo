import { expect, Page, test } from '@playwright/test';
import { diaNaFaixa } from './apoio';

const IMAGEM = {
  arquivo: 'Teste.jpg',
  url: 'https://thumb.wikimedia.org/x/500px-Teste.jpg',
  pagina_commons: 'https://commons.wikimedia.org/wiki/File:Teste.jpg',
  licenca: 'CC BY-SA 4.0',
  autor: 'Fulano de Tal',
};

/** Troca a imagem da ficha de 10-07 na resposta da requisição. */
async function comImagem(page: Page, local: string) {
  await page.route('**/data/dias/10-07.json', async (rota) => {
    const resposta = await rota.fetch();
    const santo = await resposta.json();
    await rota.fulfill({ response: resposta, json: { ...santo, imagem: { ...IMAGEM, local } } });
  });
}

test.describe('imagem com crédito', () => {
  test('sem imagem, mostra o espaço reservado', async ({ page }) => {
    await page.goto('/dia/10-06');
    const reservado = page.locator('app-imagem .reservado img');
    await expect(reservado).toHaveAttribute('src', '/img/santo-placeholder.svg');
    const caixa = await page.locator('app-imagem .moldura').boundingBox();
    expect(caixa!.height).toBeGreaterThanOrEqual(220);
  });

  test('com imagem, mostra a foto com alt, carregamento tardio e crédito', async ({ page }) => {
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
    await comImagem(page, '/img/santo-placeholder.svg');
    await diaNaFaixa(page, '7 de outubro').click();

    const foto = page.getByRole('img', { name: 'Nossa Senhora do Rosário' });
    await expect(foto).toHaveAttribute('loading', 'lazy');
    const credito = page.getByRole('link', { name: 'Fulano de Tal, CC BY-SA 4.0' });
    await expect(credito).toHaveAttribute('href', IMAGEM.pagina_commons);
  });

  test('se a imagem falhar, volta ao espaço reservado', async ({ page }) => {
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
    await comImagem(page, '/img/santos/nao-existe.jpg');
    await diaNaFaixa(page, '7 de outubro').click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nossa Senhora do Rosário');
    await expect(page.locator('app-imagem .reservado img')).toBeVisible();
    await expect(page.locator('app-imagem figure')).toHaveCount(0);
  });
});
