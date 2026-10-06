import {
  dataPorExtenso,
  dataValida,
  deslocar,
  diaAnterior,
  diaDaSemana,
  diaEMes,
  diasDoMes,
  diaSeguinte,
  ehBissexto,
  existeNoAno,
  hojeMesDia,
} from './datas';

describe('datas', () => {
  it('identifica anos bissextos', () => {
    expect(ehBissexto(2024)).toBe(true);
    expect(ehBissexto(2026)).toBe(false);
    expect(ehBissexto(1900)).toBe(false);
    expect(ehBissexto(2000)).toBe(true);
  });

  it('calcula hoje como MM-DD pela data local', () => {
    expect(hojeMesDia(new Date(2026, 9, 6, 23, 59))).toBe('10-06');
    expect(hojeMesDia(new Date(2027, 0, 1, 0, 0))).toBe('01-01');
  });

  it('valida datas MM-DD', () => {
    expect(dataValida('10-06')).toBe(true);
    expect(dataValida('02-29')).toBe(true);
    expect(dataValida('02-30')).toBe(false);
    expect(dataValida('13-40')).toBe(false);
    expect(dataValida('1-6')).toBe(false);
  });

  describe('dia seguinte e anterior', () => {
    it('vira o mês', () => {
      expect(diaSeguinte('01-31', 2026)).toBe('02-01');
      expect(diaSeguinte('04-30', 2026)).toBe('05-01');
      expect(diaAnterior('05-01', 2026)).toBe('04-30');
      expect(diaAnterior('03-01', 2026)).toBe('02-28');
    });

    it('vira de 31/12 para 01/01 e volta', () => {
      expect(diaSeguinte('12-31', 2026)).toBe('01-01');
      expect(diaAnterior('01-01', 2026)).toBe('12-31');
    });

    it('pula 29/02 em ano não bissexto', () => {
      expect(diaSeguinte('02-28', 2026)).toBe('03-01');
      expect(diaAnterior('03-01', 2026)).toBe('02-28');
      expect(diaSeguinte('02-29', 2026)).toBe('03-01');
      expect(diaAnterior('02-29', 2026)).toBe('02-28');
    });

    it('inclui 29/02 em ano bissexto e com ano desconhecido', () => {
      expect(diaSeguinte('02-28', 2028)).toBe('02-29');
      expect(diaAnterior('03-01', 2028)).toBe('02-29');
      expect(diaSeguinte('02-28', null)).toBe('02-29');
    });

    it('desloca vários dias atravessando o ano', () => {
      expect(deslocar('12-30', 3, 2026)).toBe('01-02');
      expect(deslocar('01-02', -3, 2026)).toBe('12-30');
      expect(deslocar('10-06', 0, 2026)).toBe('10-06');
    });
  });

  it('calcula o dia da semana no ano dado', () => {
    expect(diaDaSemana('10-06', 2026)).toBe(2); // terça
    expect(diaDaSemana('01-01', 2026)).toBe(4); // quinta
    expect(diaDaSemana('02-29', 2028)).toBe(2); // terça
  });

  it('lista os dias do mês', () => {
    expect(diasDoMes(10, 2026)).toHaveLength(31);
    expect(diasDoMes(4, 2026).at(-1)).toBe('04-30');
    expect(diasDoMes(2, 2026)).toHaveLength(28);
    expect(diasDoMes(2, 2028)).toHaveLength(29);
    expect(diasDoMes(2, 2028).at(-1)).toBe('02-29');
  });

  it('diz se 29/02 existe no ano', () => {
    expect(existeNoAno('02-29', 2026)).toBe(false);
    expect(existeNoAno('02-29', 2028)).toBe(true);
    expect(existeNoAno('02-29', null)).toBe(true);
    expect(existeNoAno('02-28', 2026)).toBe(true);
  });

  it('escreve a data por extenso', () => {
    expect(dataPorExtenso('10-06', 2026)).toBe('Terça-feira, 6 de outubro');
    expect(dataPorExtenso('01-01', 2026)).toBe('Quinta-feira, 1 de janeiro');
    expect(diaEMes('03-19')).toBe('19 de março');
  });
});
