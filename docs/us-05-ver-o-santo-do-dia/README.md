# US-05 — Ver o santo do dia

- **Épico:** B — Ficha do santo
- **Ordem de execução:** 5 de 18
- **Depende de:** [US-04](../us-04-rotas-e-pre-renderizacao/README.md)
- **Seções do PRD:** 4, 5.4, 7 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como visitante, quero ver nome, data e descrição do santo, para conhecer quem é celebrado.

## Critérios de aceite

- [ ] Mostra dia e mês, nome e descrição do dia da rota já no HTML pré-renderizado; o dia da semana é acrescentado depois da hidratação.
- [ ] Mostra a etiqueta de grau com o rótulo da seção 4; sem etiqueta quando `grau` é nulo.
- [ ] Mostra a nota `obs` quando existir.
- [ ] Mostra o link "Saiba mais" quando `wikipedia` existir, abrindo em nova aba.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-05 conforme `docs/us-05-ver-o-santo-do-dia/README.md` e `docs/PRD.md`, com os testes.
