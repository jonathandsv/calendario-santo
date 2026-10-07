# US-14 — Verificação das páginas geradas

- **Épico:** E — Qualidade e publicação
- **Ordem de execução:** 15 de 18
- **Depende de:** [US-04](../us-04-rotas-e-pre-renderizacao/README.md), [US-05](../us-05-ver-o-santo-do-dia/README.md)
- **Seções do PRD:** 3.1, 6 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como desenvolvedor, quero conferir o resultado do build automaticamente, para garantir que todas as páginas saíram prontas e corretas.

## Critérios de aceite

- [x] Um script de verificação roda depois do build e falha se faltar algum dos 366 `dia/MM-DD/index.html`.
- [x] Cada HTML contém o nome e a descrição do seu dia.
- [x] Nenhum HTML contém nome de dia da semana nem marcação de "hoje" (regra da seção 3.1).
- [x] Abrir `10-06`, `02-29` e `12-31` no navegador não gera aviso de hidratação no console.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-14 conforme `docs/us-14-verificacao-das-paginas/README.md` e `docs/PRD.md`, com os testes.
