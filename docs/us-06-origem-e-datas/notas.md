# US-06 — Notas

## Decisões

- **Regra isolada em função pura:** `fatosDo(santo)` (`src/app/ficha/fatos.ts`) aplica as regras da seção 4 e devolve `null` quando o bloco não aparece (celebrações, ou nenhum entre nascimento, falecimento, local e país). Origem: "local, país", só o que existir, ou "Não conhecida"; datas ausentes viram "Não se aplica"; em grupos com `dados_referentes_a`, a nota "Dados de {nome}".
- **Marcação:** lista de definição (`<dl>` com `<dt>`/`<dd>`), entre o cabeçalho e a descrição, como no mockup. No celular, grade de duas colunas com "Origem" ocupando a linha toda; a partir de 1024px, três colunas lado a lado.
- A nota "Dados de …" fica logo abaixo do bloco, em texto de apoio.
- **Testes:** unitários de `fatosDo` (todas as regras) e e2e em `e2e/ficha.spec.ts` para `10-06` (inclusive no HTML entregue), `12-25` e `02-06`.

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- Nenhuma.
