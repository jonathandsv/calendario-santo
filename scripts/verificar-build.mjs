// Confere o resultado do build estático (US-14, PRD 3.1).
// Uso: node scripts/verificar-build.mjs   (roda em postbuild)
// - Existe dia/MM-DD/index.html para cada um dos 366 dias, além de index.html e 404.html.
// - Cada página contém o nome e a descrição do seu dia (no HTML, fora dos scripts).
// - Nenhuma página traz dia da semana nem marcação de "hoje", que só podem existir no navegador.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SAIDA_PADRAO = join(RAIZ, 'dist/santo-do-dia/browser');
const FONTE_PADRAO = join(RAIZ, 'dados/santos.json');

const DIAS_DA_SEMANA = /\b(domingo|segunda-feira|terça-feira|quarta-feira|quinta-feira|sexta-feira|sábado)\b/i;
const ABREVIADOS = />\s*(Dom|Seg|Ter|Qua|Qui|Sex|Sáb)\s*(<|,)/;
/** Classe "hoje" como token (não pega "botao-hoje" nem "hoje-painel"). */
const CLASSE_HOJE = /class="(?:[^"]*\s)?hoje(?:\s[^"]*)?"/;

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decodificar = (s) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENTIDADES[e] ?? m;
  });
const normalizar = (s) => s.replace(/\s+/g, ' ').trim();

/** Texto visível de uma página: sem scripts e estilos, sem tags, entidades decodificadas. */
export function textoDe(html) {
  const semCodigo = html.replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  return normalizar(decodificar(semCodigo.replace(/<[^>]+>/g, ' ')));
}

/** Problemas de uma página de dia. `vizinhos` são os registros cujos nomes podem aparecer (próximos dias). */
export function problemasDaPagina(html, santo, vizinhos = []) {
  const problemas = [];
  const texto = textoDe(html);
  const corpo = html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  if (!texto.includes(normalizar(santo.nome))) problemas.push('não contém o nome');
  if (!texto.includes(normalizar(santo.descricao))) problemas.push('não contém a descrição');

  // Tira o conteúdo do próprio registro e dos vizinhos (podem mencionar "domingo") antes de procurar.
  let interface_ = texto;
  for (const s of [santo, ...vizinhos]) {
    for (const campo of [s.nome, s.descricao, s.obs, s.dados_referentes_a]) {
      if (campo) interface_ = interface_.split(normalizar(campo)).join(' ');
    }
  }
  const semana = DIAS_DA_SEMANA.exec(interface_);
  if (semana) problemas.push(`contém dia da semana ("${semana[1]}")`);
  const abreviado = ABREVIADOS.exec(corpo);
  if (abreviado) problemas.push(`contém dia da semana abreviado ("${abreviado[1]}")`);
  if (CLASSE_HOJE.test(corpo)) problemas.push('contém marcação de "hoje"');
  return problemas;
}

export async function verificarBuild({ saida = SAIDA_PADRAO, fonte = FONTE_PADRAO } = {}) {
  const santos = JSON.parse(await readFile(fonte, 'utf8'));
  const problemas = [];
  const ler = (caminho) => readFile(join(saida, caminho), 'utf8').catch(() => null);

  for (const pagina of ['index.html', '404.html']) {
    if ((await ler(pagina)) === null) problemas.push(`${pagina}: não existe`);
  }
  for (const [i, santo] of santos.entries()) {
    const caminho = `dia/${santo.data}/index.html`;
    const html = await ler(caminho);
    if (html === null) {
      problemas.push(`${caminho}: não existe`);
      continue;
    }
    const vizinhos = [1, 2, 3].map((p) => santos[(i + p) % santos.length]);
    for (const p of problemasDaPagina(html, santo, vizinhos)) problemas.push(`${caminho}: ${p}`);
  }
  return { paginas: santos.length, problemas };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { paginas, problemas } = await verificarBuild();
  if (problemas.length) {
    console.error(`verificar-build: ${problemas.length} problema(s):\n- ${problemas.slice(0, 50).join('\n- ')}`);
    process.exit(1);
  }
  console.log(`verificar-build: ${paginas} páginas de dia conferidas, além de index.html e 404.html.`);
}
