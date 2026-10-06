// Divide dados/santos.json em um arquivo por dia e gera o índice leve embutido no app.
// Uso: node scripts/gerar-dados.mjs   (roda antes de build, start e test)
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOTAL = 366;
const FORMATO_DATA = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export const CAMINHOS_PADRAO = {
  fonte: join(RAIZ, 'dados/santos.json'),
  dias: join(RAIZ, 'public/data/dias'),
  indice: join(RAIZ, 'src/app/dados/indice.gerado.ts'),
};

/** Confere a lista de registros e devolve uma mensagem de erro, ou null se estiver tudo certo. */
export function validar(santos) {
  if (!Array.isArray(santos)) return 'santos.json deve conter uma lista';
  if (santos.length !== TOTAL) return `santos.json deve ter ${TOTAL} registros, mas tem ${santos.length}`;
  const vistas = new Set();
  for (const s of santos) {
    if (!FORMATO_DATA.test(s?.data ?? '')) return `data inválida: ${JSON.stringify(s?.data)}`;
    if (vistas.has(s.data)) return `data repetida: ${s.data}`;
    if (!s.nome) return `registro ${s.data} sem nome`;
    vistas.add(s.data);
  }
  return null;
}

export async function gerarDados(caminhos = CAMINHOS_PADRAO) {
  const santos = JSON.parse(await readFile(caminhos.fonte, 'utf8'));
  const erro = validar(santos);
  if (erro) throw new Error(erro);

  await rm(caminhos.dias, { recursive: true, force: true });
  await mkdir(caminhos.dias, { recursive: true });
  await Promise.all(
    santos.map((s) => writeFile(join(caminhos.dias, `${s.data}.json`), JSON.stringify(s), 'utf8')),
  );

  const indice = [...santos]
    .sort((a, b) => a.data.localeCompare(b.data))
    .map(({ data, nome }) => ({ data, nome }));
  const ts =
    '// Arquivo gerado por scripts/gerar-dados.mjs. Não editar.\n' +
    "import type { ItemIndice } from './santo';\n\n" +
    `export const INDICE: readonly ItemIndice[] = ${JSON.stringify(indice, null, 1)};\n`;
  await mkdir(dirname(caminhos.indice), { recursive: true });
  await writeFile(caminhos.indice, ts, 'utf8');

  return { dias: santos.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { dias } = await gerarDados();
    console.log(`gerar-dados: ${dias} dias gerados em public/data/dias e índice em src/app/dados.`);
  } catch (e) {
    console.error(`gerar-dados: ${e.message}`);
    process.exit(1);
  }
}
