import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Santo } from '../dados/santo';
import { URL_DO_SITE } from '../site';
import { MetadadosService, resumir, tituloDoDia } from './metadados.service';

const BRUNO = {
  data: '10-06',
  nome: 'São Bruno',
  descricao:
    'Professor em Reims que recusou ser bispo para buscar a Deus no silêncio. Em 1084, retirou-se com seis companheiros para as montanhas perto de Grenoble e fundou a Ordem dos Cartuxos.',
  imagem: null,
} as unknown as Santo;

describe('metadados', () => {
  it('monta o título no formato do PRD', () => {
    expect(tituloDoDia(BRUNO)).toBe('São Bruno — 6 de outubro | Santo do Dia');
  });

  it('resume a descrição numa palavra, com reticências', () => {
    const resumo = resumir(BRUNO.descricao);
    expect(resumo.length).toBeLessThanOrEqual(160);
    expect(resumo.endsWith('…')).toBe(true);
    expect(BRUNO.descricao.startsWith(resumo.slice(0, -1))).toBe(true);
    expect(resumir('Curta.')).toBe('Curta.');
  });

  it('aplica título, descrição, canônica e Open Graph', () => {
    const servico = TestBed.inject(MetadadosService);
    const doc = TestBed.inject(DOCUMENT);
    const conteudo = (sel: string) => doc.head.querySelector(`meta[${sel}]`)?.getAttribute('content');

    servico.doDia({ ...BRUNO, imagem: { local: '/img/santos/10-06.jpg' } } as Santo);
    expect(TestBed.inject(Title).getTitle()).toBe('São Bruno — 6 de outubro | Santo do Dia');
    expect(conteudo('name="description"')).toBe(resumir(BRUNO.descricao));
    expect(doc.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${URL_DO_SITE}/dia/10-06`);
    expect(conteudo('property="og:title"')).toBe('São Bruno — 6 de outubro | Santo do Dia');
    expect(conteudo('property="og:url"')).toBe(`${URL_DO_SITE}/dia/10-06`);
    expect(conteudo('property="og:image"')).toBe(`${URL_DO_SITE}/img/santos/10-06.jpg`);

    servico.doDia(BRUNO);
    expect(conteudo('property="og:image"')).toBeUndefined();
    expect(doc.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
  });
});
