import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Santo } from '../dados/santo';
import { RelogioService } from '../datas/relogio.service';
import { Ficha } from './ficha';

const BRUNO: Santo = {
  data: '10-06',
  nome: 'São Bruno',
  grau: 'memoria_facultativa',
  fonte: 'calendario_geral',
  tipo: 'pessoa',
  descricao: 'Professor em Reims que fundou a Ordem dos Cartuxos.',
  nascimento: 'c. 1030',
  ano_nascimento: 1030,
  falecimento: '6 de outubro de 1101',
  ano_falecimento: 1101,
  local_nascimento: 'Colônia',
  pais_atual: 'Alemanha',
  wikipedia: 'https://en.wikipedia.org/wiki/Bruno_of_Cologne',
  conferido: true,
  imagem: null,
};

const ano = signal<number | null>(null);

beforeEach(() => {
  ano.set(null);
  TestBed.configureTestingModule({ providers: [{ provide: RelogioService, useValue: { ano } }] });
});

async function montar(santo: Santo) {
  const fixture = TestBed.createComponent(Ficha);
  fixture.componentRef.setInput('santo', santo);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Ficha', () => {
  it('mostra dia e mês, nome e descrição; o dia da semana só aparece com o ano conhecido', async () => {
    const { fixture, el } = await montar(BRUNO);
    expect(el.querySelector('.data')?.textContent?.trim()).toBe('6 de outubro');
    expect(el.querySelector('h1')?.textContent).toBe('São Bruno');
    expect(el.querySelector('.descricao')?.textContent).toContain('Ordem dos Cartuxos');

    ano.set(2026);
    await fixture.whenStable();
    expect(el.querySelector('.data')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('Terça-feira, 6 de outubro');
  });

  it('mostra a etiqueta de grau com o rótulo da seção 4', async () => {
    const { el } = await montar(BRUNO);
    expect(el.querySelector('.grau')?.textContent).toBe('Memória facultativa');
  });

  it('não mostra etiqueta quando o grau é nulo', async () => {
    const { el } = await montar({ ...BRUNO, grau: null });
    expect(el.querySelector('.grau')).toBeNull();
  });

  it('mostra a nota obs só quando existe', async () => {
    expect((await montar(BRUNO)).el.querySelector('.obs')).toBeNull();
    const { el } = await montar({ ...BRUNO, obs: 'Em 2026 é transferida para o domingo.' });
    expect(el.querySelector('.obs')?.textContent).toBe('Em 2026 é transferida para o domingo.');
  });

  it('mostra "Saiba mais" abrindo em nova aba quando há wikipedia', async () => {
    const { el } = await montar(BRUNO);
    const link = el.querySelector('.saiba-mais a') as HTMLAnchorElement;
    expect(link.href).toBe(BRUNO.wikipedia);
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    expect(link.textContent).toContain('Saiba mais');
  });

  it('não mostra "Saiba mais" sem wikipedia', async () => {
    const { el } = await montar({ ...BRUNO, wikipedia: null });
    expect(el.querySelector('.saiba-mais')).toBeNull();
  });
});
