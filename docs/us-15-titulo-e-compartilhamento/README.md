# US-15 — Título e compartilhamento

- **Épico:** E — Qualidade e publicação
- **Ordem de execução:** 16 de 18
- **Depende de:** [US-05](../us-05-ver-o-santo-do-dia/README.md)
- **Seções do PRD:** 6 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como visitante, quero que o link mostre o santo do dia, para compartilhar com contexto.

## Critérios de aceite

- [x] O título segue "{nome} — {dia} de {mês} | Santo do Dia".
- [x] A meta descrição usa o início de `descricao`.
- [x] Cada página tem URL canônica e metadados Open Graph (título, descrição e imagem, quando houver).
- [x] Tudo isso está no HTML pré-renderizado, não só depois da hidratação.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-15 conforme `docs/us-15-titulo-e-compartilhamento/README.md` e `docs/PRD.md`, com os testes.
