// Preenche "wikidata" e "imagem" em santos.json a partir da Wikipédia e do Wikimedia Commons.
// Uso: node buscar-imagens.mjs   (Node 18+; lê e regrava santos.json na mesma pasta)
// Só aceita imagens hospedadas no Commons (as de uso restrito ficam de fora) e guarda licença e autor.
import { readFile, writeFile } from 'node:fs/promises';

const ARQUIVO = new URL('./santos.json', import.meta.url);
const UA = 'SantoDoDia/0.1 (script de carga de imagens)';
const LARGURA = 600;

const lotes = (xs, n) => Array.from({ length: Math.ceil(xs.length / n) }, (_, i) => xs.slice(i * n, i * n + n));
const semHtml = (s) => (s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() || null;
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(base, params) {
  const url = `${base}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} em ${url}`);
  return res.json();
}

const santos = JSON.parse(await readFile(ARQUIVO, 'utf8'));
const tituloDe = (s) => decodeURIComponent(s.wikipedia.split('/wiki/')[1]).replaceAll('_', ' ');
const comPagina = santos.filter((s) => s.wikipedia);

// 1) Wikipédia: item do Wikidata e imagem principal de cada página.
const porTitulo = new Map();
for (const lote of lotes([...new Set(comPagina.map(tituloDe))], 50)) {
  const { query } = await api('https://en.wikipedia.org/w/api.php', {
    action: 'query', redirects: '1', prop: 'pageprops|pageimages', ppprop: 'wikibase_item', piprop: 'name',
    pilimit: '50', titles: lote.join('|'),
  });
  const destino = new Map();
  for (const m of [...(query.normalized ?? []), ...(query.redirects ?? [])]) destino.set(m.from, m.to);
  const paginas = new Map((query.pages ?? []).map((p) => [p.title, p]));
  for (const t of lote) {
    let fim = t;
    for (let i = 0; i < 5 && destino.has(fim); i++) fim = destino.get(fim);
    const p = paginas.get(fim);
    if (p && !p.missing) porTitulo.set(t, { wikidata: p.pageprops?.wikibase_item ?? null, arquivo: p.pageimage ?? null });
  }
  await pausa(300);
}

// 2) Commons: URL, licença e autor de cada arquivo.
const info = new Map();
const arquivos = [...new Set([...porTitulo.values()].map((v) => v.arquivo).filter(Boolean))];
for (const lote of lotes(arquivos, 50)) {
  const { query } = await api('https://commons.wikimedia.org/w/api.php', {
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
      url: ii.thumburl ?? ii.url,
      pagina_commons: ii.descriptionurl,
      licenca: semHtml(ii.extmetadata?.LicenseShortName?.value),
      autor: semHtml(ii.extmetadata?.Artist?.value),
    });
  }
  await pausa(300);
}

let comImagem = 0;
for (const s of comPagina) {
  const achado = porTitulo.get(tituloDe(s));
  if (!achado) continue;
  s.wikidata = achado.wikidata;
  s.imagem = (achado.arquivo && info.get(achado.arquivo)) || null;
  if (s.imagem) comImagem++;
}
await writeFile(ARQUIVO, JSON.stringify(santos, null, 1) + '\n', 'utf8');
console.log(`${comPagina.length} registros com página; ${porTitulo.size} páginas encontradas; ${comImagem} com imagem do Commons.`);
