# US-07 — Notas

## Decisões

- **Componente `Imagem` (`src/app/imagem/`)**, primeiro elemento da ficha (PRD 5.4). Recebe `imagem` e `nome`.
- **Com imagem** (`imagem.local` preenchido): `<figure>` com `<img>` de `imagem.local`, `alt` igual ao nome, `loading="lazy"` e `decoding="async"`, e a legenda "Imagem: {autor}, {licenca}" com link para `pagina_commons` (nova aba). Se faltarem autor e licença, o crédito diz "Wikimedia Commons".
- **Sem imagem:** espaço reservado neutro com `public/img/santo-placeholder.svg` (silhueta com auréola nos tons da paleta, sem ícone de erro), com `alt=""` por ser decorativo. Criado a pedido, enquanto a execução completa da US-18 não acontece.
- **Dimensões reservadas:** a moldura tem altura fixa (220px no celular, 380px a partir de 1024px, como no mockup) e a imagem usa `object-fit: contain` sobre fundo neutro, para não cortar pinturas e retratos. O layout não se desloca quando a imagem carrega.
- **Falha ao carregar:** `(error)` volta ao espaço reservado. Uma falha antes da hidratação não chega ao Angular, então `afterNextRender` confere `complete && naturalWidth === 0`. O estado de falha volta a zero quando a imagem muda (`linkedSignal`).
- **Testes:** unitários do componente e e2e em `e2e/imagem.spec.ts`. Como os dados ainda não têm imagens, o e2e altera a resposta de `10-07` para incluir uma imagem válida (crédito, `alt`, `loading`) e uma inexistente (volta ao espaço reservado).

## Desvios em relação ao PRD

- Nenhum. O espaço reservado é uma imagem SVG estática em vez de um bloco só de CSS.

## Pendências

- As imagens reais dependem da execução completa da US-18 (ver `docs/us-18-baixar-imagens/notas.md`).
