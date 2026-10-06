# US-05 — Notas

## Decisões

- **Componente `Ficha` (`src/app/ficha/`)** recebe o `Santo` e segue a ordem do PRD 5.4: data, nome, etiqueta de grau, descrição, nota `obs` e "Saiba mais". A imagem (US-07) e o bloco de origem e datas (US-06) entram nas posições previstas.
- **Data:** "6 de outubro" (`diaEMes`) vai no HTML pré-renderizado; o dia da semana fica num `<span>` à parte, renderizado só quando `RelogioService.ano()` deixa de ser `null` (depois da hidratação). O texto cresce na mesma linha, sem deslocar o layout vertical. A caixa alta vem do CSS, como no mockup.
- **Grau:** rótulos em `src/app/dados/rotulos.ts` (`ROTULOS_GRAU`); sem etiqueta quando `grau` é nulo.
- **"Saiba mais":** `target="_blank"` com `rel="noopener noreferrer"`; texto visível "Saiba mais" e complemento só para leitores de tela ("sobre {nome} na Wikipédia (abre em nova aba)"), via a classe global `.visualmente-oculto`.
- **Tipografia e tamanhos** do PRD 7 e do mockup: nome em Spectral 600, 28px no celular e 40px a partir de 1024px; descrição 16px/18px; etiqueta em pílula azul-noite.
- O `<article>` é rotulado pelo `<h1>` do nome.
- **Testes:** unitários do componente (com relógio controlado) e e2e em `e2e/ficha.spec.ts`, que confere o HTML entregue (dia e mês presentes, dia da semana ausente) e o texto depois da hidratação, sem avisos no console.

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- O layout final da página (cabeçalho, faixa, colunas) vem nas US-08 a US-12; os links "Dia anterior"/"Dia seguinte" da US-04 continuam até a faixa existir.
