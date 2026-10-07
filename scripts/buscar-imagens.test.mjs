import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, beforeEach, describe, it } from 'node:test';
import { buscarImagens, extensaoDe, licencaLivre, semRastreio } from './buscar-imagens.mjs';

const registro = (data, nome, wikipedia) => ({
  data, nome, grau: null, fonte: 'martirologio', tipo: 'pessoa', descricao: 'x',
  nascimento: null, ano_nascimento: null, falecimento: null, ano_falecimento: null,
  local_nascimento: null, pais_atual: null, wikipedia, conferido: null, imagem: null,
});

const resposta = (corpo, status = 200) => ({
  ok: status < 400,
  status,
  json: async () => corpo,
  arrayBuffer: async () => new TextEncoder().encode('imagem').buffer,
});

/** Simula Wikipédia, Commons e download, no formato real da API (formatversion=2). */
function fetchSimulado({ falharWikipedia = false, limitarUmaVez = false } = {}) {
  const chamadas = [];
  let limitou = false;
  const fn = async (url, init) => {
    chamadas.push({ url, ua: init?.headers?.['User-Agent'] });
    const u = new URL(url);
    if (limitarUmaVez && !limitou) {
      limitou = true;
      return { ...resposta(null, 429), headers: new Map([['retry-after', '1']]) };
    }
    if (u.host === 'en.wikipedia.org') {
      if (falharWikipedia) throw new Error('rede caiu');
      return resposta({
        query: {
          normalized: [{ from: 'Bruno_of_Cologne', to: 'Bruno of Cologne' }],
          redirects: [{ from: 'Irmã Dulce', to: 'Dulce Pontes (nun)' }],
          pages: [
            { title: 'Bruno of Cologne', pageprops: { wikibase_item: 'Q312314' }, pageimage: 'Bruno.jpg' },
            { title: 'Dulce Pontes (nun)', pageprops: { wikibase_item: 'Q461850' }, pageimage: 'Dulce.jpg' },
            { title: 'Sem imagem', pageprops: { wikibase_item: 'Q1' } },
            { title: 'Restrita', pageprops: { wikibase_item: 'Q2' }, pageimage: 'Restrita.jpg' },
            { title: 'Inexistente', missing: true },
          ],
        },
      });
    }
    if (u.host === 'commons.wikimedia.org') {
      const meta = (licenca, autor) => ({ LicenseShortName: { value: licenca }, Artist: { value: autor } });
      return resposta({
        query: {
          pages: [
            {
              title: 'File:Bruno.jpg',
              imageinfo: [{
                thumburl: 'https://thumb.wikimedia.org/x/500px-Bruno.jpg?utm_source=commons.wikimedia.org',
                url: 'https://upload.wikimedia.org/x/Bruno.jpg',
                descriptionurl: 'https://commons.wikimedia.org/wiki/File:Bruno.jpg',
                extmetadata: meta('Public domain', '<a href="#">Nicolas Mignard</a>'),
              }],
            },
            {
              title: 'File:Dulce.jpg',
              imageinfo: [{
                url: 'https://upload.wikimedia.org/x/Dulce.png',
                descriptionurl: 'https://commons.wikimedia.org/wiki/File:Dulce.jpg',
                extmetadata: meta('GFDL', 'Fulano'),
              }],
            },
            { title: 'File:Restrita.jpg', missing: true },
          ],
        },
      });
    }
    return resposta(null);
  };
  fn.chamadas = chamadas;
  return fn;
}

describe('buscar-imagens', () => {
  let pasta;
  let opcoes;

  beforeEach(async () => {
    pasta = await mkdtemp(join(tmpdir(), 'buscar-imagens-'));
    const santos = [
      registro('10-06', 'São Bruno', 'https://en.wikipedia.org/wiki/Bruno_of_Cologne'),
      registro('08-13', 'Santa Dulce', 'https://en.wikipedia.org/wiki/Irm%C3%A3_Dulce'),
      registro('01-01', 'Sem imagem', 'https://en.wikipedia.org/wiki/Sem_imagem'),
      registro('01-02', 'Restrita', 'https://en.wikipedia.org/wiki/Restrita'),
      registro('01-03', 'Inexistente', 'https://en.wikipedia.org/wiki/Inexistente'),
      registro('12-25', 'Natal', null),
    ];
    await writeFile(join(pasta, 'santos.json'), JSON.stringify(santos, null, 1));
    opcoes = {
      arquivo: join(pasta, 'santos.json'),
      imagens: join(pasta, 'public/img/santos'),
      publico: join(pasta, 'public'),
      relatorio: join(pasta, 'relatorio.md'),
      aprovadas: join(pasta, 'aprovadas.json'),
      pausa: async () => {},
      log: { log() {}, error() {} },
    };
  });

  after(() => rm(pasta, { recursive: true, force: true }));

  const ler = async () => JSON.parse(await readFile(opcoes.arquivo, 'utf8'));

  it('grava wikidata e imagem, baixa a imagem e preenche o caminho local', async () => {
    const fetch = fetchSimulado();
    await buscarImagens({ ...opcoes, fetch });
    const santos = await ler();
    const bruno = santos.find((s) => s.data === '10-06');
    assert.equal(bruno.wikidata, 'Q312314');
    assert.deepEqual(bruno.imagem, {
      arquivo: 'Bruno.jpg',
      url: 'https://thumb.wikimedia.org/x/500px-Bruno.jpg',
      local: '/img/santos/10-06.jpg',
      pagina_commons: 'https://commons.wikimedia.org/wiki/File:Bruno.jpg',
      licenca: 'Public domain',
      autor: 'Nicolas Mignard',
    });
    assert.deepEqual(await readdir(opcoes.imagens), ['10-06.jpg']);
    assert.equal(santos.length, 6);
    assert.ok(fetch.chamadas.every((c) => c.ua?.startsWith('SantoDoDia/')));
  });

  it('deixa imagem nula sem página, sem imagem ou fora do Commons', async () => {
    await buscarImagens({ ...opcoes, fetch: fetchSimulado() });
    const santos = await ler();
    for (const data of ['01-01', '01-02', '01-03', '12-25']) {
      assert.equal(santos.find((s) => s.data === data).imagem, null, data);
    }
    assert.equal(santos.find((s) => s.data === '01-02').wikidata, 'Q2');
  });

  it('separa licenças fora da lista para revisão, até serem aprovadas', async () => {
    await buscarImagens({ ...opcoes, fetch: fetchSimulado() });
    assert.equal((await ler()).find((s) => s.data === '08-13').imagem, null);
    const rel = await readFile(opcoes.relatorio, 'utf8');
    assert.match(rel, /\*\*Com imagem:\*\* 1/);
    assert.match(rel, /## Para revisão manual de licença[\s\S]*\| 08-13 \| Santa Dulce \| GFDL \|/);

    await writeFile(opcoes.aprovadas, JSON.stringify(['08-13']));
    await buscarImagens({ ...opcoes, fetch: fetchSimulado() });
    assert.equal((await ler()).find((s) => s.data === '08-13').imagem.local, '/img/santos/08-13.png');
  });

  it('não baixa de novo o que já existe', async () => {
    await buscarImagens({ ...opcoes, fetch: fetchSimulado() });
    const fetch = fetchSimulado();
    await buscarImagens({ ...opcoes, fetch });
    assert.equal(fetch.chamadas.filter((c) => c.url.includes('500px-Bruno')).length, 0);
  });

  it('registra falha de rede num lote e continua', async () => {
    const erros = [];
    const resumo = await buscarImagens({ ...opcoes, fetch: fetchSimulado({ falharWikipedia: true }), log: { log() {}, error: (m) => erros.push(m) } });
    assert.equal(resumo.falhas, 1);
    assert.equal(erros.filter((m) => m.includes('falha num lote')).length, 1);
    assert.match(await readFile(opcoes.relatorio, 'utf8'), /## Falhas[\s\S]*rede caiu/);
    assert.equal((await ler()).length, 6);
  });

  it('tenta de novo quando a API limita a taxa (429)', async () => {
    const esperas = [];
    const fetch = fetchSimulado({ limitarUmaVez: true });
    const resumo = await buscarImagens({ ...opcoes, fetch, pausa: async (ms) => esperas.push(ms) });
    assert.equal(resumo.falhas, 0);
    assert.ok(esperas.includes(1000));
    assert.equal((await ler()).find((s) => s.data === '10-06').wikidata, 'Q312314');
  });

  it('processa só as datas pedidas com --so', async () => {
    await buscarImagens({ ...opcoes, so: ['10-06'], fetch: fetchSimulado() });
    const santos = await ler();
    assert.equal(santos.find((s) => s.data === '01-02').wikidata, undefined);
  });
});

describe('funções auxiliares', () => {
  it('classifica licenças livres', () => {
    for (const l of ['Public domain', 'PD-US', 'CC0', 'CC BY 2.0', 'CC BY-SA 4.0', 'CC BY-SA 3.0 de']) assert.ok(licencaLivre(l), l);
    for (const l of ['GFDL', 'CC BY-NC 2.0', 'Copyrighted free use', null]) assert.ok(!licencaLivre(l), String(l));
  });

  it('extrai a extensão e limpa a URL', () => {
    assert.equal(extensaoDe('https://x/500px-A.svg.png?a=1'), '.png');
    assert.equal(extensaoDe('https://x/A.JPEG'), '.jpg');
    assert.equal(semRastreio('https://x/a.jpg?utm_source=c&utm_campaign=d'), 'https://x/a.jpg');
  });
});
