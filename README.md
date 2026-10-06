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
npm test         # testes unitários (Vitest)
npm run lint     # ESLint
```

O build não gera servidor: a pasta `dist/santo-do-dia/browser` contém apenas arquivos estáticos (HTML, CSS, JS, fontes e dados).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `dados/` | Fonte dos dados (`santos.json`, 366 registros) |
| `docs/` | PRD, uma pasta por história e mockups |
| `scripts/` | Scripts Node de apoio ao build e ao conteúdo |
| `public/` | Arquivos estáticos copiados para o build |
| `src/app/` | Aplicação Angular |
