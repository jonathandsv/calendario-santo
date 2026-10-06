import { expect, test } from '@playwright/test';
import { hojeNoNavegador, vigiarConsole } from './apoio';

test.describe('rotas e pré-renderização', () => {
  test('/ leva ao dia de hoje substituindo a entrada do histórico', async ({ page }) => {
    await page.goto('/dia/01-01');
    await page.goto('/');
    const hoje = await hojeNoNavegador(page);
    await expect(page).toHaveURL(`/dia/${hoje}`);

    // A entrada de "/" foi substituída: voltar leva à página anterior, não de novo a "/".
    await page.goBack();
    await expect(page).toHaveURL('/dia/01-01');
  });

  test('a ficha vem no HTML e a primeira carga não refaz a requisição', async ({ page }) => {
    const pedidos: string[] = [];
    page.on('request', (r) => pedidos.push(r.url()));
    const console = vigiarConsole(page);

    const resposta = await page.goto('/dia/10-06');
    const html = await resposta!.text();
    expect(html).toContain('São Bruno');
    expect(html).toContain('fundou a Ordem dos Cartuxos');

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('São Bruno');
    await page.waitForLoadState('networkidle');
    expect(pedidos.filter((u) => u.includes('/data/dias/'))).toEqual([]);
    expect(console).toEqual([]);
  });

  test('trocar de dia atualiza o endereço sem recarregar; voltar e avançar funcionam', async ({ page }) => {
    await page.goto('/dia/12-31');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => ((window as unknown as { marca: number }).marca = 1));

    await page.getByRole('link', { name: 'Dia seguinte' }).click();
    await expect(page).toHaveURL('/dia/01-01');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Santa Maria, Mãe de Deus');

    await page.goBack();
    await expect(page).toHaveURL('/dia/12-31');
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('Santa Maria, Mãe de Deus');

    await page.goForward();
    await expect(page).toHaveURL('/dia/01-01');
    expect(await page.evaluate(() => (window as unknown as { marca?: number }).marca)).toBe(1);
  });

  test('02-29 tem página própria', async ({ page }) => {
    await page.goto('/dia/02-29');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Santo Osvaldo de Worcester');
  });

  test('rota inválida cai na página 404 com link para hoje', async ({ page }) => {
    const resposta = await page.goto('/dia/13-40');
    expect(resposta!.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Página não encontrada');
    await page.getByRole('link', { name: 'Ver o santo de hoje' }).click();
    await expect(page).toHaveURL(`/dia/${await hojeNoNavegador(page)}`);
  });

  test('falha na troca de dia mostra "Tentar de novo"', async ({ page }) => {
    await page.goto('/dia/10-06');
    await page.waitForLoadState('networkidle');
    await page.route('**/data/dias/10-07.json', (r) => r.abort());

    await page.getByRole('link', { name: 'Dia seguinte' }).click();
    await expect(page).toHaveURL('/dia/10-07');
    const botao = page.getByRole('button', { name: 'Tentar de novo' });
    await expect(botao).toBeVisible();

    await page.unroute('**/data/dias/10-07.json');
    await botao.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nossa Senhora do Rosário');
  });
});
