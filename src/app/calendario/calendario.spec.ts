import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RelogioService } from '../datas/relogio.service';
import { Calendario } from './calendario';

const ano = signal<number | null>(2026);
const hoje = signal<string | null>('10-06');

beforeEach(() => {
  ano.set(2026);
  hoje.set('10-06');
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: RelogioService, useValue: { ano, hoje } }],
  });
});

async function montar(data: string) {
  const fixture = TestBed.createComponent(Calendario);
  fixture.componentRef.setInput('data', data);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    el,
    dias: () => [...el.querySelectorAll<HTMLAnchorElement>('a.dia')],
    titulo: () => el.querySelector('h2')?.textContent?.trim(),
    clicar: async (rotulo: string) => {
      (el.querySelector(`button[aria-label="${rotulo}"]`) as HTMLButtonElement).click();
      await fixture.whenStable();
    },
  };
}

describe('Calendario', () => {
  it('sem o ano, não monta a grade', async () => {
    ano.set(null);
    const { el, titulo } = await montar('10-06');
    expect(el.querySelector('table')).toBeNull();
    expect(titulo()).toBe('Outubro');
  });

  it('monta o mês do dia selecionado, começando no domingo', async () => {
    const { el, dias, titulo } = await montar('10-06');
    expect(titulo()).toBe('Outubro 2026');
    expect(dias()).toHaveLength(31);
    // 1º de outubro de 2026 é quinta-feira: 4 casas vazias antes.
    const primeiraLinha = [...el.querySelectorAll('tbody tr')[0].querySelectorAll('td')];
    expect(primeiraLinha.findIndex((td) => td.textContent?.trim() === '1')).toBe(4);
  });

  it('marca o selecionado com aria-current e o de hoje com a classe hoje', async () => {
    hoje.set('10-09');
    const { dias } = await montar('10-06');
    const seis = dias().find((a) => a.dataset['dia'] === '10-06')!;
    expect(seis.getAttribute('aria-current')).toBe('date');
    expect(seis.getAttribute('href')).toBe('/dia/10-06');
    expect(seis.getAttribute('aria-label')).toBe('Terça-feira, 6 de outubro');
    expect(dias().find((a) => a.dataset['dia'] === '10-09')!.classList).toContain('hoje');
  });

  it('as setas percorrem os 12 meses e dão a volta no ano', async () => {
    const { clicar, titulo } = await montar('12-15');
    await clicar('Próximo mês');
    expect(titulo()).toBe('Janeiro 2026');
    for (let i = 0; i < 12; i++) await clicar('Mês anterior');
    expect(titulo()).toBe('Janeiro 2026');
    await clicar('Mês anterior');
    expect(titulo()).toBe('Dezembro 2026');
  });

  it('fevereiro tem 28 ou 29 dias conforme o ano', async () => {
    const { fixture, dias } = await montar('02-10');
    expect(dias()).toHaveLength(28);
    ano.set(2028);
    await fixture.whenStable();
    expect(dias()).toHaveLength(29);
  });

  it('o mês exibido acompanha o dia selecionado', async () => {
    const { fixture, clicar, titulo } = await montar('10-06');
    await clicar('Próximo mês');
    fixture.componentRef.setInput('data', '03-19');
    await fixture.whenStable();
    expect(titulo()).toBe('Março 2026');
  });

  it('as setas do teclado movem o foco entre os dias, atravessando o mês', async () => {
    const { fixture, el, titulo } = await montar('10-31');
    const tecla = async (key: string) => {
      (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await fixture.whenStable();
    };
    document.body.appendChild(el);
    el.querySelector<HTMLElement>('[data-dia="10-31"]')!.focus();
    expect(el.querySelector('[data-dia="10-31"]')!.getAttribute('tabindex')).toBe('0');

    await tecla('ArrowLeft');
    expect((document.activeElement as HTMLElement).dataset['dia']).toBe('10-30');
    await tecla('ArrowUp');
    expect((document.activeElement as HTMLElement).dataset['dia']).toBe('10-23');
    await tecla('ArrowDown');
    await tecla('ArrowDown');
    expect((document.activeElement as HTMLElement).dataset['dia']).toBe('11-06');
    expect(titulo()).toBe('Novembro 2026');
    el.remove();
  });

  it('teclas seguidas, antes de o foco andar, somam os passos', async () => {
    const { fixture, el } = await montar('10-06');
    document.body.appendChild(el);
    const origem = el.querySelector<HTMLElement>('[data-dia="10-06"]')!;
    origem.focus();
    // As duas teclas chegam ao mesmo elemento, sem renderização entre elas.
    origem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    origem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect((document.activeElement as HTMLElement).dataset['dia']).toBe('10-14');
    el.remove();
  });

  it('avisa quando um dia é escolhido', async () => {
    const { fixture, dias } = await montar('10-06');
    const escolhidos: string[] = [];
    fixture.componentInstance.escolheu.subscribe((d) => escolhidos.push(d));
    vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    dias()[9].click();
    expect(escolhidos).toEqual(['10-10']);
  });
});
