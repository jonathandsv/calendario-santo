# US-07 — Imagem com crédito

- **Épico:** B — Ficha do santo
- **Ordem de execução:** 8 de 18
- **Depende de:** [US-05](../us-05-ver-o-santo-do-dia/README.md), [US-18](../us-18-baixar-imagens/README.md)
- **Seções do PRD:** 4, 5.4 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como visitante, quero ver a imagem do santo, para reconhecê-lo.

## Critérios de aceite

- [x] Com `imagem` nula, aparece o espaço reservado nas dimensões finais.
- [x] Com `imagem` preenchida, aparece a imagem de `imagem.local` com texto alternativo, carregamento tardio e crédito com link para `pagina_commons`.
- [x] Se a imagem falhar ao carregar, volta ao espaço reservado.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-07 conforme `docs/us-07-imagem-com-credito/README.md` e `docs/PRD.md`, com os testes.
