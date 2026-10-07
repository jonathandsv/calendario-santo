# US-10 — Calendário mensal

- **Épico:** C — Navegação
- **Ordem de execução:** 11 de 18
- **Depende de:** [US-03](../us-03-utilitarios-de-data/README.md), [US-04](../us-04-rotas-e-pre-renderizacao/README.md)
- **Seções do PRD:** 3.1, 5.3, 7 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como visitante, quero escolher um dia num calendário, para descobrir o santo de qualquer data.

## Critérios de aceite

- [x] Componente de grade mensal conforme o item 5.3, com setas de mês funcionando nos 12 meses.
- [x] Selecionar um dia navega para ele; cada dia é um link real.
- [x] A grade é montada no navegador, depois da hidratação, com o ano corrente; antes disso o espaço fica reservado.
- [x] Fevereiro mostra 28 ou 29 dias conforme o ano corrente.
- [x] Navegável por teclado: setas movem o foco entre os dias; Enter seleciona.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-10 conforme `docs/us-10-calendario-mensal/README.md` e `docs/PRD.md`, com os testes.
