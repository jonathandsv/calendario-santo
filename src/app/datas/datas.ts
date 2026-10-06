import { DataMesDia } from '../dados/santo';

/**
 * Funções puras de data (PRD 3.1 e 5.1). Todas trabalham com texto `MM-DD`.
 *
 * As que dependem do ano o recebem por parâmetro. `ano = null` significa "ano ainda
 * desconhecido" (no build e antes da hidratação): o ciclo usa os 366 dias, com 29/02.
 * Só `hojeMesDia` lê o relógio.
 */

export const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

export const DIAS_DA_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

export const DIAS_DA_SEMANA_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const;

const DIAS_NO_MES = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const FORMATO = /^(\d{2})-(\d{2})$/;

const doisDigitos = (n: number) => String(n).padStart(2, '0');

export function montarData(mes: number, dia: number): DataMesDia {
  return `${doisDigitos(mes)}-${doisDigitos(dia)}`;
}

/** Separa `MM-DD` em mês (1–12) e dia. */
export function partes(data: DataMesDia): { mes: number; dia: number } {
  const m = FORMATO.exec(data);
  if (!m) throw new Error(`Data inválida: ${data}`);
  return { mes: Number(m[1]), dia: Number(m[2]) };
}

/** `MM-DD` existe em algum ano (inclui `02-29`). */
export function dataValida(data: string): boolean {
  const m = FORMATO.exec(data);
  if (!m) return false;
  const mes = Number(m[1]);
  const dia = Number(m[2]);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= DIAS_NO_MES[mes - 1];
}

export function ehBissexto(ano: number): boolean {
  return (ano % 4 === 0 && ano % 100 !== 0) || ano % 400 === 0;
}

/** Quantidade de dias do mês; com `ano = null`, fevereiro tem 29. */
export function diasNoMes(mes: number, ano: number | null): number {
  if (mes === 2 && ano !== null && !ehBissexto(ano)) return 28;
  return DIAS_NO_MES[mes - 1];
}

/** `02-29` só existe em ano bissexto; com `ano = null`, existe. */
export function existeNoAno(data: DataMesDia, ano: number | null): boolean {
  const { mes, dia } = partes(data);
  return dia <= diasNoMes(mes, ano);
}

/** Dias do mês (1–12) como `MM-DD`, já sem 29/02 em ano não bissexto. */
export function diasDoMes(mes: number, ano: number | null): DataMesDia[] {
  return Array.from({ length: diasNoMes(mes, ano) }, (_, i) => montarData(mes, i + 1));
}

/** Dia seguinte, com virada de mês e de 31/12 para 01/01. */
export function diaSeguinte(data: DataMesDia, ano: number | null): DataMesDia {
  const { mes, dia } = partes(data);
  if (dia < diasNoMes(mes, ano)) return montarData(mes, dia + 1);
  return montarData(mes === 12 ? 1 : mes + 1, 1);
}

/** Dia anterior, com virada de mês e de 01/01 para 31/12. */
export function diaAnterior(data: DataMesDia, ano: number | null): DataMesDia {
  const { mes, dia } = partes(data);
  if (dia > 1) return montarData(mes, Math.min(dia - 1, diasNoMes(mes, ano)));
  const mesAnterior = mes === 1 ? 12 : mes - 1;
  return montarData(mesAnterior, diasNoMes(mesAnterior, ano));
}

/** Anda `passos` dias (negativo volta). */
export function deslocar(data: DataMesDia, passos: number, ano: number | null): DataMesDia {
  let atual = data;
  const passo = passos >= 0 ? diaSeguinte : diaAnterior;
  for (let i = 0; i < Math.abs(passos); i++) atual = passo(atual, ano);
  return atual;
}

/** Dia da semana (0 = domingo) de `MM-DD` no ano dado. */
export function diaDaSemana(data: DataMesDia, ano: number): number {
  const { mes, dia } = partes(data);
  return new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
}

/** "6 de outubro" (não depende do ano; pode ir para o HTML pré-renderizado). */
export function diaEMes(data: DataMesDia): string {
  const { mes, dia } = partes(data);
  return `${dia} de ${MESES[mes - 1]}`;
}

/** "Terça-feira, 6 de outubro". */
export function dataPorExtenso(data: DataMesDia, ano: number): string {
  return `${DIAS_DA_SEMANA[diaDaSemana(data, ano)]}, ${diaEMes(data)}`;
}

/** Hoje como `MM-DD`, pela data local do aparelho. Única função que lê o relógio. */
export function hojeMesDia(agora: Date = new Date()): DataMesDia {
  return montarData(agora.getMonth() + 1, agora.getDate());
}
