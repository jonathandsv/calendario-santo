import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, it } from 'node:test';
import { CAMINHOS_PADRAO, gerarDados, validar } from './gerar-dados.mjs';

describe('gerar-dados', () => {
  let pasta;
  let caminhos;

  before(async () => {
    pasta = await mkdtemp(join(tmpdir(), 'gerar-dados-'));
    caminhos = { fonte: CAMINHOS_PADRAO.fonte, dias: join(pasta, 'dias'), indice: join(pasta, 'indice.gerado.ts') };
  });

  after(() => rm(pasta, { recursive: true, force: true }));

  it('gera 366 arquivos, um por dia, incluindo 02-29', async () => {
    const { dias } = await gerarDados(caminhos);
    const arquivos = await readdir(caminhos.dias);
    assert.equal(dias, 366);
    assert.equal(arquivos.length, 366);
    assert.ok(arquivos.includes('02-29.json'));
    const bruno = JSON.parse(await readFile(join(caminhos.dias, '10-06.json'), 'utf8'));
    assert.equal(bruno.nome, 'São Bruno');
    assert.equal(bruno.local_nascimento, 'Colônia');
  });

  it('gera o índice com data e nome dos 366 dias', async () => {
    const ts = await readFile(caminhos.indice, 'utf8');
    const json = ts.slice(ts.indexOf('= ') + 2, ts.lastIndexOf(';'));
    const indice = JSON.parse(json);
    assert.equal(indice.length, 366);
    assert.deepEqual(Object.keys(indice[0]), ['data', 'nome']);
    assert.deepEqual(indice.find((i) => i.data === '10-06'), { data: '10-06', nome: 'São Bruno' });
  });

  it('falha se não houver exatamente 366 registros', async () => {
    const fonte = join(pasta, 'curto.json');
    await writeFile(fonte, JSON.stringify([{ data: '01-01', nome: 'X' }]));
    await assert.rejects(gerarDados({ ...caminhos, fonte }), /366 registros/);
  });

  it('valida datas inválidas e repetidas', () => {
    const base = Array.from({ length: 366 }, (_, i) => ({ data: '01-01', nome: `n${i}` }));
    assert.match(validar(base), /repetida/);
    base[0] = { data: '13-40', nome: 'x' };
    assert.match(validar(base), /inválida/);
  });
});
