# US-01 — Notas

## Decisões

- **Angular 22.2** gerado com `ng new --ssr --zoneless --style=css --routing`. Aplicação zoneless (padrão recomendado para signals); componentes standalone e nomes de arquivo no estilo 2025 (`app.ts`, `app.html`).
- **Saída estática:** `"outputMode": "static"` no `angular.json`; removidos `src/server.ts`, a entrada `ssr` e as dependências `express`/`@types/express`. O build gera só `dist/santo-do-dia/browser`, sem pasta `server`.
- **Hidratação:** `provideClientHydration()` em `app.config.ts`.
- **Fontes:** Spectral 600 e Figtree 400–700 via pacotes `@fontsource`, incluídos no `angular.json`. Escolhido no lugar do Google Fonts para não fazer requisições a terceiros (PRD 6, privacidade) e para funcionar em qualquer hospedagem estática. Cada arquivo CSS declara os subconjuntos com `unicode-range`, então o navegador só baixa o que usa.
- **Tokens:** variáveis CSS da seção 7 em `src/styles.css`, mais tokens auxiliares de fonte e raio, e um estilo de foco visível global.
- **Testes:** Vitest (padrão do Angular 22) com jsdom. `npm test` roda uma vez (`--watch=false`).
- **Lint:** `angular-eslint` com as regras recomendadas e as de acessibilidade de template.
- **Node:** 24 LTS, registrado em `.nvmrc`.
- **Mockup:** como o link do mockup é privado, copiei o código-fonte dos três quadros para `docs/mockups/` (`celular.dc.html`, `celular-calendario.dc.html`, `web.dc.html`) como referência de medidas e cores. As imagens PNG pedidas em `docs/mockups/README.md` continuam pendentes.
- `.gitignore` ignora os arquivos `*:Zone.Identifier` criados pelo Windows ao copiar para o WSL.

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- Exportar os quadros do mockup como PNG para `docs/mockups/` (opcional, o código-fonte já está lá).
