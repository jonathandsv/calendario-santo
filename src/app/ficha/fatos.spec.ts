import { Santo } from '../dados/santo';
import { fatosDo } from './fatos';

const base: Santo = {
  data: '10-06',
  nome: 'São Bruno',
  grau: null,
  fonte: 'calendario_geral',
  tipo: 'pessoa',
  descricao: '',
  nascimento: 'c. 1030',
  ano_nascimento: 1030,
  falecimento: '6 de outubro de 1101',
  ano_falecimento: 1101,
  local_nascimento: 'Colônia',
  pais_atual: 'Alemanha',
  wikipedia: null,
  conferido: true,
  imagem: null,
};

describe('fatosDo', () => {
  it('junta local e país na origem e mostra as datas como estão', () => {
    expect(fatosDo(base)).toEqual({
      origem: 'Colônia, Alemanha',
      nascimento: 'c. 1030',
      falecimento: '6 de outubro de 1101',
      referentesA: null,
    });
  });

  it('usa só o que existir na origem, ou "Não conhecida"', () => {
    expect(fatosDo({ ...base, local_nascimento: null })?.origem).toBe('Alemanha');
    expect(fatosDo({ ...base, pais_atual: null })?.origem).toBe('Colônia');
    expect(fatosDo({ ...base, local_nascimento: null, pais_atual: null })?.origem).toBe('Não conhecida');
  });

  it('mostra "Não se aplica" para datas ausentes', () => {
    const fatos = fatosDo({ ...base, nascimento: null, falecimento: null });
    expect(fatos?.nascimento).toBe('Não se aplica');
    expect(fatos?.falecimento).toBe('Não se aplica');
  });

  it('não aparece sem nenhum dado nem em celebrações', () => {
    const vazio = { ...base, nascimento: null, falecimento: null, local_nascimento: null, pais_atual: null };
    expect(fatosDo(vazio)).toBeNull();
    expect(fatosDo({ ...base, tipo: 'celebracao' })).toBeNull();
  });

  it('em grupos, informa a quem os dados se referem', () => {
    const grupo: Santo = { ...base, tipo: 'grupo', dados_referentes_a: 'São Paulo Miki' };
    expect(fatosDo(grupo)?.referentesA).toBe('São Paulo Miki');
  });
});
