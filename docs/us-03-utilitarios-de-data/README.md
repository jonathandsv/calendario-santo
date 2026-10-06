# US-03 — Utilitários de data

- **Épico:** A — Fundação
- **Ordem de execução:** 3 de 18
- **Depende de:** [US-01](../us-01-estrutura-do-projeto/README.md)
- **Seções do PRD:** 3.1, 5.1 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como desenvolvedor, quero funções puras de data, para que faixa, calendário e rotas usem a mesma regra.

## Critérios de aceite

- [x] Funções: hoje como `MM-DD`; dia anterior e seguinte (com virada de mês e de ano); dia da semana de um `MM-DD` num ano; lista de dias de um mês; verificação de ano bissexto; data por extenso ("Terça-feira, 6 de outubro").
- [x] 29/02 é pulado em ano não bissexto.
- [x] As funções que dependem do ano recebem o ano como parâmetro; nenhuma lê o relógio por conta própria, exceto "hoje".
- [x] Um serviço expõe o ano corrente e o dia de hoje como signals que começam nulos e são preenchidos em `afterNextRender` (regra da seção 3.1).
- [x] Testes cobrem viradas de mês, 31/12 para 01/01 e fevereiro nos dois tipos de ano.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-03 conforme `docs/us-03-utilitarios-de-data/README.md` e `docs/PRD.md`, com os testes.
