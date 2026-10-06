# US-01 — Estrutura do projeto

- **Épico:** A — Fundação
- **Ordem de execução:** 1 de 18
- **Depende de:** nenhuma
- **Seções do PRD:** 3, 7 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como desenvolvedor, quero o projeto Angular configurado, para começar a construir as telas.

## Critérios de aceite

- [x] Projeto Angular 22 criado com componentes standalone, roteamento e CSS puro.
- [x] `@angular/ssr` adicionado (`ng add @angular/ssr`), com `"outputMode": "static"` e hidratação ativada.
- [x] Tokens da seção 7 declarados como variáveis CSS globais; fontes Spectral e Figtree carregadas.
- [x] O build de produção gera apenas arquivos estáticos, sem pasta de servidor.
- [x] As pastas `docs/`, `dados/` e `scripts/` já existentes são preservadas.
- [x] Comandos de build, teste e lint funcionam e estão descritos no README.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-01 conforme `docs/us-01-estrutura-do-projeto/README.md` e `docs/PRD.md`, com os testes.
