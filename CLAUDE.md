# CLAUDE.md

Guia para o Claude trabalhar neste repositório.

## O projeto

**Santo do Dia**: site estático que mostra o santo do dia da Igreja Católica, segundo o calendário do Brasil. Angular 22 com pré-renderização (SSG): o build gera um HTML por dia (`/dia/MM-DD`, 366 páginas) e o Angular hidrata no navegador. Não há backend nem servidor Node em produção.

- **Requisitos:** `docs/PRD.md` é a fonte da verdade. Em caso de dúvida, o PRD vence; se precisar mudar um comportamento, atualize o PRD e o `README.md` da história primeiro.
- **Histórias:** `docs/us-XX-*/README.md`, executadas na ordem da seção 9 do PRD.
- **Mockup:** `docs/mockups/*.dc.html` (cópia do código dos três quadros: celular, celular com calendário, web). Use como referência visual de medidas, cores e estrutura.
- **Dados:** `dados/santos.json` (366 registros). Não alterar o formato; só a US-18 regrava esse arquivo.

## Comandos

O Node é instalado via nvm (versão em `.nvmrc`). Num shell novo: `source ~/.nvm/nvm.sh && nvm use`.

| Comando | O que faz |
|---|---|
| `npm start` | Servidor de desenvolvimento em `http://localhost:4200` |
| `npm run build` | Build de produção estático em `dist/santo-do-dia/browser` |
| `npm test` | Testes unitários (Vitest) e dos scripts (`node --test`) |
| `npm run lint` | ESLint (TypeScript e templates, com regras de acessibilidade) |
| `npm run e2e` | Testes de navegador (Playwright) contra o build estático; exige `npm run build` antes |
| `npm run servir` | Serve o build em `http://localhost:4300` como uma hospedagem estática |
| `npm run verificar` | Build, testes, lint e e2e em sequência — rodar antes de cada commit |
| `npm run dados` | Gera `public/data/dias/` e `src/app/dados/indice.gerado.ts` (roda sozinho antes de start/build/test) |

## Fluxo de trabalho por história

1. Ler o `README.md` da história e as seções do PRD indicadas nele.
2. Implementar com testes.
3. Rodar `npm run verificar` (build, testes, lint e e2e) e conferir o código de saída; tudo precisa passar.
4. Marcar os critérios atendidos (`- [x]`) no `README.md` da história.
5. Escrever `notas.md` na pasta da história: decisões, desvios em relação ao PRD e pendências.
6. **Um commit por história**, com mensagem `US-XX: <título da história>` e um resumo no corpo.

## Regras de arquitetura

### Pré-renderização (PRD 3.1) — a regra mais importante

O HTML é gerado uma vez no build e servido igual para todos. **Nada que dependa da data ou do ano corrente pode ir para o HTML pré-renderizado.**

- No build: ficha do santo, título e metadados, números da faixa, links para dias vizinhos, cartões "Próximos dias".
- Só no navegador, depois da hidratação: dias da semana, data por extenso com dia da semana, grade do calendário, marcação de "hoje", existência de 29/02, redirecionamento de `/`.
- Como fazer: o ano corrente e o dia de hoje ficam em signals que começam `null` (no servidor e na primeira renderização do navegador) e são preenchidos em `afterNextRender`. **Nunca** usar `isPlatformBrowser` num `@if` do template. Partes que esperam o ano reservam o espaço final (sem deslocar o layout).
- Nenhuma função de data lê o relógio por conta própria, exceto a que calcula "hoje". As demais recebem o ano por parâmetro.

### Angular

- Componentes standalone, signals, `ChangeDetectionStrategy.OnPush`, aplicação zoneless.
- Controle de fluxo novo (`@if`, `@for`) e `input()`/`output()`/`computed()`.
- Navegação sempre com links reais (`<a routerLink>`), que funcionam antes da hidratação.
- Ficha do dia via `HttpClient`; o cache de transferência embute a resposta no HTML, então a primeira carga não refaz a requisição.
- CSS puro com as variáveis de `src/styles.css` (tokens da seção 7 do PRD). Sem biblioteca de componentes nem de CSS.
- Fontes Spectral e Figtree servidas localmente via `@fontsource` (sem chamadas a terceiros, por privacidade).

### Convenções

- Código de domínio em português (nomes de arquivos, classes, funções e variáveis: `Santo`, `diaSeguinte`, `DadosService`), seguindo o vocabulário do PRD. Termos do Angular ficam em inglês.
- Datas como texto `MM-DD` em todo o app.
- Textos da interface em português do Brasil.
- Acessibilidade (PRD 6): botões e links reais, foco visível, `aria-current="date"` no dia selecionado, áreas de toque ≥ 44px, contraste ≥ 4,5:1.

## Estrutura

```
dados/        fonte dos dados (santos.json)
docs/         PRD, histórias (uma pasta por US) e mockups
scripts/      scripts Node (geração de dados, imagens, verificações)
public/       arquivos estáticos copiados para o build
src/app/      aplicação Angular
```
