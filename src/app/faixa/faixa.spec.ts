import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RelogioService } from '../datas/relogio.service';
import { Faixa } from './faixa';

const ano = signal<number | null>(null);

beforeEach(() => {
  ano.set(null);
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: RelogioService, useValue: { ano } }],
  });
});

async function montar(data: string) {
  const fixture = TestBed.createComponent(Faixa);
  fixture.componentRef.setInput('data', data);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const links = () => [...el.querySelectorAll<HTMLAnchorElement>('a.dia')];
  return { fixture, el, links };
}

describe('Faixa', () => {
  it('centraliza o dia selecionado na lista, com aria-current', async () => {
    const { links } = await montar('10-06');
    const todos = links();
    expect(todos).toHaveLength(43);
    const meio = todos[21];
    expect(meio.getAttribute('aria-current')).toBe('date');
    expect(meio.getAttribute('href')).toBe('/dia/10-06');
    expect(todos.filter((a) => a.hasAttribute('aria-current'))).toHaveLength(1);
  });

  it('sem o ano, mostra só os números; com o ano, os dias da semana', async () => {
    const { fixture, links } = await montar('10-06');
    expect(links()[21].querySelector('.semana')?.textContent?.trim()).toBe('');
    expect(links()[21].getAttribute('aria-label')).toBe('6 de outubro');

    ano.set(2026);
    await fixture.whenStable();
    expect(links()[21].querySelector('.semana')?.textContent?.trim()).toBe('Ter');
    expect(links()[21].getAttribute('aria-label')).toBe('Terça-feira, 6 de outubro');
  });

  it('atravessa a virada de ano', async () => {
    const { links } = await montar('12-31');
    expect(links()[22].getAttribute('href')).toBe('/dia/01-01');
    expect(links()[20].getAttribute('href')).toBe('/dia/12-30');
  });

  it('tira 29/02 em ano não bissexto', async () => {
    const { fixture, links } = await montar('02-28');
    expect(links()[22].getAttribute('href')).toBe('/dia/02-29');
    ano.set(2026);
    await fixture.whenStable();
    expect(links()[22].getAttribute('href')).toBe('/dia/03-01');
  });

  it('setas do teclado navegam para o dia anterior e o seguinte', async () => {
    const { el } = await montar('01-01');
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const nav = el.querySelector('nav') as HTMLElement;
    const tecla = async (key: string) => {
      nav.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      await Promise.resolve();
    };
    await tecla('ArrowLeft');
    await tecla('ArrowRight');
    await tecla('Enter');
    // A segunda tecla parte do destino da primeira, que a rota ainda não refletiu.
    expect(navegar.mock.calls.map((c) => c[0])).toEqual([
      ['/dia', '12-31'],
      ['/dia', '01-01'],
    ]);
  });

  it('teclas rápidas encadeiam a partir do destino ainda pendente', async () => {
    const { el } = await montar('10-06');
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockReturnValue(new Promise(() => undefined));
    const nav = el.querySelector('nav') as HTMLElement;
    nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    expect(navegar.mock.calls.map((c) => c[0])).toEqual([
      ['/dia', '10-05'],
      ['/dia', '10-04'],
    ]);
  });
});
