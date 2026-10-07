import { expect, Page, test } from '@playwright/test';
import { diaNaFaixa, hojeNoNavegador, vigiarConsole } from './apoio';

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** "7 de outubro" a partir de MM-DD. */
const porExtenso = (data: string) => `${Number(data.slice(3))} de ${MESES[Number(data.slice(0, 2)) - 1]}`;

/** Dia seguinte a MM-DD no ano corrente do navegador. */
const seguinte = (page: Page, data: string) =>
  page.evaluate((d) => {
    const ano = new Date().getFullYear();
    const dt = new Date(ano, Number(d.slice(0, 2)) - 1, Number(d.slice(3)) + 1);
    return `${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
  }, data);

/**
 * Fluxo principal (US-17), contra o build estático servido localmente:
 * abrir hoje → trocar de dia pela faixa → escolher um dia pelo calendário → voltar com "Hoje".
 */
test('fluxo principal: hoje, faixa, calendário e volta com "Hoje"', async ({ page, isMobile }) => {
  const console = vigiarConsole(page);
  const titulo = page.getByRole('heading', { level: 1 });

  // 1. Abrir o site leva ao santo de hoje.
  await page.goto('/');
  const hoje = await hojeNoNavegador(page);
  await expect(page).toHaveURL(`/dia/${hoje}`);
  await expect(titulo).not.toBeEmpty();
  const santoDeHoje = await titulo.textContent();
  await expect(page.locator('app-faixa [aria-current="date"] .numero')).toHaveText(String(Number(hoje.slice(3))));

  // 2. Trocar de dia pela faixa.
  const amanha = await seguinte(page, hoje);
  await diaNaFaixa(page, porExtenso(amanha)).click();
  await expect(page).toHaveURL(`/dia/${amanha}`);
  await expect(titulo).not.toHaveText(santoDeHoje!);

  // 3. Escolher um dia pelo calendário (painel no celular, coluna no computador).
  const mes = amanha.slice(0, 2);
  const escolhido = `${mes}-${amanha.slice(3) === '15' ? '16' : '15'}`;
  if (isMobile) {
    await page.getByRole('button', { name: 'Abrir calendário' }).click();
  }
  const calendario = isMobile
    ? page.getByRole('dialog', { name: 'Escolher dia do mês' })
    : page.getByRole('complementary', { name: 'Calendário do mês' });
  await calendario.getByRole('link', { name: new RegExp(`, ${porExtenso(escolhido)}$`) }).click();
  await expect(page).toHaveURL(`/dia/${escolhido}`);
  if (isMobile) await expect(calendario).toBeHidden();
  const nomeEscolhido = await titulo.textContent();
  expect(nomeEscolhido).toBeTruthy();

  // 4. Voltar com "Hoje".
  await page.getByRole('link', { name: 'Hoje', exact: true }).click();
  await expect(page).toHaveURL(`/dia/${hoje}`);
  await expect(titulo).toHaveText(santoDeHoje!);

  expect(console).toEqual([]);
});

test('endereço com barra final (comum em hospedagens estáticas) também funciona', async ({ page }) => {
  const console = vigiarConsole(page);
  await page.goto('/dia/10-06/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('São Bruno');
  await page.waitForLoadState('networkidle');
  expect(console).toEqual([]);
});
