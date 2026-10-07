import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { problemasDaPagina, textoDe, verificarBuild } from './verificar-build.mjs';

const santo = { data: '10-06', nome: 'São Bruno', descricao: 'Fundou a "Ordem" dos Cartuxos & mais.' };
const pagina = (corpo) =>
  `<html><body><h1>São Bruno</h1><p>Fundou a "Ordem" dos Cartuxos &amp; mais.</p>${corpo}` +
  `<script id="ng-state">{"x":"Terça-feira"}</script></body></html>`;

describe('verificar-build', () => {
  it('aceita uma página correta (scripts são ignorados)', () => {
    assert.deepEqual(problemasDaPagina(pagina('<a class="botao-hoje">Hoje</a><span class="semana"></span>'), santo), []);
  });

  it('acusa nome ou descrição ausentes', () => {
    const html = '<html><body><h1>Outro</h1></body></html>';
    assert.deepEqual(problemasDaPagina(html, santo), ['não contém o nome', 'não contém a descrição']);
  });

  it('acusa dia da semana por extenso ou abreviado', () => {
    assert.match(problemasDaPagina(pagina('<p class="data">Terça-feira, 6 de outubro</p>'), santo)[0], /dia da semana/);
    assert.match(problemasDaPagina(pagina('<span class="semana">Ter</span>'), santo)[0], /abreviado/);
  });

  it('não confunde o conteúdo do dia com dia da semana', () => {
    const domingos = { ...santo, nome: 'São Domingos', obs: 'Transferida para o domingo.' };
    const html = `<h1>São Domingos</h1><p>${santo.descricao.replace('&', '&amp;')}</p><p>Transferida para o domingo.</p>`;
    assert.deepEqual(problemasDaPagina(html, domingos), []);
  });

  it('acusa marcação de "hoje" no calendário', () => {
    assert.match(problemasDaPagina(pagina('<a class="dia hoje">6</a>'), santo)[0], /hoje/);
  });

  it('decodifica entidades no texto', () => {
    assert.equal(textoDe('<p>A &amp; B &quot;C&quot; &#39;D&#39;</p>'), 'A & B "C" \'D\'');
  });

  describe('na pasta do build', () => {
    let pasta;
    before(async () => {
      pasta = await mkdtemp(join(tmpdir(), 'verificar-build-'));
      await writeFile(join(pasta, 'santos.json'), JSON.stringify([santo, { ...santo, data: '10-07' }]));
      await mkdir(join(pasta, 'dia/10-06'), { recursive: true });
      await writeFile(join(pasta, 'dia/10-06/index.html'), pagina(''));
      await writeFile(join(pasta, 'index.html'), '');
    });
    after(() => rm(pasta, { recursive: true, force: true }));

    it('acusa páginas que faltam', async () => {
      const { problemas } = await verificarBuild({ saida: pasta, fonte: join(pasta, 'santos.json') });
      assert.deepEqual(problemas, ['404.html: não existe', 'dia/10-07/index.html: não existe']);
    });
  });
});
