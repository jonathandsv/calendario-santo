# US-15 — Notas

## Decisões

- **`MetadadosService` (`src/app/metadados/`)** usa `Title` e `Meta` do Angular e cria ou atualiza o `<link rel="canonical">`. A página do dia o chama num `effect` sobre a ficha, que roda também na pré-renderização. Por isso tudo sai no HTML entregue e acompanha a troca de dia no navegador.
- **Título:** "{nome} — {dia} de {mês} | Santo do Dia" (`tituloDoDia`), sem dia da semana (regra 3.1).
- **Meta descrição:** início de `descricao`, com no máximo 160 caracteres, cortado no fim de uma palavra e com reticências (`resumir`).
- **Open Graph:** `og:site_name`, `og:locale` (`pt_BR`), `og:type` (`article` nos dias, `website` nas demais), `og:title`, `og:description`, `og:url` e, quando o dia tem imagem, `og:image` (endereço absoluto do arquivo local) e `og:image:alt`. Também `twitter:card` (`summary_large_image` com imagem, `summary` sem). Tags que não se aplicam a uma página são removidas, para não sobrar a do dia anterior.
- **Endereço do site:** a URL canônica e o Open Graph precisam de endereços absolutos. O domínio fica em `src/app/site.ts` (`URL_DO_SITE`), hoje com o valor provisório `https://santododia.example.com`.
- **Início e 404** também têm título e descrição próprios; a 404 leva `robots: noindex`.
- `index.html` passou a ter `lang="pt-BR"` e `theme-color` azul-noite (desde a US-01).
- **Testes:** unitários (formato do título, resumo, aplicação das tags, remoção de `og:image`, canônica única) e e2e conferindo o HTML pré-renderizado de `10-06`, a troca de título no navegador e o `noindex` da 404.

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- **Definir o domínio definitivo** em `src/app/site.ts` antes de publicar (US-17).
- `og:image` só aparece quando as imagens existirem (execução completa da US-18).
