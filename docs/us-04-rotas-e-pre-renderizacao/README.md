# US-04 — Rotas e pré-renderização

- **Épico:** A — Fundação
- **Ordem de execução:** 4 de 18
- **Depende de:** [US-02](../us-02-dados-por-dia/README.md), [US-03](../us-03-utilitarios-de-data/README.md)
- **Seções do PRD:** 3, 3.1, 5.1 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como visitante, quero que cada dia tenha um endereço próprio e já pronto, para abrir rápido e compartilhar.

## Critérios de aceite

- [ ] `app.routes.server.ts` declara `dia/:data` com `RenderMode.Prerender`, `getPrerenderParams` devolvendo as 366 chaves do índice e `PrerenderFallback.None`.
- [ ] O build gera `dia/MM-DD/index.html` para os 366 dias, incluindo `02-29`.
- [ ] `/` é pré-renderizada e, no navegador, navega para o dia de hoje com `replaceUrl`.
- [ ] Existe uma página 404 estática com link para o dia de hoje.
- [ ] Trocar de dia no navegador atualiza o endereço sem recarregar, e os botões voltar e avançar funcionam.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-04 conforme `docs/us-04-rotas-e-pre-renderizacao/README.md` e `docs/PRD.md`, com os testes.
