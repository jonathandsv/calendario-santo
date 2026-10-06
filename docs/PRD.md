# Santo do Dia — PRD e user stories

Documento de requisitos do site Santo do Dia, escrito para orientar a implementação com o Claude. As histórias estão listadas na seção 9, na ordem sugerida de execução, e cada uma tem sua pasta em `docs/`; cada história cabe em uma sessão de trabalho.

**Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e) (celular, celular com calendário aberto e web).

## 1. Visão geral

Site que mostra o santo do dia da Igreja Católica Apostólica Romana, seguindo o calendário do Brasil. A pessoa abre o site e vê o santo de hoje; pode navegar pelos dias vizinhos numa faixa no topo ou escolher qualquer dia do ano num calendário.

- **Público:** católicos brasileiros que querem conhecer o santo de cada dia, no celular ou no computador.
- **Idioma:** português do Brasil.
- **Modelo:** gratuito, sem login, sem anúncios.

## 2. Objetivos e não objetivos

**Objetivos da versão 1**

1. Mostrar o santo de hoje em até um toque, sem cadastro.
2. Permitir descobrir o santo de qualquer dia do ano em até três toques.
3. Entregar cada dia como uma página HTML pronta, gerada no build, que abre rápido e pode ser indexada e compartilhada.
4. Funcionar bem do celular ao computador, com o mesmo código.

**Fora do escopo da versão 1**

- Backend, banco de dados, painel de edição de conteúdo.
- Login, favoritos, notificações diárias.
- PWA: sem service worker, sem uso offline e sem instalação.
- Servidor Node em produção (SSR por requisição).
- Celebrações móveis (Páscoa, Corpus Christi etc.) e transferência de solenidades para o domingo. O campo `obs` apenas informa quando isso acontece.
- Lista "também celebrados hoje" e busca por nome.
- Outros idiomas e outros calendários nacionais.

## 3. Decisões técnicas

| Tema | Decisão |
|---|---|
| Framework | Angular 22, com componentes standalone e signals |
| Renderização | Pré-renderização no build (SSG) com `@angular/ssr` e `"outputMode": "static"` no `angular.json`. O build gera um HTML por rota; não há servidor Node em produção |
| Rotas de servidor | `app.routes.server.ts` com `RenderMode.Prerender`; a rota `dia/:data` usa `getPrerenderParams` para devolver as 366 chaves e `PrerenderFallback.None` |
| Hidratação | Ativada. A página chega pronta e o Angular assume no navegador para a faixa, o calendário e a troca de dia sem recarregar |
| Dados | `santos.json` fica em `dados/` como fonte. Um script de build gera um arquivo por dia em `public/data/dias/MM-DD.json` e um índice leve (`data` e `nome` dos 366 dias) embutido no app |
| Carga de dados | A ficha do dia vem por `HttpClient`; no build o conteúdo é embutido no HTML pelo cache de transferência, então a primeira carga não faz requisição extra |
| PWA | Não usado |
| Backend | Nenhum |
| Estilo | CSS puro com variáveis (tokens da seção 7); sem biblioteca de componentes |
| Testes | Testes unitários para a lógica de datas e o serviço de dados; um teste de ponta a ponta do fluxo principal; verificação do resultado do build |
| Hospedagem | Qualquer hospedagem de arquivos estáticos, servindo `dia/MM-DD/index.html` e uma página 404 própria |

### 3.1 Regra central da pré-renderização

O HTML é gerado uma vez, no build, e servido igual para todos. Por isso **nada que dependa da data ou do ano corrente pode estar no HTML pré-renderizado**.

| Parte da tela | Onde é resolvida |
|---|---|
| Ficha do santo, título e metadados da página | No build |
| Números dos dias na faixa e links para os dias vizinhos | No build |
| Cartões "Próximos dias" | No build |
| Dias da semana na faixa e data por extenso com dia da semana | No navegador, depois da hidratação |
| Grade do calendário (o alinhamento depende do ano) | No navegador, depois da hidratação |
| Marcação de "hoje" e existência de 29/02 | No navegador, depois da hidratação |
| Redirecionamento de `/` para o dia de hoje | No navegador |

Como implementar sem erro de hidratação: o ano corrente fica num signal que começa nulo no servidor e na primeira renderização do navegador, e é preenchido em `afterNextRender`. Não usar `isPlatformBrowser` em `@if` no template. As partes que esperam o ano reservam o espaço final para não deslocar o layout.

## 4. Dados

A fonte é o `santos.json` (366 registros, um por dia, de `01-01` a `12-31`, incluindo `02-29`). Não alterar o formato; o script de build apenas o divide em um arquivo por dia e gera o índice.

| Campo | Tipo | Uso na tela |
|---|---|---|
| `data` | texto `MM-DD` | Chave do registro |
| `nome` | texto | Título |
| `grau` | `solenidade`, `festa`, `memoria`, `memoria_facultativa`, `comemoracao` ou nulo | Etiqueta abaixo do nome; oculta se nulo |
| `fonte` | `calendario_geral`, `proprio_brasil`, `martirologio` | Não exibido na versão 1 |
| `obs` | texto, opcional | Nota discreta abaixo da descrição, quando existir |
| `tipo` | `pessoa`, `grupo`, `celebracao` | Define se o bloco de origem e datas aparece |
| `descricao` | texto | Parágrafo principal |
| `nascimento`, `falecimento` | texto ou nulo | Exibidos como estão (ex.: "c. 1030") |
| `ano_nascimento`, `ano_falecimento` | número ou nulo | Não exibidos; reservados para ordenação futura |
| `local_nascimento`, `pais_atual` | texto ou nulo | Linha "Origem" |
| `dados_referentes_a` | texto, opcional | Em grupos, indica a quem as datas se referem |
| `wikipedia` | URL ou nulo | Link "Saiba mais" |
| `imagem` | objeto ou nulo: `arquivo`, `url`, `local`, `pagina_commons`, `licenca`, `autor` | Imagem e crédito; o site usa `local` (preenchidos pela US-18) |
| `wikidata` | texto, opcional | Não exibido (preenchido pela US-18) |
| `conferido` | booleano ou nulo | Não exibido |

**Rótulos de grau:** Solenidade, Festa, Memória, Memória facultativa, Comemoração.

**Regras de exibição**

- **Origem:** `local_nascimento, pais_atual`; se só um existir, mostrar esse; se nenhum, "Não conhecida".
- **Bloco de origem e datas:** aparece quando ao menos um entre nascimento, falecimento, local e país existe. Em registros `celebracao` ele não aparece.
- **Datas ausentes dentro do bloco:** mostrar "Não se aplica".
- **Grupos com `dados_referentes_a`:** mostrar abaixo do bloco a nota "Dados de {nome}".
- **Imagem nula:** mostrar um espaço reservado neutro, sem ícone de erro.
- **Imagem presente:** mostrar com texto alternativo igual ao nome e, abaixo, o crédito "{autor}, {licenca}" com link para `pagina_commons`.

## 5. Comportamento

### 5.1 Data e rotas

- "Hoje" é a data local do aparelho.
- Rotas: `/dia/MM-DD` mostra um dia específico, é pré-renderizada e pode ser compartilhada. São 366 páginas.
- `/` é uma página pré-renderizada mínima que, no navegador, leva ao dia de hoje substituindo a entrada do histórico. Sem JavaScript, ela mostra um link para o calendário de janeiro.
- Rota inválida (ex.: `/dia/13-40`) cai na página 404 estática, com link para o dia de hoje.
- Faixa, calendário e "Próximos dias" usam links reais (`<a>` com `routerLink`), que funcionam antes mesmo da hidratação.
- O ano de referência é o ano corrente. Ele serve só para calcular dias da semana e decidir se 29 de fevereiro existe.
- Em ano não bissexto, 29/02 não aparece na faixa nem no calendário; a rota `/dia/02-29` continua abrindo o registro.
- A navegação entre dias atravessa meses e vira de 31/12 para 01/01.

### 5.2 Faixa de dias

- Fica no topo, sobre o fundo azul-noite.
- Cada item mostra o dia da semana abreviado e o número.
- O dia selecionado fica centralizado e destacado em dourado.
- Rola na horizontal por arraste ou toque, sem limite de mês.
- Mostra cerca de 7 dias no celular e 11 no computador.
- O botão "Hoje" volta para a data atual.

### 5.3 Calendário

- Grade mensal com semana começando no domingo.
- Setas de mês anterior e próximo, percorrendo os 12 meses.
- O dia selecionado tem fundo azul-noite; o dia de hoje tem contorno dourado.
- **Celular:** abre como painel inferior ao tocar no nome do mês ou no ícone; escolher um dia fecha o painel. Fecha também pelo botão, pelo fundo escurecido e pela tecla Esc.
- **Computador:** fica sempre visível numa coluna à direita.
- O mês exibido acompanha o dia selecionado.

### 5.4 Ficha do santo

Ordem dos elementos: imagem, data por extenso, nome, etiqueta de grau, bloco de origem e datas, descrição, nota `obs`, link "Saiba mais".

### 5.5 Próximos dias (somente computador)

Três cartões com data e nome dos três dias seguintes; clicar leva ao dia.

### 5.6 Layout responsivo

| Largura | Layout |
|---|---|
| Até 1023px | Uma coluna; calendário em painel inferior; sem "Próximos dias" |
| 1024px ou mais | Conteúdo com largura máxima de 1180px; ficha à esquerda (imagem ao lado do texto) e calendário fixo à direita |

## 6. Requisitos não funcionais

- **Acessibilidade:** botões e links reais; navegação completa por teclado; foco visível; `aria-current="date"` no dia selecionado; painel do calendário com papel de diálogo e foco preso enquanto aberto; contraste de texto de pelo menos 4,5:1; áreas de toque de pelo menos 44px.
- **Desempenho:** primeira carga leve o bastante para rede móvel; imagens com carregamento tardio e dimensões reservadas para não deslocar o layout.
- **Conteúdo no HTML:** nome, descrição, origem e datas de cada dia estão no HTML entregue, legíveis antes de qualquer JavaScript rodar.
- **Hidratação limpa:** nenhuma página gera aviso de divergência de hidratação no console.
- **SEO e compartilhamento:** título, descrição, URL canônica e metadados Open Graph de cada dia estão no HTML pré-renderizado ("São Bruno — 6 de outubro | Santo do Dia").
- **Privacidade:** sem cookies de rastreamento e sem coleta de dados pessoais.

## 7. Design

A referência visual é o mockup [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e), com três quadros:

| Quadro | Mostra |
|---|---|
| Santo do dia | Tela de celular com faixa de dias e ficha |
| Calendário aberto | Tela de celular com o painel do calendário |
| Web (computador) | Página larga com ficha, próximos dias e calendário fixo |

O link é privado: abre para o dono do mockup e para quem ele der acesso. Para que o Claude consulte o visual durante a implementação, exporte os três quadros como imagem para `docs/mockups/`.

| Token | Valor | Uso |
|---|---|---|
| `--azul-noite` | `#16224A` | Cabeçalho, etiqueta de grau, dia selecionado no calendário |
| `--fundo` | `#F3F4F8` | Fundo da página, células do calendário |
| `--tinta` | `#121A33` | Texto principal |
| `--tinta-suave` | `#2A3350` | Parágrafo de descrição |
| `--apoio` | `#47506B` | Rótulos e textos secundários |
| `--borda` | `#D5D9E6` | Bordas e divisórias |
| `--destaque` | `#E3B341` | Dia selecionado na faixa, contorno de hoje |
| `--superficie` | `#FFFFFF` | Cartões e painel |

- **Tipografia:** Spectral 600 para nome do santo, nome do mês e marca; Figtree (400 a 700) para o restante.
- **Tamanhos:** nome do santo com 28px no celular e 40px no computador; descrição com 16px e 18px.
- **Raios:** 14px em botões de dia e cartões; 18 a 20px em painéis; etiquetas em pílula.

## 8. Pendências de conteúdo (não bloqueiam a implementação)

1. **Imagens:** a busca e o download são a US-18; depois dela, conferir à mão as imagens que o relatório separar para revisão de licença.
2. **Descrições:** revisar os textos com alguém da área antes de publicar.
3. **Registros com `conferido: false`:** validar datas de 9 pessoas e completar os 23 grupos sem dados.
4. **Beato Inácio de Azevedo:** confirmar a data (17/07) no Diretório Litúrgico da CNBB.

## 9. User stories

Cada história tem uma pasta própria em `docs/`, com um `README.md` que traz a história, as dependências e os critérios de aceite. O texto completo fica só lá, para não haver duas versões. A tabela está na ordem sugerida de execução.

"Pronto" significa todos os critérios atendidos, build, testes e lint passando, e o `notas.md` da história escrito.

| Ordem | História | Épico | Pasta | Depende de |
|---|---|---|---|---|
| 1 | US-01 — Estrutura do projeto | A | [`docs/us-01-estrutura-do-projeto/`](us-01-estrutura-do-projeto/README.md) | — |
| 2 | US-02 — Dados por dia | A | [`docs/us-02-dados-por-dia/`](us-02-dados-por-dia/README.md) | US-01 |
| 3 | US-03 — Utilitários de data | A | [`docs/us-03-utilitarios-de-data/`](us-03-utilitarios-de-data/README.md) | US-01 |
| 4 | US-04 — Rotas e pré-renderização | A | [`docs/us-04-rotas-e-pre-renderizacao/`](us-04-rotas-e-pre-renderizacao/README.md) | US-02, US-03 |
| 5 | US-05 — Ver o santo do dia | B | [`docs/us-05-ver-o-santo-do-dia/`](us-05-ver-o-santo-do-dia/README.md) | US-04 |
| 6 | US-06 — Origem e datas | B | [`docs/us-06-origem-e-datas/`](us-06-origem-e-datas/README.md) | US-05 |
| 7 | US-18 — Baixar as imagens dos santos | B | [`docs/us-18-baixar-imagens/`](us-18-baixar-imagens/README.md) | US-02 |
| 8 | US-07 — Imagem com crédito | B | [`docs/us-07-imagem-com-credito/`](us-07-imagem-com-credito/README.md) | US-05, US-18 |
| 9 | US-08 — Faixa de dias | C | [`docs/us-08-faixa-de-dias/`](us-08-faixa-de-dias/README.md) | US-03, US-04 |
| 10 | US-09 — Botão Hoje | C | [`docs/us-09-botao-hoje/`](us-09-botao-hoje/README.md) | US-08 |
| 11 | US-10 — Calendário mensal | C | [`docs/us-10-calendario-mensal/`](us-10-calendario-mensal/README.md) | US-03, US-04 |
| 12 | US-11 — Calendário no celular | C | [`docs/us-11-calendario-no-celular/`](us-11-calendario-no-celular/README.md) | US-10 |
| 13 | US-12 — Layout de computador | D | [`docs/us-12-layout-de-computador/`](us-12-layout-de-computador/README.md) | US-05, US-08, US-10 |
| 14 | US-13 — Próximos dias | D | [`docs/us-13-proximos-dias/`](us-13-proximos-dias/README.md) | US-12 |
| 15 | US-14 — Verificação das páginas geradas | E | [`docs/us-14-verificacao-das-paginas/`](us-14-verificacao-das-paginas/README.md) | US-04, US-05 |
| 16 | US-15 — Título e compartilhamento | E | [`docs/us-15-titulo-e-compartilhamento/`](us-15-titulo-e-compartilhamento/README.md) | US-05 |
| 17 | US-16 — Acessibilidade | E | [`docs/us-16-acessibilidade/`](us-16-acessibilidade/README.md) | US-11, US-12 |
| 18 | US-17 — Teste de ponta a ponta e publicação | E | [`docs/us-17-teste-e-publicacao/`](us-17-teste-e-publicacao/README.md) | US-13, US-14, US-15, US-16 |

**Épicos:** A — Fundação; B — Ficha do santo; C — Navegação; D — Computador; E — Qualidade e publicação.

## 10. Como usar este documento com o Claude

1. Copie para a raiz do repositório as pastas `docs/`, `dados/` e `scripts/` deste kit e exporte os quadros do mockup para `docs/mockups/`.
2. Peça uma história por vez, na ordem da seção 9, usando a frase que está no fim do `README.md` de cada pasta.
3. Antes de aceitar, confira os critérios da história, rode build, testes e lint, e leia o `notas.md` que o Claude deixou na pasta.
4. Mudou de ideia sobre um comportamento? Atualize o PRD e o `README.md` da história primeiro e depois peça a alteração.
