import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Santo } from '../dados/santo';
import { diaEMes } from '../datas/datas';
import { NOME_DO_SITE, URL_DO_SITE } from '../site';

const LIMITE_DESCRICAO = 160;

/** Início da descrição, cortado numa palavra, com no máximo 160 caracteres. */
export function resumir(texto: string, limite = LIMITE_DESCRICAO): string {
  const limpo = texto.replace(/\s+/g, ' ').trim();
  if (limpo.length <= limite) return limpo;
  const corte = limpo.slice(0, limite - 1);
  const ultimoEspaco = corte.lastIndexOf(' ');
  return `${(ultimoEspaco > limite / 2 ? corte.slice(0, ultimoEspaco) : corte).replace(/[\s,;:.]+$/, '')}…`;
}

/** "São Bruno — 6 de outubro | Santo do Dia" (PRD 6). */
export function tituloDoDia(santo: Santo): string {
  return `${santo.nome} — ${diaEMes(santo.data)} | ${NOME_DO_SITE}`;
}

/**
 * Título, descrição, URL canônica e Open Graph de cada página. Aplicado durante a
 * pré-renderização, então tudo vai no HTML entregue.
 */
@Injectable({ providedIn: 'root' })
export class MetadadosService {
  private readonly titulo = inject(Title);
  private readonly meta = inject(Meta);
  private readonly documento = inject(DOCUMENT);

  doDia(santo: Santo): void {
    const caminho = `/dia/${santo.data}`;
    const imagem = santo.imagem?.local ? `${URL_DO_SITE}${santo.imagem.local}` : null;
    this.aplicar({
      titulo: tituloDoDia(santo),
      descricao: resumir(santo.descricao),
      caminho,
      tipo: 'article',
      imagem,
      imagemAlt: imagem ? santo.nome : null,
    });
  }

  daPagina(dados: { titulo: string; descricao: string; caminho: string; indexar?: boolean }): void {
    this.aplicar({ ...dados, tipo: 'website', imagem: null, imagemAlt: null });
  }

  private aplicar(m: {
    titulo: string;
    descricao: string;
    caminho: string;
    tipo: string;
    imagem: string | null;
    imagemAlt: string | null;
    indexar?: boolean;
  }): void {
    const url = `${URL_DO_SITE}${m.caminho}`;
    this.titulo.setTitle(m.titulo);
    this.definir('name', 'description', m.descricao);
    this.definir('name', 'robots', m.indexar === false ? 'noindex' : null);
    this.definir('property', 'og:site_name', NOME_DO_SITE);
    this.definir('property', 'og:locale', 'pt_BR');
    this.definir('property', 'og:type', m.tipo);
    this.definir('property', 'og:title', m.titulo);
    this.definir('property', 'og:description', m.descricao);
    this.definir('property', 'og:url', url);
    this.definir('property', 'og:image', m.imagem);
    this.definir('property', 'og:image:alt', m.imagemAlt);
    this.definir('name', 'twitter:card', m.imagem ? 'summary_large_image' : 'summary');
    this.canonica(url);
  }

  private definir(atributo: 'name' | 'property', chave: string, valor: string | null): void {
    const seletor = `${atributo}="${chave}"`;
    if (valor === null) this.meta.removeTag(seletor);
    else this.meta.updateTag({ [atributo]: chave, content: valor }, seletor);
  }

  private canonica(url: string): void {
    let link = this.documento.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.documento.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.documento.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
