# US-08 — Faixa de dias

- **Épico:** C — Navegação
- **Ordem de execução:** 9 de 18
- **Depende de:** [US-03](../us-03-utilitarios-de-data/README.md), [US-04](../us-04-rotas-e-pre-renderizacao/README.md)
- **Seções do PRD:** 3.1, 5.2, 7 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como visitante, quero uma faixa com os dias próximos, para passar de um dia a outro rapidamente.

## Critérios de aceite

- [x] Atende ao item 5.2.
- [x] Cada dia é um link real para `/dia/MM-DD`; os números vêm no HTML pré-renderizado e os dias da semana aparecem depois da hidratação, sem deslocar o layout.
- [x] Tocar num dia troca a ficha e centraliza o dia na faixa.
- [x] Setas esquerda e direita do teclado mudam o dia quando a faixa tem foco.
- [x] A faixa atravessa a virada de mês e de ano.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-08 conforme `docs/us-08-faixa-de-dias/README.md` e `docs/PRD.md`, com os testes.
