import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RelogioService } from '../datas/relogio.service';
import { Proximos } from './proximos';

const ano = signal<number | null>(null);

beforeEach(() => {
  ano.set(null);
  TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: RelogioService, useValue: { ano } }] });
});

async function cartoes(data: string) {
  const fixture = TestBed.createComponent(Proximos);
  fixture.componentRef.setInput('data', data);
  await fixture.whenStable();
  const ler = () =>
    [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('a.cartao')].map((a) => ({
      href: a.getAttribute('href'),
      quando: a.querySelector('.quando')?.textContent?.replace(/\s+/g, ' ').trim(),
      nome: a.querySelector('.nome')?.textContent,
    }));
  return { fixture, ler };
}

describe('Proximos', () => {
  it('mostra os três dias seguintes com data e nome', async () => {
    const { ler } = await cartoes('10-06');
    expect(ler()).toEqual([
      { href: '/dia/10-07', quando: '7 de outubro', nome: 'Nossa Senhora do Rosário' },
      { href: '/dia/10-08', quando: '8 de outubro', nome: 'Santa Pelágia' },
      { href: '/dia/10-09', quando: '9 de outubro', nome: expect.stringContaining('Dionísio') },
    ]);
  });

  it('acrescenta o dia da semana com o ano conhecido', async () => {
    const { fixture, ler } = await cartoes('10-06');
    ano.set(2026);
    await fixture.whenStable();
    expect(ler()[0].quando).toBe('Qua, 7 de outubro');
  });

  it.each([
    ['12-30', ['/dia/12-31', '/dia/01-01', '/dia/01-02']],
    ['12-31', ['/dia/01-01', '/dia/01-02', '/dia/01-03']],
  ])('em %s continua em janeiro', async (data, esperado) => {
    const { ler } = await cartoes(data);
    expect(ler().map((c) => c.href)).toEqual(esperado);
  });
});
