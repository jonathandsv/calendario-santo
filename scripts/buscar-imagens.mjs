// Preenche "wikidata" e "imagem" em santos.json a partir da Wikipédia e do Wikimedia Commons,
// baixa a imagem de 500px de cada santo e gera o relatório de imagens.
//
// Uso: npm run imagens -- [caminho/do/santos.json] [opções]
//   --so=10-06,08-13      processa só essas datas (útil para validar contra a API real)
//   --imagens=pasta       onde salvar as imagens (padrão: public/img/santos)
//   --relatorio=arquivo   onde gravar o relatório (padrão: docs/us-18-baixar-imagens/relatorio-imagens.md)
//   --aprovadas=arquivo   lista de datas com licença aprovada à mão (padrão: dados/imagens-aprovadas.json)
//
// Só aceita imagens hospedadas no Commons (as de uso restrito ficam de fora) e guarda licença e autor.
// Imagens com licença fora de domínio público, CC0, CC BY e CC BY-SA ficam com `imagem: null`
// e vão para a seção de revisão do relatório, até a data entrar na lista de aprovadas.
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const UA =
  process.env['SANTO_USER_AGENT'] ??
  'SantoDoDia/1.0 (site estatico do santo do dia; script de imagens; Node.js fetch)';
// O Commons só gera miniaturas em larguras padrão (…, 330, 500, 960, …); 600px responde 400.
const LARGURA = 500;
const TAMANHO_LOTE = 50;

export const PADRAO = {
  arquivo: join(RAIZ, 'dados/santos.json'),
  imagens: join(RAIZ, 'public/img/santos'),
  relatorio: join(RAIZ, 'docs/us-18-baixar-imagens/relatorio-imagens.md'),
  aprovadas: join(RAIZ, 'dados/imagens-aprovadas.json'),
  publico: join(RAIZ, 'public'),
};

const lotes = (xs, n) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));
/** Texto puro de um campo HTML do Commons, sem os trechos ocultos (`display:none`) que ele inclui. */
export function semHtml(s) {
  const texto = (s ?? '')
    .replace(/<(\w+)[^>]*display:\s*none[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
  return texto || null;
}
/** Tira da URL os parâmetros de rastreamento (`utm_*`) que a API acrescenta. */
export function semRastreio(url) {
  const u = new URL(url);
  for (const chave of [...u.searchParams.keys()]) if (chave.startsWith('utm_')) u.searchParams.delete(chave);
  return u.toString();
}
const existe = (caminho) => access(caminho).then(() => true, () => false);

/** Domínio público, CC0, CC BY e CC BY-SA (qualquer versão) dispensam revisão. */
export function licencaLivre(licenca) {
  const l = (licenca ?? '').trim().toLowerCase();
  return /^(public domain|pd\b|pd-|cc0|cc[ -]?zero)/.test(l) || /^cc[ -]by(-sa)?([ -]\d|$)/.test(l);
}

/** Extensão do arquivo a partir da URL (a miniatura de um SVG, por exemplo, é PNG). */
export function extensaoDe(url) {
  const ext = extname(new URL(url).pathname).toLowerCase();
  return ext === '.jpeg' ? '.jpg' : ext || '.jpg';
}

export const tituloDe = (s) => decodeURIComponent(s.wikipedia.split('/wiki/')[1]).replaceAll('_', ' ');

/**
 * Executa a busca. `fetch`, `pausa` e `log` podem ser trocados nos testes.
 * Devolve um resumo com as contagens.
 */
export async function buscarImagens(opcoes = {}) {
  const o = {
    ...PADRAO,
    so: null,
    fetch: globalThis.fetch,
    pausa: (ms) => new Promise((r) => setTimeout(r, ms)),
    pausaMs: 1000,
    tentativas: 5,
    log: console,
    ...opcoes,
  };
  const falhas = [];

  /**
   * GET com `User-Agent` identificado, tempo limite e nova tentativa, com espera crescente
   * (no máximo 60s), em erro de rede, 429 e 5xx.
   */
  async function obter(url) {
    for (let tentativa = 1; ; tentativa++) {
      let res = null;
      let erro = null;
      try {
        res = await o.fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) });
      } catch (e) {
        erro = e;
      }
      const repetir = erro || res.status === 429 || res.status >= 500;
      if (!repetir || tentativa >= o.tentativas) {
        if (erro) throw erro;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
      }
      const pedida = Number(res?.headers?.get?.('retry-after')) * 1000;
      const espera = Math.min(pedida || 2000 * 2 ** (tentativa - 1), 60_000);
      o.log.error(`buscar-imagens: ${erro?.message ?? `HTTP ${res.status}`}; nova tentativa em ${espera / 1000}s.`);
      await o.pausa(espera);
    }
  }

  async function api(base, params) {
    const url = `${base}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`;
    try {
      return await (await obter(url)).json();
    } catch (e) {
      throw new Error(`${e.message} em ${base} (${params.titles?.split('|').length ?? 0} títulos)`);
    }
  }

  const santos = JSON.parse(await readFile(o.arquivo, 'utf8'));
  const aprovadas = new Set((await existe(o.aprovadas)) ? JSON.parse(await readFile(o.aprovadas, 'utf8')) : []);
  const so = o.so ? new Set(o.so) : null;
  const alvo = santos.filter((s) => s.wikipedia && (!so || so.has(s.data)));

  // 1) Wikipédia: item do Wikidata e imagem principal de cada página.
  const porTitulo = new Map();
  const titulosComFalha = new Set();
  for (const lote of lotes([...new Set(alvo.map(tituloDe))], TAMANHO_LOTE)) {
    try {
      const { query = {} } = await api('https://en.wikipedia.org/w/api.php', {
        action: 'query', redirects: '1', prop: 'pageprops|pageimages', ppprop: 'wikibase_item', piprop: 'name',
        pilimit: String(TAMANHO_LOTE), titles: lote.join('|'),
      });
      const destino = new Map();
      for (const m of [...(query.normalized ?? []), ...(query.redirects ?? [])]) destino.set(m.from, m.to);
      const paginas = new Map((query.pages ?? []).map((p) => [p.title, p]));
      for (const t of lote) {
        let fim = t;
        for (let i = 0; i < 5 && destino.has(fim); i++) fim = destino.get(fim);
        const p = paginas.get(fim);
        porTitulo.set(t, p && !p.missing ? { wikidata: p.pageprops?.wikibase_item ?? null, arquivo: p.pageimage ?? null } : null);
      }
    } catch (e) {
      falhas.push(`Wikipédia (${lote.length} páginas): ${e.message}`);
      o.log.error(`buscar-imagens: falha num lote da Wikipédia; seguindo. ${e.message}`);
      lote.forEach((t) => titulosComFalha.add(t));
    }
    await o.pausa(o.pausaMs);
  }

  // 2) Commons: URL, licença e autor de cada arquivo.
  const info = new Map();
  const arquivos = [...new Set([...porTitulo.values()].map((v) => v?.arquivo).filter(Boolean))];
  const arquivosComFalha = new Set();
  for (const lote of lotes(arquivos, TAMANHO_LOTE)) {
    try {
      const { query = {} } = await api('https://commons.wikimedia.org/w/api.php', {
        action: 'query', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: String(LARGURA),
        titles: lote.map((a) => `File:${a}`).join('|'),
      });
      const nome = new Map();
      for (const m of query.normalized ?? []) nome.set(m.to, m.from);
      for (const p of query.pages ?? []) {
        const ii = p.imageinfo?.[0];
        if (!ii) continue; // não está no Commons: imagem de uso restrito
        const original = (nome.get(p.title) ?? p.title).replace(/^File:/, '');
        info.set(original, {
          arquivo: p.title.replace(/^File:/, ''),
          url: semRastreio(ii.thumburl ?? ii.url),
          pagina_commons: ii.descriptionurl,
          licenca: semHtml(ii.extmetadata?.LicenseShortName?.value),
          autor: semHtml(ii.extmetadata?.Artist?.value),
        });
      }
    } catch (e) {
      falhas.push(`Commons (${lote.length} arquivos): ${e.message}`);
      o.log.error(`buscar-imagens: falha num lote do Commons; seguindo. ${e.message}`);
      lote.forEach((a) => arquivosComFalha.add(a));
    }
    await o.pausa(o.pausaMs);
  }

  // 3) Atualiza os registros e baixa as imagens aceitas.
  await mkdir(o.imagens, { recursive: true });
  const revisar = [];
  let baixadas = 0;
  for (const s of alvo) {
    const titulo = tituloDe(s);
    if (titulosComFalha.has(titulo)) continue; // mantém o registro como estava
    const achado = porTitulo.get(titulo);
    if (achado) s.wikidata = achado.wikidata;
    if (achado?.arquivo && arquivosComFalha.has(achado.arquivo)) continue;

    const dados = achado?.arquivo ? info.get(achado.arquivo) : null;
    if (!dados) {
      s.imagem = null;
      continue;
    }
    if (!licencaLivre(dados.licenca) && !aprovadas.has(s.data)) {
      revisar.push({ data: s.data, nome: s.nome, ...dados });
      s.imagem = null;
      continue;
    }

    const destino = join(o.imagens, `${s.data}${extensaoDe(dados.url)}`);
    if (!(await existe(destino))) {
      try {
        const res = await obter(dados.url);
        await writeFile(destino, Buffer.from(await res.arrayBuffer()));
        baixadas++;
        if (baixadas % 25 === 0) o.log.log(`buscar-imagens: ${baixadas} imagens baixadas…`);
        await o.pausa(o.pausaMs);
      } catch (e) {
        falhas.push(`Download de ${s.data} (${dados.arquivo}): ${e.message}`);
        o.log.error(`buscar-imagens: não consegui baixar ${s.data}; seguindo. ${e.message}`);
        s.imagem = null;
        continue;
      }
    }
    const local = '/' + relative(o.publico, destino).split('\\').join('/');
    s.imagem = {
      arquivo: dados.arquivo,
      url: dados.url,
      local,
      pagina_commons: dados.pagina_commons,
      licenca: dados.licenca,
      autor: dados.autor,
    };
  }

  await writeFile(o.arquivo, JSON.stringify(santos, null, 1) + '\n', 'utf8');
  await mkdir(dirname(o.relatorio), { recursive: true });
  await writeFile(o.relatorio, relatorio(santos, revisar, falhas), 'utf8');

  const resumo = {
    comPagina: alvo.length,
    paginasEncontradas: [...porTitulo.values()].filter(Boolean).length,
    comImagem: santos.filter((s) => s.imagem).length,
    baixadas,
    revisar: revisar.length,
    falhas: falhas.length,
  };
  o.log.log(
    `buscar-imagens: ${resumo.comPagina} registros com página; ${resumo.paginasEncontradas} páginas encontradas; ` +
      `${resumo.comImagem} com imagem (${resumo.baixadas} baixadas agora); ${resumo.revisar} para revisão; ${resumo.falhas} falhas.`,
  );
  return resumo;
}

const celula = (v) => String(v ?? '—').replaceAll('|', '\\|');

export function relatorio(santos, revisar, falhas) {
  const com = santos.filter((s) => s.imagem);
  const linhas = [
    '# Relatório de imagens',
    '',
    'Gerado por `scripts/buscar-imagens.mjs` (`npm run imagens`).',
    '',
    `- **Registros:** ${santos.length}`,
    `- **Com imagem:** ${com.length}`,
    `- **Para revisão de licença:** ${revisar.length}`,
    `- **Falhas nesta execução:** ${falhas.length}`,
    '',
    '## Imagens',
    '',
    '| Data | Nome | Licença | Autor |',
    '|---|---|---|---|',
    ...com.map((s) => `| ${s.data} | ${celula(s.nome)} | ${celula(s.imagem.licenca)} | ${celula(s.imagem.autor)} |`),
    '',
    '## Para revisão manual de licença',
    '',
    'Licença fora de domínio público, CC0, CC BY e CC BY-SA. Ficam com `imagem: null` até serem aprovadas:',
    'para aprovar, acrescente a data em `dados/imagens-aprovadas.json` e rode `npm run imagens` de novo.',
    '',
  ];
  if (revisar.length) {
    linhas.push('| Data | Nome | Licença | Autor | Arquivo |', '|---|---|---|---|---|');
    for (const r of revisar) {
      linhas.push(`| ${r.data} | ${celula(r.nome)} | ${celula(r.licenca)} | ${celula(r.autor)} | [${celula(r.arquivo)}](${r.pagina_commons}) |`);
    }
  } else {
    linhas.push('Nenhuma.');
  }
  if (falhas.length) linhas.push('', '## Falhas', '', ...falhas.map((f) => `- ${f}`));
  return linhas.join('\n') + '\n';
}

function lerArgumentos(argv) {
  const opcoes = {};
  for (const arg of argv) {
    const m = /^--(\w+)=(.*)$/.exec(arg);
    if (!m) opcoes.arquivo = arg;
    else if (m[1] === 'so') opcoes.so = m[2].split(',').map((d) => d.trim());
    else if (['imagens', 'relatorio', 'aprovadas'].includes(m[1])) opcoes[m[1]] = m[2];
    else throw new Error(`opção desconhecida: --${m[1]}`);
  }
  return opcoes;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await buscarImagens(lerArgumentos(process.argv.slice(2)));
  } catch (e) {
    console.error(`buscar-imagens: ${e.message}`);
    process.exit(1);
  }
}
