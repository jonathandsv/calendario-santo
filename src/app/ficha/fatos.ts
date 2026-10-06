import { Santo } from '../dados/santo';

export interface Fatos {
  origem: string;
  nascimento: string;
  falecimento: string;
  /** Em grupos, a quem as datas se referem ("Dados de …"). */
  referentesA: string | null;
}

const NAO_SE_APLICA = 'Não se aplica';

/**
 * Bloco de origem e datas (PRD, seção 4). Devolve `null` quando o bloco não deve aparecer:
 * em celebrações ou quando não há nenhum entre nascimento, falecimento, local e país.
 */
export function fatosDo(santo: Santo): Fatos | null {
  if (santo.tipo === 'celebracao') return null;
  const { nascimento, falecimento, local_nascimento: local, pais_atual: pais } = santo;
  if (!nascimento && !falecimento && !local && !pais) return null;

  return {
    origem: [local, pais].filter(Boolean).join(', ') || 'Não conhecida',
    nascimento: nascimento || NAO_SE_APLICA,
    falecimento: falecimento || NAO_SE_APLICA,
    referentesA: santo.tipo === 'grupo' && santo.dados_referentes_a ? santo.dados_referentes_a : null,
  };
}
