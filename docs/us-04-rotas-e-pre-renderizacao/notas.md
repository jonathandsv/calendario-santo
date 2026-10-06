# US-04 — Notas

## Decisões

- **Rotas (`app.routes.ts`):** `''` (Início), `dia/:data` (Dia, com `fichaResolver`), `404` e `**` (Não encontrada). Componentes carregados sob demanda.
- **`diaValidoGuard` (`canMatch`):** `dia/:data` só casa com datas que existem no índice. Assim, quando a hospedagem entrega `404.html` para `/dia/13-40`, o roteador no navegador também escolhe a página 404, e a hidratação bate com o HTML.
- **Rotas de servidor:** todas com `RenderMode.Prerender`; `dia/:data` usa `getPrerenderParams` com as 366 chaves do índice e `PrerenderFallback.None`. O build pré-renderiza 368 rotas (`/`, 366 dias e `/404`).
- **Página 404:** o Angular não gera `404.html` a partir de `**` no modo estático. Por isso a rota `/404` é pré-renderizada e `scripts/pos-build.mjs` (rodado em `postbuild`) a copia para `404.html`, o nome usado pelas hospedagens estáticas. O link "Ver o santo de hoje" aponta para `/`, que redireciona para hoje.
- **`/`:** página mínima pré-renderizada com link para `/dia/01-01`; no navegador, `afterNextRender` navega para hoje com `replaceUrl`.
- **Roteador:** `withComponentInputBinding()` (parâmetro `data` e ficha resolvida chegam como `input()`), `withInMemoryScrolling` com restauração de rolagem.
- **Página do dia (provisória):** mostra nome e descrição e links "Dia anterior"/"Dia seguinte", calculados com `diaAnterior`/`diaSeguinte` e o ano do `RelogioService` (`null` no build). A ficha completa vem na US-05 e a faixa na US-08, que substitui esses links.
- **Erro na troca de dia:** com a ficha `null`, a página mostra `ErroCarga`; "Tentar de novo" refaz a requisição e atualiza a ficha local (`linkedSignal`, que volta a seguir a rota na próxima navegação).
- **Servidor estático de teste (`scripts/servir.mjs`, `npm run servir`):** serve `dist/santo-do-dia/browser` como uma hospedagem estática (pasta → `index.html`, inexistente → `404.html` com status 404).
- **Testes de navegador:** Playwright (`npm run e2e`) contra o build servido pelo script acima, em dois perfis (celular e computador). `e2e/rotas.spec.ts` cobre: redirecionamento de `/` com `replaceUrl`, ficha no HTML sem nova requisição e sem avisos no console, troca de dia sem recarregar com voltar/avançar, `02-29`, 404 e "Tentar de novo". Requer `npm run build` antes.
- Teste unitário do `diaValidoGuard`.

## Desvios em relação ao PRD

- Existe também a rota `/404` (necessária para gerar o `404.html`).

## Pendências

- Nenhuma.
