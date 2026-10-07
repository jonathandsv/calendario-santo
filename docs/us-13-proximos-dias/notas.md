# US-13 — Notas

## Decisões

- **Componente `Proximos` (`src/app/proximos/`)**, abaixo da ficha, numa `<section>` rotulada pelo título "Próximos dias". Três cartões, cada um é um link real para o dia.
- **No build:** data ("7 de outubro") e nome, vindos do índice embutido (`DadosService.nome`), sem requisição extra. O dia da semana abreviado ("Qua, 7 de outubro", como no mockup) entra depois da hidratação.
- **Dias seguintes** calculados com `deslocar` e o ano do `RelogioService`: viram o ano (30/12 → 31/12, 01/01, 02/01) e, com o ano conhecido e não bissexto, pulam 29/02.
- **Só no computador:** oculto abaixo de 1024px via CSS (PRD 5.6). O HTML é o mesmo para todas as larguras.
- **Visual do mockup:** cartões brancos com borda, raio de 14px, altura mínima de 76px, lado a lado (quebram linha se faltar espaço).
- **Testes:** unitários (três dias com data e nome, dia da semana com o ano, 30/12 e 31/12 em janeiro) e e2e (presença no HTML, clique navega, viradas de ano, oculto no celular).

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- Nenhuma.
