# Santo do Dia

Site que mostra o santo do dia da Igreja Católica Apostólica Romana, segundo o calendário do Brasil. Cada dia do ano é uma página HTML gerada no build (Angular 22 com pré-renderização), servida por qualquer hospedagem de arquivos estáticos.

Requisitos e histórias: [`docs/PRD.md`](docs/PRD.md).

## Requisitos

- Node.js 24 (versão em `.nvmrc`; com nvm: `nvm use`)
- npm

## Comandos

```bash
npm install      # instala as dependências
npm start        # servidor de desenvolvimento em http://localhost:4200
npm run build    # build de produção estático em dist/santo-do-dia/browser
npm test         # testes unitários (Vitest) e dos scripts (node --test)
npm run lint     # ESLint
npm run e2e      # testes de navegador (Playwright) contra o build; rode o build antes
npm run servir   # serve o build em http://localhost:4300, como uma hospedagem estática
npm run verificar  # build, testes, lint e e2e em sequência
```

Na primeira vez, instale o navegador dos testes: `npx playwright install chromium`.

Os dados de cada dia (`public/data/dias/`) e o índice (`src/app/dados/indice.gerado.ts`) são gerados a partir de `dados/santos.json` por `npm run dados`, que roda sozinho antes de `start`, `build` e `test`.

O build não gera servidor: a pasta `dist/santo-do-dia/browser` contém apenas arquivos estáticos (HTML, CSS, JS, fontes e dados).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `dados/` | Fonte dos dados (`santos.json`, 366 registros) |
| `docs/` | PRD, uma pasta por história e mockups |
| `scripts/` | Scripts Node de apoio ao build e ao conteúdo |
| `public/` | Arquivos estáticos copiados para o build |
| `src/app/` | Aplicação Angular |
