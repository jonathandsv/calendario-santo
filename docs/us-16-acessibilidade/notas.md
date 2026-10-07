# US-16 — Notas

## Verificação dos critérios da seção 6

| Critério | Como foi atendido | Teste |
|---|---|---|
| Botões e links reais | Navegação por `<a routerLink>`; ações por `<button>` | axe, revisão |
| Navegação completa por teclado | Faixa (setas), calendário (setas com roving tabindex, Enter), painel (Esc, foco preso), Tab em todos os controles | `faixa.spec`, `calendario.spec`, `calendario-celular.spec` |
| Foco visível | Contorno de 3px em `:focus-visible`: azul-noite sobre fundo claro e dourado no topo escuro (o dourado sobre branco teria contraste de cerca de 1,9:1) | `acessibilidade.spec` (Tab) |
| `aria-current="date"` | Dia selecionado na faixa e no calendário | `faixa.spec`, unitários |
| Painel com papel de diálogo e foco preso | `<dialog>` modal com `aria-label`, ciclo de Tab/Shift+Tab e devolução do foco | `calendario-celular.spec` |
| Contraste ≥ 4,5:1 | Tokens do PRD; conferido pelo axe (`color-contrast`) | `acessibilidade.spec` |
| Áreas de toque ≥ 44px | Ver ajustes abaixo | `acessibilidade.spec` (360, 412 e 1280px, com o painel aberto no celular) |

## Decisões

- **Verificação automática** com `@axe-core/playwright` (regras WCAG 2.0/2.1/2.2 A e AA e boas práticas), exigindo zero violações sérias ou críticas em `10-06`, `12-25`, `02-06`, na 404 e com o painel do calendário aberto, nos perfis de celular e computador. Não houve violações desde a primeira execução.
- **Ajustes de área de toque:**
  - Faixa: 6 dias por tela (vão de 4px) abaixo de 400px de largura e 5 abaixo de 340px; acima disso, 7. Antes, um dia tinha 43px de largura em 360px e 36px em 320px.
  - Calendário: espaçamento de 2px entre os dias abaixo de 400px; coluna do computador de 360px para 380px (cada dia tinha 43px).
  - Link de crédito da imagem e links das páginas de início e 404 com altura mínima de 44px.
- Textos de apoio para leitores de tela já existentes: rótulos por extenso nos dias da faixa e do calendário, "Saiba mais sobre {nome} na Wikipédia (abre em nova aba)", título do mês com `aria-live="polite"` ao trocar de mês, `<abbr title>` nos dias da semana do calendário, imagem com `alt` igual ao nome e espaço reservado com `alt=""`.

## Desvios em relação ao PRD

- Em telas de 320px, os dias do painel do calendário ficam com cerca de 39px de largura (44px de altura): sete colunas de 44px não cabem nessa largura. Ainda assim, ficam acima do mínimo de 24px da WCAG 2.2 AA (2.5.8). A partir de 360px, todos os controles têm 44px ou mais.

## Pendências

- Nenhuma.
