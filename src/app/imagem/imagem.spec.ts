import { TestBed } from '@angular/core/testing';
import { ImagemSanto } from '../dados/santo';
import { Imagem } from './imagem';

const BRUNO: ImagemSanto = {
  arquivo: 'Nicolas Mignard-Saint Bruno.jpg',
  url: 'https://thumb.wikimedia.org/x/500px-Bruno.jpg',
  local: '/img/santos/10-06.jpg',
  pagina_commons: 'https://commons.wikimedia.org/wiki/File:Nicolas_Mignard-Saint_Bruno.jpg',
  licenca: 'Public domain',
  autor: 'Nicolas Mignard',
};

async function montar(imagem: ImagemSanto | null) {
  const fixture = TestBed.createComponent(Imagem);
  fixture.componentRef.setInput('imagem', imagem);
  fixture.componentRef.setInput('nome', 'São Bruno');
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Imagem', () => {
  it('sem imagem, mostra o espaço reservado', async () => {
    const { el } = await montar(null);
    expect(el.querySelector('.reservado img')?.getAttribute('src')).toBe('/img/santo-placeholder.svg');
    expect(el.querySelector('.reservado img')?.getAttribute('alt')).toBe('');
    expect(el.querySelector('figure')).toBeNull();
  });

  it('com imagem, mostra o arquivo local com alt, carregamento tardio e crédito', async () => {
    const { el } = await montar(BRUNO);
    const img = el.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/img/santos/10-06.jpg');
    expect(img.alt).toBe('São Bruno');
    expect(img.getAttribute('loading')).toBe('lazy');

    const link = el.querySelector('figcaption a') as HTMLAnchorElement;
    expect(link.textContent).toBe('Nicolas Mignard, Public domain');
    expect(link.href).toBe(BRUNO.pagina_commons);
  });

  it('volta ao espaço reservado se a imagem falhar', async () => {
    const { fixture, el } = await montar(BRUNO);
    el.querySelector('img')?.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(el.querySelector('figure')).toBeNull();
    expect(el.querySelector('.reservado img')).not.toBeNull();
  });

  it('sem caminho local, mostra o espaço reservado', async () => {
    const { el } = await montar({ ...BRUNO, local: null });
    expect(el.querySelector('figure')).toBeNull();
    expect(el.querySelector('.reservado')).not.toBeNull();
  });
});
