# US-02 — Dados por dia

- **Épico:** A — Fundação
- **Ordem de execução:** 2 de 18
- **Depende de:** [US-01](../us-01-estrutura-do-projeto/README.md)
- **Seções do PRD:** 3, 4 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como desenvolvedor, quero os dados divididos por dia e um serviço que os entregue, para que cada página carregue só o que precisa.

## Critérios de aceite

- [x] Interface TypeScript `Santo` cobre todos os campos da seção 4.
- [x] Script `scripts/gerar-dados.mjs` lê `dados/santos.json` e gera `public/data/dias/MM-DD.json` (366 arquivos) e o índice com `data` e `nome`; ele roda antes do build e falha se não houver exatamente 366 registros.
- [x] O serviço expõe a ficha de um `MM-DD` via `HttpClient` e o índice de forma síncrona.
- [x] Na página pré-renderizada, a ficha vem embutida no HTML e o navegador não refaz a requisição na primeira carga.
- [x] Na troca de dia no navegador, se a requisição falhar, aparece mensagem com botão "Tentar de novo".
- [x] Testes: o script gera 366 arquivos; o serviço retorna o registro certo para `10-06` e `02-29`.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-02 conforme `docs/us-02-dados-por-dia/README.md` e `docs/PRD.md`, com os testes.
