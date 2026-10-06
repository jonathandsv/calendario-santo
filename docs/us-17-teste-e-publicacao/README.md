# US-17 — Teste de ponta a ponta e publicação

- **Épico:** E — Qualidade e publicação
- **Ordem de execução:** 18 de 18
- **Depende de:** [US-13](../us-13-proximos-dias/README.md), [US-14](../us-14-verificacao-das-paginas/README.md), [US-15](../us-15-titulo-e-compartilhamento/README.md), [US-16](../us-16-acessibilidade/README.md)
- **Seções do PRD:** 3, 6 ([PRD](../PRD.md))
- **Mockup:** [Santo do Dia – mockup](https://claude.ai/artifact/K4CuuBocxWKjgkoY8rCd2e)

## História

Como desenvolvedor, quero um teste do fluxo principal e um build publicável, para colocar o site no ar com segurança.

## Critérios de aceite

- [ ] Teste cobre: abrir hoje, trocar de dia pela faixa, escolher um dia pelo calendário, voltar com "Hoje".
- [ ] O teste roda contra o build estático servido localmente, não contra o servidor de desenvolvimento.
- [ ] README com instruções de publicação em hospedagem estática, incluindo a configuração da página 404.

## Pronto quando

Todos os critérios acima estão atendidos, build, testes e lint passam, e o registro abaixo foi escrito.

## Registro

Ao concluir, crie `notas.md` nesta pasta com as decisões tomadas, os desvios em relação ao PRD e as pendências. Outros arquivos de apoio desta história (relatórios, capturas de tela) também ficam aqui.

## Como pedir ao Claude

> Implemente a US-17 conforme `docs/us-17-teste-e-publicacao/README.md` e `docs/PRD.md`, com os testes.
