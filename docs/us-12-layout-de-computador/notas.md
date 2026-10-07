# US-12 — Notas

## Decisões

- **Ponto de quebra único: 1024px**, só com CSS (o HTML pré-renderizado é o mesmo para todas as larguras).
- **Cabeçalho no computador:** marca "Santo do Dia" (Spectral 28px) e "Outubro de 2026" (o ano entra depois da hidratação) à esquerda, "Hoje" à direita, faixa abaixo, tudo limitado a 1180px, como no mockup "Web". O botão do mês e o ícone do calendário (que abrem o painel) somem nessa largura, e o `<dialog>` também.
- **Conteúdo:** linha com a ficha (`flex: 1 1 auto`) e o calendário numa coluna de 360px à direita, num cartão branco. A coluna é `position: sticky` (`top: 24px`), então o calendário continua visível ao rolar ("fixo à direita").
- **Ficha:** a imagem (`flex: 1 1 280px`, 380px de altura) fica ao lado do texto (`flex: 2 1 340px`); o bloco de origem e datas passa a três colunas. Para isso o texto da ficha foi agrupado num `<div class="texto">`.
- **Faixa com cerca de 11 dias** a partir de 1024px (já feito na US-08 com `--por-tela: 11`).
- **Sem rolagem horizontal:** `min-width: 0` nos itens flexíveis e `overflow-wrap: break-word` no nome e na descrição. O e2e confere `scrollWidth <= clientWidth` em 320, 375, 414, 768, 1023, 1024, 1280, 1440 e 1920px, em três dias (nome longo, celebração e grupo).
- **Testes:** `e2e/layout.spec.ts` (sem rolagem horizontal; colunas a partir de 1024px; calendário visível depois de rolar; uma coluna em 1023px).

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- Os cartões "Próximos dias" (US-13) entram abaixo da ficha.
