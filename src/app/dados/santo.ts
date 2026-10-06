/** Data no formato `MM-DD` (ex.: `10-06`). */
export type DataMesDia = string;

export type Grau = 'solenidade' | 'festa' | 'memoria' | 'memoria_facultativa' | 'comemoracao';

export type Fonte = 'calendario_geral' | 'proprio_brasil' | 'martirologio';

export type Tipo = 'pessoa' | 'grupo' | 'celebracao';

export interface ImagemSanto {
  arquivo: string;
  url: string;
  /** Caminho servido pelo site (ex.: `/img/santos/10-06.jpg`), preenchido pela US-18. */
  local?: string | null;
  pagina_commons: string;
  licenca: string | null;
  autor: string | null;
}

/** Registro de um dia, no formato de `dados/santos.json` (PRD, seção 4). */
export interface Santo {
  data: DataMesDia;
  nome: string;
  grau: Grau | null;
  fonte: Fonte;
  obs?: string;
  tipo: Tipo;
  descricao: string;
  nascimento: string | null;
  falecimento: string | null;
  ano_nascimento: number | null;
  ano_falecimento: number | null;
  local_nascimento: string | null;
  pais_atual: string | null;
  dados_referentes_a?: string;
  wikipedia: string | null;
  imagem: ImagemSanto | null;
  wikidata?: string | null;
  conferido: boolean | null;
}

/** Item do índice leve embutido no app. */
export interface ItemIndice {
  data: DataMesDia;
  nome: string;
}
