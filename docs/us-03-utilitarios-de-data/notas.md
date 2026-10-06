# US-03 — Notas

## Decisões

- **Funções puras em `src/app/datas/datas.ts`:** `hojeMesDia`, `ehBissexto`, `diasNoMes`, `diasDoMes`, `existeNoAno`, `diaSeguinte`, `diaAnterior`, `deslocar`, `diaDaSemana`, `diaEMes`, `dataPorExtenso`, além de `dataValida`, `partes` e `montarData`, e as listas `MESES`, `DIAS_DA_SEMANA` e `DIAS_DA_SEMANA_CURTOS`.
- **Ano como parâmetro `number | null`:** `null` quer dizer "ano ainda desconhecido" (build e primeira renderização). Nesse caso o ciclo tem os 366 dias, com 29/02. Isso permite que a faixa e os links vizinhos sejam gerados no build com a mesma função usada no navegador; depois da hidratação, com o ano conhecido, 29/02 sai em ano não bissexto.
- `diaAnterior('02-29', anoNaoBissexto)` devolve `02-28` e `diaSeguinte('02-29', anoNaoBissexto)` devolve `03-01`, para a rota `/dia/02-29` continuar navegável mesmo em ano não bissexto.
- **Dia da semana** calculado em UTC (`Date.UTC`), para não depender do fuso do aparelho.
- **`hojeMesDia(agora = new Date())`** é a única que lê o relógio; aceita uma data para teste. Usa a data local do aparelho (PRD 5.1).
- **`diaEMes`** ("6 de outubro") não depende do ano e pode ir para o HTML pré-renderizado; `dataPorExtenso` acrescenta o dia da semana e só deve ser usada no navegador.
- **`RelogioService`:** signals `ano` e `hoje` começam `null` e são preenchidos em `afterNextRender`. É injetado no componente raiz para o gancho ser registrado na carga. `atualizar()` permite reler o relógio (útil para o botão "Hoje" depois da meia-noite).

## Desvios em relação ao PRD

- Nenhum.

## Pendências

- Nenhuma.
