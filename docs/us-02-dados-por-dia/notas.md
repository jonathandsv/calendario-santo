# US-02 — Notas

## Decisões

- **Modelo:** `src/app/dados/santo.ts` com `Santo`, `ImagemSanto`, `ItemIndice` e os tipos `Grau`, `Fonte`, `Tipo` e `DataMesDia`. `obs`, `dados_referentes_a` e `wikidata` são opcionais, como no JSON.
- **Script `scripts/gerar-dados.mjs`:** valida a fonte (exatamente 366 registros, datas `MM-DD` válidas e sem repetição, nome presente) e falha com código 1 se algo estiver errado. Gera `public/data/dias/MM-DD.json` (limpa a pasta antes) e o índice em `src/app/dados/indice.gerado.ts`.
- **Índice como módulo TypeScript** (`INDICE: readonly ItemIndice[]`), e não JSON, para ter tipagem sem `resolveJsonModule`. Ele entra no bundle (cerca de 20 kB sem compressão).
- **Arquivos gerados não são versionados** (`.gitignore`). Os scripts `prestart`, `prebuild` e `pretest` rodam `npm run dados`, então qualquer comando do fluxo normal os recria.
- **Serviço `DadosService`:** `ficha(data)` faz `GET /data/dias/MM-DD.json` com `HttpClient` (URL absoluta para a chave do cache de transferência ser igual no build e no navegador); `indice`, `nome(data)` e `existe(data)` são síncronos.
- **`provideHttpClient(withFetch())`** no `app.config.ts`; o cache de transferência de HTTP já vem ligado por `provideClientHydration()`.
- **Carga pela rota:** `fichaResolver` carrega a ficha antes de ativar a rota e devolve `null` em caso de falha. Assim a página hidrata já com a ficha (sem estado "carregando" que divergiria do HTML pré-renderizado) e a falha vira um estado da tela, não um erro de navegação.
- **Erro:** componente `ErroCarga` com a mensagem e o botão "Tentar de novo" (emite `tentarDeNovo`; aceita `carregando`).
- **Testes dos scripts** com o executor nativo do Node (`node --test`), já que o Vitest do Angular roda em ambiente de navegador. `npm test` roda os dois.

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- Nenhuma. Os critérios "ficha embutida no HTML sem nova requisição" e "mensagem com 'Tentar de novo' na troca de dia" dependiam da rota `dia/:data` e foram ligados e verificados na US-04 (testes em `e2e/rotas.spec.ts`).
