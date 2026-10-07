# US-08 — Notas

## Decisões

- **Componente `Faixa` (`src/app/faixa/`)** no topo azul-noite da página do dia. É uma lista (`<ol>`) de links reais (`<a routerLink>` para `/dia/MM-DD`) dentro de um `<nav aria-label="Dias próximos">`.
- **Janela de 43 dias** (21 de cada lado do selecionado), calculada com `deslocar` e o ano do `RelogioService`. A faixa rola na horizontal por arraste/toque e atravessa meses e anos. Como tocar num dia recentraliza a janela, a navegação não tem fim.
- **Centralização sem JavaScript:** antes da hidratação, só o dia selecionado tem `scroll-snap-align: center` num contêiner com `scroll-snap-type: x mandatory`, então o próprio navegador abre a faixa já centralizada (conferido no Chromium, com e sem JS). Depois da hidratação, a classe `hidratada` libera a rolagem (`proximity`, encaixe em qualquer dia) e a troca de dia centraliza com animação (`afterRenderEffect` + `scrollTo`).
- **No build** vão os números e os links; o dia da semana abreviado entra depois da hidratação num `<span>` com altura reservada. O e2e confere que a altura da faixa e a posição do dia selecionado não mudam com a hidratação.
- **Rótulos acessíveis:** cada link tem `aria-label` com a data por extenso ("6 de outubro"; depois da hidratação, "Terça-feira, 6 de outubro"); o selecionado tem `aria-current="date"`.
- **Quantidade visível:** a largura de cada item é uma fração do contêiner, com 7 por tela no celular e 11 a partir de 1024px (variável `--por-tela`).
- **Teclado:** com o foco na faixa, as setas esquerda e direita navegam para o dia anterior e o seguinte e o foco acompanha o novo dia selecionado. Teclas rápidas encadeiam a partir do destino ainda pendente. O tratamento fica no host do componente (os eventos sobem a partir do link focado).
- **29/02:** com o ano conhecido e não bissexto, some da faixa; antes da hidratação (ano `null`) aparece.
- Os links provisórios "Dia anterior"/"Dia seguinte" da US-04 foram removidos. Os e2e passaram a usar a faixa (`diaNaFaixa` em `e2e/apoio.ts`).
- Visual conforme o mockup: itens com 64px de altura (68px no computador), raio de 14px, fundo branco a 9% e selecionado em dourado com texto `--tinta`.

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- O cabeçalho com o nome do mês, o botão "Hoje" e o ícone do calendário vêm nas US-09 a US-11.
